import { countReadableWords, getReadTimeFromWordCount } from "../utils/publicationMetadata.ts";

export type BuddhistQuestionLink = {
  label: string;
  href: string;
  description?: string;
};

export type BuddhistQuestionSource = {
  label: string;
  href: string;
  sourceType:
    | "Early Buddhist discourse"
    | "Theravāda canonical hagiography"
    | "Theravāda narrative/commentary"
    | "Museum / art history"
    | "Cultural heritage / history";
  note: string;
};

export type BuddhistQuestionSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type BuddhistQuestion = {
  number: 1 | 2 | 3 | 4 | 5;
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  publishedDate: string;
  modifiedDate: string;
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
    publishedDate: "2026-09-02",
    modifiedDate: "2026-09-02",
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
    publishedDate: "2026-09-02",
    modifiedDate: "2026-09-02",
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
    },
    next: {
      label: "Question 3: Is a Buddha Image the Only Uddesika Cetiya?",
      href: `${questionsPath}/is-buddha-image-only-uddesika-cetiya/`
    }
  },
  {
    number: 3,
    slug: "is-buddha-image-only-uddesika-cetiya",
    title: "Is a Buddha Image the Only Uddesika Cetiya?",
    seoTitle: "Is a Buddha Image the Only Uddesika Cetiya? | Echo Buddha",
    description:
      "Is Uddesika Cetiya limited to Buddha statues? Explore Theravāda memorial traditions, sand-stupa stories in the Apadāna, and the role of intention and representation.",
    eyebrow: "Question 3",
    publishedDate: "2026-09-14",
    modifiedDate: "2026-09-14",
    intro:
      "A Buddha image is an important example of Uddesika Cetiya in later Theravāda explanation, but the underlying idea of a memorial or representational shrine is broader than one artistic form.",
    takeaway:
      "A Buddha image can be understood as an Uddesika Cetiya, but it should not be treated as the only possible form of commemorative representation. Theravāda texts preserve stories of deliberately made memorials—including simple sand stupas—used to recollect and honor Buddhas without depending on bodily relics or an object personally used by a Buddha. These stories illustrate a wider devotional logic, although their exact technical classification should be stated cautiously.",
    shortAnswer: [
      "No. Within later Theravāda explanation, a Buddha image is a familiar and important example of Uddesika Cetiya, but uddesika points more broadly to a commemorative or representational focus established in relation to the Buddha.",
      "This differs from a Sārīrika Cetiya, centered on bodily relics, and a Pāribhogika Cetiya, connected with something used by or closely associated with a Buddha. A representational memorial does not depend on either kind of direct physical connection.",
      "Theravāda hagiographic literature also tells of ascetics deliberately making sand stupas in honor of Buddhas. Those accounts show that meaningful remembrance was not limited to expensive statues or relic-bearing monuments. They do not, however, formally define every sand stupa with the technical label Uddesika Cetiya."
    ],
    sections: [
      {
        heading: "What Does Uddesika Cetiya Mean?",
        paragraphs: [
          "In a later Theravāda explanatory framework, <i>cetiya</i> covers sacred monuments, shrines, and memorial supports. <i>Uddesika</i> identifies the commemorative or representational category: an object established to point toward the Buddha rather than one defined by bodily relics or personal use.",
          "The familiar threefold classification appears in the prose narrative surrounding the <i>Kāliṅgabodhi Jātaka</i> (Ja 479). It is helpful within Theravāda tradition, but it should not be presented as a universal classification used identically by every Buddhist school or as a verbatim definition from an early discourse."
        ],
        points: [
          "<strong>Sārīrika Cetiya</strong> — a shrine associated with bodily relics.",
          "<strong>Pāribhogika Cetiya</strong> — a place or object linked with a Buddha’s use or presence, such as the Bodhi tree in the Jetavana narrative.",
          "<strong>Uddesika Cetiya</strong> — a commemorative or representational focus that points toward the Buddha."
        ]
      },
      {
        heading: "Why a Buddha Image Is an Important Example",
        paragraphs: [
          "A Buddha image clearly performs a representational role. Merely being an image does not give it a bodily-relic connection, nor does it mean the historical Buddha personally used the object. Instead, the image directs attention beyond its material form.",
          "Stone, metal, wood, or paint is not itself the historical Buddha. In devotional practice, the form can help someone recollect awakening, wisdom, compassion, freedom from greed, hatred, and delusion, and the path taught by the Buddha. This makes the image a strong later example of Uddesika remembrance without reducing the category to statues alone."
        ]
      },
      {
        heading: "The Sand-Stupa Stories in the Apadāna",
        paragraphs: [
          "The Therāpadāna, a collection of canonical Theravāda hagiographies, preserves more than one story about a deliberately constructed sand stupa. In the Puḷinuppādaka account, an ascetic named Devala builds a stupa from sand, adorns it with flowers, and honors Buddhas through it; his students then join that practice. The text connects the act with confidence, recollection, and beneficial karmic results.",
          "The Puḷinathūpiya account describes an ascetic named Nārada who, wanting a worthy focus for respect, builds and venerates a sand stupa for Buddhas. The account likewise presents the memorial act as karmically fruitful. These are sacred biographies expressing the collection’s devotional and karmic vision, not modern historical reports or early-discourse instructions.",
          "Echo Buddha paraphrases only the limited source claims needed here. No translated verse or photographed-book passage is reproduced."
        ]
      },
      {
        heading: "What These Stories Do—and Do Not—Establish",
        paragraphs: [
          "The sand-stupa stories help illustrate the broader logic of commemorative or representational devotion. Their memorials do not require a bodily relic, an object personally used by a Buddha, or a costly human-form statue. Their emphasis falls on deliberate construction, recollection, confidence, and veneration.",
          "The comparison has a boundary. The Apadāna passages are not being treated as though each formally defines its sand stupa with the exact category Uddesika Cetiya. Connecting them with the wider Uddesika idea is an editorial comparison informed by later Theravāda memorial explanation—not a quotation or technical definition supplied by those verses."
        ]
      },
      {
        heading: "Does Respectful Intention Make Any Object a Cetiya?",
        paragraphs: [
          "Intention matters, but intention alone does not automatically turn every object into a cetiya. A random object is not transformed merely because someone feels affection for it.",
          "A memorial has a deliberate relationship and function: it is dedicated, established, or used to recollect the Buddha, awakening, or qualities connected with the Buddhist path. The sand-stupa narratives make this purposeful orientation visible. Material simplicity does not prevent a memorial function, but neither does emotion remove the need for an intentional connection."
        ]
      },
      {
        heading: "Why This Matters for Buddha Images",
        paragraphs: [
          "If deliberately constructed memorials can support remembrance without bodily relics or direct-use objects, representational devotion need not be confined to one physical form. A stupa of sand and a carefully made Buddha image are materially different, yet each can be deliberately related to recollection of Buddhas within its own textual or historical setting.",
          "A Buddha image remains one of the clearest later examples of Uddesika Cetiya. The point is not to weaken that role, but to avoid mistaking a major example for the entire category. For the earlier question about whether images were commanded, see <a href=\"/learn/questions-about-buddhism/did-buddha-order-buddha-images/\">Did the Buddha Order the Construction and Veneration of Buddha Images?</a>"
        ]
      },
      {
        heading: "A Careful Conclusion",
        paragraphs: [
          "A Buddha image can be an Uddesika Cetiya, but Uddesika remembrance is better understood through its commemorative or representational function than through one required material form.",
          "Theravāda sand-stupa stories reinforce the importance of intentional remembrance and the religious value that the tradition assigns to it. Careful source reading also keeps the claim proportionate: the stories illustrate the broader memorial logic without themselves supplying a formal Uddesika definition for every sand stupa."
        ]
      }
    ],
    sourceNote:
      "This page is an original Echo Buddha educational explanation. It distinguishes the Apadāna’s canonical Theravāda hagiographies from the later cetiya classification in the Kāliṅgabodhi Jātaka prose and from Echo Buddha’s own comparison between them.",
    sources: [
      {
        label: "Puḷinuppādakatthera Apadāna (Tha Ap 489) — SuttaCentral",
        href: "https://suttacentral.net/tha-ap489/en/walters",
        sourceType: "Theravāda canonical hagiography",
        note: "Supports the account of Devala deliberately making and venerating a sand stupa in honor of Buddhas, and the beneficial results the text associates with that devotion. It is not used as a formal definition of Uddesika Cetiya."
      },
      {
        label: "Puḷinathūpiya Therāpadāna (Tha Ap 500) — SuttaCentral",
        href: "https://suttacentral.net/tha-ap500/en/walters",
        sourceType: "Theravāda canonical hagiography",
        note: "Supports the Nārada sand-stupa episode and its devotional and karmic framing. Edition numbering can differ, so the stable SuttaCentral text identifier is provided."
      },
      {
        label: "Kāliṅgabodhi Jātaka (Ja 479) — Ancient Buddhist Texts",
        href: "https://ancient-buddhist-texts.net/English-Texts/Jataka/479.htm",
        sourceType: "Theravāda narrative/commentary",
        note: "Provides the later threefold shrine framework used to explain the distinction among bodily-relic, use-associated, and memorial or representational cetiyas."
      }
    ],
    relatedLinks: [
      {
        label: "Did the Buddha Order Buddha Images?",
        href: `${questionsPath}/did-buddha-order-buddha-images/`,
        description: "Separate early textual claims about commands from the later history and meaning of Buddha images."
      },
      {
        label: "How Can the Buddha Be Respected After Parinibbāna?",
        href: `${questionsPath}/respecting-buddha-after-parinibbana/`,
        description: "Place images, stupas, relics, Bodhi traditions, and Dhamma practice in a wider account of remembrance."
      },
      {
        label: "Buddhist Sources and Citations",
        href: "/buddhist-sources-and-citations/",
        description: "See how Echo Buddha distinguishes scripture, commentary, history, and editorial explanation."
      }
    ],
    relatedTerms: ["Uddesika Cetiya", "Sārīrika Cetiya", "Pāribhogika Cetiya", "Apadāna", "Sand stupa"],
    searchTerms: ["Uddesika Cetiya", "Buddha image", "Buddha statue", "cetiya", "sand stupa", "Apadāna", "memorial shrine", "representational shrine"],
    previous: {
      label: "Question 2: How Can the Buddha Be Respected After Parinibbāna?",
      href: `${questionsPath}/respecting-buddha-after-parinibbana/`
    },
    next: {
      label: "Question 4: Why Didn’t the Buddha Ask for a Statue at Jetavana?",
      href: `${questionsPath}/why-no-buddha-statue-at-jetavana/`
    }
  },
  {
    number: 4,
    slug: "why-no-buddha-statue-at-jetavana",
    title: "If a Buddha Image Can Be an Uddesika Cetiya, Why Didn’t the Buddha Ask for a Statue at Jetavana?",
    seoTitle: "Why Didn’t the Buddha Ask for a Statue at Jetavana? | Echo Buddha",
    description:
      "Why did the Jetavana tradition use a Bodhi tree rather than a Buddha statue? Explore what the Kāliṅgabodhi Jātaka actually says, what it does not say, and why silence is not a prohibition.",
    eyebrow: "Question 4",
    publishedDate: "2026-09-14",
    modifiedDate: "2026-09-14",
    intro:
      "The Jetavana Bodhi-tree story tells us what memorial solution Ānanda proposed and the Buddha approved. It does not tell us that Buddha images were forbidden, nor does it record the Buddha saying he would have approved a statue instead.",
    takeaway:
      "The Kāliṅgabodhi Jātaka narrative says that Ānanda proposed a Bodhi tree as a focus for reverence at Jetavana and that the Buddha approved the proposal. The narrative records no command to build a statue, but it also records no prohibition against Buddha images. The safest conclusion is limited: the Bodhi tree was the memorial chosen in this traditional account; the absence of a statue instruction cannot by itself invalidate later Buddha-image devotion.",
    shortAnswer: [
      "The later Theravāda narrative surrounding the Kāliṅgabodhi Jātaka describes a practical problem: people wanted a suitable focus for reverence at Jetavana when the Buddha was away. Anāthapiṇḍika raised the concern, and Ānanda asked the Buddha about an appropriate shrine.",
      "Ānanda proposed planting a Bodhi tree, and the Buddha approved that proposal. The tree had a close traditional association with awakening and with the Buddha, making it a natural focus within this particular story.",
      "The text does not record the Buddha rejecting a statue. It also does not record him saying that a hypothetical statue would have been approved. A careful reading therefore invents neither a prohibition nor an approval that the narrative does not contain."
    ],
    sections: [
      {
        heading: "What the Jetavana Story Actually Says",
        paragraphs: [
          "In the prose narrative introducing the <i>Kāliṅgabodhi Jātaka</i> (Ja 479), devotees arrive at Jetavana with offerings while the Buddha is away and find no fitting focus for their reverence. Anāthapiṇḍika brings the practical concern to Ānanda, who asks the Buddha about suitable shrines.",
          "The discussion distinguishes bodily-relic, use-associated, and memorial shrines. The Bodhi tree is treated as suitable during the Buddha’s lifetime because of its direct association with awakening. Ānanda proposes planting a descendant of the great Bodhi tree at Jetavana, the Buddha approves the plan, and Anāthapiṇḍika plants it. The narrative later says that the Buddha spends one night beneath the new tree, further connecting it with him.",
          "This is the sequence that the later Theravāda narrative preserves. It should be paraphrased as such, not silently moved into the earlier discourse layer."
        ]
      },
      {
        heading: "The Buddha Approved the Bodhi Tree—Not a Recorded Statue Proposal",
        paragraphs: [
          "The story gives an affirmative answer to one proposal: Ānanda asks to establish a Bodhi tree at Jetavana, and the proposal is approved. No comparable proposal to make a Buddha statue appears in the narrative.",
          "Some later readers may reason that a statue could also have been approved. That is an interpretation, not a statement placed in the Buddha’s mouth by Ja 479. Echo Buddha therefore does not present the counterfactual as a quotation or historical fact.",
          "The equally important boundary runs the other way. The absence of a statue proposal is not a recorded rejection of Buddha images. The text supports the chosen Bodhi-tree memorial; it does not settle every possible later representational practice."
        ]
      },
      {
        heading: "Why Was a Bodhi Tree a Natural Memorial Focus?",
        paragraphs: [
          "The Bodhi tree is inseparable from the traditional account of the Buddha’s awakening. In the threefold cetiya explanation used by this narrative, it belongs to the Pāribhogika category: a memorial associated with a Buddha’s use or presence rather than with bodily relics.",
          "That direct association makes the tree intelligible as the solution proposed at Jetavana. The story also gives the planted tree a continuing connection when the Buddha sits beneath it. These textual features are enough to explain its role without guessing at Ānanda’s private motives or claiming that a statue was rejected as difficult, unavailable, or improper."
        ]
      },
      {
        heading: "Does the Absence of a Statue Order Mean Statues Were Rejected?",
        paragraphs: [
          "No. A narrative recording one approved solution does not automatically establish that every unmentioned alternative was forbidden. Silence can tell us that no statue instruction is recorded in this scene; it cannot, by itself, become a universal rule against later images.",
          "The Jetavana story answers a focused question: what devotional support was established in this traditional account while the Buddha was away? It does not answer the broader historical question of whether the Buddha issued a universal prohibition against future human-form images. For that separate issue, see <a href=\"/learn/questions-about-buddhism/did-buddha-order-buddha-images/\">Did the Buddha Order the Construction and Veneration of Buddha Images?</a>"
        ]
      },
      {
        heading: "Historical Context Also Requires Caution",
        paragraphs: [
          "Surviving human-form Buddha images are securely attested centuries after the period in which the Jetavana narrative is set. The Metropolitan Museum of Art dates one early seated Buddha from Gandhāra to the first to mid-second century CE and describes human-form traditions developing in Gandhāra and, contemporaneously, Mathurā.",
          "This chronology cautions against projecting a fully developed later image culture backward into an earlier setting. It does not prove that all early Buddhists followed a universal image ban, and it does not reveal the undocumented reason why the traditional Ānanda narrative chooses a tree. Archaeological chronology supplies context, not a missing line of dialogue."
        ]
      },
      {
        heading: "What Later Buddha Images Mean",
        paragraphs: [
          "Later Theravāda explanation can treat Buddha images as Uddesika, or representational, cetiyas. Such an image points toward the Buddha and qualities associated with awakening without being identical with the historical Buddha or depending on a bodily relic.",
          "That later representational practice does not require a claim that a statue was ordered at Jetavana. Religious traditions can preserve an approved Bodhi-tree memorial in one narrative and develop meaningful image devotion in later settings. Q3 explains why <a href=\"/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/\">Uddesika Cetiya is broader than one material form</a>."
        ]
      },
      {
        heading: "A Better Way to Read the Question",
        paragraphs: [
          "The apparent conflict disappears when four questions are kept separate: what the Jetavana narrative records, how later Theravāda explanation classifies devotional objects, how Buddhist art developed historically, and what Buddha-image veneration means in later practice.",
          "Ja 479 records approval of a Bodhi tree at Jetavana. It records no statue proposal, no rejection of statues, and no certainty about a hypothetical approval. Later Buddha-image devotion should therefore be understood through its own traditional and historical context—not condemned by silence in this story and not justified by words the story never gives the Buddha."
        ]
      }
    ],
    sourceNote:
      "This page is an original Echo Buddha explanation of a question raised within later Theravāda memorial tradition. It distinguishes the Kāliṅgabodhi Jātaka narrative, later interpretation, art-historical evidence, and Echo Buddha editorial inference.",
    sources: [
      {
        label: "Kāliṅgabodhi Jātaka (Ja 479) — Ancient Buddhist Texts",
        href: "https://ancient-buddhist-texts.net/English-Texts/Jataka/479.htm",
        sourceType: "Theravāda narrative/commentary",
        note: "Supports the Jetavana sequence: the need for a devotional focus, Ānanda’s inquiry and Bodhi-tree proposal, the Buddha’s approval, the planting, and the later connection made by the Buddha sitting beneath the tree. It records no statue proposal."
      },
      {
        label: "Seated Buddha from Gandhāra — The Metropolitan Museum of Art",
        href: "https://www.metmuseum.org/art/collection/search/72381",
        sourceType: "Museum / art history",
        note: "Supports the limited chronology of a securely attested human-form Buddha image dated to the first to mid-second century CE. It does not prove an earlier prohibition or Ānanda’s motive."
      },
      {
        label: "Buddhism and Buddhist Art — The Metropolitan Museum of Art",
        href: "https://www.metmuseum.org/essays/buddhism-and-buddhist-art",
        sourceType: "Museum / art history",
        note: "Supports the broader contextual statement that human-form Buddha traditions emerged in Gandhāra and contemporaneously in Kushan-period Mathurā."
      }
    ],
    relatedLinks: [
      {
        label: "Did the Buddha Order Buddha Images?",
        href: `${questionsPath}/did-buddha-order-buddha-images/`,
        description: "Examine the distinct question of commands, early textual evidence, and later image history."
      },
      {
        label: "Is a Buddha Image the Only Uddesika Cetiya?",
        href: `${questionsPath}/is-buddha-image-only-uddesika-cetiya/`,
        description: "Explore the wider representational and memorial logic behind Uddesika Cetiya."
      },
      {
        label: "Visiting a Buddhist Temple Respectfully",
        href: "/articles/visiting-a-buddhist-temple-respectfully/",
        description: "Use calm practical guidance around Bodhi trees, shrines, images, and offerings."
      }
    ],
    relatedTerms: ["Jetavana", "Ānanda", "Bodhi tree", "Uddesika Cetiya", "Kāliṅgabodhi Jātaka"],
    searchTerms: ["Jetavana", "Ānanda", "Bodhi tree", "Buddha statue", "Uddesika Cetiya", "Kāliṅgabodhi Jātaka", "Buddhist memorial", "Buddha image"],
    previous: {
      label: "Question 3: Is a Buddha Image the Only Uddesika Cetiya?",
      href: `${questionsPath}/is-buddha-image-only-uddesika-cetiya/`
    },
    next: {
      label: "Question 5: Why Was a Bodhi Tree Planted at Jetavana?",
      href: `${questionsPath}/why-bodhi-tree-planted-at-jetavana/`
    }
  },
  {
    number: 5,
    slug: "why-bodhi-tree-planted-at-jetavana",
    title: "Why Was a Bodhi Tree Planted at Jetavana When Other Objects Had Been Used by the Buddha?",
    seoTitle: "Why Was a Bodhi Tree Planted at Jetavana? | Echo Buddha",
    description:
      "Why was a Bodhi tree chosen at Jetavana when other places and objects were associated with the Buddha? Explore Ja 479, awakening, Pāribhogika Cetiya, and historical context.",
    eyebrow: "Question 5",
    publishedDate: "2026-09-20",
    modifiedDate: "2026-09-20",
    intro:
      "The Jetavana Bodhi-tree tradition is better explained through its connection with awakening and memorial continuity than by simply asking which object the Buddha used most often.",
    takeaway:
      "Within the later Theravāda narrative, the Bodhi tree carries a distinctive connection with awakening and is explicitly treated as a suitable focus for reverence. The text does not say that other places or objects were inferior or formally rejected. Visibility, propagation, continuity, and the wider history of sacred trees may help explain the reach of Bodhi-tree devotion, but those are contextual observations rather than motives stated by Ja 479.",
    shortAnswer: [
      "The Bodhi tree was not important merely because it was another object associated with the Buddha. In Buddhist tradition, the great Bodhi tree at Bodh Gaya is inseparably connected with awakening itself.",
      "The later Theravāda narrative surrounding the Kāliṅgabodhi Jātaka (Ja 479) gives the Bodhi tree a particular memorial role. When devotees at Jetavana needed a focus for reverence while the Buddha was away, Ānanda proposed a tree propagated from the great Bodhi tree, and the proposal was approved.",
      "Other places and objects at Jetavana could also carry meaning, but Ja 479 does not rank them by frequency of use. Its choice is better explained by the Bodhi tree’s distinctive association with awakening and the deliberate continuity created in the Jetavana story—not by unsupported guesses about beauty or durability."
    ],
    sections: [
      {
        heading: "The Bodhi Tree Was More Than an Ordinary ‘Used Object’",
        paragraphs: [
          "Within later Theravāda explanation, the Bodhi tree can be discussed as a <i>Pāribhogika Cetiya</i>: a memorial connected with a Buddha’s use or presence. Yet its importance cannot be measured simply by counting how long the Buddha stayed near it.",
          "The great Bodhi tree at Bodh Gaya is associated above all with the Buddha’s awakening. A seat may recall where a teacher sat, and a dwelling may recall where a teacher stayed. The Bodhi tree recalls the setting of the event through which Siddhattha became the Buddha. That association gives it a religious significance different from ordinary frequency of use.",
          "UNESCO’s account of the Mahabodhi Temple Complex treats Bodh Gaya as a holy site particularly connected with the attainment of enlightenment and identifies the sacred Bodhi tree as a central element of the complex. This is cultural and historical evidence about the site’s heritage, not a canonical doctrinal definition."
        ]
      },
      {
        heading: "What the Jetavana Tradition Actually Says",
        paragraphs: [
          "In the prose narrative associated with the <i>Kāliṅgabodhi Jātaka</i> (Ja 479), devotees bring offerings to Jetavana while the Buddha is away but lack an appropriate focus for reverence. Anāthapiṇḍika raises the problem with Ānanda, who asks the Buddha about suitable shrines.",
          "The narrative distinguishes bodily-relic, use-associated, and memorial shrines. It then singles out the great Bodhi tree as suitable for a shrine during a Buddha’s lifetime as well as after a Buddha’s passing. Ānanda proposes planting a Bodhi tree at Jetavana, and the proposal is approved.",
          "This account belongs to later Theravāda narrative and commentary, not to an early Buddhist discourse. It nevertheless gives a direct traditional answer to this question: within this source, the Bodhi tree already has a distinctive shrine-suitable status."
        ]
      },
      {
        heading: "A Deliberate Connection with the Great Bodhi Tree",
        paragraphs: [
          "Ja 479 does not describe an unrelated tree being chosen at random. Its narrative says that a fruit from the great Bodhi tree was obtained and planted at Jetavana. The new devotional focus was therefore presented through a lineage connected with the tree of awakening.",
          "The story then adds another connection: the Buddha spends one night beneath the newly planted tree. The narrative thus relates the Jetavana tree both to the great Bodhi tree through propagation and to the Buddha through his later presence there.",
          "This is best understood as intentional memorial continuity. It does not require claiming that every descendant tree is physically identical with the original or that sacredness is a scientific property transmitted by a seed. The religious continuity lies in lineage, dedication, symbolism, and recollection."
        ]
      },
      {
        heading: "Why Not the Buddha’s Hut, Seat, or Another Object?",
        paragraphs: [
          "The surviving narrative does not compare the Bodhi tree with the Buddha’s hut, bed, chair, or teaching seat and then reject those alternatives. It provides no ranking based on how many hours or days each object was used.",
          "We therefore cannot say that Ja 479 declares the Bodhi tree better than every other object associated with the Buddha. Other places and objects could retain their own meanings. The narrower source-based conclusion is that the Bodhi tree represented something distinctive—awakening—and that this particular narrative explicitly selected it for Jetavana.",
          "This question differs from Q4. Q4 asks why the story records a Bodhi-tree proposal rather than a statue proposal; <a href=\"/learn/questions-about-buddhism/why-no-buddha-statue-at-jetavana/\">that page addresses the limits of an argument from silence</a>. Q5 asks why the Bodhi tree itself could carry such a powerful memorial role."
        ]
      },
      {
        heading: "A Living Memorial That Could Continue",
        paragraphs: [
          "A living tree can become a visible communal focus, and a lineage of trees can be propagated instead of depending on possession of one unique portable artifact. Not every Buddhist community could possess a bodily relic or an original personal object used by the historical Buddha.",
          "Propagation therefore offers a form of continuity: descendant trees can be dedicated in new places while pointing back to the awakening tradition. This may help explain the wider accessibility and endurance of Bodhi-tree devotion across Buddhist cultures.",
          "That is an Echo Buddha editorial observation drawn from the narrative’s emphasis on propagation, not a motive explicitly stated by the Buddha or Ānanda in Ja 479. The text does not say that the tree was chosen because it was impossible to steal, burn, damage, or remove."
        ]
      },
      {
        heading: "The Wider History of Tree Shrines",
        paragraphs: [
          "Sacred trees and tree shrines formed part of the broader religious landscape of South Asia. The Metropolitan Museum of Art’s <i>Tree &amp; Serpent</i> material explains that tree shrines were incorporated into early Buddhist sacred settings and describes the Bodhi tree of awakening as especially powerful in living Buddhist tradition.",
          "Early Buddhist art also used an empty throne beneath a tree to refer to the Buddha’s place of awakening. This historical context helps explain why tree-centered devotion would have been intelligible and meaningful in Buddhist environments.",
          "The boundary is important: this evidence does not document Ānanda’s personal motive. Ja 479 does not say that the tree was selected because pre-Buddhist communities venerated trees. Cultural background can illuminate the setting without replacing the reason the Theravāda narrative itself supplies."
        ]
      },
      {
        heading: "A Careful Conclusion",
        paragraphs: [
          "The strongest answer begins with awakening. The later Theravāda tradition gives the great Bodhi tree a special shrine role, and the Jetavana story creates continuity through a propagated tree that the Buddha later uses for one night.",
          "The account does not tell us that other Buddha-associated objects were inferior, examined, or rejected. Nor does it identify beauty, resistance to theft, or resistance to fire and water as reasons for the choice.",
          "Practical features such as visibility, communal focus, and propagation can be useful secondary observations when they are labelled as interpretation. The traditional core remains more precise: the Bodhi tree was a living memorial whose meaning pointed to awakening. For the broader categories of remembrance, see <a href=\"/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/\">Is a Buddha Image the Only Uddesika Cetiya?</a> and <a href=\"/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/\">How Can the Buddha Be Respected After Parinibbāna?</a>"
        ]
      }
    ],
    sourceNote:
      "This page is an original Echo Buddha educational explanation. It distinguishes the later Theravāda Kāliṅgabodhi Jātaka narrative, cultural and historical evidence about Bodhi-tree devotion, and Echo Buddha’s editorial interpretation of why the tree became a particularly powerful memorial.",
    sources: [
      {
        label: "Kāliṅgabodhi Jātaka (Ja 479) — Ancient Buddhist Texts",
        href: "https://ancient-buddhist-texts.net/English-Texts/Jataka/479.htm",
        sourceType: "Theravāda narrative/commentary",
        note: "Supports the Jetavana devotional problem, the three shrine categories, the Bodhi tree’s stated suitability, Ānanda’s proposal, propagation from the great Bodhi tree, planting, and the Buddha’s later night beneath the tree. It is not presented as an early discourse."
      },
      {
        label: "Mahabodhi Temple Complex at Bodh Gaya — UNESCO World Heritage Centre",
        href: "https://whc.unesco.org/en/list/1056/",
        sourceType: "Cultural heritage / history",
        note: "Supports the narrow historical and heritage context linking Bodh Gaya and its sacred Bodhi tree with the Buddha’s awakening. UNESCO is not used as a canonical or doctrinal authority."
      },
      {
        label: "Tree & Serpent: Early Buddhist Art in India — The Metropolitan Museum of Art",
        href: "https://www.metmuseum.org/exhibitions/tree-and-serpent/visiting-guide",
        sourceType: "Museum / art history",
        note: "Supports the broader South Asian tree-shrine context and the incorporation of sacred-tree imagery into early Buddhist settings. It is not used to claim a documented motive for Ānanda or the Buddha."
      }
    ],
    relatedLinks: [
      {
        label: "Why Didn’t the Buddha Ask for a Statue at Jetavana?",
        href: `${questionsPath}/why-no-buddha-statue-at-jetavana/`,
        description: "Separate the story’s recorded Bodhi-tree proposal from claims it never makes about statues."
      },
      {
        label: "Is a Buddha Image the Only Uddesika Cetiya?",
        href: `${questionsPath}/is-buddha-image-only-uddesika-cetiya/`,
        description: "Compare representational remembrance with bodily-relic and use-associated memorials."
      },
      {
        label: "Buddhist Sources and Citations",
        href: "/buddhist-sources-and-citations/",
        description: "See how Echo Buddha distinguishes scripture, commentary, history, and editorial explanation."
      }
    ],
    relatedTerms: ["Bodhi tree", "Jetavana", "Pāribhogika Cetiya", "Ānanda", "Kāliṅgabodhi Jātaka", "Bodh Gaya"],
    searchTerms: ["Bodhi tree", "Jetavana", "Ānanda", "Pāribhogika Cetiya", "Kāliṅgabodhi Jātaka", "Bodh Gaya", "Buddhist shrine", "Buddhist memorial", "sacred tree"],
    previous: {
      label: "Question 4: Why Didn’t the Buddha Ask for a Statue at Jetavana?",
      href: `${questionsPath}/why-no-buddha-statue-at-jetavana/`
    }
  }
];

export function getBuddhistQuestion(slug: string) {
  return buddhistQuestions.find((question) => question.slug === slug);
}

export function getBuddhistQuestionPath(question: BuddhistQuestion) {
  return `${questionsPath}/${question.slug}/`;
}

export function getBuddhistQuestionWordCount(question: BuddhistQuestion) {
  const articleContent = [
    question.intro,
    question.takeaway,
    ...question.shortAnswer,
    ...question.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.points ?? [])
    ]),
    question.sourceNote,
    ...question.sources.flatMap((source) => [source.label, source.note])
  ].join(" ");

  return countReadableWords(articleContent);
}

export function getBuddhistQuestionReadTime(question: BuddhistQuestion) {
  return getReadTimeFromWordCount(getBuddhistQuestionWordCount(question));
}
