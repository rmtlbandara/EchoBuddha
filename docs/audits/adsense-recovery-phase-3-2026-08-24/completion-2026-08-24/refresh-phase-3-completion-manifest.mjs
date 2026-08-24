import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const phase = path.dirname(dir);
const repo = path.resolve(phase, "../../..");
const manifestPath = path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_METHOD_MANIFEST.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const core = [
  "ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv", "ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv", "ECHO_BUDDHA_PROTECTED_URLS.csv", "ECHO_BUDDHA_QUALITY_GROWTH_MATRIX.csv", "ECHO_BUDDHA_HIGH_EQUITY_LOW_VALUE_URLS.csv", "ECHO_BUDDHA_QUERY_OWNERSHIP_PROTECTION_MAP.csv", "ECHO_BUDDHA_SEARCH_MOMENTUM.csv", "ECHO_BUDDHA_BACKLINK_PROTECTION_MAP.csv", "ECHO_BUDDHA_INTERNAL_AUTHORITY_PROTECTION_MAP.csv", "ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv", "ECHO_BUDDHA_LEGACY_URL_EQUITY.csv", "ECHO_BUDDHA_CONSOLIDATION_SURVIVOR_CANDIDATES.csv", "ECHO_BUDDHA_FUTURE_URL_MAPPING_PLAN.csv", "ECHO_BUDDHA_SEARCH_VALUE_ELEMENT_MAP.csv", "ECHO_BUDDHA_SEO_PRESERVATION_CONTRACTS.md", "ECHO_BUDDHA_CHANGE_RISK_MATRIX.csv", "ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv", "ECHO_BUDDHA_POST_REMEDIATION_SEARCH_MONITORING.md", "ECHO_BUDDHA_FAMILY_SEARCH_PROTECTION.md", "ECHO_BUDDHA_QUOTE_SEARCH_EQUITY_PROTECTION.csv", "ECHO_BUDDHA_PHASE_4_CHANGE_READINESS.csv", "ECHO_BUDDHA_PHASE_3_GOOGLE_GROWTH_PROTECTION.md"
];
const completion = [
  "ECHO_BUDDHA_PHASE_3_COMPLETION_REPORT.md", "ECHO_BUDDHA_PHASE_3_EVIDENCE_GAP_CLOSURE.md", "ECHO_BUDDHA_PHASE_3_BLOCKING_DATA_REQUEST.md", "ECHO_BUDDHA_PHASE_3_NEW_GSC_EVIDENCE_RECONCILIATION.md", "ECHO_BUDDHA_PHASE_3_NEW_GSC_EVIDENCE.csv", "ECHO_BUDDHA_PHASE_3_COVERAGE_EXCEPTION_RECONCILIATION.csv", "ECHO_BUDDHA_PHASE_3_GSC_INTERNAL_LINK_RECONCILIATION.csv", "ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv", "ECHO_BUDDHA_GSC_URL_INSPECTION.csv", "ECHO_BUDDHA_GENERATIVE_AI_SEARCH_VISIBILITY.csv", "ECHO_BUDDHA_PHASE_3_PROTECTION_TIER_DIFF.csv", "ECHO_BUDDHA_DO_NOT_CHANGE_YET_DIFF.csv", "ECHO_BUDDHA_PHASE_3_NEW_STANDARD_PAGE_PERFORMANCE.csv", "ECHO_BUDDHA_PHASE_3_PROPERTY_MOMENTUM_REFRESH.csv", "ECHO_BUDDHA_PHASE_3_ORIGINAL_54_CHECKPOINT_RERUN.json", "ECHO_BUDDHA_PHASE_3_SECRET_HANDLING_VALIDATION.json", "collect-phase-3-gsc-api-evidence.mjs", "finalize-phase-3-completion-pass.mjs", "validate-phase-3-completion-pass.mjs", "validate-phase-3-completion-evidence.mjs", "independently-validate-phase-3-completion-pass.mjs", "validate-phase-3-secret-handling.mjs", "refresh-phase-3-completion-manifest.mjs"
];
manifest.generated_at = new Date().toISOString();
const workbookSnapshot = path.join(phase, "source-evidence/completion-2026-08-24/ECHO_BUDDHA_PHASE_3_NEW_GSC_WORKBOOK_SNAPSHOT.json");
const linksSnapshot = path.join(phase, "source-evidence/completion-2026-08-24/ECHO_BUDDHA_PHASE_3_CURRENT_LINKS_REPORT_SNAPSHOT.json");
const guidanceSnapshot = path.join(phase, "ECHO_BUDDHA_PHASE_3_COMPLETION_GOOGLE_GUIDANCE_SNAPSHOT.json");
manifest.inputs.workbook_snapshot = { path: path.relative(repo, workbookSnapshot), sha256: sha(workbookSnapshot) };
manifest.inputs.gsc_links_snapshot = { path: path.relative(repo, linksSnapshot), sha256: sha(linksSnapshot) };
manifest.inputs.google_guidance_snapshot = { path: path.relative(repo, guidanceSnapshot), sha256: sha(guidanceSnapshot) };
manifest.artifact_sha256 = Object.fromEntries([
  ...core.map((name) => [`../${name}`, sha(path.join(phase, name))]),
  ...completion.map((name) => [name, sha(path.join(dir, name))])
]);
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ artifacts_hashed: Object.keys(manifest.artifact_sha256).length }));
