import fs from "node:fs";
import sharp from "sharp";
// Rasterize repository-owned vector artwork; no third-party art or raster upscaling.
await sharp("public/og-default.svg").png({ compressionLevel: 9 }).toFile("public/og-default.png");
const sections = {
  learn: ["Learn Buddhism", "Foundations · Terms · Source-aware study"],
  meditation: ["Meditation", "Gentle practice · Clear guidance · Care"],
  handbook: ["Buddhist Life & Practice", "A source-aware handbook in eight chapters"],
  quotes: ["Quotes & Reflections", "Original writing for everyday practice"]
};
for (const [name, [title, subtitle]] of Object.entries(sections)) {
  const escape = (text) => text.replaceAll("&", "&amp;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fffdf8"/><circle cx="1100" cy="100" r="265" fill="#e8f0e4"/><circle cx="90" cy="625" r="225" fill="#f3dfaa"/><circle cx="1060" cy="120" r="122" fill="none" stroke="#b98524" stroke-width="5"/><text x="90" y="158" font-family="Georgia,serif" font-size="46" fill="#674824">Echo Buddha</text><text x="90" y="315" font-family="Georgia,serif" font-size="70" font-weight="700" fill="#26231f">${escape(title)}</text><path d="M90 360H390" stroke="#b98524" stroke-width="5"/><text x="90" y="428" font-family="Arial,sans-serif" font-size="29" fill="#405c43">${escape(subtitle)}</text><text x="90" y="542" font-family="Arial,sans-serif" font-size="24" fill="#674824">echobuddha.com</text></svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`public/og-${name}.png`);
}
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="70" fill="#fffdf8"/><circle cx="256" cy="256" r="214" fill="#e8f0e4"/><circle cx="256" cy="256" r="185" fill="none" stroke="#b98524" stroke-width="7"/><text x="256" y="240" text-anchor="middle" font-family="Georgia,serif" font-size="77" font-weight="700" fill="#26231f">Echo</text><text x="256" y="326" text-anchor="middle" font-family="Georgia,serif" font-size="77" font-weight="700" fill="#26231f">Buddha</text></svg>`;
fs.writeFileSync("public/images/publisher-logo.svg", logo + "\n");
await sharp(Buffer.from(logo)).png({ compressionLevel: 9 }).toFile("public/images/publisher-logo.png");
console.log("Generated five 1200×630 previews and the original 512×512 publisher logo.");
