import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-12-2026-08-25");
const base = process.argv[2] ?? "http://127.0.0.1:8789";
const generatedAt = "2026-08-25T10:45:00+05:30";
const samples = [
  "/", "/start-here/", "/articles/buddhist-wisdom-for-overthinking/",
  "/articles/compassion-with-boundaries/", "/articles/dhamma-vs-dharma/",
  "/learn/buddhism-101/what-is-mindfulness/", "/learn/buddhist-dictionary/anicca/",
  "/meditation/breathing-meditation/", "/quotes/mindfulness/",
  "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/",
  "/daily-reflections/thoughts-are-visitors/", "/search/?q=casino%3Cscript%3E",
  "/privacy-policy/", "/404", "/phase-12-invalid-route-probe/"
];
const redirectSamples = [
  ["/articles/how-to-practice-non-attachment/", "/articles/how-to-let-go-of-attachment-in-buddhism/"],
  ["/articles/letting-go-without-giving-up/", "/articles/how-to-let-go-of-attachment-in-buddhism/"],
  ["/terms-and-conditions/", "/terms-of-use/"]
];
const variants = {
  normal: { "user-agent": "Mozilla/5.0 EchoBuddha-Phase12-Normal" },
  googlebot: { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  mobile: { "user-agent": "Mozilla/5.0 (Linux; Android 15; Mobile) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36" },
  external_referrer: { "user-agent": "Mozilla/5.0 EchoBuddha-Phase12-Referrer", referer: "https://www.google.com/search?q=echobuddha" }
};
const hash = (body) => crypto.createHash("sha256").update(body.replace(/\s+/g, " ")).digest("hex");
const observations = [];

for (const route of samples) {
  const variantsOut = {};
  for (const [name, headers] of Object.entries(variants)) {
    const response = await fetch(`${base}${route}`, { headers, redirect: "manual" });
    const body = await response.text();
    variantsOut[name] = { status: response.status, location: response.headers.get("location") ?? "", body_hash: hash(body), bytes: body.length, noindex: /<meta\s+name=["']robots["'][^>]*noindex/i.test(body), reflected_attack: /casino\s*<script>/i.test(body), ad_runtime: /pagead2\.googlesyndication|adsbygoogle/i.test(body), empty_ad_placeholder: /data-ad-status=["']unfilled|class=["'][^"']*ad-placeholder/i.test(body) };
  }
  const baseline = variantsOut.normal;
  const parity = Object.values(variantsOut).every((value) => value.status === baseline.status && value.location === baseline.location && value.body_hash === baseline.body_hash);
  const expectedStatus = route.includes("invalid-route") ? 404 : 200;
  const searchSafe = !route.startsWith("/search/") || (baseline.noindex && !baseline.reflected_attack);
  observations.push({ route, expected_status: expectedStatus, parity, search_safe: searchSafe, variants: variantsOut, pass: parity && searchSafe && baseline.status === expectedStatus && !baseline.ad_runtime && !baseline.empty_ad_placeholder });
}

for (const [route, expectedPath] of redirectSamples) {
  const variantsOut = {};
  for (const [name, headers] of Object.entries(variants)) {
    const response = await fetch(`${base}${route}?utm_source=phase12`, { headers, redirect: "manual" });
    variantsOut[name] = { status: response.status, location: response.headers.get("location") ?? "" };
  }
  const baseline = variantsOut.normal;
  const parity = Object.values(variantsOut).every((value) => value.status === baseline.status && value.location === baseline.location);
  const targetMatches = baseline.location === expectedPath || baseline.location === `${expectedPath}?utm_source=phase12` || baseline.location === `https://echobuddha.com${expectedPath}` || baseline.location === `https://echobuddha.com${expectedPath}?utm_source=phase12`;
  observations.push({ route, expected_status: 301, expected_target: expectedPath, parity, variants: variantsOut, pass: parity && baseline.status === 301 && targetMatches });
}

const failures = observations.filter((item) => !item.pass);
const result = { phase: 12, generated_at: generatedAt, base, status: failures.length ? "FAIL" : "PASS", routes: observations.length, variants_per_route: 4, failures: failures.map((item) => item.route), observations };
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_12_LOCAL_POLICY_HTTP_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);

const q = (value) => { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const headers = ["URL", "browser_result", "bot_result", "mobile", "referrer_variant", "redirect", "difference", "legitimate", "risk", "evidence", "result"];
const rows = observations.map((item) => ({
  URL: `https://echobuddha.com${item.route}`,
  browser_result: `${item.variants.normal.status}:${item.variants.normal.location ?? ""}`,
  bot_result: `${item.variants.googlebot.status}:${item.variants.googlebot.location ?? ""}`,
  mobile: `${item.variants.mobile.status}:${item.variants.mobile.location ?? ""}`,
  referrer_variant: `${item.variants.external_referrer.status}:${item.variants.external_referrer.location ?? ""}`,
  redirect: item.expected_target ?? "NONE", difference: item.parity ? "NONE" : "MATERIAL_VARIANCE",
  legitimate: item.pass ? "YES" : "REVIEW", risk: item.pass ? "LOW" : "HIGH",
  evidence: "LOCAL_CLOUDFLARE_HTTP_NORMAL_GOOGLEBOT_MOBILE_EXTERNAL_REFERRER",
  result: item.pass ? "PASS" : "FAIL"
}));
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_12_CLOAKING_REDIRECT_REDTEAM.csv"), `${headers.join(",")}\n${rows.map((row) => headers.map((header) => q(row[header])).join(",")).join("\n")}\n`);
console.log(`Phase 12 local policy HTTP validation: ${observations.length - failures.length}/${observations.length} routes passed across four variants.`);
if (failures.length) process.exitCode = 1;
