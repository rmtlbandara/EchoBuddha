import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const walk = (dir, matcher, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) walk(filePath, matcher, out);
    else if (matcher(filePath)) out.push(filePath);
  }
  return out;
};

for (const filePath of walk(root, (file) => path.basename(file) === ".DS_Store")) {
  const relative = path.relative(root, filePath);
  if (!relative.startsWith("node_modules/") && !relative.startsWith(".git/") && !relative.startsWith("dist/")) {
    failures.push(`Remove OS metadata file from source: ${relative}`);
  }
}

const layout = read("src/layouts/Layout.astro");
if (layout.includes("googletagmanager.com/gtag/js")) {
  failures.push("Layout must not load Google Analytics directly; use ConsentManager.");
}

const consent = read("src/components/ConsentManager.astro");
for (const consentType of ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"]) {
  if (!consent.includes(consentType)) failures.push(`ConsentManager is missing ${consentType} handling.`);
}
if (!consent.includes("analytics_storage: \"denied\"")) {
  failures.push("ConsentManager must still support denying analytics storage.");
}
if (!consent.includes("writePreference(true)")) {
  failures.push("ConsentManager must default missing analytics preferences to accepted.");
}
if (consent.includes("window.setTimeout(openPanel")) {
  failures.push("ConsentManager must not auto-open the analytics popup for missing preferences.");
}
if (!consent.includes(".consent-panel[hidden]")) {
  failures.push("ConsentManager must explicitly hide the panel when the hidden attribute is set.");
}

const site = read("src/data/site.ts");
if (!site.includes("adsEnabled: false")) {
  failures.push("AdSense must remain disabled in src/data/site.ts.");
}

const publicFiles = walk(path.join(root, "public"), () => true);
const hiddenPublicFiles = publicFiles
  .map((filePath) => path.relative(path.join(root, "public"), filePath))
  .filter((relative) => relative.split(path.sep).some((part) => part.startsWith(".") && part !== ".well-known"));
if (hiddenPublicFiles.length > 0) {
  failures.push(`Public assets include hidden files: ${hiddenPublicFiles.join(", ")}`);
}

if (!fs.existsSync(path.join(root, "public/site.webmanifest"))) {
  failures.push("Missing public/site.webmanifest.");
}

if (!fs.existsSync(path.join(root, "public/_headers"))) {
  failures.push("Missing source-controlled Cloudflare header policy at public/_headers.");
} else {
  const headers = read("public/_headers");
  for (const required of [
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "X-Frame-Options: DENY",
    "Content-Security-Policy-Report-Only:"
  ]) {
    if (!headers.includes(required)) failures.push(`Missing required security header: ${required}`);
  }
}

if (!fs.existsSync(path.join(root, ".github/workflows/validate.yml"))) {
  failures.push("Missing CI workflow at .github/workflows/validate.yml.");
}

if (failures.length > 0) {
  console.error("Governance lint failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Governance lint passed.");
