# Handbook Image Manifest

Date: 2026-09-26

All nine images are original project assets generated with OpenAI image generation for this refinement. No stock, scraped, archival, or third-party religious image was used. Masters are 1672×941 PNG files; production derivatives are 1600×900 and 800×450 (16:9) in AVIF and WebP. The browser receives width-based `srcset` and `sizes`; the true hero image is loaded eagerly with explicit intrinsic dimensions. AVIF is preferred and WebP is the fallback. Each chapter image is used in visible content, Open Graph/Twitter metadata, and the corresponding `Article.image` object.

| Page | Production basename | Concept | Alt text | Master file |
|---|---|---|---|---|
| `/learn/buddhist-handbook/` | `buddhist-life-practice-handbook` | Bodhi leaves, manuscript, bowl, path, distant stupa at dawn | Bodhi leaves, a palm-leaf manuscript, an alms bowl, and a path toward a distant stupa at dawn | `exec-e4315af6-ccc4-4f24-bf3c-563d21e62cca.png` |
| `/learn/buddhist-handbook/buddha-as-refuge/` | `buddha-as-refuge` | Empty teaching seat and medicine bowl beneath a Bodhi tree | An empty teaching seat and medicine bowl beneath a Bodhi tree at dawn | `exec-b351cdd0-e778-4889-a348-f74817fab03c.png` |
| `/learn/buddhist-handbook/dhamma-as-refuge/` | `dhamma-as-refuge` | Manuscripts and lamp beside an onward path | Palm-leaf manuscripts and an oil lamp beside a path leading toward sunrise | `exec-62c9fef1-4a86-46a5-a122-170fd4e9f181.png` |
| `/learn/buddhist-handbook/sangha-as-refuge/` | `sangha-as-refuge` | Robes, bowl, and cushions in a monastery courtyard | Meditation cushions, folded robes, and an alms bowl in an open monastery courtyard | `exec-7d7a5254-0644-4ac5-a52a-fb7e2845490f.png` |
| `/learn/buddhist-handbook/taking-refuge-triple-gem/` | `taking-refuge-triple-gem` | Three balanced refuge symbols in a home practice space | A Bodhi leaf, palm-leaf manuscript, and alms bowl in a quiet home practice space | `exec-9915e2f7-6e8f-493a-b6fd-6b0d252c4751.png` |
| `/learn/buddhist-handbook/forms-of-refuge-theravada/` | `forms-of-refuge-theravada` | Four paths converging at a teaching seat | Four garden paths converging beneath a Bodhi tree toward a teaching seat | `exec-4e3736fb-2421-4a3d-9539-0380f1281c30.png` |
| `/learn/buddhist-handbook/refuge-devas-buddhist-practice/` | `refuge-devas-buddhist-practice` | Stupa, Bodhi tree, and distinct devale in Sri Lankan landscape | A stupa, Bodhi tree, and separate devale shrine in a Sri Lankan landscape at twilight | `exec-fce5d78c-19ed-4b16-adb1-bb71b3d49b26.png` |
| `/learn/buddhist-handbook/respecting-triple-gem/` | `respecting-triple-gem` | Clean temple courtyard, stupa, Bodhi tree, flowers, books | A clean temple courtyard with a stupa, Bodhi tree, Buddha image, flowers, and Dhamma books | `exec-6e9876d6-4d20-41ff-8d80-8ecad70a8b38.png` |
| `/learn/buddhist-handbook/lay-sangha-relationship/` | `lay-sangha-relationship` | Open meeting veranda with offering, books, and shared seating | An open monastery meeting veranda with a meal offering, Dhamma books, and community chairs | `exec-d7bbc1c4-d090-481f-ae7d-ee9a4440206a.png` |

Master directory: `/Users/tharindu/.codex/generated_images/01a0d83e-0260-72c0-8133-d918a830d1bd/`

Production directory: `public/images/handbook/refined/`

## Generation method and prompt family

Mode: new generation, with targeted edits to remove pseudo-text or watermark-like artifacts on the Buddha, Taking Refuge, Forms, and Respect images. The shared prompt requested a calm, contemplative, premium editorial illustration in warm cream, forest green, muted brown, and restrained gold; accurate generic Buddhist symbolism; natural light; generous 16:9 composition; and no text, logos, fantasy effects, glowing supernatural figures, fake archaeology, or stock-photo staging. Each image then received the page-specific concept in the table above.

## Verification

- All 36 production files exist and exceed 30 KB.
- Full-size production images are 1600×900, responsive variants are 800×450, and markup retains explicit 1600×900 intrinsic dimensions to prevent layout shift.
- A nine-image contact sheet and each corrected master were visually inspected for composition, artifacts, pseudo-text, and religious sensationalism.
- Every chapter has a distinct image path; no logo is used as a chapter social image.
- Public image paths are not blocked by `robots.txt`; pages emit `max-image-preview:large`.
