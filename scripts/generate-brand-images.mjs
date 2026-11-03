import fs from "node:fs";
import sharp from "sharp";

// The original vector is the canonical artwork. Never recreate or overwrite it.
const logo = fs.readFileSync("public/images/publisher-logo.svg");
const logoDataUrl = `data:image/svg+xml;base64,${logo.toString("base64")}`;
const logoImage = (x, y, size) => `<image href="${logoDataUrl}" x="${x}" y="${y}" width="${size}" height="${size}"/>`;
await sharp(logo).png({ compressionLevel: 9 }).toFile("public/images/publisher-logo.png");

// Derive browser and install icons from the same artwork, without stretching or cropping.
const faviconImages = [];
for (const size of [16, 32, 48, 180, 192, 512]) {
  const file = size === 180 ? "apple-touch-icon.png"
    : size <= 48 ? `favicon-${size}x${size}.png` : `icon-${size}x${size}.png`;
  const png = await sharp(logo).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(`public/${file}`, png);
  if (size <= 48) faviconImages.push({size, png});
}
// ICO directories may contain PNG images; include all three actual favicon sizes.
const directory = Buffer.alloc(6 + faviconImages.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(faviconImages.length, 4);
let offset = directory.length;
for (const [index, { size, png }] of faviconImages.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
fs.writeFileSync("public/favicon.ico", Buffer.concat([directory, ...faviconImages.map(({png}) => png)]));

// Keep the established preview layouts; add the genuine logo in their open lower-right area.
const defaultSvg = fs.readFileSync("public/og-default.svg", "utf8");
await sharp(Buffer.from(defaultSvg)).png({ compressionLevel: 9 }).toFile("public/og-default.png");
const sections = {
  learn: ["Learn Buddhism", "Foundations · Terms · Source-aware study"],
  meditation: ["Meditation", "Gentle practice · Clear guidance · Care"],
  handbook: ["Buddhist Life & Practice", "A source-aware handbook in eight chapters"],
  quotes: ["Quotes & Reflections", "Original writing for everyday practice"]
};
for (const [name, [title, subtitle]] of Object.entries(sections)) {
  const escape = (text) => text.replaceAll("&", "&amp;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fffdf8"/><circle cx="1100" cy="100" r="265" fill="#e8f0e4"/><circle cx="90" cy="625" r="225" fill="#f3dfaa"/><circle cx="1060" cy="120" r="122" fill="none" stroke="#b98524" stroke-width="5"/><text x="90" y="158" font-family="Georgia,serif" font-size="46" fill="#674824">Echo Buddha</text><text x="90" y="315" font-family="Georgia,serif" font-size="70" font-weight="700" fill="#26231f">${escape(title)}</text><path d="M90 360H390" stroke="#b98524" stroke-width="5"/><text x="90" y="428" font-family="Arial,sans-serif" font-size="29" fill="#405c43">${escape(subtitle)}</text><text x="90" y="542" font-family="Arial,sans-serif" font-size="24" fill="#674824">echobuddha.com</text>${logoImage(1008, 438, 144)}</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`public/og-${name}.png`);
}
console.log("Generated five branded 1200×630 previews, publisher PNG, seven browser/install icons from the unchanged original logo.");
