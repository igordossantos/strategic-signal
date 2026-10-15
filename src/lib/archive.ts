import type { ArchiveBundle } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateArchive(value: unknown): ArchiveBundle {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    throw new Error("The intelligence archive has an unsupported schema.");
  }
  if (!Array.isArray(value.sources) || !Array.isArray(value.signals)) {
    throw new Error("The intelligence archive is missing sources or signals.");
  }
  if (!isRecord(value.counts) || !isRecord(value.coverage)) {
    throw new Error("The intelligence archive is missing coverage metadata.");
  }
  return value as unknown as ArchiveBundle;
}

export async function loadArchive(): Promise<ArchiveBundle> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/archive.json`, {
    cache: "no-cache",
  });
  if (!response.ok) {
    throw new Error(
      `Could not load the reusable intelligence archive (${response.status}).`,
    );
  }
  return validateArchive(await response.json());
}
