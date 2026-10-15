import type { DigestDocument } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function importDigestDocument(text: string): DigestDocument {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The selected digest is not valid JSON.");
  }
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.generatedAt !== "string" ||
    typeof value.provider !== "string" ||
    typeof value.model !== "string" ||
    typeof value.executiveSummary !== "string" ||
    !isRecord(value.request) ||
    !Array.isArray(value.keyThemes) ||
    !Array.isArray(value.mustKnow) ||
    !Array.isArray(value.customerConnections) ||
    !Array.isArray(value.questions) ||
    !Array.isArray(value.readingOrder) ||
    !Array.isArray(value.caveats)
  ) {
    throw new Error(
      "The selected file is not a Strategic Signal digest document.",
    );
  }
  return value as unknown as DigestDocument;
}
