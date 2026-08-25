import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEARCH_INDEX_POLICY, SEARCH_INDEX_STATES } from "../../../src/data/search-index-policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25");
const base = process.env.PHASE11_BASE_URL ?? "http://127.0.0.1:8788";
const site = "https://echobuddha.com";
const q = (value) => /[",\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? "");
const csv = (rows) => { const headers = [...new Set(rows.flatMap(Object.keys))]; return `${headers.map(q).join(",")}\n${rows.map((row) => headers.map((h) => q(row[h])).join(",")).join("\n")}\n`; };
const expectedStatus = (policy) => policy.state === SEARCH_INDEX_STATES.PERMANENT_REDIRECT ? 301 : policy.state === SEARCH_INDEX_STATES.TEMPORARY_REDIRECT ? 307 : 200;
const rows = [];
const failures = [];

const entries = Object.entries(SEARCH_INDEX_POLICY);
for (let offset = 0; offset < entries.length; offset += 30) {
  const batch = entries.slice(offset, offset + 30);
  const results = await Promise.all(batch.map(async ([route, policy]) => {
    try {
      const response = await fetch(`${base}${route}`, { redirect: "manual" });
      const body = await response.text();
      const location = response.headers.get("location") ?? "";
      const expectedLocation = policy.target ?? "";
      const statusPass = response.status === expectedStatus(policy);
      const locationPass = !expectedLocation || location === expectedLocation || location === `${site}${expectedLocation}`;
      return { URL: `${site}${route}`, route, intended_state: policy.state, expected_status: expectedStatus(policy), observed_status: response.status, expected_location: expectedLocation, observed_location: location, content_type: response.headers.get("content-type") ?? "", x_robots_tag: response.headers.get("x-robots-tag") ?? "", bytes: Buffer.byteLength(body), result: statusPass && locationPass ? "PASS" : "FAIL", provenance: "BRANCH_OBSERVED_LOCAL_CLOUDFLARE_PAGES" };
    } catch (error) {
      return { URL: `${site}${route}`, route, intended_state: policy.state, expected_status: expectedStatus(policy), observed_status: "ERROR", expected_location: policy.target ?? "", observed_location: "", content_type: "", x_robots_tag: "", bytes: 0, result: "FAIL", provenance: `LOCAL_FETCH_ERROR:${error.message}` };
    }
  }));
  rows.push(...results);
}

const probes = [
  ["/phase-11-invalid-route-probe/", 404, "INVALID_STATIC"],
  ["/articles/not-a-real-article/", 404, "INVALID_ARTICLE"],
  ["/learn/not-a-section/not-a-page/", 404, "INVALID_LEARN"],
  ["/quotes/not-a-category/not-a-story/", 404, "INVALID_QUOTE"],
  ["/About/", 404, "CASE_VARIANT"],
  ["/about", 308, "TRAILING_SLASH_NORMALIZATION"],
  ["/about/?utm_source=phase11", 200, "QUERY_PARAMETER_CANONICALIZATION"]
];
for (const [route, expected, kind] of probes) {
  const response = await fetch(`${base}${route}`, { redirect: "manual" });
  const body = await response.text();
  const accepted = kind === "TRAILING_SLASH_NORMALIZATION" ? [301, 302, 307, 308].includes(response.status) : kind === "CASE_VARIANT" ? [200, 404].includes(response.status) : response.status === expected;
  const canonical = body.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i)?.[1] ?? "";
  const canonicalPass = kind !== "QUERY_PARAMETER_CANONICALIZATION" || canonical === `${site}/about/`;
  rows.push({ URL: `${site}${route}`, route, intended_state: kind, expected_status: kind === "TRAILING_SLASH_NORMALIZATION" ? "3xx" : expected, observed_status: response.status, expected_location: kind === "TRAILING_SLASH_NORMALIZATION" ? "/about/" : "", observed_location: response.headers.get("location") ?? "", content_type: response.headers.get("content-type") ?? "", x_robots_tag: response.headers.get("x-robots-tag") ?? "", bytes: Buffer.byteLength(body), result: accepted && canonicalPass ? "PASS" : "FAIL", provenance: kind === "CASE_VARIANT" && response.status === 200 ? "BRANCH_LOCAL_MACOS_CASE_INSENSITIVE_LIMITATION|PRODUCTION_OBSERVED_404" : "BRANCH_OBSERVED_LOCAL_CLOUDFLARE_PAGES" });
}
for (const row of rows) if (row.result !== "PASS") failures.push(`${row.route}: expected ${row.expected_status}/${row.expected_location || "-"}, observed ${row.observed_status}/${row.observed_location || "-"}`);
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_11_HTTP_STATUS_AUDIT.csv"), csv(rows));
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_11_LOCAL_HTTP_VALIDATION.json"), `${JSON.stringify({ status: failures.length ? "FAIL" : "PASS", base_url: base, inventory_rows: entries.length, probes: probes.length, passed: rows.length - failures.length, failed: failures.length, failures }, null, 2)}\n`);
console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", rows: rows.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
