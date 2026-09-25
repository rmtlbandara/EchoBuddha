const ARTICLE_IMAGE_WIDTHS = [480, 800, 1200] as const;

function withoutExtension(path: string) {
  return path.replace(/\.[^/.]+$/, "");
}

export function getArticleImageSet(thumbnail: string) {
  const base = withoutExtension(thumbnail);
  const webpAt = (width: number) => width === 1200 ? `${base}.webp` : `${base}-${width}.webp`;
  const avifAt = (width: number) => width === 1200 ? `${base}.avif` : `${base}-${width}.avif`;

  return {
    primary: `${base}.webp`,
    avif: `${base}.avif`,
    image4x3: `${base}-4x3.webp`,
    image1x1: `${base}-1x1.webp`,
    webpSrcset: ARTICLE_IMAGE_WIDTHS.map((width) => `${webpAt(width)} ${width}w`).join(", "),
    avifSrcset: ARTICLE_IMAGE_WIDTHS.map((width) => `${avifAt(width)} ${width}w`).join(", "),
    width: 1200,
    height: 675
  };
}

