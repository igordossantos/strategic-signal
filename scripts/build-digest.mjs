import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const requestPath = arg("request");
const request = requestPath
  ? JSON.parse(await readFile(resolve(requestPath), "utf8"))
  : {};
const requestId =
  arg("request-id") ?? request.id ?? `digest-${Date.now().toString(36)}`;
const intent = arg("intent") ?? request.intent ?? "brief";
const depth = arg("depth") ?? request.depth ?? "standard";
const audience = arg("audience") ?? request.audience ?? "";
const instructions = arg("instructions") ?? request.instructions ?? "";
const selectionInput =
  arg("selection-json") ?? request.selection ?? request.items;
const dryRun = process.argv.includes("--dry-run");
const outputPath = resolve(
  arg("output") ?? resolve(root, "data", "digest-run", "digest.json"),
);

let selection;
try {
  selection =
    typeof selectionInput === "string"
      ? JSON.parse(selectionInput)
      : selectionInput;
} catch {
  throw new Error("selection-json must be valid JSON.");
}
if (!Array.isArray(selection) || selection.length < 1) {
  throw new Error("Select at least one item for the digest.");
}
if (selection.length > 15) {
  throw new Error("AI digests support at most 15 selected items.");
}
const allowedIntents = ["brief", "customer", "learn", "executive"];
const allowedDepths = ["concise", "standard", "deep"];
if (!allowedIntents.includes(intent)) {
  throw new Error(`Unsupported digest intent: ${intent}.`);
}
if (!allowedDepths.includes(depth)) {
  throw new Error(`Unsupported digest depth: ${depth}.`);
}
for (const item of selection) {
  if (
    typeof item?.id !== "string" ||
    typeof item?.title !== "string" ||
    typeof item?.summary !== "string"
  ) {
    throw new Error(
      "Every selected item requires string id, title, and summary values.",
    );
  }
}

const depthGuidance = {
  concise: "Be extremely concise. Prefer one sentence per point.",
  standard: "Use enough detail to support a 10-minute review.",
  deep: "Provide a detailed synthesis, trade-offs, and a sequenced reading path.",
};
const intentGuidance = {
  brief:
    "Write an internal technologist briefing. Be direct and preserve engineering nuance.",
  customer:
    "Write customer-safe language. Use could, may, and consider. Never claim knowledge of the customer's environment.",
  learn:
    "Organize around concepts to learn, misconceptions to avoid, and a study sequence.",
  executive:
    "Lead with decisions, material implications, hard dates, risks, and recommended conversations.",
};

const schemaDescription = {
  title: "string",
  executiveSummary: "string",
  keyThemes: [{ title: "string", summary: "string", itemIds: ["string"] }],
  mustKnow: [
    {
      title: "string",
      why: "string",
      status: "string",
      itemIds: ["string"],
    },
  ],
  customerConnections: [
    { audience: "string", reason: "string", itemIds: ["string"] },
  ],
  questions: ["string"],
  readingOrder: [{ itemId: "string", reason: "string" }],
  caveats: ["string"],
};

const systemPrompt = `You are the senior technology editor for Igor Dos Santos, a Microsoft Cloud and AI Solutions Engineer.
Create an evidence-grounded digest only from the selected items supplied by the user.
Do not invent product availability, customer facts, ROI, licensing, dates, or technical claims.
Preserve status and evidence distinctions. Explicitly surface breaking changes, hard dates, security, pricing, and source conflicts.
${intentGuidance[intent]}
${depthGuidance[depth]}
${audience ? `The intended audience is ${audience}.` : "There is no single named audience."}
Return one JSON object matching this shape exactly:
${JSON.stringify(schemaDescription)}
Every itemIds and readingOrder itemId value must reference an id from the supplied selection.
Do not wrap the JSON in Markdown.`;

const userPrompt = `Additional instructions:
${instructions || "None."}

Selected evidence:
${JSON.stringify(selection)}`;

const modelRequest = {
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  response_format: { type: "json_object" },
  temperature: 0.2,
};

await mkdir(dirname(outputPath), { recursive: true });
if (dryRun) {
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        requestId,
        intent,
        depth,
        audience,
        itemIds: selection.map((item) => item.id),
        modelRequest,
      },
      null,
      2,
    )}\n`,
  );
  console.log(JSON.stringify({ outputPath, dryRun: true }, null, 2));
  process.exit(0);
}

const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, "");
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion =
  process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";
if (!endpoint || !apiKey || !deployment) {
  throw new Error(
    "Azure OpenAI is not configured. Add AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT repository secrets.",
  );
}
const requestUrl = endpoint.includes("/openai/deployments/")
  ? `${endpoint}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`
  : `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
const response = await fetch(requestUrl, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "api-key": apiKey,
  },
  body: JSON.stringify(modelRequest),
  signal: AbortSignal.timeout(180_000),
});
if (!response.ok) {
  const body = (await response.text()).slice(0, 1000);
  throw new Error(
    `Azure OpenAI digest request failed (${response.status}): ${body}`,
  );
}
const completion = await response.json();
const rawContent = completion.choices?.[0]?.message?.content;
if (typeof rawContent !== "string" || !rawContent.trim()) {
  throw new Error("Azure OpenAI returned no digest content.");
}
let generated;
try {
  generated = JSON.parse(
    rawContent
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, ""),
  );
} catch {
  throw new Error("Azure OpenAI returned content that is not valid JSON.");
}
for (const field of [
  "title",
  "executiveSummary",
  "keyThemes",
  "mustKnow",
  "customerConnections",
  "questions",
  "readingOrder",
  "caveats",
]) {
  if (!(field in generated)) {
    throw new Error(`Azure OpenAI digest is missing ${field}.`);
  }
}
const allowedIds = new Set(selection.map((item) => item.id));
for (const itemId of [
  ...generated.keyThemes.flatMap((item) => item.itemIds ?? []),
  ...generated.mustKnow.flatMap((item) => item.itemIds ?? []),
  ...generated.customerConnections.flatMap((item) => item.itemIds ?? []),
  ...generated.readingOrder.map((item) => item.itemId),
]) {
  if (!allowedIds.has(itemId)) {
    throw new Error(
      `Azure OpenAI digest referenced an unselected item id: ${itemId}.`,
    );
  }
}

const digest = {
  schemaVersion: 1,
  id: requestId,
  title: String(generated.title),
  generatedAt: new Date().toISOString(),
  provider: "Azure OpenAI",
  model: deployment,
  request: {
    intent,
    depth,
    audience,
    instructions,
    itemIds: selection.map((item) => item.id),
  },
  executiveSummary: String(generated.executiveSummary),
  keyThemes: generated.keyThemes,
  mustKnow: generated.mustKnow,
  customerConnections: generated.customerConnections,
  questions: generated.questions,
  readingOrder: generated.readingOrder,
  caveats: generated.caveats,
  usage: completion.usage ?? null,
};
await writeFile(outputPath, `${JSON.stringify(digest, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      outputPath,
      requestId,
      model: deployment,
      selectedItems: selection.length,
      usage: completion.usage ?? null,
    },
    null,
    2,
  ),
);
