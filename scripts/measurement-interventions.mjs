import crypto from "node:crypto";

export const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");

// Supersession is per file. Historical records and their baseline evidence stay intact.
export function resolveInterventions(register, readFile) {
  const files = new Map();
  const records = new Map();
  for (const record of register.interventions) {
    if (!record.id || records.has(record.id)) throw new Error("Duplicate or missing intervention ID");
    if (record.status === "CANCELLED") {
      records.set(record.id, record);
      continue;
    }
    if (!record.authorizedBy || !/^\d{4}-\d{2}-\d{2}$/.test(record.authorizedOn)) throw new Error(`Missing authorization: ${record.id}`);
    if (!/^[a-f0-9]{40}$/.test(record.baselineSha)) throw new Error(`Invalid baseline SHA: ${record.id}`);
    const baselineBytes = readFile(record.baselineEvidence);
    if (digest(baselineBytes) !== record.baselineEvidenceSha256) throw new Error(`Changed baseline evidence: ${record.id}`);
    const baseline = JSON.parse(baselineBytes);
    for (const key of ["publicRouteRemovals", "indexStateChanges", "ownerChanges", "canonicalChanges"]) {
      if (record[key] !== 0) throw new Error(`Destructive intervention requires separate governance: ${key}`);
    }
    const replacements = record.supersedesFiles ?? [];
    for (const replacement of replacements) {
      const previous = files.get(replacement.file);
      const historical = records.get(replacement.interventionId);
      if (!previous || previous.interventionId !== replacement.interventionId || previous.hash !== replacement.previousSha256) {
        throw new Error(`Invalid supersession: ${replacement.file}`);
      }
      if (!Object.hasOwn(record.approvedApplicationFiles, replacement.file)) throw new Error(`Supersession has no replacement: ${replacement.file}`);
      const pinned = baseline.historicalInterventions?.find(item => item.id === historical.id);
      if (pinned?.sha256 !== digest(JSON.stringify(historical))) throw new Error(`Historical intervention changed: ${historical.id}`);
    }
    for (const [file, hash] of Object.entries(record.approvedApplicationFiles)) {
      if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid approved digest: ${file}`);
      const previous = files.get(file);
      if (previous && previous.hash !== hash && !replacements.some(item => item.file === file && item.interventionId === previous.interventionId)) {
        throw new Error(`Unapproved supersession: ${file}`);
      }
      files.set(file, { hash, interventionId: record.id });
    }
    records.set(record.id, record);
  }
  for (const [file, { hash }] of files) {
    if (digest(readFile(file)) !== hash) throw new Error(`Reviewed intervention file changed: ${file}`);
  }
  return files;
}
