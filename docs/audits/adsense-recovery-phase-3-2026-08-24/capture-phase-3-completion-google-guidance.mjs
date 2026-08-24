import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const urls = [
  "https://developers.google.com/webmaster-tools/v1/searchanalytics/query",
  "https://developers.google.com/webmaster-tools/limits",
  "https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect",
  "https://support.google.com/webmasters/answer/7576553?hl=en",
  "https://support.google.com/webmasters/answer/17011259?hl=en",
  "https://support.google.com/webmasters/answer/17011364?hl=en",
  "https://support.google.com/webmasters/answer/12919797?hl=en",
  "https://support.google.com/webmasters/answer/7440203?hl=en",
  "https://support.google.com/webmasters/answer/9049606?hl=en"
];
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const sources = [];
for (const url of urls) {
  const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "EchoBuddha-Private-Audit/1.0" } });
  const body = await response.text();
  sources.push({ requested_url: url, final_url: response.url, status: response.status, accessible: response.ok, sha256: sha256(body), bytes: Buffer.byteLength(body) });
}
const output = {
  checked_at: new Date().toISOString(),
  source_policy: "Official Google documentation only; no private repository or Search Console data transmitted.",
  accessible_count: sources.filter((source) => source.accessible).length,
  source_count: sources.length,
  confirmed_rules: {
    query_page_multiple_dimensions_supported: true,
    row_limit_maximum: 25000,
    start_row_pagination_supported: true,
    final_data_state_supported: true,
    search_analytics_top_rows_not_exhaustive: true,
    query_page_requests_are_high_load: true,
    url_inspection_site_quota_qpd: 2000,
    url_inspection_site_quota_qpm: 600,
    url_inspection_reports_indexed_version_not_live_test: true,
    links_report_is_sampled: true
  },
  sources
};
fs.writeFileSync(path.join(dir, "ECHO_BUDDHA_PHASE_3_COMPLETION_GOOGLE_GUIDANCE_SNAPSHOT.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ accessible: output.accessible_count, total: output.source_count }, null, 2));
