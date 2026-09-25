# Echo Buddha Article Thumbnail Inventory

Audit date: 2026-09-25  
Scope: all 48 records dynamically discovered in `fullArticles`

## Baseline classification

| Class | Count | Meaning |
| --- | ---: | --- |
| A — Keep | 0 | No legacy asset met the new Handbook benchmark without art-direction changes. |
| B — Refine | 35 | The subject was usable, but the image needed a richer, publication-level treatment. |
| C — Regenerate | 13 | The article shared an image identity or used a text-heavy placeholder. |
| D — Technical fix only | 0 | No article needed only metadata or delivery work. |

Collection QA led to all 48 images being regenerated so the finished library would be coherent rather than mixing flat legacy illustration with the new painterly editorial benchmark. Every row below has a 1200×675 WebP fallback, a 1200×675 AVIF source, 480 px and 800 px WebP/AVIF responsive sources, a 1200×900 WebP crop, and a 1200×1200 WebP crop.

## Final refinement classification

The generated library then received a second, selective collection-level audit against the final concept-alignment brief. This classification describes the action taken on the generated artwork, not the legacy baseline above.

| Action | Count | Result |
| --- | ---: | --- |
| KEEP | 19 | Strong, distinctive images retained without art-direction changes. |
| REFINE | 3 | Composition retained; excessive sunset, mountain, or cinematic lighting removed. |
| RECOMPOSE | 26 | Rebuilt around a more specific daily-life, learning, practice, community, or tactile-process concept. |
| REGENERATE | 0 | No image required an unrelated replacement after focused recomposition. |
| TECHNICAL FIX ONLY | 0 | Delivery was already handled consistently at collection level. |

The final red-team pass also removed incidental generated writing from the Sangha and Right Speech scenes while preserving their approved compositions. All 48 identities remain unique and all 384 production derivatives pass the automated asset audit.

### Final action by image identity

- **KEEP (19):** `mindful-email-and-texting`, `dhamma-vs-dharma`, `right-speech-examples`, `dhammapada-verse-1-meaning`, `mindfulness-of-breathing-guide`, `loving-kindness-meditation-guide`, `buddhist-teachings-on-impermanence`, `buddhist-approach-to-anger`, `mindfulness-for-better-sleep`, `beginning-a-daily-mindfulness-practice`, `three-ways-to-practice-patience`, `creating-a-peaceful-corner-at-home`, `what-is-karma-in-buddhism`, `buddhist-teachings-on-forgiveness`, `metta-meditation-script`, `buddhist-wisdom-for-overthinking`, `three-poisons-buddhism-explained`, `right-livelihood-modern-life`, `buddhist-gratitude-practice`.
- **REFINE (3):** `how-to-meditate-for-anxiety`, `how-to-meditate-for-beginners`, `impermanence-in-buddhism-letting-go`.
- **RECOMPOSE (26):** `buddhism-for-beginners-simple-guide`, `compassion-in-buddhism-beginner-guide`, `compassion-with-boundaries`, `compassion-as-a-daily-discipline`, `dhammapada-reflection-trained-mind`, `dhammapada-reflection-what-we-think`, `eightfold-path-explained`, `eightfold-path-explained-daily-life`, `equanimity-in-buddhism`, `first-week-buddhist-practice`, `five-precepts-in-daily-life`, `four-noble-truths-explained`, `four-noble-truths-explained-simply`, `how-to-let-go-of-attachment-in-buddhism`, `how-to-practice-non-attachment` (used by the `non-attachment-in-relationships` article), `impermanence-in-buddhism`, `loving-kindness-meditation-beginners`, `mindful-listening-in-everyday-life`, `mindfulness-morning-routine`, `mindfulness-vs-meditation`, `noble-eightfold-path-practical-guide`, `right-speech-buddhism`, `visiting-a-buddhist-temple-respectfully`, `walking-meditation-step-by-step`, `what-is-buddhism-beginner-guide`, `what-is-sangha-buddhist-community`.
- **REGENERATE (0)** and **TECHNICAL FIX ONLY (0):** no image required either action in the final selective pass.

## Article mapping

| Article | Baseline | Old asset | New asset | Concept | Ratios | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Mindful Email and Texting | C | `mindful-listening-in-everyday-life.webp` | `mindful-email-and-texting.webp` | Phone, envelope, cup, and blank message shapes on a quiet desk | 16:9, 4:3, 1:1 | PASS |
| Compassion With Boundaries | C | `compassion-as-a-daily-discipline.webp` | `compassion-with-boundaries.webp` | A warm drink and note separated by a translucent room divider | 16:9, 4:3, 1:1 | PASS |
| Dhamma vs Dharma: What Is the Difference? | C | `what-is-buddhism-beginner-guide.webp` | `dhamma-vs-dharma.webp` | Two palm-leaf manuscript bundles beside one lamp | 16:9, 4:3, 1:1 | PASS |
| Visiting a Buddhist Temple Respectfully | C | `what-is-sangha-buddhist-community.svg` | `visiting-a-buddhist-temple-respectfully.webp` | Shoes on a rack as a visitor steps onto a plain entrance mat | 16:9, 4:3, 1:1 | PASS |
| First Week Buddhist Practice for Beginners | C | `buddhism-for-beginners-simple-guide.webp` | `first-week-buddhist-practice.webp` | Seven blank practice cards with ordinary practice supports | 16:9, 4:3, 1:1 | PASS |
| Non-Attachment in Relationships | B | `how-to-practice-non-attachment.webp` | `how-to-practice-non-attachment.webp` | Two friends walking together with comfortable space between them | 16:9, 4:3, 1:1 | PASS |
| Right Speech Examples for Everyday Life | C | `right-speech-buddhism.webp` | `right-speech-examples.webp` | Place settings and four soft ribbons meeting across a table | 16:9, 4:3, 1:1 | PASS |
| Dhammapada Verse 1 Meaning and Translation Caution | C | `dhammapada-reflection-what-we-think.webp` | `dhammapada-verse-1-meaning.webp` | Manuscript, blank notebook, magnifier, and gloves | 16:9, 4:3, 1:1 | PASS |
| What Is Buddhism? A Beginner-Friendly Guide | B | `what-is-buddhism-beginner-guide.webp` | `what-is-buddhism-beginner-guide.webp` | Open book, plain journal, tea cup, and cushion in a learning room | 16:9, 4:3, 1:1 | PASS |
| The Four Noble Truths Explained Simply | B | `four-noble-truths-explained-simply.webp` | `four-noble-truths-explained-simply.webp` | Four low steps leading from scattered pebbles to a clear doorway | 16:9, 4:3, 1:1 | PASS |
| The Noble Eightfold Path: A Practical Guide for Daily Life | B | `noble-eightfold-path-practical-guide.webp` | `noble-eightfold-path-practical-guide.webp` | Eight stone pavers crossing an ordinary urban courtyard | 16:9, 4:3, 1:1 | PASS |
| Impermanence in Buddhism: Learning to Let Go Gently | B | `impermanence-in-buddhism-letting-go.webp` | `impermanence-in-buddhism-letting-go.webp` | An overcast wave gradually erasing a circle drawn in wet sand | 16:9, 4:3, 1:1 | PASS |
| Compassion in Buddhism: A Beginner's Guide | B | `compassion-in-buddhism-beginner-guide.webp` | `compassion-in-buddhism-beginner-guide.webp` | A community kitchen worker setting down a warm bowl | 16:9, 4:3, 1:1 | PASS |
| How to Meditate for Beginners | B | `how-to-meditate-for-beginners.webp` | `how-to-meditate-for-beginners.webp` | Cushion, folded support, and timer bowl | 16:9, 4:3, 1:1 | PASS |
| Mindfulness of Breathing | B | `mindfulness-of-breathing-guide.webp` | `mindfulness-of-breathing-guide.webp` | A linen curtain curving beside a still ceramic bowl | 16:9, 4:3, 1:1 | PASS |
| Loving-Kindness Meditation: A Gentle Practice Guide | B | `loving-kindness-meditation-guide.webp` | `loving-kindness-meditation-guide.webp` | A central clay lamp illuminating a circle of cushions | 16:9, 4:3, 1:1 | PASS |
| Dhammapada Reflection: What We Think, We Become | B | `dhammapada-reflection-what-we-think.webp` | `dhammapada-reflection-what-we-think.webp` | A clear glass casting changing light and shadow over blank paper | 16:9, 4:3, 1:1 | PASS |
| Dhammapada Reflection: A Trained Mind Brings Peace | B | `dhammapada-reflection-trained-mind.webp` | `dhammapada-reflection-trained-mind.webp` | Clay and bowls at successive stages of shaping on a workbench | 16:9, 4:3, 1:1 | PASS |
| Buddhism for Beginners | B | `buddhism-for-beginners-simple-guide.webp` | `buddhism-for-beginners-simple-guide.webp` | A blank open book in an airy everyday study space | 16:9, 4:3, 1:1 | PASS |
| How to Meditate for Anxiety | B | `how-to-meditate-for-anxiety.webp` | `how-to-meditate-for-anxiety.webp` | Chair, cup, and moving curtain with a modest courtyard beyond | 16:9, 4:3, 1:1 | PASS |
| Loving-Kindness Meditation for Beginners | B | `loving-kindness-meditation-beginners.webp` | `loving-kindness-meditation-beginners.webp` | Five handmade cups widening from one central cup | 16:9, 4:3, 1:1 | PASS |
| The Noble Eightfold Path Explained for Daily Life | B | `eightfold-path-explained-daily-life.webp` | `eightfold-path-explained-daily-life.webp` | Daily objects gathered in an ordinary home entryway | 16:9, 4:3, 1:1 | PASS |
| A Mindful Morning Routine | B | `mindfulness-morning-routine.webp` | `mindfulness-morning-routine.webp` | Opening a curtain beside breakfast, water, journal, and closed phone | 16:9, 4:3, 1:1 | PASS |
| Buddhist Teachings on Impermanence and Change | B | `buddhist-teachings-on-impermanence.webp` | `buddhist-teachings-on-impermanence.webp` | Four leaves at different stages over dark water | 16:9, 4:3, 1:1 | PASS |
| Walking Meditation | B | `walking-meditation-step-by-step.webp` | `walking-meditation-step-by-step.webp` | Bare feet taking a measured step along a covered corridor | 16:9, 4:3, 1:1 | PASS |
| A Buddhist Approach to Anger | B | `buddhist-approach-to-anger.webp` | `buddhist-approach-to-anger.webp` | A heat-cracked clay cup cooling beside water | 16:9, 4:3, 1:1 | PASS |
| Mindfulness for Better Sleep | B | `mindfulness-for-better-sleep.webp` | `mindfulness-for-better-sleep.webp` | Turned-down bed, closed book, and moonlit window | 16:9, 4:3, 1:1 | PASS |
| Beginning a Daily Mindfulness Practice | B | `beginning-a-daily-mindfulness-practice.webp` | `beginning-a-daily-mindfulness-practice.webp` | Dew-covered leaf making one ripple in a bowl | 16:9, 4:3, 1:1 | PASS |
| Compassion as a Daily Discipline | B | `compassion-as-a-daily-discipline.webp` | `compassion-as-a-daily-discipline.webp` | Groceries and covered food left with care beside an apartment door | 16:9, 4:3, 1:1 | PASS |
| Three Ways to Practice Patience | B | `three-ways-to-practice-patience.webp` | `three-ways-to-practice-patience.webp` | Three pots showing soil, seedling, and flower | 16:9, 4:3, 1:1 | PASS |
| Mindful Listening in Everyday Life | B | `mindful-listening-in-everyday-life.webp` | `mindful-listening-in-everyday-life.webp` | Two adults in attentive conversation | 16:9, 4:3, 1:1 | PASS |
| Creating a Peaceful Corner at Home | B | `creating-a-peaceful-corner-at-home.webp` | `creating-a-peaceful-corner-at-home.webp` | A modest home corner with cushion, shelf, plant, and cup | 16:9, 4:3, 1:1 | PASS |
| How Karma Shapes Daily Choices | B | `what-is-karma-in-buddhism.webp` | `what-is-karma-in-buddhism.webp` | Planting a seed beside ripples in a stone basin | 16:9, 4:3, 1:1 | PASS |
| The Four Noble Truths in Everyday Language | B | `four-noble-truths-explained.webp` | `four-noble-truths-explained.webp` | A fiber cord shown in four stages from knots to a clear line | 16:9, 4:3, 1:1 | PASS |
| Mindfulness vs Meditation | B | `mindfulness-vs-meditation.webp` | `mindfulness-vs-meditation.webp` | Mindfully washing a cup while a meditation cushion rests nearby | 16:9, 4:3, 1:1 | PASS |
| Buddhist Teachings on Forgiveness | B | `buddhist-teachings-on-forgiveness.webp` | `buddhist-teachings-on-forgiveness.webp` | Releasing a dry leaf above a green shoot | 16:9, 4:3, 1:1 | PASS |
| Metta Meditation Script | B | `metta-meditation-script.webp` | `metta-meditation-script.webp` | Blank practice card and widening rings of lamp light | 16:9, 4:3, 1:1 | PASS |
| The Noble Eightfold Path Explained for Beginners | B | `eightfold-path-explained.webp` | `eightfold-path-explained.webp` | Eight colored natural-fiber strands braided into one cord | 16:9, 4:3, 1:1 | PASS |
| How to Let Go of Attachment | B | `how-to-let-go-of-attachment-in-buddhism.webp` | `how-to-let-go-of-attachment-in-buddhism.webp` | An open keepsake box, photographs, and a loosened ribbon | 16:9, 4:3, 1:1 | PASS |
| Right Speech in Buddhism | B | `right-speech-buddhism.webp` | `right-speech-buddhism.webp` | Two colleagues pausing for a thoughtful conversation | 16:9, 4:3, 1:1 | PASS |
| Buddhist Wisdom for Overthinking | B | `buddhist-wisdom-for-overthinking.webp` | `buddhist-wisdom-for-overthinking.webp` | Tangled thread unwinding around a smooth stone | 16:9, 4:3, 1:1 | PASS |
| Impermanence in Buddhism: Accepting Change | B | `impermanence-in-buddhism.webp` | `impermanence-in-buddhism.webp` | Linen cloths at different drying stages moving on a courtyard line | 16:9, 4:3, 1:1 | PASS |
| The Three Poisons in Buddhism | C | `three-poisons-buddhism-explained.svg` | `three-poisons-buddhism-explained.webp` | Three tangled roots loosening beneath a healthy tree | 16:9, 4:3, 1:1 | PASS |
| Equanimity in Buddhism | C | `equanimity-in-buddhism.svg` | `equanimity-in-buddhism.webp` | A protected lamp staying steady through rain and clearing weather | 16:9, 4:3, 1:1 | PASS |
| The Five Precepts in Daily Life | C | `five-precepts-in-daily-life.svg` | `five-precepts-in-daily-life.webp` | Five wooden supports protecting a young community-garden plant | 16:9, 4:3, 1:1 | PASS |
| Right Livelihood in Modern Life | C | `right-livelihood-modern-life.svg` | `right-livelihood-modern-life.webp` | A handmade bowl exchanged across a workbench | 16:9, 4:3, 1:1 | PASS |
| What Is Sangha? | C | `what-is-sangha-buddhist-community.svg` | `what-is-sangha-buddhist-community.webp` | Six varied adults listening together around a shared table | 16:9, 4:3, 1:1 | PASS |
| Buddhist Gratitude Practice | C | `buddhist-gratitude-practice.svg` | `buddhist-gratitude-practice.webp` | Open hands receiving a pear and releasing a leaf | 16:9, 4:3, 1:1 | PASS |
