import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fullArticles, SITE } from "../src/data/site.ts";

const root = process.cwd();
const imageDirectory = path.join(root, "public", "images", "articles");
const errors = [];
const hashes = new Map();
const expectedVariants = [
  [".webp", 1200, 675, 250_000],
  [".avif", 1200, 675, 180_000],
  ["-480.webp", 480, 270, 60_000],
  ["-480.avif", 480, 270, 40_000],
  ["-800.webp", 800, 450, 120_000],
  ["-800.avif", 800, 450, 90_000],
  ["-4x3.webp", 1200, 900, 300_000],
  ["-1x1.webp", 1200, 1200, 350_000]
];

function fail(message) {
  errors.push(message);
}

if (new Set(fullArticles.map((article) => article.thumbnail)).size !== fullArticles.length) {
  fail("Every article must have a distinct preferred image identity.");
}

for (const article of fullArticles) {
  if (!article.thumbnail.match(/^\/images\/articles\/[a-z0-9-]+\.webp$/)) {
    fail(`${article.slug}: primary image must be a semantic WebP path.`);
    continue;
  }
  if (!article.imageAlt || article.imageAlt.length < 12 || article.imageAlt.length > 180) {
    fail(`${article.slug}: alt text must be concise and descriptive.`);
  }

  const stem = path.basename(article.thumbnail, ".webp");
  for (const [suffix, width, height, budget] of expectedVariants) {
    const file = path.join(imageDirectory, `${stem}${suffix}`);
    if (!fs.existsSync(file)) {
      fail(`${article.slug}: missing ${path.basename(file)}`);
      continue;
    }
    const metadata = await sharp(file).metadata();
    if (metadata.width !== width || metadata.height !== height) {
      fail(`${article.slug}: ${path.basename(file)} is ${metadata.width}x${metadata.height}, expected ${width}x${height}.`);
    }
    if (fs.statSync(file).size > budget) {
      fail(`${article.slug}: ${path.basename(file)} exceeds ${budget} bytes.`);
    }
  }

  const primaryFile = path.join(root, "public", article.thumbnail);
  const digest = crypto.createHash("sha256").update(fs.readFileSync(primaryFile)).digest("hex");
  const existing = hashes.get(digest);
  if (existing) fail(`${article.slug}: duplicates primary artwork used by ${existing}.`);
  else hashes.set(digest, article.slug);

  const builtFile = path.join(root, "dist", "articles", article.slug, "index.html");
  if (!fs.existsSync(builtFile)) {
    fail(`${article.slug}: built article page is missing.`);
    continue;
  }
  const html = fs.readFileSync(builtFile, "utf8");
  const base = article.thumbnail.replace(/\.webp$/, "");
  const expected = [article.thumbnail, `${base}-4x3.webp`, `${base}-1x1.webp`];
  for (const image of expected) {
    if (!html.includes(`${SITE.url}${image}`)) fail(`${article.slug}: built metadata is missing ${image}.`);
  }
  for (const required of [
    "<picture>",
    "type=\"image/avif\"",
    "srcset=",
    "sizes=",
    "fetchpriority=\"high\"",
    "max-image-preview:large",
    "og:image:width",
    "og:image:height",
    "twitter:image:alt"
  ]) {
    if (!html.includes(required)) fail(`${article.slug}: built page is missing ${required}.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Article image audit passed for ${fullArticles.length} unique article identities and ${fullArticles.length * expectedVariants.length} generated assets.`);

