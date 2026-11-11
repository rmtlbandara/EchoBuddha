// Original project-authored SVG is the source; no external photograph or artwork is used.
import sharp from "sharp";
await sharp("public/images/hero-buddha-source.svg")
  .resize(960, 960)
  .avif({ quality: 55, effort: 6 })
  .toFile("public/images/hero-buddha.avif");
console.log("Encoded the authored homepage illustration as 960×960 AVIF.");
