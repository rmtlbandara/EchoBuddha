# Echo Buddha Editorial Thumbnail System

## Purpose

Echo Buddha article imagery uses a quiet contemporary Buddhist editorial language: calm, premium, tactile, culturally respectful, globally legible, and specific to the article rather than decorative spirituality. The Buddhist Life & Practice Handbook artwork is the quality reference, not a scene template.

## Visual language

- Prefer painterly realism, natural materials, understated texture, soft depth, and a single clear focal idea.
- Use warm ivory, stone, sage, olive, muted clay, restrained ochre, warm gold, and occasional charcoal brown. Cool night blue or rain gray may support sleep, uncertainty, or change.
- Vary art direction across the library: still life, close detail, interior, human connection, study, work, water, path, and landscape. Do not allow three adjacent cards to repeat the same setting, palette, or focal device.
- Keep important subjects in the central safe area for 16:9, 4:3, and 1:1 crops. The image must remain meaningful at a 320 px mobile-card size.
- Do not place headlines, category labels, dates, CTAs, fake writing, or branding inside artwork.

## What an Echo Buddha image should feel like

The image should connect Buddhist wisdom with a recognizable human moment: learning at a table, pausing before speech, carrying care to a neighbor, tending a shared space, moving through work, or noticing change. It should be compassionate and grounded without advertising enlightenment. Quiet does not mean vacant; every image needs an editorial idea that a reader can grasp at thumbnail size.

Use three complementary editorial modes across the collection:

- **Learn:** books, teaching materials, study rooms, careful comparison, or a concrete visual model. Keep every visible page blank unless genuine source text is essential and verified.
- **Practice:** ordinary actions, ethical choices, meditation supports, work, walking, listening, and repeatable routines.
- **Reflect:** change, release, steadiness, attention, and consequence expressed through tactile processes rather than generic scenery.

The library should represent Buddhism as a living global tradition and a practical source of wisdom. Include varied ages, appearances, homes, workplaces, community spaces, and climates without turning any identity or tradition into visual shorthand.

## Anti-AI and anti-cliche gate

Reject or rework an image when it relies on cinematic gold light, anonymous mountains, lone silhouettes, excessive mist, floating objects, glowing halos, symmetrical spiritual spectacle, plastic surfaces, duplicated features, malformed hands, invented text, or the same composition already used elsewhere. A natural landscape is valid only when the landscape itself explains the article concept. Photorealism is not enough: the scene must feel observed, plausible, and editorially specific.

## Religious and cultural treatment

Prefer human-life and natural metaphors when historical or ritual accuracy is not essential. Do not use Buddha heads as decoration, distorted sacred figures, accidental mudras, invented Pali or Sanskrit, sacred objects underfoot, mixed architectural traditions, fantasy monks, halos, or tourist-poster spectacle. Temple and manuscript scenes require plausible materials and respectful placement.

## Topic mapping

- Mindfulness: a present-moment detail, attentive listening, breath movement, or one observed object.
- Meditation: a practical space, cushion, posture support, measured movement, or gentle inward attention.
- Compassion and metta: care, warmth, protection, listening, shared light, or inclusive community.
- Impermanence and non-attachment: changing leaves, water, release, a loosened thread, or a temporary mark.
- Ethics and Eightfold Path: a traversable path, ordinary work, conversation, training markers, or protective habits.
- Textual study: manuscripts, blank notes, lamps, comparison, and careful reading without invented script.
- Difficult emotions: tension becoming space, cooling, grounding, or tangled material becoming clear.

## File contract

Every article has one semantic basename under `public/images/articles/` and these generated assets:

| Purpose | Filename | Dimensions | Format |
| --- | --- | ---: | --- |
| Preferred/social/fallback | `{slug}.webp` | 1200×675 | WebP |
| Preferred modern source | `{slug}.avif` | 1200×675 | AVIF |
| Card source | `{slug}-480.*` | 480×270 | AVIF + WebP |
| Wide card source | `{slug}-800.*` | 800×450 | AVIF + WebP |
| Structured-data crop | `{slug}-4x3.webp` | 1200×900 | WebP |
| Structured-data crop | `{slug}-1x1.webp` | 1200×1200 | WebP |

Run `npm run images:articles` after adding a 1200×675 primary file. During an art-production pass, `node scripts/generate-article-image-variants.mjs --source-dir <png-directory>` can derive all crops from higher-resolution PNG sources.

Primary filenames must be short, lowercase, hyphenated, semantic, and stable. Do not delete an old indexed asset solely because the content model moved to a better semantic URL; retain it unless a deliberate redirect or retirement plan exists.

## HTML and metadata contract

- Use `ArticleImage.astro`; it emits an AVIF/WebP `<picture>`, explicit dimensions, `srcset`, `sizes`, and a crawlable fallback `src`.
- Card images are lazy-loaded. The visible article feature image is eager with `fetchpriority="high"`; do not preload card grids.
- The 1200×675 primary is the `og:image` and Twitter image. Emit 1200×675 dimensions and descriptive social-image alt text.
- Article structured data references the same artwork in 16:9, 4:3, and 1:1 crops.
- Indexable pages emit `max-image-preview:large`. Robots must allow image crawling.
- A separate image sitemap is not required while each preferred image is present in standard HTML, metadata, and structured data on an already-sitemapped canonical article page.

## Alt text

Describe the visible scene and, when useful, its editorial metaphor. Do not repeat the article headline verbatim, list keywords, or describe unsupported symbolism. When a rendering is purely decorative and adjacent text provides all meaning, use empty alt text; linked article-card thumbnails remain descriptive because the image is part of the link.

## Performance budget

- Mobile cards should select the 480 px AVIF/WebP source rather than the 1200 px primary.
- Desktop cards should normally select 480 or 800 px; the 1200 px source is reserved for feature/social use and high-density layouts.
- Preserve the 16:9 aspect ratio and explicit intrinsic dimensions to prevent layout shift.
- Keep un-hashed `/images/` assets cacheable but revalidatable; do not mark stable mutable URLs as immutable.
- Reject a release if representative Lighthouse results show an unexplained material LCP, CLS, or transfer-size regression.

## Generation brief template

```text
ARTICLE: exact title
PRIMARY CONCEPT: what the article is actually about
VISUAL METAPHOR: one specific, meaningful metaphor
SCENE / FOCAL SUBJECT: thumbnail-readable composition
SECONDARY ELEMENTS: only elements needed for meaning
EMOTIONAL TONE: calm, practical, compassionate, reflective, or clear
ECHO BUDDHA STYLE: painterly realism, tactile natural materials, quiet editorial finish
PALETTE: warm ivory, stone, sage, olive, muted clay, restrained ochre/gold
COMPOSITION: central safe zone for 16:9, 4:3, and square
CULTURAL NOTES: accuracy and sacred-image constraints
NEGATIVE REQUIREMENTS: no text, watermark, anatomy errors, fake script, glossy 3D, neon spirituality, or repeated library composition
```

## Release QA

1. Review the 16:9 and square contact sheets as a collection and inspect each new master at full size.
2. Confirm relevance, central crop, anatomy, faces, hands, text artifacts, religious accuracy, and adjacent-card variety.
3. Run `npm run images:articles`, `npm run validate:release`, browser accessibility checks, and representative Lighthouse checks.
4. Inspect built HTML for fallback `src`, `srcset`, `sizes`, alt text, canonical, OG/Twitter image, robots metadata, and Article image URLs.
5. Confirm every referenced image returns 200 with the expected MIME type and dimensions.
6. Deploy only the exact validated commit through the protected production workflow, then run production smoke and manually verify representative mobile and desktop pages.
7. Classify every reviewed image as KEEP, REFINE, RECOMPOSE, REGENERATE, or TECHNICAL FIX ONLY. Regeneration is a last resort; preserve strong work when a focused edit or new composition can solve the problem.
