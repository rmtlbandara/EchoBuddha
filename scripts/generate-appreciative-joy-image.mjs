/** Original code-authored editorial diagram. No stock, remote asset, or generated photograph. */
import fs from 'node:fs/promises';
import sharp from 'sharp';
const stem = 'public/images/articles/appreciative-joy-when-comparison-hurts';
function drawing(width, height) {
  const viewHeight = Math.round(height / width * 1200);
  const square = viewHeight >= 900;
  const panelHeight = (viewHeight - 440) / 2;
  const panels = square
    ? [{ x: 100, y: 210, w: 1000, h: panelHeight, title: 'Their good news', line: 'Something good happened for them.' }, { x: 100, y: 250 + panelHeight, w: 1000, h: panelHeight, title: 'My unmet hope', line: 'Something I wanted is still missing.' }]
    : [{ x: 70, y: 210, w: 510, h: 270, title: 'Their good news', line: 'Something good happened for them.' }, { x: 620, y: 210, w: 510, h: 270, title: 'My unmet hope', line: 'Something I wanted is still missing.' }];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 ${viewHeight}" role="img" aria-labelledby="title desc">
<title id="title">Room for both</title><desc id="desc">Their good news and my unmet hope can both be acknowledged. My worth is not decided by either.</desc>
<rect width="1200" height="${viewHeight}" fill="#f8f3e9"/>
<text x="70" y="82" font-family="Arial,sans-serif" font-size="22" letter-spacing="4" fill="#435c47">ECHO BUDDHA · APPRECIATIVE JOY</text>
<text x="70" y="158" font-family="Georgia,serif" font-size="62" fill="#242a24">Room for both</text>
${panels.map((p,i)=>`<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="26" fill="${i?'#eee2ce':'#e1e9dc'}" stroke="#50634e" stroke-width="2"/>
<circle cx="${p.x+52}" cy="${p.y+58}" r="16" fill="${i?'#927139':'#45644b'}"/>
<text x="${p.x+35}" y="${p.y+125}" font-family="Georgia,serif" font-size="42" fill="#242a24">${p.title}</text>
<text x="${p.x+35}" y="${p.y+182}" font-family="Arial,sans-serif" font-size="24" fill="#3f493f">${p.line}</text>`).join('')}
<text x="70" y="${viewHeight-108}" font-family="Arial,sans-serif" font-size="32" fill="#242a24">My worth is not decided by either.</text>
<text x="70" y="${viewHeight-51}" font-family="Arial,sans-serif" font-size="21" fill="#435c47">An original editorial reading aid · not a scriptural quotation</text></svg>`;
}
await fs.writeFile(`${stem}.svg`, drawing(1200,675));
for (const [suffix,w,h,format] of [['.webp',1200,675,'webp'],['.avif',1200,675,'avif'],['-480.webp',480,270,'webp'],['-480.avif',480,270,'avif'],['-800.webp',800,450,'webp'],['-800.avif',800,450,'avif'],['-4x3.webp',1200,900,'webp'],['-1x1.webp',1200,1200,'webp']]) {
  await sharp(Buffer.from(drawing(w,h)))[format]({quality:format==='avif'?65:88,effort:5}).toFile(`${stem}${suffix}`);
}
console.log('Created original source SVG and eight responsive image variants.');
