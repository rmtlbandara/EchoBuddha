# UX and Mobile Validation

Status: **PASS**  
Checked: 2026-09-29

Nine representative routes cover all six remediated clusters plus the numbered-TOC, meditation-safety, and comprehensive-guide template changes. Each route was rendered at 390 × 844 and 1280 × 900.

## Results

- Rendered route/viewport combinations: 18
- HTTP/canonical/title/H1/main checks: 18/18
- Horizontal-overflow failures: 0
- Broken or missing-alt images: 0
- Critical/serious axe violations: 0
- Layout-shift threshold failures (CLS ≥ 0.1): 0
- FCP/LCP threshold failures (FCP ≥ 1.8s or LCP ≥ 2.5s): 0
- Obsolete FAQPage/HowTo schema observed: 0

Local paint measurements are regression gates, not field Core Web Vitals. Production CWV should continue to be monitored after deployment.

## Route matrix

| Cluster / regression | Route | Mobile | Desktop |
|---|---|---:|---:|
| Beginner Meditation | `/articles/how-to-meditate-for-beginners/` | PASS | PASS |
| Four Noble Truths | `/articles/four-noble-truths-explained-simply/` | PASS | PASS |
| Noble Eightfold Path | `/articles/eightfold-path-explained-daily-life/` | PASS | PASS |
| Buddhism for Beginners | `/articles/buddhism-for-beginners-simple-guide/` | PASS | PASS |
| Impermanence / Anicca | `/articles/impermanence-in-buddhism-letting-go/` | PASS | PASS |
| Loving-kindness / Mettā | `/articles/loving-kindness-meditation-guide/` | PASS | PASS |
| Numbered TOC regression | `/articles/noble-eightfold-path-practical-guide/` | PASS | PASS |
| Meditation detail safety regression | `/meditation/meditation-for-beginners/` | PASS | PASS |
| Comprehensive meditation reference | `/meditation-guide/` | PASS | PASS |
