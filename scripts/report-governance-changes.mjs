import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.resolve(root, process.env.GOVERNANCE_REPORT_DIR || ".artifacts/governance");
const base = process.env.GOVERNANCE_BASE_REF || (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "HEAD~1");
let files = [];
try {
  files = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
} catch {
  files = execFileSync("git", ["diff", "--name-only", base, "HEAD"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
}

const categories = {
  content: files.filter((file) => /^src\/(?:data|pages)\//.test(file)),
  indexing: files.filter((file) => /sitemap|robots|SEO\.astro|_redirects|release-baseline|indexable-page-approvals/.test(file)),
  trustSafety: files.filter((file) => /editorialGovernance|trust|source|safety|author|correction/i.test(file)),
  adsensePrivacy: files.filter((file) => /ads\.ts|AdSense|AdSlot|ConsentManager|privacy-policy|_headers/.test(file)),
  delivery: files.filter((file) => /^\.github\/|wrangler|scripts\/(?:validate-phase-9|production-smoke|create-release|verify-release)/.test(file)),
};
const warnings = [];
if (categories.content.length) warnings.push("Human editorial review: content/page data changed; review ownership, unique value, sources, safety, and template overlap.");
if (categories.indexing.length) warnings.push("SEO-significant change: verify URL, index state, sitemap, canonical, and redirect intent.");
if (categories.trustSafety.length) warnings.push("Trust/safety change: verify organizational identity, attribution, source IDs, and safety boundaries.");
if (categories.adsensePrivacy.length) warnings.push("High-sensitivity change: verify no AdSense runtime/manual-slot expansion and rerun consent browser scenarios.");
const result = { generatedAt: new Date().toISOString(), base, head: "HEAD", files, categories, warnings, blocking: false };
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "governance-change-report.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Governance change report: ${files.length} files; ${warnings.length} human-review warning(s).`);
for (const warning of warnings) console.warn(`WARNING: ${warning}`);
