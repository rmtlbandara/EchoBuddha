import { countReadableWords, getReadTimeFromWordCount } from "../utils/publicationMetadata.ts";

export type HandbookLink = { label: string; href: string; description?: string };

export type HandbookSource = {
  label: string;
  href: string;
  sourceType:
    | "Early Buddhist discourse"
    | "Theravāda canonical collection"
    | "Traditional Theravāda manual"
    | "Theravāda commentary / tradition"
    | "Sri Lankan cultural practice"
    | "Academic reference";
  note: string;
};

export type HandbookSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type HandbookImage = {
  src: string;
  avif: string;
  alt: string;
  width: number;
  height: number;
};

export type HandbookPage = {
  number: number;
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  publishedDate: string;
  modifiedDate: string;
  intro: string;
  takeaway: string;
  image: HandbookImage;
  sections: HandbookSection[];
  sourceNote: string;
  sources: HandbookSource[];
  relatedLinks: HandbookLink[];
  relatedTerms: string[];
  searchTerms: string[];
  previous?: HandbookLink;
  next?: HandbookLink;
};

export const HANDBOOK_PATH = "/learn/buddhist-handbook";
export const HANDBOOK_PART = "Part I · The Triple Gem & Refuge";
export const HANDBOOK_IMAGE = "/images/handbook/refined/buddhist-life-practice-handbook.webp";
export const HANDBOOK_IMAGE_AVIF = "/images/handbook/refined/buddhist-life-practice-handbook.avif";
export const HANDBOOK_IMAGE_WIDTH = 1600;
export const HANDBOOK_IMAGE_HEIGHT = 900;

export function getHandbookImageVariant(src: string, width: 800 | 1600 = 800) {
  return width === 1600 ? src : src.replace(/\.(avif|webp)$/, `-${width}.$1`);
}

export const handbookPages: HandbookPage[] = [
  {
    number: 1,
    slug: "buddha-as-refuge",
    title: "The Buddha as Refuge",
    seoTitle: "The Buddha as Refuge: Meaning and Practice | Echo Buddha",
    description: "Learn what taking refuge in the Buddha means, how recollection works, and how early teachings differ from later Theravāda devotional traditions.",
    eyebrow: "Part I · Chapter 1 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "Taking the Buddha as refuge means orienting life toward awakening through confidence in a teacher and an example—not asking a supernatural rescuer to do the work of practice for us.",
    takeaway: "The Buddha is a refuge because his awakening makes the path knowable. Recollection becomes practical when admiration turns into ethical conduct, training of mind, and careful understanding.",
    image: {
      src: "/images/handbook/refined/buddha-as-refuge.webp",
      avif: "/images/handbook/refined/buddha-as-refuge.avif",
      alt: "An empty teaching seat and medicine bowl beneath a Bodhi tree at dawn",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "What the Word Refuge Is Doing",
        paragraphs: [
          "In ordinary speech, a refuge is a safe place. In Buddhist practice it also names a direction: a person entrusts their training to the Buddha as the awakened teacher, the Dhamma as the teaching and realization, and the Saṅgha as the community of noble disciples. The act is therefore both devotional and practical.",
          "The Buddha is not presented as a creator god who cancels cause and effect or grants awakening on request. He is remembered as someone who discovered and taught a path. Confidence in him matters because it can steady a learner long enough to test that path through conduct, meditation, and wisdom.",
          "This is why refuge should not be reduced to repeating a formula. Recitation can mark an intention, but the intention becomes visible in what a person values, avoids, studies, and repeatedly practices."
        ]
      },
      {
        heading: "The Qualities Recollected in Theravāda Practice",
        paragraphs: [
          "A standard recollection praises the Buddha as accomplished, fully awakened, complete in knowledge and conduct, well gone, knower of worlds, unsurpassed trainer of persons, teacher of gods and humans, awakened, and blessed. These titles are not a biography in miniature. They are practice prompts that direct attention toward wisdom, integrity, skill in teaching, and freedom.",
          "Early discourses repeatedly use this formula when describing confident recollection. A practitioner need not manufacture a dramatic feeling. Quietly considering one quality—and asking how it changes one’s choices—can be a more honest beginning than trying to produce devotion on command.",
          "Later biographies and devotional literature also praise the Buddha’s compassion, impartial teaching, extraordinary knowledge, voice, physical marks, radiance, and supernormal abilities. These portrayals have a real place in Buddhist tradition, but they answer a different question from modern historical biography."
        ]
      },
      {
        heading: "Long Preparation and Great Compassion",
        paragraphs: [
          "Theravāda tradition tells of the Buddha’s long bodhisatta career and of sacrifices made over immeasurable spans of time. Later texts sometimes give the period as four incalculable ages and one hundred thousand eons. The figure expresses the magnitude of the aspiration and cultivation; it is a traditional cosmological chronology, not a date that historical method can verify.",
          "The moral point of these accounts is not that ordinary people should imitate every legendary sacrifice. It is that awakening is associated with sustained generosity, truthfulness, patience, resolve, loving-kindness, and equanimity. Compassion is not merely a pleasant emotion in these narratives; it is a long discipline.",
          "Readers can receive the tradition respectfully while still naming its source layer. Early discourse, later biography, commentarial explanation, devotional poetry, and modern history answer different questions. Mixing them removes context from all of them."
        ]
      },
      {
        heading: "A Teacher and Physician, Not a Substitute for Practice",
        paragraphs: [
          "A useful traditional comparison is a skilled physician. A physician can diagnose an illness, explain the treatment, and warn against what worsens it. The patient still has to follow the treatment. In the same way, confidence in the Buddha is meant to support practice rather than replace it.",
          "This protects refuge from two opposite mistakes. One is treating the Buddha as irrelevant once a teaching has been heard. Gratitude, recollection, and confidence can be powerful supports. The other is expecting reverence alone to undo harmful habits while conduct and understanding remain unchanged.",
          "A simple practice is to recollect one quality before a difficult choice: clarity before confusion, compassion before cruelty, truthfulness before self-protection. Refuge becomes concrete at the point where a remembered quality changes an action."
        ]
      },
      {
        heading: "Historical Teacher, Devotional Memory",
        paragraphs: [
          "The earliest discourses present a human teacher moving through northern India, speaking with rulers, workers, householders, renunciants, women and men, and building communities of practice. Historical inquiry can responsibly study that setting without deciding every religious claim in advance.",
          "Theravāda tradition remembers more than a historical founder. It remembers the Sammāsambuddha: one who awakened without a teacher in that life and opened a path for others. The long bodhisatta career, extraordinary bodily signs, six-colored radiance, far-reaching knowledge, and supernormal abilities belong especially to canonical narrative, later commentary, and devotional retelling rather than to one flat layer of biography.",
          "Keeping the layers visible does not require choosing contempt or credulity. A practitioner may receive the traditional portrait as an object of confidence while a historian asks when and where particular details appear. The practical test remains whether recollection supports wisdom, compassion, and freedom from greed, hatred, and delusion."
        ]
      }
    ],
    sourceNote: "The standard recollection formula appears in early discourses. The four-incalculables chronology and many extraordinary biographical details are preserved in later Theravāda texts and commentary; they are presented here as traditional devotional memory rather than modern historical proof.",
    sources: [
      { label: "Mahāparinibbāna Sutta (DN 16) — SuttaCentral", href: "https://suttacentral.net/dn16/en/sujato", sourceType: "Early Buddhist discourse", note: "Includes the standard recollection of the Buddha’s qualities and shows how recollection functions as a source of confidence." },
      { label: "Cūḷahatthipadopama Sutta (MN 27) — SuttaCentral", href: "https://suttacentral.net/mn27/en/sujato", sourceType: "Early Buddhist discourse", note: "Supports the gradual movement from confidence in the Buddha toward direct training and knowledge." },
      { label: "A Treatise on the Pāramīs — Buddhist Publication Society", href: "https://bps.lk/book/a-treatise-on-the-paramis", sourceType: "Theravāda commentary / tradition", note: "Provides the later Theravāda account of the bodhisatta path, its compassionate purpose, and the traditional duration of the perfections." }
    ],
    relatedLinks: [
      { label: "Who Was the Buddha?", href: "/learn/buddhism-101/who-was-the-buddha/", description: "Begin with the historical teacher and the meaning of awakening." },
      { label: "The Three Jewels Explained", href: "/learn/buddhism-101/the-three-jewels-explained/", description: "Read the concise beginner overview before this deeper sequence." },
      { label: "Did the Buddha Order Buddha Images?", href: "/learn/questions-about-buddhism/did-buddha-order-buddha-images/", description: "Separate early evidence, later image traditions, and devotional meaning." }
    ],
    relatedTerms: ["Buddha", "Buddhānussati", "Tathāgata", "Bodhisatta", "Refuge"],
    searchTerms: ["Buddha refuge", "taking refuge in Buddha", "Buddha qualities", "recollection of Buddha", "Triple Gem"],
    next: { label: "The Dhamma as Refuge", href: `${HANDBOOK_PATH}/dhamma-as-refuge/` }
  },
  {
    number: 2,
    slug: "dhamma-as-refuge",
    title: "The Dhamma as Refuge",
    seoTitle: "The Dhamma as Refuge: Teaching, Practice, and Realization",
    description: "Understand the Dhamma as teaching, practice, and realization, including the Tipiṭaka, paths and fruits, Nibbāna, and source-aware study.",
    eyebrow: "Part I · Chapter 2 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "The Dhamma is more than a collection of books. It is the Buddha’s teaching, the practice that can be undertaken, and the liberating reality toward which the teaching points.",
    takeaway: "To take the Dhamma as refuge is to rely on a path that invites study, ethical testing, cultivation, and direct understanding—not to treat scripture as a charm or information as realization.",
    image: {
      src: "/images/handbook/refined/dhamma-as-refuge.webp",
      avif: "/images/handbook/refined/dhamma-as-refuge.avif",
      alt: "Palm-leaf manuscripts and an oil lamp beside a path leading toward sunrise",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "Teaching, Practice, and Realization",
        paragraphs: [
          "Dhamma carries several connected meanings. It can name the Buddha’s teaching, the truth or pattern disclosed by that teaching, individual phenomena, and the qualities cultivated along the path. Context determines which meaning is active.",
          "Theravāda explanations often distinguish learned teaching from realized Dhamma. Texts, translations, sermons, and conversations can guide a person, but they do not become wisdom merely by being collected. The teaching fulfills its purpose when it is understood and embodied.",
          "This makes the Dhamma a demanding refuge. It asks the reader to examine causes and consequences, abandon what is unskillful, cultivate what is skillful, and see experience more clearly."
        ]
      },
      {
        heading: "The Nine Supramundane Dhammas",
        paragraphs: [
          "Classical Theravāda analysis speaks of nine supramundane dhammas: four paths, four corresponding fruits, and Nibbāna. The four stages are stream-entry, once-return, non-return, and arahantship. ‘Path’ names the decisive breakthrough at a stage; ‘fruit’ names its result.",
          "This scheme should not be confused with the many teachings preserved in scripture. It is a map of liberating realization. Nibbāna is included as the unconditioned goal, not as a heavenly place granted by an external power.",
          "For a beginner, the value of the map is orientation rather than self-certification. It shows that Buddhist practice has a direction and degrees of transformation, while cautioning against turning spiritual labels into status claims."
        ]
      },
      {
        heading: "What the Tipiṭaka Contains",
        paragraphs: [
          "The Pāli Tipiṭaka—‘Three Baskets’—is conventionally organized as Vinaya Piṭaka, Sutta Piṭaka, and Abhidhamma Piṭaka. The Vinaya contains monastic discipline and its narratives; the Sutta collection contains discourses and verse; the Abhidhamma organizes teachings through detailed analytical frameworks.",
          "Traditional summaries sometimes give exact totals for books, discourses, recitation units, verses, or ‘Dhamma items,’ including the well-known number eighty-four thousand. Such figures depend on edition, classification, and what is being counted. They are best read as traditional enumerations, not a single universal arithmetic inventory.",
          "Theravāda tradition also associates the teaching of the Abhidhamma with the Tāvatiṃsa heaven and the Buddha’s mother. Modern scholarship investigates the collection’s textual development differently. A source-aware reader can understand the devotional account as tradition without relabeling it as an early-discourse historical report."
        ]
      },
      {
        heading: "Why Respect for Dhamma Includes Careful Reading",
        paragraphs: [
          "Respect for the Dhamma may be expressed through listening attentively, caring for books, supporting translation and teaching, and avoiding casual distortion. Yet physical care is not enough. Respect also includes checking the source, identifying whether a passage is canonical or commentarial, and acknowledging when a claim is uncertain.",
          "A practical reading method asks four questions: What kind of source is this? What does it actually claim? Which interpretation is being added? What change in conduct or understanding does it invite? These questions keep study from becoming either credulous or dismissive.",
          "The Dhamma is described as visible here and now, timeless in its relevance, inviting inspection, onward-leading, and knowable individually by the wise. Those qualities make inquiry part of reverence."
        ]
      },
      {
        heading: "From Words to a Lived Refuge",
        paragraphs: [
          "The three baskets preserve different kinds of guidance. Vinaya shows how a renunciant community learns from conflict and sets boundaries. Suttas teach through dialogue, lists, stories, verses, and gradual instruction. The Theravāda Abhidhamma offers a later canonical system for analyzing experience with great precision. None is helped by pretending that every collection has the same literary history or purpose.",
          "A useful sequence is hearing, remembering, examining, practicing, and directly knowing. Study supplies language and orientation; ethical restraint reduces remorse; meditation steadies attention; wisdom tests what has been learned against experience. The stages reinforce one another, but reading alone is not realization.",
          "For daily practice, choose one teaching and give it a defined trial: truthful speech in one difficult conversation, mindful breathing for ten minutes, or noticing impermanence in a recurring frustration. Record what changed and what did not. In that movement from instruction to observation, the Dhamma begins to function as refuge."
        ]
      }
    ],
    sourceNote: "The qualities used in recollection are grounded in early discourses. The nine supramundane dhammas are a classical Theravāda analytical category, while exact canon totals and the celestial account of Abhidhamma teaching belong to particular recensions and later Theravāda tradition.",
    sources: [
      { label: "Mahāparinibbāna Sutta (DN 16) — SuttaCentral", href: "https://suttacentral.net/dn16/en/sujato", sourceType: "Early Buddhist discourse", note: "Contains the standard recollection of the Dhamma as visible, timeless, inviting inspection, onward-leading, and individually knowable." },
      { label: "Introduction to the Dīgha Nikāya edition — SuttaCentral", href: "https://suttacentral.net/edition/dn/en/sujato/general_introduction", sourceType: "Academic reference", note: "Explains the main Pāli collections and distinguishes the early discourse strata from the later systematic Abhidhamma treatises." },
      { label: "Essence of Tipiṭaka — Vipassana Research Institute", href: "https://www.tipitaka.org/eot.html", sourceType: "Traditional Theravāda manual", note: "Documents the three baskets and the seven-book Theravāda Abhidhamma arrangement while showing why edition-specific counts need context." }
    ],
    relatedLinks: [
      { label: "What Is Dhamma?", href: "/learn/buddhist-dictionary/dhamma/", description: "Use the concise dictionary entry for the word’s main meanings." },
      { label: "How to Read a Buddhist Sutta", href: "/learn/sutta-for-daily-life/how-to-read-a-buddhist-sutta/", description: "Apply a source-aware reading method to a discourse." },
      { label: "Buddhist Sources and Citations", href: "/buddhist-sources-and-citations/", description: "See how Echo Buddha labels scripture, commentary, and paraphrase." }
    ],
    relatedTerms: ["Dhamma", "Tipiṭaka", "Vinaya", "Sutta", "Abhidhamma", "Nibbāna"],
    searchTerms: ["Dhamma refuge", "Tipitaka three baskets", "nine supramundane dhammas", "Pali Canon", "84,000 dhamma items"],
    previous: { label: "The Buddha as Refuge", href: `${HANDBOOK_PATH}/buddha-as-refuge/` },
    next: { label: "The Saṅgha as Refuge", href: `${HANDBOOK_PATH}/sangha-as-refuge/` }
  },
  {
    number: 3,
    slug: "sangha-as-refuge",
    title: "The Saṅgha as Refuge",
    seoTitle: "The Saṅgha as Refuge: Noble and Monastic Communities",
    description: "Learn the difference between the Noble Saṅgha, the monastic Saṅgha, and wider Buddhist community, including the four pairs and eight individuals.",
    eyebrow: "Part I · Chapter 3 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "Saṅgha can name related but distinct communities. Understanding which meaning is intended prevents confusion about refuge, ordination, and the place of lay disciples.",
    takeaway: "The refuge formula praises the Noble Saṅgha—the four pairs and eight kinds of noble individuals—while Vinaya contexts refer to ordained communities. Lay and ordained identity is not the same distinction as ordinary and noble attainment.",
    image: {
      src: "/images/handbook/refined/sangha-as-refuge.webp",
      avif: "/images/handbook/refined/sangha-as-refuge.avif",
      alt: "Meditation cushions, folded robes, and an alms bowl in an open monastery courtyard",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "Three Uses of the Word Saṅgha",
        paragraphs: [
          "In the traditional refuge recollection, Saṅgha primarily means the community of the Buddha’s noble disciples: those who have realized one of the four paths or four fruits. In Vinaya, legal and communal contexts, Saṅgha commonly means an ordained community of bhikkhus or bhikkhunīs.",
          "Modern English sometimes uses sangha for everyone connected with a Buddhist center or even for a meditation group. That broad social use can be helpful, but it should not be silently substituted for the earlier technical meanings.",
          "Ordination defines membership in the conventional monastic Saṅgha. Noble attainment is a different distinction: the traditional refuge formula praises the community of realized disciples and does not make robes the test of realization. Keeping these meanings separate honors both lay noble disciples and the specific responsibilities of ordained communities."
        ]
      },
      {
        heading: "Four Pairs and Eight Individuals",
        paragraphs: [
          "The standard formula describes four pairs of persons, eight kinds of individuals. Each of four stages has a path and a fruit: stream-entry, once-return, non-return, and arahantship. Counting the path-attainer and fruit-attainer at each stage produces eight.",
          "Stream-entry is associated with the breaking of the first three fetters: identity view, debilitating doubt, and attachment to rites and observances as sufficient in themselves. Traditional texts describe the stream-enterer as safe from lower realms and destined for full awakening within at most seven more lives.",
          "Once-return weakens sensual desire and ill will; non-return abandons them; arahantship completes the work by ending the remaining fetters. These concise definitions are maps, not invitations to diagnose other people’s inner attainment."
        ]
      },
      {
        heading: "Why This Community Is Called Worthy of Gifts",
        paragraphs: [
          "The recollection praises the Noble Saṅgha as practicing well, directly, methodically, and properly, and as worthy of gifts, hospitality, offerings, and respectful salutation. The point is not inherited rank. It is that realization and exemplary practice make a fertile field for generosity.",
          "The traditional field-of-merit image compares giving with sowing: the quality of the field affects the crop. It encourages careful, generous support, but it should not be turned into a fixed return, prosperity promise, or spiritual sales pitch.",
          "Confidence in the Saṅgha also offers evidence that the path can be lived. The community of noble disciples represents transmission through practice, not merely preservation of words."
        ]
      },
      {
        heading: "Vinaya Precision Without Inflated Numbers",
        paragraphs: [
          "Claims that a monk keeps billions of distinct precepts do not provide a reliable canonical rule count. Theravāda communities commonly refer to 227 training rules in the bhikkhu Pātimokkha and 311 in the bhikkhunī Pātimokkha, while the wider Vinaya contains many more procedures, origin stories, definitions, and communal acts.",
          "The point of discipline is not numerical spectacle. Vinaya trains restraint, resolves disputes, protects communal confidence, and supports conditions for practice. The exact application of rules also depends on ordination lineage, textual recension, and competent interpretation.",
          "Taking Saṅgha as refuge therefore does not require idealizing every person in robes. It means honoring noble realization, supporting responsible communal practice, and relating to ordained communities with both respect and ethical clarity."
        ]
      },
      {
        heading: "How Saṅgha Refuge Supports Practice",
        paragraphs: [
          "A living community can do what private study cannot. It preserves practices across generations, corrects misunderstandings, creates opportunities for generosity, and lets learners observe how patience and restraint work under real conditions. Good spiritual friendship is not an optional decoration around the path.",
          "Community also tests discernment. A robe deserves the courtesy attached to an ordained role, yet awakening is not inferred from charisma, seniority, ethnicity, or institutional power. The four-pairs formula directs the deepest confidence toward realized qualities, not personality cults.",
          "A practical recollection is to name one quality of good practice—straightforwardness, method, integrity, generosity, or restraint—and look for it in communities you support and in your own conduct. Refuge in the Saṅgha then becomes both gratitude and a standard of accountability."
        ]
      }
    ],
    sourceNote: "Early discourses support the four-pairs/eight-individuals formula, the stream-entry fetters, the maximum-seven-lives description, and the field-of-merit image. Conventional monastic Saṅgha and modern community usage are related but distinct senses of the word.",
    sources: [
      { label: "Mahāparinibbāna Sutta (DN 16) — SuttaCentral", href: "https://suttacentral.net/dn16/en/sujato", sourceType: "Early Buddhist discourse", note: "Contains the standard recollection of the Saṅgha as four pairs and eight individuals, worthy of gifts and respect." },
      { label: "The Discourse on Fear and Animosity (AN 10.92) — SuttaCentral", href: "https://suttacentral.net/an10.92/en/thanissaro", sourceType: "Early Buddhist discourse", note: "Connects verified confidence in the Triple Gem, the four-pairs formula, ethical conduct, and the factors of stream-entry." },
      { label: "In Brief (SN 48.12) — SuttaCentral", href: "https://suttacentral.net/sn48.12/en/sujato", sourceType: "Early Buddhist discourse", note: "Presents the four stages of realization in relation to the development of the spiritual faculties." }
    ],
    relatedLinks: [
      { label: "What Is Sangha?", href: "/learn/buddhist-dictionary/sangha/", description: "Review the word’s common meanings in a concise entry." },
      { label: "What Is Buddhism?", href: "/learn/buddhism-101/what-is-buddhism/", description: "Return to the broad beginner orientation." },
      { label: "Lay Buddhists and the Saṅgha", href: `${HANDBOOK_PATH}/lay-sangha-relationship/`, description: "Explore mutual support, boundaries, and accountability." }
    ],
    relatedTerms: ["Saṅgha", "Ariya Saṅgha", "Bhikkhu", "Bhikkhunī", "Sotāpanna"],
    searchTerms: ["Sangha refuge", "Noble Sangha", "four pairs eight individuals", "stream entry seven lives", "monastic community"],
    previous: { label: "The Dhamma as Refuge", href: `${HANDBOOK_PATH}/dhamma-as-refuge/` },
    next: { label: "Taking Refuge in the Triple Gem", href: `${HANDBOOK_PATH}/taking-refuge-triple-gem/` }
  },
  {
    number: 4,
    slug: "taking-refuge-triple-gem",
    title: "Taking Refuge in the Triple Gem",
    seoTitle: "Taking Refuge in the Triple Gem: A Practical Guide",
    description: "A practical guide to taking refuge in the Buddha, Dhamma, and Saṅgha, including the formula, intention, ethics, and daily-life meaning.",
    eyebrow: "Part I · Chapter 4 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "Taking refuge is a declaration of direction: the Buddha is the teacher, the Dhamma is the path and goal, and the Saṅgha shows that the path can be realized.",
    takeaway: "Refuge is made credible by practice. The formula can begin or renew a commitment, but confidence matures through ethical restraint, learning, meditation, generosity, and wise friendship.",
    image: {
      src: "/images/handbook/refined/taking-refuge-triple-gem.webp",
      avif: "/images/handbook/refined/taking-refuge-triple-gem.avif",
      alt: "A Bodhi leaf, palm-leaf manuscript, and alms bowl in a quiet home practice space",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "The Traditional Formula",
        paragraphs: [
          "The familiar Pāli lines are <i>Buddhaṃ saraṇaṃ gacchāmi</i>, <i>Dhammaṃ saraṇaṃ gacchāmi</i>, and <i>Saṅghaṃ saraṇaṃ gacchāmi</i>: I go to the Buddha, Dhamma, and Saṅgha for refuge. In many Theravāda ceremonies the three lines are repeated three times.",
          "A person may take refuge privately, in a temple, or in a ceremony led by a monastic. Customs vary. The essential movement is intelligible without claiming that one ritual format is the only valid expression in every Buddhist tradition.",
          "Traditionally, going for refuge marks someone as a lay follower—an <i>upāsaka</i> or <i>upāsikā</i>. That identity is best understood as an ongoing orientation rather than a badge of superiority."
        ]
      },
      {
        heading: "What Each Refuge Contributes",
        paragraphs: [
          "The Buddha offers the example of awakening and the authority of a discoverer and teacher. The Dhamma offers the teaching to be understood, the training to be practiced, and the liberation to be realized. The Saṅgha offers the example of those who have practiced successfully and the living conditions that help practice continue.",
          "The three work together. Admiration for the Buddha without learning the Dhamma can become personality devotion. Study without practice can become accumulation of ideas. Community without a shared path can become mere belonging.",
          "Conversely, a well-balanced refuge brings gratitude, testing, and companionship into one training. This is why the Triple Gem is also called the Three Jewels: each is considered exceptionally valuable in a distinct way."
        ]
      },
      {
        heading: "How Refuge Helps Without Becoming Magical Thinking",
        paragraphs: [
          "Two traditional analogies clarify the relationship. The Buddha resembles a physician who understands an illness and prescribes a cure; the practitioner must still take the medicine. The Saṅgha resembles a fertile field for generosity; the image concerns the quality of intention and recipient, not a guaranteed financial return.",
          "Refuge can protect by reorganizing priorities. Recollecting the Triple Gem may interrupt panic, resentment, or pressure to follow a harmful crowd. It supplies a remembered standard when the easier choice conflicts with the wiser one.",
          "Traditional texts also connect refuge and generosity with fortunate results. Such teachings belong within a wider account of kamma, intention, and many conditions. They should not be converted into promises that a ritual prevents every misfortune."
        ]
      },
      {
        heading: "A Simple Daily Refuge Practice",
        paragraphs: [
          "Pause, settle the body, and recite or recall the three refuges. Then name one quality for the day: clarity from the Buddha, truthfulness from the Dhamma, or good companionship from the Saṅgha. Choose one specific action that expresses it.",
          "At day’s end, review gently. Where did the chosen refuge affect speech, conduct, or attention? Where was it forgotten? The review is not a trial. It turns a broad religious commitment into learnable experience.",
          "Someone who is still exploring Buddhism can use the same structure as study without making a formal religious declaration. Honest investigation is preferable to borrowed certainty."
        ]
      },
      {
        heading: "Formal Commitment and Everyday Evidence",
        paragraphs: [
          "In a formal Theravāda setting, a monastic may lead the refuges and Five Precepts in Pāli, often line by line. The ceremony gives a public shape to intention and connects an individual with a lineage of practice. An informal private recitation can also be sincere; the two settings serve different needs.",
          "The terms <i>upāsaka</i> and <i>upāsikā</i> traditionally name male and female lay followers who have gone for refuge. The identity carries no license to look down on those who are still exploring. Its evidence is found in conduct: non-harming, honesty, sexual responsibility, sobriety, generosity, meditation, and friendship with people who encourage the good.",
          "Refuge is renewed whenever direction matters: before work, after a mistake, during illness, or when social pressure favors harm. Recite if recitation helps, then choose the next action that fits the refuge. Ethical repair after failure is a stronger sign of commitment than defending a perfect religious self-image."
        ]
      }
    ],
    sourceNote: "The refuge formula and lay-follower framework are traditional and widely attested. This chapter explains their practical meaning without claiming that ritual alone guarantees protection or results.",
    sources: [
      { label: "Going for Refuge & Taking the Precepts — BPS publication", href: "https://www.accesstoinsight.org/lib/authors/bodhi/wheel282.html", sourceType: "Traditional Theravāda manual", note: "A systematic explanation of refuge, its objects, the lay disciple, and the relation between refuge and ethical precepts." },
      { label: "Refuge: An Introduction to the Buddha, Dhamma, & Sangha", href: "https://www.accesstoinsight.org/lib/authors/thanissaro/refuge.html", sourceType: "Traditional Theravāda manual", note: "Clarifies that refuge is a commitment to training rather than a request that the Buddha intervene as a creator deity." },
      { label: "Buddhist Ceremonies and Rituals of Sri Lanka — BPS publication", href: "https://www.accesstoinsight.org/lib/authors/kariyawasam/wheel402.html", sourceType: "Sri Lankan cultural practice", note: "Documents common Sri Lankan Theravāda refuge recitation and ceremony while allowing regional practice to remain contextual." }
    ],
    relatedLinks: [
      { label: "Five Precepts", href: "/learn/buddhism-101/five-precepts-buddhism/", description: "Connect refuge with concrete ethical training." },
      { label: "Buddhism for Beginners", href: "/learn/buddhism-for-beginners/", description: "Follow a simple first-week learning path." },
      { label: "Forms and Depths of Refuge", href: `${HANDBOOK_PATH}/forms-of-refuge-theravada/`, description: "Continue into a traditional analysis of how refuge is undertaken." }
    ],
    relatedTerms: ["Saraṇa", "Triple Gem", "Upāsaka", "Upāsikā", "Three Jewels"],
    searchTerms: ["taking refuge", "Triple Gem refuge", "three refuges Pali", "Buddhist refuge ceremony", "lay Buddhist"],
    previous: { label: "The Saṅgha as Refuge", href: `${HANDBOOK_PATH}/sangha-as-refuge/` },
    next: { label: "Forms and Depths of Refuge", href: `${HANDBOOK_PATH}/forms-of-refuge-theravada/` }
  },
  {
    number: 5,
    slug: "forms-of-refuge-theravada",
    title: "Forms and Depths of Refuge in Theravāda",
    seoTitle: "Four Forms of Refuge in Theravāda Buddhism",
    description: "Explore mundane and supramundane refuge, four traditional forms of commitment, and what strengthens, weakens, or breaks refuge.",
    eyebrow: "Part I · Chapter 5 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "Traditional Theravāda manuals analyze refuge at different depths and describe several ways a person’s commitment may be formed. The categories are aids to clarity, not grades for judging others.",
    takeaway: "Mundane refuge depends on cultivated confidence and can waver; supramundane refuge is linked to noble realization. Four traditional forms describe self-surrender, taking the Triple Gem as one’s guiding ideal, discipleship, and reverential salutation.",
    image: {
      src: "/images/handbook/refined/forms-of-refuge-theravada.webp",
      avif: "/images/handbook/refined/forms-of-refuge-theravada.avif",
      alt: "Four garden paths converging beneath a Bodhi tree toward a teaching seat",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "Mundane and Supramundane Refuge",
        paragraphs: [
          "Mundane refuge is the ordinary practitioner’s confidence and commitment. It can be sincere and transformative while still being conditioned: understanding may deepen, doubt may return, and conduct may fall short. Practice strengthens it.",
          "Supramundane refuge is associated in Theravāda explanation with the direct realization of the noble path. It is not a more emotional recitation. It names the irreversible change in perspective connected with stream-entry and beyond.",
          "These categories discourage pretending. A beginner need not claim unshakable realization in order to practice sincere refuge. A vulnerable commitment can still be tended with learning, ethical repair, and good friendship."
        ]
      },
      {
        heading: "Four Traditional Forms",
        paragraphs: [
          "The commentarial and manual tradition describes four ways refuge may be undertaken. Transliteration varies across publications, but the underlying meanings are stable enough to explain carefully.",
          "<i>Attasanniyyātana</i> is the dedication or surrender of oneself to the Triple Gem. <i>Tapparāyaṇatā</i> is taking the Triple Gem as one’s supreme resort or guiding ideal. <i>Sissabhāvūpagamana</i> is entering the condition of a disciple. <i>Paṇipāta</i> is reverential salutation or homage.",
          "The four are not mutually exclusive. A ceremony might contain homage while a person’s life expresses discipleship and guiding commitment. Their value lies in showing that refuge involves the whole direction of a life, not only assent to a proposition."
        ]
      },
      {
        heading: "What Pollutes or Weakens Refuge",
        paragraphs: [
          "Traditional explanations identify ignorance about the Triple Gem, doubt, distorted views, and disrespect as causes that weaken or pollute mundane refuge. The practical remedy is not anxiety about ritual perfection. It is learning, questioning well, repairing conduct, and renewing the commitment.",
          "The manuals distinguish polluted refuge from broken refuge. In their internal framework, taking another teacher or object as one’s ultimate spiritual refuge breaks the commitment. This describes the integrity of a Theravāda vow; it is not a license to insult another religion or police another person’s conscience.",
          "A Buddhist may show courtesy to teachers, relatives, officials, or sacred places without making them the final refuge. The meaning of a gesture depends on intention and context; not every bow is a doctrinal declaration."
        ]
      },
      {
        heading: "Confidence Without Sectarianism",
        paragraphs: [
          "Strong confidence does not require contempt. A person can understand why they entrust themselves to the Triple Gem while acknowledging that neighbors and family members live by different commitments.",
          "This matters especially in religiously plural settings. Fear that every social courtesy threatens refuge can produce rigidity; treating all traditions as interchangeable can erase real differences. The middle course is honest commitment joined with non-harming speech.",
          "A useful review asks: Is my refuge making me more truthful, generous, steady, and willing to learn? If it produces only identity and rivalry, the form may be present while the training is being missed."
        ]
      },
      {
        heading: "Pollution, Breach, and Renewal",
        paragraphs: [
          "In later Theravāda analysis, ordinary refuge can be obscured by ignorance, doubt, wrong understanding, or irreverence. A breach is described more strongly as deliberately abandoning the Triple Gem as one’s refuge. Death ends the particular lifetime of mundane refuge, while the supramundane refuge associated with noble realization is described as unbreakable.",
          "These are technical categories, not reasons to live in fear. Forgetfulness, a clumsy bow, a question asked in good faith, or respectful contact with another tradition is not automatically a spiritual catastrophe. Intention, understanding, and the direction of commitment matter.",
          "When confidence has weakened, renewal can be concrete: study what each refuge means, repair a harmful action, recite the formula with understanding, seek wise friendship, and return to practice. The purpose of the categories is to clarify and strengthen the path—not to manufacture religious anxiety."
        ]
      }
    ],
    sourceNote: "The four-form analysis comes from later Theravāda explanation rather than a single early discourse. Pāli spellings vary in romanization; this page uses normalized diacritics and explains the meanings rather than claiming one English rendering is definitive.",
    sources: [
      { label: "The Threefold Refuge — BPS publication", href: "https://www.accesstoinsight.org/lib/authors/nyanaponika/wheel076.html", sourceType: "Traditional Theravāda manual", note: "Primary reference for mundane and supramundane refuge, the four forms, and the distinction between defilement and breach." },
      { label: "Going for Refuge & Taking the Precepts — BPS publication", href: "https://www.accesstoinsight.org/lib/authors/bodhi/wheel282.html", sourceType: "Traditional Theravāda manual", note: "Provides a complementary analysis of the act, function, corruption, and breach of refuge." },
      { label: "Dhammapada 188–192 — SuttaCentral", href: "https://suttacentral.net/dhp179-196/en/sujato", sourceType: "Theravāda canonical collection", note: "Contrasts inadequate places of safety with refuge in the Buddha, Dhamma, and Saṅgha together with understanding the Four Noble Truths." }
    ],
    relatedLinks: [
      { label: "Taking Refuge in the Triple Gem", href: `${HANDBOOK_PATH}/taking-refuge-triple-gem/`, description: "Return to the practical foundation before the technical categories." },
      { label: "Four Noble Truths", href: "/learn/four-noble-truths/", description: "Study the understanding paired with refuge in Dhammapada 190–192." },
      { label: "Wise Thinking in the Kālāma Sutta", href: "/learn/sutta-for-daily-life/kalama-sutta-and-wise-thinking/", description: "Explore inquiry, confidence, and careful evaluation." }
    ],
    relatedTerms: ["Attasanniyyātana", "Tapparāyaṇatā", "Sissabhāvūpagamana", "Paṇipāta"],
    searchTerms: ["four forms of refuge", "mundane refuge", "supramundane refuge", "breaking Buddhist refuge", "Theravada refuge"],
    previous: { label: "Taking Refuge in the Triple Gem", href: `${HANDBOOK_PATH}/taking-refuge-triple-gem/` },
    next: { label: "Refuge, Devas, and Local Practice", href: `${HANDBOOK_PATH}/refuge-devas-buddhist-practice/` }
  },
  {
    number: 6,
    slug: "refuge-devas-buddhist-practice",
    title: "Refuge, Devas, and Local Buddhist Practice",
    seoTitle: "Buddhist Refuge, Devas, and Sri Lankan Practice",
    description: "Understand how devas and regional devotional customs relate to Buddhist refuge, with careful attention to Theravāda teaching and Sri Lankan practice.",
    eyebrow: "Part I · Chapter 6 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "Buddhist texts acknowledge devas, while Buddhist cultures have developed many local relationships with named deities. Neither fact automatically makes a deva the final refuge of Buddhist practice.",
    takeaway: "In early Buddhist cosmology, devas are powerful but impermanent beings, not creators or guarantors of liberation. Regional customs involving figures such as Viṣṇu or Kataragama should be described as varied cultural practice, not as one universal Buddhist rule.",
    image: {
      src: "/images/handbook/refined/refuge-devas-buddhist-practice.webp",
      avif: "/images/handbook/refined/refuge-devas-buddhist-practice.avif",
      alt: "A stupa, Bodhi tree, and separate devale shrine in a Sri Lankan landscape at twilight",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "What Devas Are in Buddhist Texts",
        paragraphs: [
          "Early Buddhist discourses include many kinds of devas. They may admire the Buddha, ask questions, protect places, or enjoy long and fortunate lives. Yet they remain within saṃsāra. Their lives are conditioned and impermanent, and divine status does not equal awakening.",
          "This differs from belief in an eternal creator who controls the whole cosmos and grants final salvation. Buddhist practice centers liberation on understanding, ethics, and cultivation of mind. A deva may be respected within a story without replacing the Buddha, Dhamma, and Saṅgha as refuge.",
          "The distinction also prevents condescension. Saying that a practice is cultural does not mean it is foolish or meaningless. It means its history, social function, and doctrinal status must be described accurately."
        ]
      },
      {
        heading: "Sri Lankan Customs Are Historically Layered",
        paragraphs: [
          "In Sri Lanka, some Buddhists make vows, offerings, or requests at shrines associated with deities, including Viṣṇu and Kataragama. Practices differ by region, family, temple, and individual. Hindu and Buddhist communities may also understand the same figure or place in different ways.",
          "These observances can coexist socially with recitation of the Three Refuges, but they are not identical with refuge in the Theravāda doctrinal sense. A person may seek limited worldly help while regarding the Triple Gem as the guide to liberation. Others may avoid deity practice altogether.",
          "These examples raise a question of boundaries, and intention matters. A request for limited help, a family custom, a pilgrimage, and taking ultimate refuge are not automatically the same act. No single example should be generalized into a census of what all Sri Lankan Buddhists believe."
        ]
      },
      {
        heading: "Respect, Requests, and Ultimate Reliance",
        paragraphs: [
          "Traditional manuals distinguish courtesy or a limited request from entrusting one’s ultimate spiritual direction. This helps explain why a Buddhist might respectfully acknowledge a deva without treating that being as awakened or as a substitute for the Dhamma.",
          "The boundary is clearest when the request conflicts with ethics. No appeal to a spirit or deity makes harmful conduct wholesome. Nor should fear of unseen punishment be used to pressure a person into donations or obedience.",
          "If an observance strengthens generosity, gratitude, and communal care without distorting the refuges or harming others, practitioners may interpret it within their cultural setting. Clear categories leave room for honest disagreement without turning local practice into a universal rule."
        ]
      },
      {
        heading: "A Source-Aware Way to Discuss Lived Religion",
        paragraphs: [
          "When describing a local custom, ask who practices it, where, in what period, and how participants explain it. Avoid converting one family’s custom into ‘Buddhism says’ or treating a scholar’s outside category as the only account that matters.",
          "Then separate description from doctrine. A ritual may be common without appearing in early discourses; a canonical idea may be central in theory but expressed differently in daily life. Both observations can be true.",
          "Finally, speak without ridicule. Lived religion is often layered. Clear distinctions can protect the integrity of refuge while leaving room for historical change, regional identity, and respectful disagreement."
        ]
      },
      {
        heading: "Viṣṇu, Kataragama, and Historical Interaction",
        paragraphs: [
          "The place of Viṣṇu in Sinhala Buddhist culture developed through a long history of royal patronage, literature, temple networks, and changing political identities. Scholars describe not a simple borrowing but processes of assimilation, transformation, and subordination within Buddhist social worlds. That history is not evidence that early Pāli texts gave Viṣṇu the role later found in Sri Lanka.",
          "Kataragama is a particularly clear example of a shared but differently interpreted sacred place. Buddhist and Hindu pilgrims have gathered there, while communities have identified the deity, the shrine, and proper worship in different ways. Shared geography does not erase doctrinal difference; doctrinal difference does not erase centuries of interaction.",
          "A careful description therefore uses four labels when needed: early-text teaching, later Theravāda explanation, popular or family practice, and documented local history. With those layers visible, neither devotion nor scholarship has to pretend that one sentence—‘Buddhists worship gods’ or ‘Buddhists never approach gods’—captures the whole situation."
        ]
      }
    ],
    sourceNote: "This page combines early-discourse cosmology with documented Sri Lankan ritual context. It does not claim that all Buddhists, all Theravādins, or all Sri Lankans share one attitude toward devas or named local deities.",
    sources: [
      { label: "Sakka’s Questions (DN 21) — SuttaCentral", href: "https://suttacentral.net/dn21/en/sujato", sourceType: "Early Buddhist discourse", note: "Shows a prominent deva approaching the Buddha as a questioner rather than as an omnipotent creator or source of liberation." },
      { label: "Buddhist Ceremonies and Rituals of Sri Lanka — BPS publication", href: "https://www.accesstoinsight.org/lib/authors/kariyawasam/wheel402.html", sourceType: "Sri Lankan cultural practice", note: "Provides contextual description of Sri Lankan Theravāda ceremony, devales, and popular religious practice." },
      { label: "The Buddhist Viṣṇu — Columbia University Press", href: "https://cup.columbia.edu/book/the-buddhist-visnu/9780231133234/", sourceType: "Academic reference", note: "Summarizes the historical assimilation and transformation of Viṣṇu within Sinhala Buddhist religious culture." },
      { label: "The Kataragama Pilgrimage — Journal of Asian Studies", href: "https://resolve.cambridge.org/core/services/aop-cambridge-core/content/view/C1287D1F0655BDA41865047647CFDE41/S0021911800141622a.pdf/the-kataragama-pilgrimage-hindu-buddhist-interaction-and-its-significance-in-sri-lankas-polyethnic-social-system.pdf", sourceType: "Academic reference", note: "Provides scholarly context for Buddhist–Hindu interaction at Kataragama and its place in Sri Lanka’s plural religious life." }
    ],
    relatedLinks: [
      { label: "Forms and Depths of Refuge", href: `${HANDBOOK_PATH}/forms-of-refuge-theravada/`, description: "Review the distinction between reverence and ultimate refuge." },
      { label: "What Is Karma?", href: "/learn/buddhist-dictionary/karma/", description: "Clarify intentional action without fatalism or divine reward." },
      { label: "Buddhist Resources", href: "/learn/buddhist-resources/", description: "Continue with source and tradition references." }
    ],
    relatedTerms: ["Deva", "Sakka", "Saṃsāra", "Viṣṇu", "Kataragama"],
    searchTerms: ["Buddhist devas", "gods in Buddhism", "Vishnu Sri Lankan Buddhism", "Kataragama Buddhism", "refuge and deities"],
    previous: { label: "Forms and Depths of Refuge", href: `${HANDBOOK_PATH}/forms-of-refuge-theravada/` },
    next: { label: "Respecting the Triple Gem", href: `${HANDBOOK_PATH}/respecting-triple-gem/` }
  },
  {
    number: 7,
    slug: "respecting-triple-gem",
    title: "Respecting the Triple Gem",
    seoTitle: "Respecting the Buddha, Dhamma, and Saṅgha",
    description: "Practical, source-aware guidance on respecting the Buddha, Dhamma, Saṅgha, shrines, books, Bodhi trees, temple spaces, and offerings.",
    eyebrow: "Part I · Chapter 7 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "Respect in Buddhist life includes gestures, speech, care for shared places, attention to teachings, and—most importantly—the conduct those forms are meant to support.",
    takeaway: "Bows, offerings, shrines, Dhamma books, Bodhi trees, and temple etiquette can train gratitude and mindfulness. They are most coherent when joined to ethical conduct and an honest understanding of what the objects represent.",
    image: {
      src: "/images/handbook/refined/respecting-triple-gem.webp",
      avif: "/images/handbook/refined/respecting-triple-gem.avif",
      alt: "A clean temple courtyard with a stupa, Bodhi tree, Buddha image, flowers, and Dhamma books",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "Respect for the Buddha",
        paragraphs: [
          "During the Buddha’s lifetime, respect could be directed to the living teacher. After Parinibbāna, early textual support is clearest for pilgrimage places, relics, and stupas. Later traditions developed further memorial forms, including Bodhi-tree shrines and Buddha images.",
          "A material object is not identical with the awakened Buddha. Its function can be commemorative and pedagogical: it gathers attention, evokes gratitude, and reminds a practitioner of awakening. This distinction allows meaningful veneration without claiming that stone, paint, wood, or metal itself possesses wisdom.",
          "Later Theravāda explanations often group memorial objects as bodily relics (<i>sārīrika</i>), objects associated with the Buddha’s use such as the Bodhi tree (<i>pāribhogika</i>), and representational memorials (<i>uddesika</i>). The linked deeper studies examine how these categories, Buddha images, and the Jetavana traditions developed."
        ]
      },
      {
        heading: "Respect for the Dhamma",
        paragraphs: [
          "Traditional etiquette treats Dhamma books and teaching spaces with care. In a digital setting, equivalent respect includes accurate quotation, honest attribution, context, and not reshaping a teaching merely to make it more shareable.",
          "Listening respectfully does not mean suppressing questions. The Dhamma is repeatedly presented as something to be examined and known. Good questions attend to the actual claim, its source layer, and how it bears on practice.",
          "Supporting translation, preservation, teaching, and access can be a form of generosity. So can correcting an error without humiliation. Care for the teaching includes care for the people trying to understand it."
        ]
      },
      {
        heading: "Respect for the Saṅgha and Shared Property",
        paragraphs: [
          "Respect for monastics may include greeting, offering food or requisites, listening to teaching, and observing local forms of address. Visitors should follow a community’s guidance around seating, photography, clothing, restricted areas, and contact across gender boundaries.",
          "Temple and Saṅgha property is held for communal religious use. Deliberate damage, theft, waste, or private appropriation violates both ordinary ethics and the trust that sustains a community. Report accidental damage honestly; do not turn accidents into supernatural panic.",
          "Traditional cautionary stories sometimes attach frightening karmic outcomes to misuse of flags, oil, food, or other communal property. Where a story’s textual provenance is unclear, it should not be used as verified history or as a threat. The ethical principle needs no embellishment: do not steal, waste, or privately appropriate what was given for communal practice."
        ]
      },
      {
        heading: "Temple Etiquette Without Performance Anxiety",
        paragraphs: [
          "Observe first, follow posted or spoken guidance, and ask quietly when unsure. Remove shoes where required, dress with care, keep phones unobtrusive, and avoid blocking worshippers or photographing people without consent. Customs vary across countries and communities.",
          "Bowing, flowers, lamps, incense, and circumambulation may express recollection and gratitude. A newcomer may participate respectfully or remain quietly observant. Pretending certainty is unnecessary.",
          "The deepest safeguard is intention joined to attention. Etiquette is not a competition in cultural fluency; it is a way of reducing disruption and making room for other people’s practice."
        ]
      },
      {
        heading: "Offerings, Listening, and Care for What Is Shared",
        paragraphs: [
          "Flowers, lamps, incense, food, robes, and practical service can express gratitude and generosity. Their impermanence is part of their teaching: a flower fades, a lamp is consumed, and a gift leaves the giver’s control. An offering is not a payment that obliges the Buddha, a deity, or a monastic to deliver a private outcome.",
          "Respect for Dhamma includes how one listens. Set aside avoidable distraction, hear the whole explanation before reacting, ask questions in good faith, and distinguish a teacher’s interpretation from a cited passage. For books and digital texts, preserve context, attribution, accessibility, and accurate wording.",
          "Respect for shared property is equally ordinary and important. Use temple spaces as directed, seek permission before moving objects or entering restricted areas, contribute to repair when appropriate, and report damage honestly. Cleanliness and restraint protect other people’s practice as well as physical things."
        ]
      }
    ],
    sourceNote: "Early discourse evidence supports relic, stupa, pilgrimage, and recollection practices; later Theravāda sources add cetiya classifications and other devotional forms. Some later cautionary stories have uncertain textual provenance, so this chapter preserves their ethical concern without presenting them as verified history.",
    sources: [
      { label: "Mahāparinibbāna Sutta (DN 16) — SuttaCentral", href: "https://suttacentral.net/dn16/en/sujato", sourceType: "Early Buddhist discourse", note: "Supports early textual claims about pilgrimage places, relic distribution, stupas, and confident recollection." },
      { label: "Buddhist Ceremonies and Rituals of Sri Lanka — BPS publication", href: "https://www.accesstoinsight.org/lib/authors/kariyawasam/wheel402.html", sourceType: "Sri Lankan cultural practice", note: "Provides context for offerings, cetiya categories, homage, and temple ritual in Sri Lankan Theravāda life." },
      { label: "Caṅkī Sutta (MN 95) — SuttaCentral", href: "https://suttacentral.net/mn95/en/sujato", sourceType: "Early Buddhist discourse", note: "Connects respect and attentive listening with inquiry, practice, and the gradual attainment of truth." }
    ],
    relatedLinks: [
      { label: "How Can the Buddha Be Respected After Parinibbāna?", href: "/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/", description: "Study relics, stupas, Bodhi trees, images, and offerings in source order." },
      { label: "Is a Buddha Image the Only Uddesika Cetiya?", href: "/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/", description: "Explore the later memorial category without narrowing it prematurely." },
      { label: "Visiting a Buddhist Temple Respectfully", href: "/articles/visiting-a-buddhist-temple-respectfully/", description: "Use a concise practical guide before visiting." }
    ],
    relatedTerms: ["Cetiya", "Stupa", "Bodhi tree", "Vandana", "Pūjā"],
    searchTerms: ["respect Triple Gem", "Buddhist temple etiquette", "respect Dhamma books", "stupa cetiya", "Bodhi tree respect"],
    previous: { label: "Refuge, Devas, and Local Practice", href: `${HANDBOOK_PATH}/refuge-devas-buddhist-practice/` },
    next: { label: "Lay Buddhists and the Saṅgha", href: `${HANDBOOK_PATH}/lay-sangha-relationship/` }
  },
  {
    number: 8,
    slug: "lay-sangha-relationship",
    title: "Lay Buddhists and the Saṅgha",
    seoTitle: "Lay Buddhists and the Monastic Saṅgha: Support and Boundaries",
    description: "Learn how laypeople and monastics support one another, maintain healthy boundaries, respond to misconduct, and understand AN 8.88.",
    eyebrow: "Part I · Chapter 8 of 8",
    publishedDate: "2026-09-25",
    modifiedDate: "2026-09-26",
    intro: "The lay–monastic relationship is sustained by generosity, teaching, ethical conduct, and trust. Respect does not require blindness, and accountability does not require abuse.",
    takeaway: "Laypeople may support responsible monastic life and receive teaching and example in return. When conduct is seriously harmful, early texts allow principled withdrawal of support; concerns should be handled through evidence, safety, and appropriate community procedures.",
    image: {
      src: "/images/handbook/refined/lay-sangha-relationship.webp",
      avif: "/images/handbook/refined/lay-sangha-relationship.avif",
      alt: "An open monastery meeting veranda with a meal offering, Dhamma books, and community chairs",
      width: 1600,
      height: 900
    },
    sections: [
      {
        heading: "A Relationship of Mutual Support",
        paragraphs: [
          "Lay communities traditionally provide food, clothing, lodging, medicine, and practical help. Monastics preserve and teach the Dhamma, maintain disciplined communities, counsel practitioners, and offer an example of renunciation. Neither side is simply purchasing a service from the other.",
          "DN 31 describes reciprocal duties between householders and spiritual teachers. The broader principle is mutual care: generosity should not be exploited, and teaching should not be treated as entitlement to control another person’s life.",
          "Healthy support is voluntary, proportionate, and transparent. A person should not neglect dependents, incur harmful debt, or submit to coercion in order to appear generous."
        ]
      },
      {
        heading: "Boundaries Around Livelihood and Influence",
        paragraphs: [
          "A twenty-one-part list of improper ways to obtain requisites appears in later Theravāda disciplinary and commentarial literature, with parallels in the <i>Visuddhimagga</i> and <i>Milindapañha</i> tradition. It includes gift-giving designed to gain favor, flattery, ingratiating oneself with families, errands and messages, medical practice for gain, exchange of gifts, site divination, astrology, and physiognomy. It is not a single list from an early sutta.",
          "Lay supporters can ask how funds are handled, what a project is for, and which community procedures exist. Reasonable questions are not disrespect. Clear governance protects sincere monastics as well as donors.",
          "Customs around money, transport, meals, medicine, and direct contact differ by Vinaya lineage and monastery. Ask the community rather than assuming that one local rule applies everywhere."
        ]
      },
      {
        heading: "When a Layperson May Withdraw Support",
        paragraphs: [
          "Aṅguttara Nikāya 8.88 lists eight grounds on which lay followers may declare no confidence in a monk: working for laypeople’s loss or harm, insulting them, dividing them from one another, disparaging the Buddha, Dhamma, or Saṅgha, and being seen in an improper place. The later commentary describes a bounded response: not rising, bowing, going out to meet him, or giving gifts.",
          "The passage does not authorize harassment, threats, public humiliation, rumor campaigns, or violence. Nor does it remove the need to establish facts. Serious allegations may require safeguarding steps, senior monastic procedures, organizational reporting, or civil authorities, depending on the conduct.",
          "Withdrawal of support can be morally serious without becoming hatred. A layperson can protect people and institutions while refusing to pretend that robes make every action blameless."
        ]
      },
      {
        heading: "Respectful Accountability in Practice",
        paragraphs: [
          "Begin by separating discomfort, cultural difference, Vinaya questions, ethical misconduct, and immediate danger. They call for different responses. Record concrete facts and avoid embellishment. If someone may be at risk, prioritize safety over reputation management.",
          "Use established channels where they are credible: a monastery’s senior community, trustees, safeguarding contact, or lineage authority. Criminal conduct should not be hidden inside a religious process. Seek qualified local help when law or personal safety is involved.",
          "The strongest conclusion is balanced: support worthy practice, preserve gratitude, maintain boundaries, and do not weaponize either devotion or criticism. The Triple Gem is honored when truthfulness and non-harming remain present even in conflict."
        ]
      },
      {
        heading: "A Mature Relationship Protects Both Sides",
        paragraphs: [
          "Dāna is most wholesome when it is freely given, within the giver’s means, and directed toward genuine need or practice. Monastics protect that generosity by living transparently, observing discipline, avoiding manipulative intimacy, and refusing to convert spiritual trust into personal leverage.",
          "Laypeople protect the relationship by respecting reasonable monastic boundaries, not demanding private access or special status, and not using donations to purchase influence. They also protect it by asking responsible questions, supporting sound governance, and refusing concealment when someone may be harmed.",
          "This completes Part I where it began: refuge is a direction expressed in conduct. Confidence in the Buddha, Dhamma, and Noble Saṅgha should make a community more truthful, less coercive, more generous, and more capable of repair. Respect and accountability are not enemies when both serve non-harming and the path."
        ]
      }
    ],
    sourceNote: "AN 8.88 is the early-discourse basis for declaring no confidence; the concrete gestures of withdrawal come from its Theravāda commentary. The twenty-one improper ways of gaining requisites belong to later disciplinary and commentarial lineages, not to that sutta.",
    sources: [
      { label: "Appasāda Sutta (AN 8.88) — SuttaCentral", href: "https://suttacentral.net/an8.88/en/sujato", sourceType: "Early Buddhist discourse", note: "Lists eight grounds on which lay followers may declare no confidence; the concrete gestures of withdrawal are explained in later commentary." },
      { label: "Sigālovāda Sutta (DN 31) — SuttaCentral", href: "https://suttacentral.net/dn31/en/sujato", sourceType: "Early Buddhist discourse", note: "Provides a reciprocal-duty framework for householders and religious teachers within a wider ethics of relationships." },
      { label: "Saddhammopāyana — Journal of the Pali Text Society", href: "https://palitextsociety.org/wp-content/uploads/2024/12/JPTS_XII_4.pdf", sourceType: "Academic reference", note: "Documents the later twenty-one-part enumeration and its parallels in the Visuddhimagga and Milindapañha traditions." }
    ],
    relatedLinks: [
      { label: "The Saṅgha as Refuge", href: `${HANDBOOK_PATH}/sangha-as-refuge/`, description: "Distinguish Noble Saṅgha, monastic Saṅgha, and wider community." },
      { label: "Five Precepts", href: "/learn/buddhism-101/five-precepts-buddhism/", description: "Return to the ethical baseline shared by lay practice." },
      { label: "Compassion With Boundaries", href: "/articles/compassion-with-boundaries/", description: "Apply non-harming without abandoning clear limits." }
    ],
    relatedTerms: ["Bhikkhu", "Bhikkhunī", "Upāsaka", "Upāsikā", "Vinaya", "Appasāda"],
    searchTerms: ["lay Buddhist and monks", "lay Sangha relationship", "AN 8.88", "monastic misconduct", "Buddhist accountability"],
    previous: { label: "Respecting the Triple Gem", href: `${HANDBOOK_PATH}/respecting-triple-gem/` }
  }
];

export function getHandbookPath(page: Pick<HandbookPage, "slug">) {
  return `${HANDBOOK_PATH}/${page.slug}/`;
}

export function getHandbookReadTime(page: HandbookPage) {
  const text = [
    page.intro,
    page.takeaway,
    ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.points ?? [])]),
    page.sourceNote
  ].join(" ");
  return getReadTimeFromWordCount(countReadableWords(text));
}
