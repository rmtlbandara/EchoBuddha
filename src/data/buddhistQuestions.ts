export type BuddhistQuestionLink = {
  label: string;
  href: string;
  description?: string;
};

export type BuddhistQuestionSource = {
  label: string;
  href: string;
  sourceType: "Early Buddhist discourse" | "Theravāda narrative/commentary" | "Museum / art history";
  note: string;
};

export type BuddhistQuestionSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type BuddhistQuestion = {
  number: 1 | 2;
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  takeaway: string;
  shortAnswer: string[];
  sections: BuddhistQuestionSection[];
  sourceNote: string;
  sources: BuddhistQuestionSource[];
  relatedLinks: BuddhistQuestionLink[];
  relatedTerms: string[];
  searchTerms: string[];
  previous?: BuddhistQuestionLink;
  next?: BuddhistQuestionLink;
};

const questionsPath = "/learn/questions-about-buddhism";

export const buddhistQuestions: BuddhistQuestion[] = [
  {
    number: 1,
    slug: "did-buddha-order-buddha-images",
    title: "Did the Buddha Order the Construction and Veneration of Buddha Images?",
    seoTitle: "Did the Buddha Order Buddha Images? | Echo Buddha",
    description:
      "Did the Buddha tell followers to make or venerate Buddha images? Explore early texts, relic and stupa traditions, later Theravāda commentary, and Buddhist art history.",
    eyebrow: "Question 1",
    intro:
      "The history of Buddha images and the Buddhist meaning of venerating them are related questions, but they are not the same question.",
    takeaway:
      "The early discourses do not record the Buddha ordering followers to construct and worship statues of him. They do support reverence for the Buddha and, after his Parinibbāna, memorial practice around relics and stupas. Human-form Buddha images became an important devotional form later.",
    shortAnswer: [
      "There is no clear record in the early Buddhist discourses of the Buddha instructing followers to make statues of him or commanding people to worship such images.",
      "That does not make respect for the Buddha—or every later use of a Buddha image—contrary to Buddhism. Early textual support is much clearer for honoring the Buddha, his relics, and stupas. Later Buddhist traditions added other forms of remembrance, including images.",
      "The careful answer therefore separates three issues: what early texts say, what later Theravāda tradition explains, and what material evidence tells us about the history of Buddhist art."
    ],
    sections: [
      {
        heading: "The Buddha Did Not Seek Personal Worship",
        paragraphs: [
          "Buddhist traditions understand a fully awakened Buddha as free from greed, status-seeking, conceit, and dependence on personal admiration. It would therefore be misleading to picture the Buddha demanding worship because he wanted praise or recognition.",
          "Traditional Buddhist accounts nevertheless describe people showing him respect during his lifetime. Such gestures need not satisfy a need in the Buddha. Their meaning can lie in the confidence, gratitude, reverence, and recollection cultivated by the person making them.",
          "The distinction is simple but important: not demanding veneration is not the same as declaring every act of veneration meaningless or forbidden."
        ]
      },
      {
        heading: "Respect During the Buddha’s Lifetime",
        paragraphs: [
          "Buddhist literature regularly treats respectful conduct toward the Buddha as spiritually meaningful. The act is understood partly through the intention and qualities it develops in the person acting: confidence, gratitude, generosity, humility, recollection, and care.",
          "An offering cannot therefore be judged only by asking whether an awakened person needs the object. A respectful action may train the giver even when the recipient has no material need. For wider beginner context, see <a href=\"/learn/buddhism-101/who-was-the-buddha/\">Who Was the Buddha?</a> and <a href=\"/learn/buddhism-101/the-three-jewels-explained/\">The Three Jewels Explained</a>."
        ]
      },
      {
        heading: "Did Buddha Statues Exist During the Buddha’s Lifetime?",
        paragraphs: [
          "The early discourses do not describe the Buddha establishing a system of devotion to human-form statues of himself. Many surviving early Buddhist monuments instead evoke the Buddha or his presence through a Bodhi tree, footprints, an empty throne, a Dhamma wheel, or a stupa.",
          "Unmistakable human-form Buddha images are securely attested by the early centuries of the Common Era. The Metropolitan Museum of Art, for example, dates an early seated Buddha from Gandhāra to the first to mid-second century CE. Other early image traditions developed in centers including Mathurā.",
          "This evidence should not be turned into a claim that all early Buddhists followed a universal ban on images. Scholars continue to debate how symbolic and human representation developed and what early communities intended. The cautious conclusion is that we have no evidence of the historical Buddha ordering statues of himself, while human-form imagery became an important Buddhist artistic and devotional form later."
        ]
      },
      {
        heading: "What Do Early Texts Say About Remembrance After the Buddha’s Death?",
        paragraphs: [
          "The <i>Mahāparinibbāna Sutta</i> (DN 16) gives important early textual evidence. In its account of the Buddha’s final days and aftermath, the Tathāgata is described as worthy of a stupa. The discourse connects approaching such a memorial with confidence and a settled, joyful mind.",
          "DN 16 also narrates the division of the Buddha’s bodily relics and the construction of memorials associated with them. This makes early textual support for relic and stupa veneration clearer than early textual support for Buddha statues. The two historical claims should not be collapsed."
        ]
      },
      {
        heading: "The Traditional Theravāda Idea of Cetiyas",
        paragraphs: [
          "The Pāli word <i>cetiya</i> can refer to a sacred monument, shrine, memorial, or object connected with remembrance and veneration. A later Theravāda framework distinguishes three kinds. This classification appears in the prose narrative surrounding the <i>Kāliṅgabodhi Jātaka</i> (Ja 479), not as a verbatim teaching in an early discourse.",
          "In that narrative, Ānanda asks about providing a place for reverence at Jetavana while the Buddha is away, and the Bodhi tree becomes the appropriate memorial focus. The passage belongs to the Jātaka’s later narrative/commentarial layer. It can be important within Theravāda tradition without being presented as identical in date or authority to DN 16."
        ],
        points: [
          "<strong>Sārīrika Cetiya</strong> — bodily relics associated with the Buddha.",
          "<strong>Pāribhogika Cetiya</strong> — objects or places associated with the Buddha’s use or presence, especially the Bodhi tree in this traditional explanation.",
          "<strong>Uddesika Cetiya</strong> — a commemorative or representational object that points toward the Buddha."
        ]
      },
      {
        heading: "Is a Buddha Image an Uddesika Cetiya?",
        paragraphs: [
          "Within later Theravāda interpretation, a Buddha image can be understood as an <i>Uddesika Cetiya</i>: a representation established in remembrance of the Buddha. This is a traditional interpretation, not a claim that an early sutta records the Buddha defining statues in those words.",
          "The physical object is not identical with the historical Buddha, and the material does not itself possess awakening. The image can point beyond stone, metal, wood, or paint by helping a practitioner recollect qualities associated with the Buddha."
        ],
        points: [
          "awakening and wisdom",
          "compassion",
          "freedom from greed, hatred, and delusion",
          "confidence and gratitude",
          "the path the Buddha taught"
        ]
      },
      {
        heading: "So Is Venerating a Buddha Statue Wrong?",
        paragraphs: [
          "It is not wrong merely because the early discourses do not record the Buddha commanding statues to be made. Religious communities can develop meaningful forms without those forms being personal demands from their founder.",
          "In traditions that use Buddha images, bowing can express respect for the Buddha and what awakening represents rather than worship of the material substance. Buddhists and Buddhist cultures do not all explain or perform image devotion in exactly the same way.",
          "Ritual before an image is also not the whole of Buddhism. Ethical conduct, meditation, wisdom, generosity, compassion, and understanding the Dhamma remain central. For the paired question about remembrance after the Buddha’s death, read <a href=\"/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/\">How Can the Buddha Be Respected After Parinibbāna?</a>"
        ]
      }
    ],
    sourceNote:
      "This page is an original Echo Buddha educational explanation. It distinguishes early Buddhist textual material, later Theravāda narrative and interpretation, and modern art-historical evidence because those sources answer different parts of the question.",
    sources: [
      {
        label: "Mahāparinibbāna Sutta (DN 16) — SuttaCentral",
        href: "https://suttacentral.net/dn16/en/sujato",
        sourceType: "Early Buddhist discourse",
        note: "Supports the early textual claims about the Tathāgata as worthy of a stupa, memorial reverence, and the distribution of relics. It is not used as evidence that the Buddha ordered statues."
      },
      {
        label: "Kāliṅgabodhi Jātaka (Ja 479) — Ancient Buddhist Texts",
        href: "https://ancient-buddhist-texts.net/English-Texts/Jataka/479.htm",
        sourceType: "Theravāda narrative/commentary",
        note: "Provides the later narrative context for Ānanda, the Jetavana Bodhi tree, and the threefold shrine or cetiya classification. The page identifies this source layer explicitly."
      },
      {
        label: "Seated Buddha from Gandhāra — The Metropolitan Museum of Art",
        href: "https://www.metmuseum.org/art/collection/search/72381",
        sourceType: "Museum / art history",
        note: "Supports the careful art-historical statement that surviving human-form Buddha images are securely attested by the early centuries CE; it does not establish a universal earlier prohibition."
      },
      {
        label: "Buddhism and Buddhist Art — The Metropolitan Museum of Art",
        href: "https://www.metmuseum.org/essays/buddhism-and-buddhist-art",
        sourceType: "Museum / art history",
        note: "Supports the limited statement that distinct human-form Buddha image traditions developed in Gandhāra and, contemporaneously, in Kushan-period Mathurā."
      }
    ],
    relatedLinks: [
      {
        label: "Who Was the Buddha?",
        href: "/learn/buddhism-101/who-was-the-buddha/",
        description: "Meet the Buddha as the awakened teacher remembered across Buddhist traditions."
      },
      {
        label: "The Three Jewels Explained",
        href: "/learn/buddhism-101/the-three-jewels-explained/",
        description: "Understand refuge in the Buddha, Dhamma, and Sangha."
      },
      {
        label: "Visiting a Buddhist Temple Respectfully",
        href: "/articles/visiting-a-buddhist-temple-respectfully/",
        description: "Practical guidance for respectful conduct around shrines, images, and offerings."
      }
    ],
    relatedTerms: ["Cetiya", "Uddesika", "Relics", "Stupa", "Buddha image"],
    searchTerms: ["Buddha images", "Buddha statues", "veneration", "cetiya", "Uddesika", "relics", "stupa", "Buddhist art"],
    next: {
      label: "Question 2: How Can the Buddha Be Respected After Parinibbāna?",
      href: `${questionsPath}/respecting-buddha-after-parinibbana/`
    }
  },
  {
    number: 2,
    slug: "respecting-buddha-after-parinibbana",
    title: "How Can the Buddha Be Respected After Parinibbāna?",
    seoTitle: "How Is the Buddha Honored After Parinibbāna? | Echo Buddha",
    description:
      "Learn how Buddhists honor the Buddha after Parinibbāna through recollection, relics, stupas, Bodhi traditions, images, offerings, and Dhamma practice.",
    eyebrow: "Question 2",
    intro:
      "Buddhist respect for the Buddha can continue through recollection and practice without treating him as an unseen person who still needs material support.",
    takeaway:
      "After Parinibbāna, relics, stupas, Bodhi trees, images, offerings, and bows can support remembrance of the Buddha and wholesome qualities. Early texts most clearly support relic and stupa traditions; later Theravāda explanations add the threefold cetiya framework. Living by the Dhamma remains the deeper measure of respect.",
    shortAnswer: [
      "Buddhist tradition does not make respect for the Buddha depend on his physical presence. Buddhists may remember and honor him through the Dhamma, relics and stupas, places and objects associated with his life, and—in later traditions—Buddha images.",
      "These objects do not matter merely as objects. Their religious meaning comes from what they represent and from the gratitude, confidence, generosity, humility, and recollection cultivated through using them.",
      "A shrine or image can support practice, but it is not required for sincere recollection or for living according to the Dhamma."
    ],
    sections: [
      {
        heading: "Parinibbāna Does Not Mean the Buddha Is Waiting to Receive Offerings",
        paragraphs: [
          "For beginners, Parinibbāna should not be explained as though the Buddha died and continued somewhere as an ordinary invisible personality who now needs flowers, lamps, food, or other material care. That picture oversimplifies a central Buddhist teaching.",
          "Post-Parinibbāna veneration is better understood as remembering and honoring the Buddha. The Buddha does not need flowers. The practitioner may still use an offering to cultivate gratitude, confidence, generosity, humility, and recollection."
        ]
      },
      {
        heading: "Early Textual Basis for Honoring the Buddha After Parinibbāna",
        paragraphs: [
          "The <i>Mahāparinibbāna Sutta</i> (DN 16) supplies significant early textual precedent. It describes the Tathāgata as worthy of a stupa and explains that recollection at such a memorial can bring confidence and a calm, joyful mind.",
          "The discourse also narrates the division of the Buddha’s bodily relics and the building of memorials associated with them. Post-Parinibbāna relic and stupa veneration therefore has a clear early textual basis. This does not mean DN 16 describes the later history of Buddha images."
        ]
      },
      {
        heading: "Understanding Cetiya",
        paragraphs: [
          "The Pāli word <i>cetiya</i> can refer to a sacred monument, shrine, memorial, or object associated with remembrance and veneration. Later Theravāda tradition uses a threefold explanation that is especially relevant to remembering the Buddha.",
          "The classification used here appears in the prose narrative of the <i>Kāliṅgabodhi Jātaka</i> (Ja 479), where Ānanda asks about a focus for reverence at Jetavana and a Bodhi tree is planted. That narrative/commentarial provenance matters: it is later than the early discourse material in DN 16."
        ],
        points: [
          "<strong>Sārīrika Cetiya</strong> — the Buddha’s bodily relics, which became centers of devotion after his Parinibbāna.",
          "<strong>Pāribhogika Cetiya</strong> — something used by or closely connected with the Buddha; the Bodhi tree is especially important in the traditional account.",
          "<strong>Uddesika Cetiya</strong> — a commemorative or representational object pointing toward the Buddha; later interpretation commonly includes Buddha images."
        ]
      },
      {
        heading: "Why Can an Image Represent the Buddha?",
        paragraphs: [
          "An image can remind someone of a person or teaching without being identical with what it represents. Before a Buddha image, the meaningful focus is not simply stone, metal, wood, or paint. It is the awakening, wisdom, compassion, freedom from greed, hatred, and delusion, and path of practice toward which the image points.",
          "This avoids two opposite misunderstandings. Buddhists need not be described as worshipping raw material, yet the object need not be dismissed as having no role. Within devotional practice it can matter as a support for recollection without being confused with the Buddha himself."
        ]
      },
      {
        heading: "Did Buddha Images Always Exist?",
        paragraphs: [
          "No. Many surviving early Buddhist monuments use symbolic forms, while unmistakable human-form images are securely attested in regions such as Gandhāra by the early centuries CE. The history is complex and does not prove a universal early prohibition against images.",
          "The main point for this question is that forms of remembrance developed over time while continuing to point toward the Buddha, awakening, and the Dhamma. For a fuller treatment of that chronology, see <a href=\"/learn/questions-about-buddhism/did-buddha-order-buddha-images/\">Did the Buddha Order the Construction and Veneration of Buddha Images?</a>"
        ]
      },
      {
        heading: "Does Respect Require a Shrine or Buddha Statue?",
        paragraphs: [
          "No. A temple, stupa, relic shrine, Bodhi tree, or Buddha image can provide a meaningful focus, but confidence and recollection are not confined to one physical place.",
          "More deeply, Buddhist practice points from symbolic respect toward living according to the Dhamma. A person can bow beautifully before an image and behave carelessly afterward. Respect also means trying to avoid harm, give generously, speak truthfully and carefully, train the mind, develop compassion, and cultivate wisdom.",
          "Physical veneration and Dhamma practice do not have to compete. At their best, the first reminds practitioners of the second. The <a href=\"/learn/buddhism-101/the-three-jewels-explained/\">Three Jewels</a> provide a wider framework for understanding this relationship."
        ]
      },
      {
        heading: "What Is the Meaning of an Offering?",
        paragraphs: [
          "A flower placed before a Buddha image does not become meaningful because the Buddha consumes it. It can become an intentional act of recollection. Flowers may call attention to beauty and impermanence; light may symbolize wisdom overcoming ignorance; incense may express reverence; bowing may cultivate gratitude and humility.",
          "Ritual should not be treated mechanically. Intention, understanding, and the qualities of mind accompanying the action matter. Readers visiting a shrine for the first time may also find <a href=\"/articles/visiting-a-buddhist-temple-respectfully/\">Visiting a Buddhist Temple Respectfully</a> useful."
        ]
      },
      {
        heading: "Can the Buddha Be Respected Without Any Physical Object?",
        paragraphs: [
          "Yes. A person without a shrine, relic, temple, Bodhi tree, or image can still recollect the Buddha’s qualities and practice the Dhamma. Physical supports can be meaningful, but sincere recollection is not geographically confined to them.",
          "To remember the Buddha is meaningful. To understand the Dhamma and let it shape conduct, meditation, compassion, and wisdom is deeper still."
        ]
      }
    ],
    sourceNote:
      "This page is an original Echo Buddha educational explanation. It distinguishes early Buddhist textual material, later Theravāda narrative and interpretation, and modern historical evidence where those sources answer different questions.",
    sources: [
      {
        label: "Mahāparinibbāna Sutta (DN 16) — SuttaCentral",
        href: "https://suttacentral.net/dn16/en/sujato",
        sourceType: "Early Buddhist discourse",
        note: "Supports the early textual claims about stupa remembrance, reverence, relic distribution, and the memorials built after the Buddha’s Parinibbāna."
      },
      {
        label: "Kāliṅgabodhi Jātaka (Ja 479) — Ancient Buddhist Texts",
        href: "https://ancient-buddhist-texts.net/English-Texts/Jataka/479.htm",
        sourceType: "Theravāda narrative/commentary",
        note: "Provides the later traditional setting for Ānanda, the Jetavana Bodhi tree, and the threefold cetiya explanation; it is not presented as an early sutta."
      },
      {
        label: "Seated Buddha from Gandhāra — The Metropolitan Museum of Art",
        href: "https://www.metmuseum.org/art/collection/search/72381",
        sourceType: "Museum / art history",
        note: "Supports the limited chronology statement about surviving human-form imagery in the early centuries CE without implying a universal earlier ban."
      }
    ],
    relatedLinks: [
      {
        label: "Who Was the Buddha?",
        href: "/learn/buddhism-101/who-was-the-buddha/",
        description: "Begin with the Buddha as the awakened teacher and the path he taught."
      },
      {
        label: "The Three Jewels Explained",
        href: "/learn/buddhism-101/the-three-jewels-explained/",
        description: "See how Buddha, Dhamma, and Sangha orient Buddhist life."
      },
      {
        label: "Buddhist Sources and Citations",
        href: "/buddhist-sources-and-citations/",
        description: "Learn how Echo Buddha distinguishes scripture, commentary, history, and editorial explanation."
      }
    ],
    relatedTerms: ["Parinibbāna", "Cetiya", "Relics", "Stupa", "Bodhi tree", "Offerings"],
    searchTerms: ["Parinibbāna", "honoring the Buddha", "relics", "stupa", "Bodhi tree", "cetiya", "Buddha images", "offerings"],
    previous: {
      label: "Question 1: Did the Buddha Order the Construction and Veneration of Buddha Images?",
      href: `${questionsPath}/did-buddha-order-buddha-images/`
    }
  }
];

export function getBuddhistQuestion(slug: string) {
  return buddhistQuestions.find((question) => question.slug === slug);
}

export function getBuddhistQuestionPath(question: BuddhistQuestion) {
  return `${questionsPath}/${question.slug}/`;
}
