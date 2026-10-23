/** Original editorial explanations. These are paraphrases and modern applications,
 * not translated scripture or evidence of external expert review. */
export type TopicGuide = {
  heading: string;
  intro: string;
  modifiedDate: string;
  table?: { caption: string; headers: string[]; rows: string[][] };
  stepsHeading?: string;
  steps?: string[];
  questions: { question: string; answer: string }[];
  sourceNote: string;
};

const guides: Record<string, TopicGuide> = {
  "/learn/four-noble-truths/": {
    heading: "Four Truths, Four Different Tasks",
    intro: "The Four Noble Truths describe dukkha, its origin in craving, its cessation, and the path to cessation. Each truth calls for a different response; simply believing the list is not the whole training.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "The truths and their tasks in SN 56.11, paraphrased",
      headers: ["Truth", "Pali term", "Task", "Everyday starting point"],
      rows: [
        ["Suffering and unsatisfactoriness", "Dukkha", "Understand", "Recognize the pain and the strain of clinging without blaming the sufferer."],
        ["Origin", "Samudaya", "Abandon", "Notice the craving that insists experience must conform to a demand."],
        ["Cessation", "Nirodha", "Realize", "Understand the possibility of the ending of craving; a brief pause is an illustration, not a claim of full liberation."],
        ["Path", "Magga", "Develop", "Cultivate wisdom, ethical conduct, and mental training together."]
      ]
    },
    questions: [
      { question: "Does Buddhism say that life is only suffering?", answer: "No. The teaching recognizes pleasure and happiness while asking whether changing conditions can provide permanent satisfaction. It also teaches cessation and a path, so acknowledging dukkha is the beginning of a response rather than a verdict of hopelessness." },
      { question: "Is every difficulty caused by my own craving?", answer: "No. Illness, injury, exploitation, and loss have conditions that cannot responsibly be reduced to a person's attitude. Examining craving can reveal an additional source of distress without excusing harm or replacing practical help." }
    ],
    sourceNote: "The task distinctions are grounded in SN 56.11; the everyday examples are original editorial applications. Sources are listed below."
  },
  "/learn/eightfold-path/": {
    heading: "How the Eight Factors Work Together",
    intro: "The Noble Eightfold Path develops understanding, intention, ethical behavior, and the mind. Its factors support one another; it is not eight achievements that must be completed one at a time.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "A traditional threefold grouping of the path",
      headers: ["Training", "Path factors", "A daily-life question"],
      rows: [
        ["Wisdom (paññā)", "Right view; right intention", "What am I assuming, and is my intention shaped by goodwill or by grasping?"],
        ["Ethical conduct (sīla)", "Right speech; right action; right livelihood", "Will this choice protect life, honesty, trust, and others' wellbeing?"],
        ["Concentration (samādhi)", "Right effort; right mindfulness; right concentration", "What states am I cultivating, and can attention become less scattered?"]
      ]
    },
    questions: [
      { question: "Is right concentration simply feeling relaxed?", answer: "Relaxation may help, but SN 45.8 describes right concentration through the four jhānas. A short beginner practice is an entry into mental training, not a claim that the full canonical definition has been attained." },
      { question: "Can meditation replace ethical conduct?", answer: "No. In the path, speech, action, and livelihood matter alongside attention. A useful daily review considers how practice affects choices and relationships as well as what happens while sitting." }
    ],
    sourceNote: "SN 45.8 explains the factors; MN 44 describes their grouping into the three trainings. Questions and examples are editorial explanation."
  },
  "/learn/buddhism-for-beginners/": {
    heading: "Choose a First Step That Fits Your Question",
    intro: "A beginner does not have to learn every term before starting. Use the route that meets your immediate need, then return to the foundations so that meditation, ethics, and understanding remain connected.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "Choosing among Echo Buddha's learning routes",
      headers: ["Your question", "Begin with", "What to do next"],
      rows: [
        ["What is this tradition about?", "The Buddha and Four Noble Truths", "Read the Eightfold Path as a connected training."],
        ["How can I try a practice?", "Meditation for Beginners", "Choose a short breathing or walking session and read the safety guidance."],
        ["What does a Buddhist term mean?", "Buddhist Dictionary", "Follow its source and related lesson rather than treating one definition as a complete doctrine."],
        ["How do refuge and Buddhist community fit together?", "Buddhist Life & Practice Handbook", "Read the chapters in sequence, keeping their Theravāda context in view."]
      ]
    },
    questions: [
      { question: "Do all Buddhist traditions teach and practice identically?", answer: "No. Theravāda, Mahāyāna, Vajrayāna, and their many communities differ in texts, terminology, ideals, and practice. These introductory pages often use early Pali discourses as a reference point; that scope does not make every interpretation universal." },
      { question: "When should I seek a teacher or community?", answer: "You can ask questions at any stage. Look for clear ethical boundaries, freedom to question, transparent expectations, and a willingness to refer health concerns to qualified professionals. Reading online supports learning but does not establish a teacher's qualifications or replace a relationship with a responsible community." }
    ],
    sourceNote: "This route comparison describes the publication's learning structure; it is not a scriptural quotation or endorsement of a particular teacher."
  },
  "/learn/buddhism-101/what-is-impermanence/": {
    heading: "Impermanence Without Fatalism",
    intro: "Anicca means that conditioned things are inconstant: they arise and change with conditions. Understanding this can guide care and wise action without requiring indifference, forced acceptance, or a denial of grief.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "Three ways to respond to change",
      headers: ["Experience", "Unhelpful conclusion", "A more careful response"],
      rows: [
        ["Pleasure ends", "Enjoyment is pointless", "Appreciate what is present without demanding that it last."],
        ["A relationship changes", "Care cannot matter", "Listen, repair what can be repaired, and respect necessary boundaries."],
        ["A difficult feeling changes", "I should be able to end grief immediately", "Allow time and support; change is not a command to recover on schedule."]
      ]
    },
    questions: [
      { question: "Does impermanence mean that literally everything is conditioned?", answer: "The traditional formulation concerns conditioned phenomena. It should not be stretched into the claim that nibbāna is just another changing condition. The Dhammapada distinguishes the wording about conditioned things in verse 277 from the broader not-self formulation in verse 279." },
      { question: "How is this lesson different from the Anicca dictionary entry?", answer: "The dictionary provides a quick definition and terminology. This lesson explains how the teaching relates to clinging, care, and daily experience; the supporting articles explore particular applications and misunderstandings." }
    ],
    sourceNote: "Dhammapada 277–279 supplies the textual distinction. The comparison examples are original modern reflections."
  },
  "/meditation/meditation-for-beginners/": {
    heading: "Your First Session, Step by Step",
    intro: "Begin with three to five minutes of noticing a comfortable anchor and returning when distracted. Thinking is expected. The aim of this first session is to learn the action of returning, rather than to force silence or prove spiritual progress.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "Choose an anchor you can use comfortably",
      headers: ["Anchor", "What to notice", "When to adapt"],
      rows: [
        ["Natural breath", "One place where breathing can be felt", "If breath focus increases anxiety, use feet, sounds, or walking instead."],
        ["Contact with the chair or feet", "Pressure, warmth, and contact", "Change posture if there is pain; endurance is not the goal."],
        ["Walking", "The contact and movement of each step", "Use a clear, safe space and keep your eyes open."]
      ]
    },
    steps: [
      "Choose a safe place where you do not need to drive, supervise a hazard, or attend to an urgent task. Set a quiet timer for three to five minutes if useful.",
      "Sit on a chair or cushion, stand, or walk gently. Let the body be supported; an upright position should not mean stiffness or pain.",
      "Notice a natural breath, contact at the feet, or surrounding sounds. Leave breathing unforced; do not hold it or impose a rhythm.",
      "When you notice thinking, recognize it briefly and return to the next sensation. Each return is a repetition of the practice.",
      "End by noticing the room and how you feel. If distress increases, open the eyes, move, shorten the session, or stop. Choose the next session by what was manageable."
    ],
    questions: [
      { question: "What if I spend almost the whole session thinking?", answer: "Noticing that attention wandered is part of learning. Return once, without trying to win back lost minutes. A session full of gentle returns can be a useful beginning, even if it does not feel calm." },
      { question: "Should I increase the time every day?", answer: "There is no required schedule. Repeat a manageable length before increasing it, and keep a shorter option for difficult days. For a first-week habit plan, use the supporting beginner article linked below; for distress or persistent difficulty, use the Meditation Safety page and seek qualified support where appropriate." }
    ],
    sourceNote: "This short sequence is an introductory editorial adaptation, not the complete method of MN 118 or a clinical treatment. Traditional references and practice boundaries appear on this page."
  },
  "/meditation/loving-kindness-meditation/": {
    heading: "A Gentle Mettā Practice Sequence",
    intro: "Mettā develops goodwill: the intention that beings be free from hostility and harm. Phrases are reminders of that direction. They do not have to create strong emotion, and they never require contact with someone unsafe.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "Goodwill and related responses are distinct",
      headers: ["Quality", "Direction", "A common confusion"],
      rows: [
        ["Mettā — goodwill", "Wishing wellbeing without hostility", "It is not approval of every action."],
        ["Karuṇā — compassion", "Responding to suffering with care", "It does not require taking responsibility for everything."],
        ["Upekkhā — equanimity", "Care with balance and awareness of limits", "It is not indifference to harm."]
      ]
    },
    stepsHeading: "Try Three to Five Minutes of Goodwill",
    steps: [
      "Settle into a supported posture. Choose yourself or someone for whom goodwill feels uncomplicated.",
      "Offer one honest aspiration, such as wishing for safety or freedom from hostility. Repeat slowly enough to remember what the phrase means.",
      "If comfortable, extend that intention to another person and then more widely. Stay with an easy recipient if widening creates strain; a difficult person is optional.",
      "Notice the response without forcing warmth. If there is grief or distress, pause, ground in the room, or stop.",
      "Close with one concrete act that supports non-harming, such as speaking without contempt or keeping a necessary boundary."
    ],
    questions: [
      { question: "Are these phrases literal words from the Mettā Sutta?", answer: "No. The phrases and short sequence here are original editorial practice instructions. Sn 1.8 / Khp 9 supplies a traditional orientation toward expansive goodwill, but it should not be cited as the source of every modern staged meditation script." },
      { question: "Must I practice with someone who harmed me?", answer: "No. Leave them out when doing so is safer. Goodwill is compatible with distance, reporting harm, and seeking help. The separate troubleshooting article addresses empty phrases, anger, and self-kindness in more detail." }
    ],
    sourceNote: "The traditional orientation is Sn 1.8 / Khp 9; the sequence and comparison are editorial explanation, not a reproduced translation."
  },
  "/learn/buddhism-101/five-precepts-buddhism/": {
    heading: "Five Training Commitments in Everyday Life",
    intro: "The Five Precepts are voluntary commitments to refrain from harmful actions. Modern examples help examine conduct but should not be mistaken for the complete traditional wording.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "The Five Precepts and modern applications, paraphrased",
      headers: ["Refrain from", "A modern application"],
      rows: [
        ["Taking life", "Avoid intentional killing and consider how choices affect living beings."],
        ["Taking what is not given", "Respect property, permissions, and others' work."],
        ["Sexual misconduct", "Respect consent, commitments, and vulnerability; avoid exploitation."],
        ["False speech", "Check a claim before repeating it online or in conversation."],
        ["Intoxicants that lead to heedlessness", "Consider substances and situations that undermine attention and ethical restraint."]
      ]
    },
    questions: [{ question: "Does making a mistake mean the training has failed?", answer: "A lapse calls for honest recognition, repair where possible, and renewed care. It should not be used to deny harm or to condemn a person permanently. The precepts guide ongoing conduct rather than replacing reflection with a claim of moral purity." }],
    sourceNote: "Compare the linked traditional precept references below. The digital and relationship examples are editorial applications."
  },
  "/learn/buddhism-101/three-marks-of-existence/": {
    heading: "Distinguishing the Three Characteristics",
    intro: "Impermanence, dukkha, and not-self are related ways of examining experience. Their traditional formulations are not identical, so one slogan should not be substituted for all three.",
    modifiedDate: "2026-10-23",
    table: {
      caption: "Dhammapada 277–279, summarized without reproducing a translation",
      headers: ["Characteristic", "Scope in these verses", "Question for understanding"],
      rows: [
        ["Anicca — impermanence", "Conditioned things", "Can changing conditions provide permanent security?"],
        ["Dukkha — unsatisfactoriness", "Conditioned things", "What strain comes from relying on what cannot be held?"],
        ["Anattā — not-self", "All phenomena", "Is this appropriately held as mine, as what I am, or as my self?"]
      ]
    },
    questions: [{ question: "Does not-self mean that people or consequences do not matter?", answer: "No. Examining identification does not erase responsibility or suffering. Ethical care remains part of the Buddhist path. This introductory summary is a starting point for the linked sources, not a complete account of debates across Buddhist traditions." }],
    sourceNote: "See Dhammapada 277–279 and the linked not-self teaching. The question column is original editorial reflection."
  }
};

export const getTopicGuide = (route: string): TopicGuide | undefined => guides[route];
export const TOPIC_GUIDE_ROUTES = Object.keys(guides);
