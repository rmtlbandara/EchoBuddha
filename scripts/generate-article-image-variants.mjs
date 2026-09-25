import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fullArticles } from "../src/data/site.ts";

const projectRoot = process.cwd();
const sourceDirectory = process.argv.includes("--source-dir")
  ? path.resolve(process.argv[process.argv.indexOf("--source-dir") + 1])
  : undefined;
const articleDirectory = path.join(projectRoot, "public", "images", "articles");
const thumbnails = [...new Set(fullArticles.map((article) => article.thumbnail))].sort();

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeVariant(input, output, width, height, format, quality) {
  const pipeline = sharp(input).rotate().resize({
    width,
    height,
    fit: "cover",
    position: "centre",
    kernel: sharp.kernel.lanczos3
  });
  if (format === "avif") await pipeline.avif({ quality, effort: 5 }).toFile(output);
  else await pipeline.webp({ quality, effort: 5, smartSubsample: true }).toFile(output);
}

await mkdir(articleDirectory, { recursive: true });

for (const thumbnail of thumbnails) {
  if (!thumbnail.startsWith("/images/articles/") || !thumbnail.endsWith(".webp")) {
    throw new Error(`Article thumbnails must use a primary WebP asset: ${thumbnail}`);
  }

  const stem = path.basename(thumbnail, ".webp");
  const primary = path.join(articleDirectory, `${stem}.webp`);
  const sourceCandidate = sourceDirectory ? path.join(sourceDirectory, `${stem}.png`) : undefined;
  const source = sourceCandidate && await exists(sourceCandidate) ? sourceCandidate : primary;

  if (!(await exists(source))) throw new Error(`Missing source image for ${thumbnail}`);
  if (source !== primary) await writeVariant(source, primary, 1200, 675, "webp", 82);

  await Promise.all([
    writeVariant(source, path.join(articleDirectory, `${stem}.avif`), 1200, 675, "avif", 56),
    writeVariant(source, path.join(articleDirectory, `${stem}-480.webp`), 480, 270, "webp", 76),
    writeVariant(source, path.join(articleDirectory, `${stem}-480.avif`), 480, 270, "avif", 48),
    writeVariant(source, path.join(articleDirectory, `${stem}-800.webp`), 800, 450, "webp", 78),
    writeVariant(source, path.join(articleDirectory, `${stem}-800.avif`), 800, 450, "avif", 50),
    writeVariant(source, path.join(articleDirectory, `${stem}-4x3.webp`), 1200, 900, "webp", 82),
    writeVariant(source, path.join(articleDirectory, `${stem}-1x1.webp`), 1200, 1200, "webp", 82)
  ]);
}

console.log(`Generated responsive and structured-data variants for ${thumbnails.length} article images.`);

