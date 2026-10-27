import test from "node:test";
import assert from "node:assert/strict";
import { digest, resolveInterventions } from "../scripts/measurement-interventions.mjs";

function fixture() {
  const old = {
    id: "historical", status: "DEPLOYED", authorizedBy: "Owner", authorizedOn: "2026-10-23",
    baselineSha: "a".repeat(40), baselineEvidence: "old.json", baselineEvidenceSha256: digest("{}"),
    publicRouteRemovals: 0, indexStateChanges: 0, ownerChanges: 0, canonicalChanges: 0,
    approvedApplicationFiles: { "src/page": digest("old content"), "src/policy": digest("policy") }
  };
  const baseline = JSON.stringify({ historicalInterventions: [{ id: old.id, sha256: digest(JSON.stringify(old)) }] });
  const next = {
    ...old, id: "candidate", status: "AUTHORIZED_FOR_RELEASE", authorizedOn: "2026-10-27",
    baselineEvidence: "new.json", baselineEvidenceSha256: digest(baseline),
    approvedApplicationFiles: { "src/page": digest("new content") },
    supersedesFiles: [{ file: "src/page", interventionId: old.id, previousSha256: old.approvedApplicationFiles["src/page"] }]
  };
  const bytes = { "old.json": "{}", "new.json": baseline, "src/page": "new content", "src/policy": "policy" };
  return { register: { interventions: [old, next] }, bytes, read: file => { if (!(file in bytes)) throw new Error(`Missing ${file}`); return bytes[file]; } };
}

test("explicit per-file supersession preserves historical records and checks current content", () => {
  const f = fixture();
  const before = JSON.stringify(f.register.interventions[0]);
  const files = resolveInterventions(f.register, f.read);
  assert.equal(files.get("src/page").interventionId, "candidate");
  assert.equal(files.get("src/policy").interventionId, "historical");
  assert.equal(JSON.stringify(f.register.interventions[0]), before);
});

for (const [name, mutate, expected] of [
  ["unapproved supersession", f => { f.register.interventions[1].supersedesFiles = []; }, /Unapproved supersession/],
  ["changed historical record", f => { f.register.interventions[0].authorizedBy = "Someone else"; }, /Historical intervention changed/],
  ["changed historical baseline", f => { f.bytes["old.json"] = '{"changed":true}'; }, /Changed baseline/],
  ["unapproved candidate edit", f => { f.bytes["src/page"] = "rogue edit"; }, /file changed/],
  ["unapproved policy edit", f => { f.bytes["src/policy"] = "noindex removed"; }, /file changed/],
  ["deleted protected route", f => { delete f.bytes["src/page"]; }, /Missing/],
  ["changed route declaration", f => { f.register.interventions[1].publicRouteRemovals = 1; }, /Destructive/],
  ["canonical change", f => { f.register.interventions[1].canonicalChanges = 1; }, /Destructive/],
  ["index-state change", f => { f.register.interventions[1].indexStateChanges = 1; }, /Destructive/],
  ["owner change", f => { f.register.interventions[1].ownerChanges = 1; }, /Destructive/],
  ["missing authorization", f => { delete f.register.interventions[1].authorizedBy; }, /authorization/],
  ["future or cyclic supersession", f => { f.register.interventions[1].supersedesFiles[0].interventionId = "candidate"; }, /Invalid supersession/]
]) test(`intervention validation rejects ${name}`, () => {
  const f = fixture(); mutate(f);
  assert.throws(() => resolveInterventions(f.register, f.read), expected);
});
