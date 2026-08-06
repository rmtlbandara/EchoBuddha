import { SITE } from "./site";

export type LearningLink = {
  label: string;
  href: string;
  description?: string;
};

export type SourceLink = {
  label: string;
  href: string;
  note: string;
};

export type LearningPage = {
  section: string;
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  takeaway: string;
  practice?: string;
  relatedLinks: LearningLink[];
  sourceNote?: string;
  terms?: string[];
};

export type LearningQualityNote = {
  why: string;
  clarification: string;
  question: string;
};

export type TermLink = {
  label: string;
  href?: string;
};

export type LearningSection = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  intro: string;
  href: string;
  eyebrow: string;
  items: LearningPage[];
};

const commonSourceNote =
  "Echo Buddha writes original, beginner-friendly explanations for general education and reflection. Readers who want formal study are encouraged to learn with qualified teachers and reputable translations.";

const sourceLinksByPage: Record<string, SourceLink[]> = {
  "buddhism-101/who-was-the-buddha": [
    {
      label: "Dhammacakkappavattana Sutta (SN 56.11)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "A traditional early-discourse context for the Buddha's first teaching after awakening."
    }
  ],
  "buddhism-101/what-is-buddhism": [
    {
      label: "Dhammacakkappavattana Sutta (SN 56.11)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "Supports the framing of Buddhism around dukkha, its cause, cessation, and a path of practice."
    },
    {
      label: "Magga-vibhanga Sutta (SN 45.8)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html",
      note: "Gives a compact early-discourse analysis of the Noble Eightfold Path."
    }
  ],
  "buddhism-101/the-three-jewels-explained": [
    {
      label: "Dhammapada, Buddhavagga (Dhp 190-192)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.14.budd.html",
      note: "A traditional source for refuge in the Buddha, Dhamma, and Sangha."
    }
  ],
  "buddhism-101/the-four-noble-truths-explained": [
    {
      label: "Dhammacakkappavattana Sutta (SN 56.11)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "Primary early-discourse source for the four truths and the path leading to the cessation of dukkha."
    }
  ],
  "buddhism-101/the-noble-eightfold-path-explained": [
    {
      label: "Magga-vibhanga Sutta (SN 45.8)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html",
      note: "Defines the eight path factors in an early Buddhist discourse."
    }
  ],
  "buddhism-101/five-precepts-buddhism": [
    {
      label: "The Five Precepts",
      href: "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html",
      note: "Lists the five lay training precepts and connects them with non-harming."
    }
  ],
  "buddhism-101/three-marks-of-existence": [
    {
      label: "Pañcavaggi Sutta (SN 22.59)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn22/sn22.059.than.html",
      note: "A traditional source connecting the aggregates with impermanence, dukkha, and not-self."
    },
    {
      label: "Dhammapada, Maggavagga (Dhp 277-279)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html",
      note: "A concise Dhammapada source for impermanence, dukkha, and not-self themes."
    }
  ],
  "buddhism-101/what-is-karma-in-buddhism": [
    {
      label: "Kalama Sutta (AN 3.65)",
      href: "https://www.accesstoinsight.org/tipitaka/an/an03/an03.065.than.html",
      note: "Supports careful attention to greed, aversion, delusion, and the results of actions."
    }
  ],
  "buddhism-101/dependent-origination-explained": [
    {
      label: "Paticca-samuppada-vibhanga Sutta (SN 12.2)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn12/sn12.002.than.html",
      note: "A standard early-discourse analysis of dependent origination."
    }
  ],
  "buddhism-101/five-aggregates-buddhism": [
    {
      label: "Khandha Sutta (SN 22.48)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn22/sn22.048.than.html",
      note: "Defines the five aggregates and the five clinging-aggregates."
    }
  ],
  "buddhism-101/what-is-impermanence": [
    {
      label: "Dhammapada, Maggavagga (Dhp 277)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html",
      note: "A concise traditional verse source for impermanence as a path insight."
    }
  ],
  "buddhism-101/what-is-mindfulness": [
    {
      label: "Maha-satipatthana Sutta (DN 22)",
      href: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html",
      note: "A major early-discourse source for the four frames of reference."
    }
  ],
  "buddhism-101/right-livelihood-buddhism": [
    {
      label: "Right Livelihood overview",
      href: "https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-ajivo/index.html",
      note: "Summarizes right livelihood as part of the Noble Eightfold Path."
    },
    {
      label: "Vanijja Sutta (AN 5.177)",
      href: "https://www.accesstoinsight.org/tipitaka/an/an05/an05.177.than.html",
      note: "Names five trades traditionally discouraged for lay followers."
    }
  ],
  "buddhism-101/how-to-practice-buddhism-at-home": [
    {
      label: "The Five Precepts",
      href: "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html",
      note: "Supports home practice as ethical training, not only meditation."
    }
  ],
  "buddhism-101/a-simple-daily-buddhist-practice": [
    {
      label: "Magga-vibhanga Sutta (SN 45.8)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html",
      note: "Connects daily practice with the path factors of conduct, effort, mindfulness, and concentration."
    }
  ],
  "buddhist-dictionary/anicca": [
    {
      label: "Dhammapada, Maggavagga (Dhp 277)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html",
      note: "Traditional verse source for impermanence as a direct path insight."
    }
  ],
  "buddhist-dictionary/dukkha": [
    {
      label: "Dhammacakkappavattana Sutta (SN 56.11)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "Primary early-discourse source for the truth of dukkha and the path beyond it."
    }
  ],
  "buddhist-dictionary/anatta": [
    {
      label: "Pañcavaggi Sutta (SN 22.59)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn22/sn22.059.than.html",
      note: "A traditional source for not-self reflection through the five aggregates."
    }
  ],
  "buddhist-dictionary/metta": [
    {
      label: "Karaniya Metta Sutta (Sn 1.8)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for mettā/goodwill and care for all beings."
    }
  ],
  "buddhist-dictionary/karuna": [
    {
      label: "Dhammapada, Yamakavagga (Dhp 5)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html",
      note: "Supports the non-hatred and non-harming framing behind compassion."
    }
  ],
  "buddhist-dictionary/sati": [
    {
      label: "Maha-satipatthana Sutta (DN 22)",
      href: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html",
      note: "A major early-discourse source for mindfulness as careful present-moment remembering."
    }
  ],
  "buddhist-dictionary/karma": [
    {
      label: "Kalama Sutta (AN 3.65)",
      href: "https://www.accesstoinsight.org/tipitaka/an/an03/an03.065.than.html",
      note: "Supports the focus on intention, skillful action, and observable results."
    }
  ],
  "buddhist-dictionary/dhamma": [
    {
      label: "Dhammapada, Buddhavagga (Dhp 190-192)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.14.budd.html",
      note: "A traditional source for taking refuge in Buddha, Dhamma, and Sangha."
    },
    {
      label: "Magga-vibhanga Sutta (SN 45.8)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html",
      note: "A compact early-discourse source for the path factors often included when explaining Dhamma as practice."
    }
  ],
  "buddhist-dictionary/sangha": [
    {
      label: "Dhammapada, Buddhavagga (Dhp 190-192)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.14.budd.html",
      note: "A traditional source for the Sangha as part of the Three Jewels."
    },
    {
      label: "Upaddha Sutta (SN 45.2)",
      href: "https://www.dhammatalks.org/suttas/SN/SN45_2.html",
      note: "A source for admirable friendship and companionship as support for developing the path."
    }
  ],
  "buddhist-dictionary/nirvana": [
    {
      label: "Dhammacakkappavattana Sutta (SN 56.11)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "Supports the beginner framing of cessation and release from dukkha."
    }
  ],
  "buddhist-dictionary/mindfulness": [
    {
      label: "Maha-satipatthana Sutta (DN 22)",
      href: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html",
      note: "A major traditional source for mindfulness of body, feelings, mind, and mental qualities."
    }
  ],
  "buddhist-dictionary/compassion": [
    {
      label: "Karaniya Metta Sutta (Sn 1.8)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "A traditional source for goodwill and non-harming concern for all beings."
    }
  ],
  "dhammapada-reflections/avoid-evil-do-good-purify-the-mind": [
    {
      label: "Dhammapada, Buddhavagga (Dhp 183)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.14.budd.html",
      note: "Traditional verse source for avoiding evil, cultivating good, and cleansing the mind."
    }
  ],
  "dhammapada-reflections/the-mind-leads-all-things": [
    {
      label: "Dhammapada, Yamakavagga (Dhp 1-2)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html",
      note: "Traditional source for the mind-leading theme; Echo Buddha's wording is an original explanation."
    }
  ],
  "dhammapada-reflections/hatred-is-not-ended-by-hatred": [
    {
      label: "Dhammapada, Yamakavagga (Dhp 5)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html",
      note: "Traditional verse source for the non-hatred theme."
    }
  ],
  "dhammapada-reflections/better-than-a-thousand-empty-words": [
    {
      label: "Dhammapada, Sahassavagga (Dhp 100-102)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.08.budd.html",
      note: "Traditional source for the value of one useful word or verse."
    }
  ],
  "dhammapada-reflections/peace-comes-from-a-trained-mind": [
    {
      label: "Dhammapada, Cittavagga (Dhp 33-43)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.03.budd.html",
      note: "Traditional source for training, guarding, and directing the mind."
    }
  ],
  "sutta-for-daily-life/metta-sutta-explained-for-daily-life": [
    {
      label: "Karaniya Metta Sutta (Sn 1.8)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for mettā/goodwill practice and the phrase 'may all beings be happy at heart.'"
    }
  ],
  "sutta-for-daily-life/kalama-sutta-and-wise-thinking": [
    {
      label: "Kalama Sutta (AN 3.65)",
      href: "https://www.accesstoinsight.org/tipitaka/an/an03/an03.065.than.html",
      note: "Traditional source for discernment and checking what leads to welfare or harm."
    }
  ],
  "sutta-for-daily-life/right-speech-in-daily-life": [
    {
      label: "Right Speech overview",
      href: "https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-vaca/index.html",
      note: "Collects early-discourse criteria for right speech and careful verbal action."
    }
  ],
  "sutta-for-daily-life/mindfulness-of-breathing-explained-simply": [
    {
      label: "Anapanasati Sutta (MN 118)",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Primary early-discourse source for mindfulness of in-and-out breathing."
    }
  ],
  "sutta-for-daily-life/buddhas-teaching-on-patience": [
    {
      label: "Dhammapada, Buddhavagga (Dhp 184)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.14.budd.html",
      note: "Traditional source for patience as a valued discipline."
    }
  ],
  "buddhism-101/middle-way-explained-for-beginners": [
    {
      label: "Dhammacakkappavattana Sutta (SN 56.11)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "Traditional source context for the Middle Way and the Buddha's first teaching."
    }
  ],
  "buddhism-101/threefold-training-sila-samadhi-panna": [
    {
      label: "Magga-vibhanga Sutta (SN 45.8)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html",
      note: "Early-discourse source for the Eightfold Path factors, which are often grouped as wisdom, ethical conduct, and mental cultivation."
    },
    {
      label: "Access to Insight: The Foundations of Mindfulness",
      href: "https://www.accesstoinsight.org/lib/authors/nyanasatta/wheel019.html",
      note: "Study reference that explicitly summarizes the Noble Eightfold Path under virtuous conduct, concentration, and wisdom."
    }
  ],
  "buddhism-101/five-hindrances-in-buddhism": [
    {
      label: "The Five Mental Hindrances",
      href: "https://www.accesstoinsight.org/lib/authors/nyanaponika/wheel026.html",
      note: "A traditional Buddhist study essay on the hindrances and their role in practice."
    }
  ],
  "buddhism-101/four-brahmaviharas": [
    {
      label: "The Four Sublime States",
      href: "https://www.accesstoinsight.org/lib/authors/nyanaponika/wheel006.html",
      note: "A traditional Buddhist study essay on loving-kindness, compassion, appreciative joy, and equanimity."
    },
    {
      label: "Karaniya Metta Sutta (Sn 1.8)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for mettā/goodwill practice."
    }
  ],
  "sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths": [
    {
      label: "Dhammacakkappavattana Sutta (SN 56.11)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "Thanissaro Bhikkhu translation of SN 56.11, a traditional source for the two extremes, Middle Way, Four Noble Truths, and path."
    },
    {
      label: "SuttaCentral: SN 56.11",
      href: "https://suttacentral.net/sn56.11/en/sujato",
      note: "Bhikkhu Sujato translation reference for comparison and canonical location."
    }
  ],
  "sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path": [
    {
      label: "Magga-vibhanga Sutta (SN 45.8)",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html",
      note: "Thanissaro Bhikkhu translation of SN 45.8, a traditional source that analyzes all eight path factors."
    },
    {
      label: "Dhammatalks: SN 45.8",
      href: "https://www.dhammatalks.org/suttas/SN/SN45_8.html",
      note: "Current Dhammatalks reference for the same translation and notes on path-factor wording."
    }
  ],
  "buddhist-dictionary/sutta": [
    {
      label: "SuttaCentral: sutta definition",
      href: "https://suttacentral.net/define/sutta",
      note: "Pali terminology reference for sutta as scripture, discourse, sacred text, and related textual uses."
    },
    {
      label: "Access to Insight: Sutta Pitaka",
      href: "https://www.accesstoinsight.org/tipitaka/sutta.html",
      note: "Theravada textual reference for suttas as discourses grouped in the Sutta Pitaka."
    }
  ],
  "buddhist-dictionary/pali-canon": [
    {
      label: "Access to Insight: Tipitaka, the Pali Canon",
      href: "https://www.accesstoinsight.org/tipitaka/index.html",
      note: "Reference for the Tipitaka or Pali Canon as the primary Pali-language textual foundation of Theravada Buddhism."
    },
    {
      label: "Access to Insight: Sutta Pitaka",
      href: "https://www.accesstoinsight.org/tipitaka/sutta.html",
      note: "Reference for the Sutta Pitaka as the discourse collection within the Tipitaka."
    },
    {
      label: "Access to Insight: Vinaya Pitaka",
      href: "https://www.accesstoinsight.org/tipitaka/vin/",
      note: "Reference for Vinaya as the monastic discipline division of the Tipitaka."
    },
    {
      label: "Access to Insight: Abhidhamma Pitaka",
      href: "https://www.accesstoinsight.org/tipitaka/abhi/index.html",
      note: "Reference for Abhidhamma as the analytical teaching division of the Tipitaka."
    }
  ],
  "meditation/meditation-for-beginners": [
    {
      label: "Anapanasati Sutta (MN 118)",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Classical background for breath-based meditation; this page gives modern beginner guidance."
    }
  ],
  "meditation/breathing-meditation": [
    {
      label: "Anapanasati Sutta (MN 118)",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Primary source for mindfulness of breathing in the Pali canon."
    }
  ],
  "meditation/loving-kindness-meditation": [
    {
      label: "Karaniya Metta Sutta (Sn 1.8)",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for mettā/goodwill practice."
    }
  ],
  "meditation/walking-meditation": [
    {
      label: "Maha-satipatthana Sutta (DN 22)",
      href: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html",
      note: "Includes mindfulness while walking, standing, sitting, and lying down."
    }
  ],
  "meditation/mindfulness-in-daily-life": [
    {
      label: "Maha-satipatthana Sutta (DN 22)",
      href: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html",
      note: "Supports mindfulness as awareness of body, feelings, mind, and mental qualities in ordinary activities."
    }
  ],
  "meditation/5-minute-meditation-practice": [
    {
      label: "Anapanasati Sutta (MN 118)",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Classical background for breath attention; this page adapts it into a short practice."
    }
  ],
  "meditation/10-minute-meditation-practice": [
    {
      label: "Anapanasati Sutta (MN 118)",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Classical background for breath attention; this page adapts it into a short beginner practice."
    },
    {
      label: "NCCIH: Meditation and Mindfulness",
      href: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
      note: "Health-context safety reference for presenting meditation as supportive practice without guaranteed outcomes."
    },
    {
      label: "NHS: Mindfulness",
      href: "https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/",
      note: "Practical safety context for mindfulness, including times when it may not feel suitable."
    }
  ],
  "meditation/meditation-posture-for-beginners": [
    {
      label: "Maha-satipatthana Sutta (DN 22)",
      href: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html",
      note: "Includes mindfulness of bodily postures as part of practice context."
    },
    {
      label: "NCCIH: Meditation and Mindfulness",
      href: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
      note: "Health-context safety reference for avoiding medical or guaranteed-benefit claims around meditation."
    }
  ],
  "meditation/when-meditation-feels-hard": [
    {
      label: "Anapanasati Sutta (MN 118)",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Classical background for returning to breathing with patience and continuity."
    },
    {
      label: "NCCIH: Meditation and Mindfulness",
      href: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
      note: "Health-context safety reference for naming limits, adverse experiences, and support-seeking."
    },
    {
      label: "NHS: Mindfulness",
      href: "https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/",
      note: "Practical safety context for readers who find mindfulness uncomfortable, destabilizing, or unsuitable."
    }
  ]
};

const learningQualityNotes: Record<string, LearningQualityNote> = {
  "buddhism-101/who-was-the-buddha": {
    why:
      "Beginning with the Buddha as a human teacher keeps Buddhist study grounded. The path becomes less about distant perfection and more about honest observation, careful conduct, and the possibility of awakening in ordinary life.",
    clarification:
      "A common misunderstanding is that honoring the Buddha means treating him as a creator god. Most Buddhist traditions honor him as the awakened teacher who discovered and taught a path that can be examined through practice.",
    question: "Where in your life would clearer seeing be more helpful than another quick opinion?"
  },
  "buddhism-101/what-is-buddhism": {
    why:
      "Understanding Buddhism as a path of practice helps beginners avoid reducing it to either belief alone or relaxation alone. Wisdom, ethics, meditation, and compassion support one another.",
    clarification:
      "Buddhism is not simply positive thinking. It begins with a realistic look at suffering, change, craving, and habit so that kindness and freedom can become more than ideas.",
    question: "Which part of practice feels most needed today: wiser seeing, kinder speech, or steadier attention?"
  },
  "buddhism-101/the-three-jewels-explained": {
    why:
      "The Three Jewels give beginners a stable orientation: the Buddha as example, the Dhamma as teaching, and the Sangha as support. This keeps practice from becoming isolated or vague.",
    clarification:
      "Taking refuge does not mean hiding from life. It means choosing reliable guidance when confusion, fear, pride, or loneliness would otherwise lead the mind.",
    question: "What kind of refuge do you need most right now: inspiration, teaching, or wise companionship?"
  },
  "buddhism-101/the-four-noble-truths-explained": {
    why:
      "The Four Noble Truths matter because they turn pain into something workable. Instead of blaming ourselves for suffering, we learn to see causes, conditions, and possible release.",
    clarification:
      "This teaching is not pessimistic. It is compassionate realism: what is understood clearly can be met more wisely than what is denied.",
    question: "What part of a current difficulty is unavoidable pain, and what part is added by clinging or resistance?"
  },
  "buddhism-101/the-noble-eightfold-path-explained": {
    why:
      "The Eightfold Path matters because it brings Buddhist wisdom into speech, work, relationships, attention, and effort. It prevents practice from remaining only a beautiful idea.",
    clarification:
      "The word right is best understood as wise, skillful, or leading away from harm. It is not a weapon for judging yourself or others harshly.",
    question: "Which path factor could guide one real choice before the day ends?"
  },
  "buddhism-101/five-precepts-buddhism": {
    why:
      "The Five Precepts matter because they make Buddhist ethics visible in ordinary choices. They help speech, work, family life, money, and digital habits become less harmful and more trustworthy.",
    clarification:
      "The precepts are best understood as training principles, not a way to shame yourself or rank other people. Their purpose is to support wisdom, safety, and a calmer conscience.",
    question: "Which precept could protect one relationship, conversation, or habit today?"
  },
  "buddhism-101/three-marks-of-existence": {
    why:
      "The Three Marks matter because they describe patterns already visible in daily life: change, unsatisfactoriness, and the absence of a fixed self. Seeing them gently can reduce clinging.",
    clarification:
      "These teachings are not meant to make life bleak or meaningless. They help the heart meet changing life with less denial and more care.",
    question: "Where are you asking something changing to provide permanent security?"
  },
  "buddhism-101/what-is-karma-in-buddhism": {
    why:
      "Karma matters because intention quietly shapes the direction of a life. Small repeated choices become habits, and habits influence how we meet joy, stress, conflict, and loss.",
    clarification:
      "Karma should not be used to blame people for illness, poverty, grief, or misfortune. Buddhist practice uses karma mainly as a teaching on responsibility for present intention and action.",
    question: "What intention is behind one action you are about to take?"
  },
  "buddhism-101/dependent-origination-explained": {
    why:
      "Dependent origination matters because it shows that suffering does not appear from nowhere. When causes and conditions are understood, old reactions can be interrupted with mindfulness and care.",
    clarification:
      "This teaching is not fatalism. Conditions influence experience, but practice can become a new condition that changes how a moment unfolds.",
    question: "What condition could you change before a familiar reaction becomes suffering again?"
  },
  "buddhism-101/five-aggregates-buddhism": {
    why:
      "The Five Aggregates matter because they help us observe experience without turning every feeling, thought, or story into a solid self. This can soften shame, pride, and reactivity.",
    clarification:
      "Non-self does not mean nothing matters. It means the person we call self is a changing process, and that process can be understood and trained.",
    question: "Which part of an experience can you observe today: body, feeling, perception, formation, or consciousness?"
  },
  "buddhism-101/what-is-impermanence": {
    why:
      "Impermanence matters because much suffering comes from asking changing life to behave as if it were fixed. Seeing change clearly can make love, gratitude, and patience more honest.",
    clarification:
      "Impermanence does not mean nothing matters. It means what matters should be met with presence, because it cannot be possessed forever.",
    question: "What are you trying to hold still that life is already changing?"
  },
  "buddhism-101/what-is-mindfulness": {
    why:
      "Mindfulness matters because it creates a pause between impulse and action. In that pause, wisdom has room to enter speech, work, family life, and meditation.",
    clarification:
      "Mindfulness is not the demand to feel calm all the time. It is honest awareness of what is happening, including restlessness, sadness, joy, or confusion.",
    question: "What would change if you noticed the body before answering one difficult message?"
  },
  "buddhism-101/right-livelihood-buddhism": {
    why:
      "Right livelihood matters because work is one of the main places where values become visible. It asks whether earning, ambition, speech, and responsibility reduce harm or quietly increase it.",
    clarification:
      "Right livelihood is not a demand for a perfect job. It is a sincere direction: earn and work with as much honesty, care, and non-harming as your real conditions allow.",
    question: "What one work choice could become more honest, kind, or less harmful this week?"
  },
  "buddhism-101/how-to-practice-buddhism-at-home": {
    why:
      "Home practice matters because the path is tested in ordinary rooms: the kitchen, the phone call, the commute, the apology, and the evening reflection.",
    clarification:
      "Practicing at home does not require making your life look special. Consistency, sincerity, and reduced harm are more important than display.",
    question: "What small practice could fit naturally into your real morning or evening?"
  },
  "buddhism-101/a-simple-daily-buddhist-practice": {
    why:
      "A simple daily practice matters because transformation usually grows through repetition. One steady breath, one careful sentence, and one honest review can shape the mind over time.",
    clarification:
      "Daily practice is not a performance of purity. Missing a day is not failure; beginning again without shame is also practice.",
    question: "What is one repeatable practice you can keep even on an ordinary busy day?"
  },
  "buddhist-dictionary/anicca": {
    why:
      "Anicca matters because impermanence is not hidden in monasteries; it is visible in emotions, relationships, work, aging, success, disappointment, and every meditation session.",
    clarification:
      "Seeing impermanence is not cold detachment. It can make care warmer because we stop assuming that people, moods, and opportunities will always be available.",
    question: "What changed recently that you are still treating as if it should be unchanged?"
  },
  "buddhist-dictionary/dukkha": {
    why:
      "Dukkha matters because it names both obvious pain and the quieter unease of wanting life to satisfy every expectation. Naming it clearly is the first kindness of practice.",
    clarification:
      "Dukkha does not say life is only suffering. It says clinging to changing conditions cannot provide lasting security.",
    question: "Where is expectation adding extra weight to an already difficult moment?"
  },
  "buddhist-dictionary/anatta": {
    why:
      "Anatta matters because rigid identity can become a prison. Seeing the self as changing and conditioned softens shame, pride, resentment, and the belief that old patterns are permanent.",
    clarification:
      "Non-self does not mean you are nothing or that your actions do not matter. It points to the absence of a fixed, independent self that can be possessed.",
    question: "What story about yourself feels solid but may actually be changing?"
  },
  "buddhist-dictionary/metta": {
    why:
      "Metta matters because goodwill can be trained in the very places where irritation, self-criticism, and social division usually grow. It changes the tone of speech and the direction of attention.",
    clarification:
      "Loving-kindness is not people-pleasing. It can be warm, truthful, and boundaried at the same time.",
    question: "Who could receive a quieter, cleaner form of goodwill from you today?"
  },
  "buddhist-dictionary/karuna": {
    why:
      "Karuna matters because suffering is everywhere, but the heart can learn to respond without collapsing, judging, or turning away. Compassion joins tenderness with wise action.",
    clarification:
      "Compassion is not pity and not approval of harm. It sees pain clearly while still allowing truth, protection, and boundaries.",
    question: "What would wise compassion look like here, not merely soft feeling?"
  },
  "buddhist-dictionary/sati": {
    why:
      "Sati matters because remembering awareness interrupts automatic habit. It helps you notice intention before speech and sensation before reaction.",
    clarification:
      "Mindfulness is not passive watching. In Buddhist practice it supports ethical choices, wise effort, and insight.",
    question: "What daily cue could remind you to return to the body and breath?"
  },
  "buddhist-dictionary/karma": {
    why:
      "Karma matters because it makes practice concrete. Each intention leaves some trace in speech, behavior, relationship, and habit.",
    clarification:
      "Karma is not a simple reward-and-punishment story. Many causes shape life, so the teaching should be used carefully and compassionately.",
    question: "What repeated intention are you strengthening without noticing?"
  },
  "buddhist-dictionary/dhamma": {
    why:
      "Dhamma matters because it points to teaching that can be lived, not merely admired. It asks whether a view, word, or action leads toward less greed, hatred, and confusion.",
    clarification:
      "The Dhamma is not only information about Buddhism. It is guidance to be examined in experience and embodied through practice.",
    question: "What teaching do you already understand but need to practice more honestly?"
  },
  "buddhist-dictionary/sangha": {
    why:
      "Sangha matters because sincere practice is easier with support. Teachers, communities, and wise friends help us remember the path when habit becomes persuasive.",
    clarification:
      "Community does not need to be perfect to be helpful. Still, healthy Sangha should support humility, safety, kindness, and clear practice.",
    question: "Who or what helps you return to wisdom when you forget?"
  },
  "buddhist-dictionary/nirvana": {
    why:
      "Nirvana matters because it points beyond temporary comfort toward the cooling of greed, hatred, and delusion. Even small moments of release can hint at this direction.",
    clarification:
      "Nirvana is not the same as a pleasant mood. It is traditionally understood as liberation from the fires that keep suffering burning.",
    question: "What small fire of grasping could you stop feeding for one moment?"
  },
  "buddhist-dictionary/mindfulness": {
    why:
      "Mindfulness matters because attention shapes the life we actually experience. What we notice, ignore, repeat, and feed becomes the ground of speech and action.",
    clarification:
      "Mindfulness is not a productivity trick. In Buddhist practice, it is connected to ethics, compassion, concentration, and insight.",
    question: "What is happening now that you have been moving too quickly to notice?"
  },
  "buddhist-dictionary/compassion": {
    why:
      "Compassion matters because Buddhist practice is not only inner calm. It asks the heart to meet suffering in oneself and others with wise, non-harming care.",
    clarification:
      "Compassion does not remove the need for boundaries. Sometimes the most compassionate action is honest, firm, and protective.",
    question: "Where could compassion include both kindness and clarity?"
  },
  "dhammapada-reflections/avoid-evil-do-good-purify-the-mind": {
    why:
      "This theme matters because it gathers the path into a memorable training: reduce harm, cultivate what is wholesome, and understand the mind that creates both.",
    clarification:
      "Avoiding harm is not only about dramatic wrongdoing. It includes small habits of speech, thought, and neglect that quietly shape the heart.",
    question: "Which one harmful habit, wholesome action, and mind state can you notice today?"
  },
  "dhammapada-reflections/the-mind-leads-all-things": {
    why:
      "This theme matters because speech and action rarely begin at the mouth or hand. They begin as intention, mood, interpretation, and attention.",
    clarification:
      "Saying the mind leads does not mean every hardship is imagined. It means the quality of mind strongly shapes how hardship is met.",
    question: "What mind is leading your next sentence?"
  },
  "dhammapada-reflections/hatred-is-not-ended-by-hatred": {
    why:
      "This theme matters because hostility often feels powerful while secretly extending the wound. Non-hatred interrupts the chain without pretending harm is acceptable.",
    clarification:
      "Non-hatred is not passivity. It can include boundaries, justice, distance, and truth spoken without revenge.",
    question: "What boundary would protect peace without feeding hatred?"
  },
  "dhammapada-reflections/better-than-a-thousand-empty-words": {
    why:
      "This theme matters because words can either clarify suffering or multiply it. A small amount of truthful, timely speech can protect more peace than a flood of reaction.",
    clarification:
      "Buddhist speech practice does not mean becoming silent out of fear. It means learning when speech is true, useful, kind, and well-timed.",
    question: "Where would fewer, truer words serve better than more explanation?"
  },
  "dhammapada-reflections/peace-comes-from-a-trained-mind": {
    why:
      "This theme matters because peace is not only found; it is cultivated. The mind is trained by whatever it repeats, so practice gives repetition a wiser direction.",
    clarification:
      "Training the mind is not forcing it into silence. It is learning to return, observe, soften, and choose with patience.",
    question: "What has your mind been practicing repeatedly, and is it worth continuing?"
  },
  "sutta-for-daily-life/metta-sutta-explained-for-daily-life": {
    why:
      "The Metta Sutta matters because goodwill becomes a complete way of living: humble, content, ethical, inclusive, and free from the wish to harm.",
    clarification:
      "Metta is not pretending everyone is easy to like. It is the deeper intention not to add hatred to the world.",
    question: "How could goodwill shape one difficult interaction without erasing your boundary?"
  },
  "sutta-for-daily-life/kalama-sutta-and-wise-thinking": {
    why:
      "This teaching matters because modern readers meet many claims, teachers, trends, and opinions. Wise inquiry protects both faith and intelligence.",
    clarification:
      "Questioning is not cynicism. The Kalama Sutta theme points toward careful testing of what leads to harm or freedom from harm.",
    question: "What advice have you accepted recently, and what qualities does it strengthen?"
  },
  "sutta-for-daily-life/right-speech-in-daily-life": {
    why:
      "Right speech matters because words are daily karma. They can heal, confuse, divide, protect, apologize, encourage, or wound.",
    clarification:
      "Right speech is not always soft speech. Sometimes truth needs firmness, but firmness does not require cruelty.",
    question: "Before one conversation, can you check truth, usefulness, kindness, and timing?"
  },
  "sutta-for-daily-life/mindfulness-of-breathing-explained-simply": {
    why:
      "Mindfulness of breathing matters because the breath is always near enough to become a simple training ground for attention, patience, and clear seeing.",
    clarification:
      "The practice is not about controlling the breath into calmness. It is about knowing the breath and returning when the mind wanders.",
    question: "What happens when you let one breath be enough?"
  },
  "sutta-for-daily-life/buddhas-teaching-on-patience": {
    why:
      "Patience matters because many harmful actions happen in the first hot moment. Patience gives wisdom time to arrive.",
    clarification:
      "Patience is not allowing harm to continue. It is the strength to respond from clarity rather than panic, resentment, or pride.",
    question: "What would patience protect in this situation?"
  },
  "meditation/meditation-for-beginners": {
    why:
      "Beginner meditation matters because it teaches the most basic movement of practice: noticing wandering and returning without punishment.",
    clarification:
      "A busy mind does not mean meditation is failing. Seeing the busyness is already part of the training.",
    question: "Can you treat one return to the breath as success rather than interruption?"
  },
  "meditation/breathing-meditation": {
    why:
      "Breathing meditation matters because the breath gives attention a simple, honest anchor that does not require belief, performance, or special conditions.",
    clarification:
      "The breath does not need to become deep or peaceful. A natural breath known clearly is enough for practice.",
    question: "Where do you feel the next breath most clearly?"
  },
  "meditation/loving-kindness-meditation": {
    why:
      "Loving-kindness meditation matters because the heart can be trained away from harshness and toward goodwill, including toward oneself.",
    clarification:
      "Metta phrases are not meant to force emotion. They gently incline intention, even when feeling is quiet or mixed.",
    question: "What phrase of goodwill feels honest enough to repeat today?"
  },
  "meditation/walking-meditation": {
    why:
      "Walking meditation matters because practice should not remain only on a cushion. Each step can reconnect attention with the body and the earth.",
    clarification:
      "Walking meditation does not need to look unusual. Natural walking with remembered awareness can still be meaningful practice.",
    question: "Can you feel one complete step without rushing to the next?"
  },
  "meditation/mindfulness-in-daily-life": {
    why:
      "Daily mindfulness matters because most of life happens between formal meditation sessions. The path becomes real in washing, listening, eating, typing, and waiting.",
    clarification:
      "You do not need to be mindful of everything all day. Choose small repeatable cues and let the habit grow gently.",
    question: "Which ordinary action could become a reminder to wake up?"
  },
  "meditation/5-minute-meditation-practice": {
    why:
      "A five-minute meditation matters because it removes the excuse that practice must be long to count. Small sincere pauses can change the direction of a day.",
    clarification:
      "Short practice is not lesser practice. It is often the practice that actually survives a busy life.",
    question: "What time of day could hold five honest minutes without strain?"
  }
};

export const buddhism101Pages: LearningPage[] = [
  {
    section: "buddhism-101",
    slug: "who-was-the-buddha",
    title: "Who Was the Buddha?",
    seoTitle: "Who Was the Buddha? A Simple Beginner-Friendly Explanation",
    description:
      "Learn who the Buddha was, why he is called the awakened one, and how his life story can guide modern daily practice.",
    eyebrow: "Buddhism 101",
    intro:
      "The Buddha was a human teacher remembered for awakening to the causes of suffering and teaching a practical path of wisdom, ethics, and meditation.",
    sections: [
      {
        heading: "A Human Teacher, Not a Creator God",
        paragraphs: [
          "The historical Buddha is commonly known as Siddhartha Gautama. Buddhist traditions remember him as a prince who left a life of comfort after seeing sickness, aging, death, and the possibility of spiritual freedom. His search was not a rejection of life, but a sincere attempt to understand why human beings suffer and how the mind can become free from confusion.",
          "The word Buddha means awakened one. In this sense, the Buddha is honored as a teacher who saw clearly into experience and shared a path others could test for themselves. Echo Buddha explains this respectfully in simple language, without asking readers to accept anything blindly."
        ]
      },
      {
        heading: "Why His Story Still Matters",
        paragraphs: [
          "The Buddha's life speaks to ordinary concerns: fear, loss, desire, anger, uncertainty, and the wish to live with more care. His teaching begins with honest observation rather than dramatic belief. We look at the mind, notice what leads to harm, and practice what leads to clarity and compassion.",
          "For daily life, this means the Buddha's example is not remote. It can appear when we pause before speaking sharply, sit quietly with the breath, notice craving, or choose kindness when irritation would be easier."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "Imagine beginning a tense morning by asking, “What is actually happening in the mind right now?” That question is close to the Buddha's spirit of investigation. Instead of being carried by habit, you begin to see causes and choices. This is where learning becomes practice."
        ]
      }
    ],
    takeaway: "The Buddha was an awakened human teacher whose path invites clear seeing, ethical care, meditation, and compassion.",
    practice:
      "Today, pause once and ask, “What action would reduce harm here?” Let the answer guide one small choice.",
    relatedLinks: [
      { label: "Buddhism for Beginners", href: "/articles/buddhism-for-beginners-simple-guide/" },
      { label: "Four Noble Truths", href: "/learn/buddhism-101/the-four-noble-truths-explained/" },
      { label: "Questions About Buddhism", href: "/learn/questions-about-buddhism/" }
    ],
    sourceNote:
      "Source note: This page is an original Echo Buddha educational overview of the historical Buddha as presented across Buddhist traditions. Readers seeking formal study should compare reputable biographies, translations, teachers, and practice communities.",
    terms: ["Buddha", "Dhamma", "Sangha"]
  },
  {
    section: "buddhism-101",
    slug: "what-is-buddhism",
    title: "What Is Buddhism?",
    seoTitle: "What Is Buddhism? A Clear Beginner's Guide",
    description:
      "A simple explanation of Buddhism as a path of wisdom, ethical living, meditation, compassion, and practical insight.",
    eyebrow: "Buddhism 101",
    intro:
      "Buddhism is a diverse spiritual tradition and practical path that helps people understand suffering and cultivate wisdom, compassion, and freedom.",
    sections: [
      {
        heading: "A Path of Practice",
        paragraphs: [
          "Buddhism includes temples, rituals, communities, scriptures, meditation methods, ethics, philosophy, and devotional traditions. It is lived differently across cultures. Still, a simple thread runs through many Buddhist teachings: look carefully at experience, understand suffering, reduce harmful habits, and cultivate the mind.",
          "For beginners, Buddhism can be approached as a path of practice. It asks how we speak, how we think, how we respond to pain, and how we relate to change. It is not only something to believe; it is something to explore through daily life."
        ]
      },
      {
        heading: "Wisdom, Ethics, and Meditation",
        paragraphs: [
          "Buddhist practice is often described through wisdom, ethical conduct, and mental cultivation. Wisdom helps us see impermanence, craving, and interdependence. Ethics helps us reduce regret and harm. Meditation steadies attention so inner habits become easier to see.",
          "These parts support each other. A quiet mind helps speech become more careful. Kind speech helps meditation feel less burdened by regret. Clear seeing helps compassion become wiser."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "If someone criticizes you, Buddhism does not simply tell you to be calm. It invites you to notice the hurt, see the urge to react, consider the consequences of your words, and choose a response that reduces unnecessary harm. That ordinary moment becomes the path."
        ]
      }
    ],
    takeaway: "Buddhism is a living path of understanding suffering and practicing wisdom, compassion, and mindful action.",
    practice: "Choose one ordinary moment today and treat it as practice: a reply, a meal, a chore, or a pause.",
    relatedLinks: [
      { label: "Noble Eightfold Path", href: "/learn/buddhism-101/the-noble-eightfold-path-explained/" },
      { label: "Buddhist Dictionary", href: "/learn/buddhist-dictionary/" },
      { label: "Daily Buddhist Practice Quote", href: "/quotes/practice/small-actions-shape-the-mind/" }
    ],
    sourceNote:
      "Source note: This page is an original Echo Buddha explanation of Buddhism as a path of wisdom, ethical conduct, meditation, and compassion. It is simplified for beginners and should be compared with reputable Buddhist teachers and study communities for deeper learning.",
    terms: ["Dhamma", "Karma", "Mindfulness"]
  },
  {
    section: "buddhism-101",
    slug: "the-three-jewels-explained",
    title: "The Three Jewels Explained",
    description:
      "Understand the Buddha, Dhamma, and Sangha in simple language and learn how the Three Jewels support daily practice.",
    eyebrow: "Buddhism 101",
    intro:
      "The Three Jewels are the Buddha, the Dhamma, and the Sangha. They are sources of guidance, practice, and community in Buddhist life.",
    sections: [
      {
        heading: "Buddha, Dhamma, and Sangha",
        paragraphs: [
          "The Buddha represents awakening and the possibility of seeing clearly. The Dhamma is the teaching and truth discovered through practice. The Sangha is the community of those who practice, from monastic communities to sincere companions on the path.",
          "Taking refuge in the Three Jewels does not need to sound mysterious. It means turning toward wisdom instead of confusion, toward teaching instead of harmful habit, and toward supportive community instead of isolation."
        ]
      },
      {
        heading: "Daily Meaning",
        paragraphs: [
          "In daily life, the Buddha can remind us that human beings can wake up from harmful patterns. The Dhamma can guide a difficult choice. The Sangha can be a friend, teacher, or community that helps us remember what matters when the mind forgets.",
          "For beginners, the Three Jewels offer a simple map: learn from awakening, study the teaching, and practice with support."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "When anger rises, refuge might mean remembering the Buddha's example of clear seeing, using the Dhamma of right speech, and asking a wise friend for perspective before acting. Refuge becomes practical, not abstract."
        ]
      }
    ],
    takeaway: "The Three Jewels offer guidance through the awakened example, the teaching, and the community of practice.",
    practice: "Ask which jewel you need today: inspiration, teaching, or support. Take one small step toward it.",
    relatedLinks: [
      { label: "Dhamma Definition", href: "/learn/buddhist-dictionary/dhamma/" },
      { label: "Sangha Definition", href: "/learn/buddhist-dictionary/sangha/" },
      { label: "How to Practice at Home", href: "/learn/buddhism-101/how-to-practice-buddhism-at-home/" }
    ],
    sourceNote:
      "Source note: The Three Jewels are widely taught as Buddha, Dhamma, and Sangha. Echo Buddha presents this beginner explanation in original language for general education and daily reflection.",
    terms: ["Buddha", "Dhamma", "Sangha"]
  },
  {
    section: "buddhism-101",
    slug: "the-four-noble-truths-explained",
    title: "The Four Noble Truths Explained",
    description:
      "A beginner-friendly explanation of the Four Noble Truths and how they help us understand suffering and practice wisely.",
    eyebrow: "Buddhism 101",
    intro:
      "The Four Noble Truths are a foundation of Buddhist teaching: suffering can be understood, its causes can be seen, and a path of practice can be followed.",
    sections: [
      {
        heading: "A Caring Diagnosis",
        paragraphs: [
          "The Four Noble Truths say that life includes suffering and dissatisfaction, that craving and clinging contribute to suffering, that freedom from this pattern is possible, and that the Noble Eightfold Path supports that freedom.",
          "This teaching is not meant to make life gloomy. It is more like a caring diagnosis. Before pain can be understood, it must be acknowledged without shame or denial."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "A person may suffer because a plan changes, but the suffering often becomes heavier when the mind adds clinging: this must not happen, I cannot accept this, my peace depends on this result. Seeing the pattern gives us room to respond differently.",
          "The Four Noble Truths help us ask gentle questions: What is painful here? What am I clinging to? What can soften? What wise step is available?"
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "If a friend cancels a visit, disappointment may be natural. Extra suffering may come from the demand that the day should be exactly as expected. Seeing that demand does not erase disappointment, but it can soften resentment."
        ]
      }
    ],
    takeaway: "The Four Noble Truths help us understand suffering, its causes, the possibility of release, and the path of practice.",
    practice: "Name one difficulty and one form of clinging around it. Then choose one kind step that does not feed the clinging.",
    relatedLinks: [
      { label: "Four Noble Truths Article", href: "/articles/four-noble-truths-explained/" },
      { label: "Dukkha Definition", href: "/learn/buddhist-dictionary/dukkha/" },
      { label: "Eightfold Path Lesson", href: "/learn/buddhism-101/the-noble-eightfold-path-explained/" },
      { label: "Dependent Origination", href: "/learn/buddhism-101/dependent-origination-explained/" }
    ],
    sourceNote:
      "Source note: This page is an original Echo Buddha educational explanation based on the widely taught Buddhist framework of the Four Noble Truths, traditionally associated with the Buddha's first teaching.",
    terms: ["Dukkha", "Karma", "Dhamma"]
  },
  {
    section: "buddhism-101",
    slug: "the-noble-eightfold-path-explained",
    title: "The Noble Eightfold Path Explained",
    description:
      "Learn the Noble Eightfold Path in simple language, with examples for speech, action, work, mindfulness, and meditation.",
    eyebrow: "Buddhism 101",
    intro:
      "The Noble Eightfold Path is a practical guide for living with clearer understanding, kinder conduct, and steadier attention.",
    sections: [
      {
        heading: "Eight Parts of One Path",
        paragraphs: [
          "The path includes right view, right intention, right speech, right action, right livelihood, right effort, right mindfulness, and right concentration. These are not rigid commandments. They are training areas that support wisdom and reduce harm.",
          "The word right means skillful or wise in context. It asks whether a way of seeing, speaking, or acting leads toward less greed, hatred, and confusion."
        ]
      },
      {
        heading: "Daily Meaning",
        paragraphs: [
          "Right speech may appear in a difficult family conversation. Right effort may appear when you protect a helpful habit. Right mindfulness may appear when you notice the body before anger becomes a sentence. Right concentration may appear in a few steady minutes with the breath.",
          "The path becomes real when it enters ordinary choices. It is not separate from work, relationships, money, conflict, rest, or care."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "Before sending a tense email, the path might ask: Am I seeing clearly? What is my intention? Are these words true and useful? Would waiting reduce harm? One email can become a complete field of practice."
        ]
      }
    ],
    takeaway: "The Noble Eightfold Path turns Buddhist wisdom into daily practice through seeing, intention, speech, action, effort, mindfulness, and concentration.",
    practice: "Choose one path factor for today. Keep it visible and practice it in one specific situation.",
    relatedLinks: [
      { label: "Eightfold Path Article", href: "/articles/eightfold-path-explained/" },
      { label: "Right Speech in Daily Life", href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/" },
      { label: "Right Livelihood", href: "/learn/buddhism-101/right-livelihood-buddhism/" },
      { label: "Eightfold Path Quote", href: "/quotes/practice/eightfold-path-daily-choices/" }
    ],
    sourceNote:
      "Source note: This page is an original Echo Buddha explanation of the Noble Eightfold Path as a practical training path in wisdom, ethical conduct, and mental cultivation.",
    terms: ["Mindfulness", "Dhamma", "Sati"]
  },
  {
    section: "buddhism-101",
    slug: "five-precepts-buddhism",
    title: "The Five Precepts in Buddhism",
    seoTitle: "The Five Precepts in Buddhism: A Beginner's Guide to Ethical Living",
    description:
      "Learn the Five Precepts in Buddhism in simple language. A beginner-friendly guide to Buddhist ethics, daily choices, right speech, honesty, kindness, and mindful living.",
    eyebrow: "Buddhism 101",
    intro:
      "The Five Precepts are simple Buddhist training principles for living with less harm, more trust, and a clearer heart.",
    sections: [
      {
        heading: "What Are the Five Precepts?",
        paragraphs: [
          "The Five Precepts are among the most practical introductions to Buddhist ethics for beginners. They guide lay people toward non-harming in body, speech, livelihood, relationships, and daily habits. In simple language, they encourage us to avoid killing, stealing, sexual misconduct, false speech, and intoxicants that lead to carelessness.",
          "These precepts are not meant to make a beginner feel watched or judged. They are training principles. A person practices them because harmful action leaves disturbance in the mind and harm in the world. When conduct becomes steadier, meditation and wisdom also have better conditions. This is why the precepts sit naturally beside the <a href='/learn/buddhism-101/the-noble-eightfold-path-explained/'>Noble Eightfold Path</a>, especially right speech, right action, and right livelihood."
        ]
      },
      {
        heading: "Precepts as Training, Not Punishment",
        paragraphs: [
          "A useful way to understand the Five Precepts is to see them as promises of care. They are not commandments handed down for fear. They are chosen disciplines that protect life. A person may break a precept, recognize the result, make repair where possible, and begin again with more honesty.",
          "This training approach is important because shame can become another form of suffering. Buddhist ethics asks for responsibility without cruelty. If you speak falsely, the practice is not to hate yourself. The practice is to understand why it happened, tell the truth where you can, and strengthen the conditions for honesty next time. This connects closely with the lesson on <a href='/learn/buddhism-101/what-is-karma-in-buddhism/'>karma and intention</a>."
        ]
      },
      {
        heading: "The First Precept: Respect for Life",
        paragraphs: [
          "The first precept trains us to avoid taking life. For many beginners, this begins with obvious non-violence, but it also invites a gentler relationship with living beings. It can shape how we treat animals, insects, the natural world, and people who are difficult to like.",
          "In daily life, this precept may appear as patience during anger, careful driving, eating with gratitude, or refusing to turn another person into an enemy in the mind. It does not answer every ethical question with one simple rule, but it asks a steady question: does this action increase harm or protect life?"
        ]
      },
      {
        heading: "The Second Precept: Respect for What Is Not Given",
        paragraphs: [
          "The second precept trains us not to take what is not freely given. It includes obvious stealing, but it also touches time, credit, attention, and trust. At work, it may mean not claiming another person's effort. In digital life, it may mean not using someone else's words, images, or private information carelessly.",
          "This precept encourages contentment and honesty. Much stealing begins before the hand moves; it begins with the mind that says, I must have what is not mine. Noticing that movement is already practice."
        ]
      },
      {
        heading: "The Third Precept: Care in Sexual Conduct",
        paragraphs: [
          "The third precept trains us to avoid sexual misconduct. For lay life, this means relating to sexuality with honesty, consent, responsibility, and non-harm. It asks us not to use another person for craving, secrecy, pressure, betrayal, or manipulation.",
          "A beginner can practice this precept by respecting boundaries, keeping promises, avoiding exploitative situations, and remembering that desire does not remove responsibility. The precept is not anti-love. It protects trust so that affection is not mixed with harm."
        ]
      },
      {
        heading: "The Fourth Precept: Truthful and Helpful Speech",
        paragraphs: [
          "The fourth precept trains us to avoid false speech. In a wider practical sense, it supports truthfulness, trustworthy communication, and restraint from speech that deceives. This is closely related to the site lesson on <a href='/learn/sutta-for-daily-life/right-speech-in-daily-life/'>right speech in daily life</a>.",
          "Modern life gives this precept many practice fields: exaggerating online, hiding mistakes at work, gossiping in a family, forwarding uncertain claims, or speaking in a tone that bends the truth to win. Truthful speech does not mean saying everything harshly. It means letting words become accurate, timely, useful, and kind whenever possible."
        ]
      },
      {
        heading: "The Fifth Precept: Carefulness With Intoxicants",
        paragraphs: [
          "The fifth precept trains us to avoid intoxicants that lead to heedlessness. The heart of this precept is care. When the mind becomes careless, the other precepts become easier to break. Speech becomes loose, desire becomes reckless, anger becomes less restrained, and attention becomes clouded.",
          "For some people, this precept may mean complete abstinence. For others who are still learning, it may begin as honest reflection: does this habit make me less aware, less truthful, less safe, or less kind? The point is not moral display. The point is protecting the clarity that Buddhist practice needs."
        ]
      },
      {
        heading: "Everyday Examples of the Five Precepts",
        paragraphs: [
          "The precepts become real in small choices. You pause before sending an angry message because words can harm. You return extra change because honesty matters even when nobody notices. You give credit to a coworker because taking praise that is not yours weakens trust. You decline gossip because truth and kindness are more important than belonging for a moment.",
          "At home, the precepts may look like apologizing after harsh speech, respecting a partner's boundary, choosing a safer habit when stress rises, or teaching children by example. They are not only about avoiding dramatic wrongs. They train the ordinary texture of a life."
        ]
      },
      {
        heading: "Common Misunderstandings",
        paragraphs: [
          "<strong>Misunderstanding one:</strong> the precepts are only rules. In practice, they are more like mirrors. They show where craving, fear, carelessness, or dishonesty is leading the mind.",
          "<strong>Misunderstanding two:</strong> keeping precepts makes a person superior. Buddhist ethics should soften pride, not feed it. The precepts are personal training, not a weapon for judging others.",
          "<strong>Misunderstanding three:</strong> one mistake ruins practice. Mistakes matter, but they can become teachers when met with honesty, repair, and renewed intention."
        ]
      },
      {
        heading: "Key Takeaways",
        paragraphs: [
          "The Five Precepts are a daily training in non-harming. They protect life, trust, sexuality, speech, and clarity of mind. They are simple enough for beginners and deep enough to keep refining for a lifetime.",
          "The precepts work best when they are practiced with humility. They do not make a person pure or superior. They help a person notice intention earlier, repair harm more honestly, and create conditions for a more peaceful mind.",
          "If the whole list feels large, begin with one precept in one real situation. Truthful speech in a difficult conversation, care with consumption, or respect for what is not given can become a complete practice for the day."
        ]
      },
      {
        heading: "Frequently Asked Questions",
        paragraphs: [
          "<strong>What are the Five Precepts in Buddhism?</strong> They are training principles to avoid killing, stealing, sexual misconduct, false speech, and intoxicants that lead to carelessness.",
          "<strong>Are the Five Precepts required for all Buddhists?</strong> Traditions vary, but the precepts are widely used as a basic ethical training for lay Buddhist life.",
          "<strong>Are the precepts the same as commandments?</strong> They are better understood as voluntary trainings that support non-harming, clarity, and wise conduct.",
          "<strong>What happens if I break a precept?</strong> Practice invites honest recognition, repair where possible, and renewed care. The point is learning, not self-hatred.",
          "<strong>Can beginners practice one precept at a time?</strong> Yes. Begin where daily life is most obvious, such as truthful speech or mindful consumption, and let the training grow."
        ]
      }
    ],
    takeaway:
      "The Five Precepts are practical Buddhist ethical trainings that protect life, trust, truthfulness, responsibility, and mindful awareness.",
    practice:
      "Choose one precept for today. Before one action connected with it, pause and ask, \"Would this increase harm or support trust?\"",
    relatedLinks: [
      { label: "Noble Eightfold Path", href: "/learn/buddhism-101/the-noble-eightfold-path-explained/" },
      { label: "Right Speech in Daily Life", href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/" },
      { label: "Karma Lesson", href: "/learn/buddhism-101/what-is-karma-in-buddhism/" }
    ],
    sourceNote:
      "Source note: The Five Precepts are widely taught in Buddhist traditions as lay ethical trainings. Echo Buddha presents them in original beginner-friendly language for reflection and daily practice.",
    terms: ["Karma", "Right Speech", "Dhamma"]
  },
  {
    section: "buddhism-101",
    slug: "three-marks-of-existence",
    title: "The Three Marks of Existence",
    seoTitle: "The Three Marks of Existence in Buddhism Explained Simply",
    description:
      "Understand the Three Marks of Existence in Buddhism: anicca, dukkha, and anatta. A simple beginner guide with examples, reflections, and practical meaning.",
    eyebrow: "Buddhism 101",
    intro:
      "The Three Marks of Existence describe three features of conditioned life: impermanence, unsatisfactoriness, and non-self.",
    sections: [
      {
        heading: "What Are the Three Marks?",
        paragraphs: [
          "The Three Marks of Existence are usually named with three Pali words: anicca, dukkha, and anatta. Anicca means impermanence. Dukkha points to suffering, stress, or unsatisfactoriness. Anatta means non-self, or the absence of a fixed independent self that can be possessed.",
          "These teachings may sound abstract at first, but they describe ordinary experience. Moods change. Plans disappoint. Identity shifts. The mind says mine and me, then suffers when life refuses to stay still. The Three Marks help beginners understand why the <a href='/learn/buddhism-101/the-four-noble-truths-explained/'>Four Noble Truths</a> are practical rather than pessimistic."
        ]
      },
      {
        heading: "Anicca: Everything Conditioned Changes",
        paragraphs: [
          "Anicca is the mark of impermanence. A feeling begins, changes, and passes. A body ages. A relationship grows in one direction, then another. A work role feels central for years and later becomes only one chapter of life.",
          "Seeing impermanence does not mean becoming cold. It can make care more tender. If a visit with a loved one will not last forever, attention becomes precious. If an anxious mood is changing, it does not need to define the whole day. You can explore this more in <a href='/learn/buddhism-101/what-is-impermanence/'>What Is Impermanence?</a>."
        ]
      },
      {
        heading: "Dukkha: Clinging Cannot Give Lasting Security",
        paragraphs: [
          "Dukkha includes obvious pain such as sickness, grief, and loss. It also includes the subtle dissatisfaction that comes from asking changing things to provide permanent safety. Praise feels good, then fades. Control works for a moment, then fails. A pleasant mood arrives, but cannot be held by force.",
          "This does not mean joy is wrong. It means clinging is unreliable. When the mind demands that joy must stay, fear enters the joy. When the mind can appreciate without grasping, the same moment may become lighter."
        ]
      },
      {
        heading: "Anatta: Experience Is Not a Fixed Self",
        paragraphs: [
          "Anatta is often the most challenging mark for beginners. It does not mean you do not exist in any ordinary sense. It means what we call self is a changing process of body, feeling, perception, habits, and consciousness. It is not a solid owner standing apart from life.",
          "This can be deeply practical. A person who says, I am an angry person, may begin to see anger as a conditioned state that arises and passes. A person who says, I always fail, may begin to see a painful story rather than a permanent identity. This connects naturally with the lesson on <a href='/learn/buddhist-dictionary/anatta/'>anatta</a> and the new guide to the <a href='/learn/buddhism-101/five-aggregates-buddhism/'>Five Aggregates</a>."
        ]
      },
      {
        heading: "How the Three Marks Work Together",
        paragraphs: [
          "The Three Marks are not separate boxes. They reveal one another. Because things are impermanent, clinging to them creates dukkha. Because experience is changing and conditioned, it cannot be found as a fixed self. Because the mind mistakes changing processes for mine and me, it struggles when they shift.",
          "A simple example is criticism. The sound of words is impermanent. The painful feeling is impermanent. The interpretation, They do not respect me, is a perception. The urge to defend is a mental formation. Consciousness knows these events. When they are taken as a solid self under attack, suffering grows quickly."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "Imagine waiting for a message that does not arrive. Anicca appears because the mood changes from hopeful to tense. Dukkha appears because the mind clings to the demand that the person must respond now. Anatta can be seen when you notice the story, I am being ignored, as a changing thought rather than a permanent truth.",
          "This does not mean your needs do not matter. It means you can respond with more wisdom. You might wait, ask clearly later, or set a boundary, but you do not have to let one unanswered message become your whole identity."
        ]
      },
      {
        heading: "A Simple Reflection Practice",
        paragraphs: [
          "Choose one experience today, such as a feeling, sound, or thought. Notice its beginning, middle, and fading. If grasping appears, name it gently: wanting, resisting, fearing. Then ask whether the experience is a permanent self or a changing event known by awareness.",
          "Keep the reflection light. The purpose is not to force a conclusion. The purpose is to become more honest with experience. This honesty supports <a href='/learn/buddhism-101/what-is-mindfulness/'>mindfulness</a> and letting go."
        ]
      },
      {
        heading: "Key Takeaways",
        paragraphs: [
          "Anicca, dukkha, and anatta are not only ideas for study. They are ways to look at ordinary experience. A changing mood, a clinging thought, and a rigid self-story can all become places of insight.",
          "The Three Marks are not pessimistic. They help the heart stop arguing with the nature of conditioned life. When change is understood, gratitude becomes more immediate and clinging becomes easier to question.",
          "For beginners, the most useful approach is gentle observation. Notice change, notice the stress of grasping, and notice how a thought or feeling is not the whole of who you are."
        ]
      },
      {
        heading: "Frequently Asked Questions",
        paragraphs: [
          "<strong>What are the Three Marks of Existence?</strong> They are impermanence, unsatisfactoriness, and non-self, often called anicca, dukkha, and anatta.",
          "<strong>Are the Three Marks negative?</strong> No. They are realistic observations that can reduce denial, clinging, and confusion.",
          "<strong>What does dukkha mean here?</strong> Dukkha points to stress or unsatisfactoriness, especially the strain of clinging to changing conditions.",
          "<strong>Does non-self mean I am nothing?</strong> No. It means the self is not a fixed independent thing. It is a changing process shaped by conditions.",
          "<strong>How can I practice the Three Marks daily?</strong> Notice change, notice clinging, and observe thoughts and feelings as events rather than permanent identity."
        ]
      }
    ],
    takeaway:
      "The Three Marks help beginners see changing life clearly: all conditioned things change, clinging brings stress, and the self is a changing process.",
    practice:
      "Notice one feeling today and quietly observe: changing, not fully satisfying, not a fixed self.",
    relatedLinks: [
      { label: "What Is Impermanence?", href: "/learn/buddhism-101/what-is-impermanence/" },
      { label: "Dukkha Definition", href: "/learn/buddhist-dictionary/dukkha/" },
      { label: "Five Aggregates", href: "/learn/buddhism-101/five-aggregates-buddhism/" }
    ],
    sourceNote:
      "Source note: The Three Marks are foundational Buddhist teachings discussed across Buddhist traditions. Echo Buddha summarizes them in original plain language for beginner education.",
    terms: ["Anicca", "Dukkha", "Anatta"]
  },
  {
    section: "buddhism-101",
    slug: "what-is-karma-in-buddhism",
    title: "What Is Karma in Buddhism?",
    seoTitle: "What Is Karma in Buddhism? A Beginner's Guide",
    description:
      "Learn what karma means in Buddhism, how intention shapes actions, and how beginners can understand karma in everyday life.",
    eyebrow: "Buddhism 101",
    intro:
      "This beginner guide explains karma as intentional action, not fate or cosmic punishment. It gives new readers a clear foundation before exploring practical daily-life applications.",
    sections: [
      {
        heading: "Karma Is Not Simple Fate",
        paragraphs: [
          "Karma is often misunderstood as a system of reward and punishment. A more careful beginner-friendly explanation is that intentional actions have consequences. These consequences may appear in the mind, relationships, habits, and future conditions.",
          "This does not mean every painful event is someone's fault. Life is shaped by many causes. Karma invites responsibility for the intentions and actions that are actually ours."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "If we repeatedly speak with anger, anger becomes easier to repeat. If we practice pausing, honesty, and kindness, those qualities also become more available. Karma is seen in the way small actions train the mind.",
          "This makes daily life meaningful. A single kind word, sincere apology, or restrained reply can plant a different seed."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "Before criticizing someone, you might notice the intention beneath the words. Do you want to help, or do you want to hurt? The outer sentence may be similar, but the karmic direction of the heart is different."
        ]
      }
    ],
    takeaway: "Karma points to intentional action and the way choices shape habits, relationships, and future conditions.",
    practice: "Before one important action today, ask, “What intention is leading this?” Adjust gently if needed.",
    relatedLinks: [
      { label: "Daily Karma Practice Article", href: "/articles/what-is-karma-in-buddhism/" },
      { label: "Karma Dictionary Term", href: "/learn/buddhist-dictionary/karma/" },
      { label: "Dependent Origination", href: "/learn/buddhism-101/dependent-origination-explained/" },
      { label: "Karma Quote", href: "/quotes/wisdom/karma-begins-in-intention/" }
    ],
    sourceNote:
      "Source note: This page is original Echo Buddha educational writing about karma as intention, action, habit, and consequence. It avoids using karma to blame people for suffering and encourages compassionate, careful study.",
    terms: ["Karma", "Dhamma", "Compassion"]
  },
  {
    section: "buddhism-101",
    slug: "dependent-origination-explained",
    title: "Dependent Origination Explained",
    seoTitle: "Dependent Origination in Buddhism Explained for Beginners",
    description:
      "Learn dependent origination in Buddhism in simple terms. Understand causes, conditions, craving, clinging, suffering, and how mindfulness can interrupt old patterns.",
    eyebrow: "Buddhism 101",
    intro:
      "Dependent origination teaches that experiences arise because of causes and conditions, and that understanding conditions can help reduce suffering.",
    sections: [
      {
        heading: "The Simple Meaning of Dependent Origination",
        paragraphs: [
          "Dependent origination is a central Buddhist teaching about causes and conditions. The Pali term is paticca samuppada. A beginner does not need to memorize every traditional link before the teaching becomes useful. The simple meaning is this: things arise in dependence on conditions, and when conditions change, results can change.",
          "This teaching helps explain why suffering is workable. If suffering had no causes, practice would have no place to stand. But if stress grows from conditions such as ignorance, craving, clinging, habit, and reaction, then mindfulness and wisdom can become new conditions. This connects closely with the <a href='/learn/buddhism-101/the-four-noble-truths-explained/'>Four Noble Truths</a>."
        ]
      },
      {
        heading: "Causes and Conditions in Ordinary Life",
        paragraphs: [
          "A flower depends on soil, water, light, seed, temperature, and time. A harsh sentence depends on tiredness, irritation, old stories, fear, tone, and intention. A peaceful response may depend on sleep, practice, patience, and a remembered breath.",
          "Dependent origination asks us to look less for one single blame and more for the conditions that make an experience likely. This does not remove responsibility. It makes responsibility more intelligent. If you see the conditions that feed anger, you can begin changing them before anger becomes speech."
        ]
      },
      {
        heading: "The Chain From Feeling to Suffering",
        paragraphs: [
          "One practical way to understand dependent origination is through a familiar chain: contact, feeling, craving, clinging, and suffering. Something happens. A pleasant, unpleasant, or neutral feeling appears. The mind wants more, wants less, or stops paying attention. Craving becomes clinging. Clinging becomes stress.",
          "For example, a notification appears. The feeling is unpleasant because the message sounds critical. Craving appears as the wish to defend yourself immediately. Clinging appears as the thought, I must prove I am right. Suffering appears as tension, angry words, and a mind that keeps replaying the exchange."
        ]
      },
      {
        heading: "A Daily Example: Irritation Becoming Suffering",
        paragraphs: [
          "Imagine you are cooking and someone points out a small mistake. Contact happens through hearing the words. Feeling appears as heat in the chest. Perception labels the comment as disrespect. Mental formations prepare a sharp reply. Consciousness knows the whole event.",
          "If mindfulness is absent, irritation may become a familiar sentence. If mindfulness is present, the chain can be interrupted. You may feel the heat, breathe, and ask, Is this comment harmful, helpful, clumsy, or simply inconvenient? The response may still be honest, but it does not need to be ruled by the first spark."
        ]
      },
      {
        heading: "Mindfulness Interrupts Old Patterns",
        paragraphs: [
          "Mindfulness is powerful in dependent origination because it notices the process early. It sees feeling before craving becomes a command. It sees a story before the story becomes identity. It sees tension before tension becomes harmful speech. This is why <a href='/learn/buddhism-101/what-is-mindfulness/'>mindfulness</a> is not only relaxation; it is practical wisdom in motion.",
          "The interruption may be small. One breath before replying. One honest label: anger is here. One softer choice: I will answer later. Small changes matter because conditions are cumulative. Repeated pauses create a different kind of mind."
        ]
      },
      {
        heading: "Dependent Origination Is Not Fatalism",
        paragraphs: [
          "A common misunderstanding is that dependent origination means everything is predetermined. That is not the point. The teaching shows influence, not helplessness. Conditions shape a moment, but practice itself is also a condition.",
          "If you grew up around harsh speech, harsh speech may arise quickly. That history matters. But listening, study, therapy where needed, good friends, meditation, and restraint can become new conditions. Buddhism does not ask us to pretend we have no conditioning. It asks us to see conditioning clearly enough to stop being completely ruled by it."
        ]
      },
      {
        heading: "A Simple Practice for Seeing Conditions",
        paragraphs: [
          "Choose one repeated pattern, such as checking your phone too often, snapping at a loved one, or postponing meditation. Ask gently: What conditions make this more likely? What conditions make it less likely? Then change one small condition.",
          "You might place the phone outside the bedroom, eat before a difficult conversation, write a kinder reply and wait before sending it, or sit for two minutes before the day becomes busy. The goal is not self-control through force. The goal is wiser conditions."
        ]
      },
      {
        heading: "Key Takeaways",
        paragraphs: [
          "Dependent origination teaches that experience unfolds through causes and conditions. This helps beginners move away from one-sided blame and toward clearer understanding.",
          "The teaching is practical because reaction chains can be seen. Contact, feeling, craving, clinging, and suffering often happen quickly, but mindfulness can notice the process before it hardens into speech or action.",
          "Changing one condition may look small, but it matters. Rest, wise friends, honest reflection, ethical restraint, and short meditation can all become conditions that weaken old patterns."
        ]
      },
      {
        heading: "Frequently Asked Questions",
        paragraphs: [
          "<strong>What is dependent origination in simple words?</strong> It means experiences arise because of causes and conditions, and changing conditions can change what follows.",
          "<strong>Is dependent origination the same as karma?</strong> They are related, but not identical. Karma focuses on intentional action, while dependent origination describes conditional arising more broadly.",
          "<strong>Why is dependent origination important?</strong> It shows that suffering has conditions and can therefore be understood and gradually weakened.",
          "<strong>Does dependent origination mean everything is fate?</strong> No. Practice, mindfulness, and wise choices are also conditions that can change a pattern.",
          "<strong>How can beginners practice this teaching?</strong> Notice one reaction chain and interrupt it early with a breath, a pause, or a wiser condition."
        ]
      }
    ],
    takeaway:
      "Dependent origination teaches that suffering arises through causes and conditions, and mindful practice can change the conditions that keep old patterns alive.",
    practice:
      "When a familiar reaction begins today, pause and ask, \"What conditions are feeding this, and what condition could soften it?\"",
    relatedLinks: [
      { label: "Four Noble Truths", href: "/learn/buddhism-101/the-four-noble-truths-explained/" },
      { label: "Karma Lesson", href: "/learn/buddhism-101/what-is-karma-in-buddhism/" },
      { label: "Overthinking Article", href: "/articles/buddhist-wisdom-for-overthinking/" }
    ],
    sourceNote:
      "Source note: Dependent origination is a foundational Buddhist teaching on conditional arising. This page offers an original beginner summary and encourages deeper study with reputable translations and teachers.",
    terms: ["Karma", "Dukkha", "Mindfulness"]
  },
  {
    section: "buddhism-101",
    slug: "five-aggregates-buddhism",
    title: "The Five Aggregates in Buddhism",
    seoTitle: "The Five Aggregates in Buddhism Explained Simply",
    description:
      "A simple beginner guide to the Five Aggregates in Buddhism: form, feeling, perception, mental formations, and consciousness, with practical examples.",
    eyebrow: "Buddhism 101",
    intro:
      "The Five Aggregates are a Buddhist way of observing human experience as a changing process rather than a fixed self.",
    sections: [
      {
        heading: "What Are the Five Aggregates?",
        paragraphs: [
          "The Five Aggregates are form, feeling, perception, mental formations, and consciousness. In Pali they are called the five khandhas. They describe the parts of experience that we often gather together and call me, mine, or myself.",
          "For beginners, the aggregates are not meant to be a dry list. They are a practical way to observe life. A body sensation appears. A pleasant or unpleasant feeling tone appears. The mind recognizes and labels. Habits and intentions form. Consciousness knows the experience. When these processes are clung to as a solid self, suffering grows. This connects with <a href='/learn/buddhism-101/three-marks-of-existence/'>the Three Marks of Existence</a> and the dictionary entry on <a href='/learn/buddhist-dictionary/anatta/'>anatta</a>."
        ]
      },
      {
        heading: "Form: The Body and Material Experience",
        paragraphs: [
          "Form includes the body and material aspects of experience. It is the weight of sitting, the sound of traffic, the warmth of tea, the eyes reading a page, and the hands typing a message. The body is not separate from practice; it is one of the clearest places to begin.",
          "When anger rises, form may be tight shoulders, a clenched jaw, and faster breathing. Seeing form clearly can prevent the mind from becoming lost in the story alone. The body often announces a reaction before words do."
        ]
      },
      {
        heading: "Feeling: Pleasant, Unpleasant, or Neutral",
        paragraphs: [
          "Feeling in the aggregate teaching does not mean emotion in the broad modern sense. It means the basic tone of experience: pleasant, unpleasant, or neutral. A compliment feels pleasant. A loud noise feels unpleasant. A familiar wall may feel neutral.",
          "This matters because craving often begins here. Pleasant feeling invites grasping. Unpleasant feeling invites resistance. Neutral feeling invites dullness or neglect. Mindfulness notices feeling tone before it becomes a whole drama."
        ]
      },
      {
        heading: "Perception: Naming and Recognizing",
        paragraphs: [
          "Perception is the process of recognizing and labeling. It tells us, This is a smile, this is criticism, this is my phone, this is success, this is failure. Perception is useful, but it can also be mistaken.",
          "If someone sends a short message, perception may label it as cold. Another person might label it as busy. The same words can be colored by history, fear, and expectation. Seeing perception as a process helps us hold interpretations more lightly."
        ]
      },
      {
        heading: "Mental Formations: Habits, Intentions, and Reactions",
        paragraphs: [
          "Mental formations include intentions, emotions, habits, impulses, attention patterns, and reactions. This is where much of daily Buddhist practice becomes visible. The urge to interrupt, the wish to help, the habit of worrying, the decision to pause, and the intention to speak truthfully are all part of this field.",
          "Because formations are conditioned, they can be trained. This is encouraging. An impatient habit is not a permanent identity. A kinder response can be practiced until it becomes more available."
        ]
      },
      {
        heading: "Consciousness: Knowing Experience",
        paragraphs: [
          "Consciousness is the knowing of an object: seeing, hearing, smelling, tasting, touching, or thinking. It is not presented here as a permanent soul. It is part of the changing stream of experience.",
          "In meditation, consciousness may know the breath, then a sound, then a memory, then a feeling in the knee. Observing this movement helps reveal impermanence. Experience is happening, but it is not as solid as the mind usually assumes."
        ]
      },
      {
        heading: "A Daily Example: Receiving Criticism",
        paragraphs: [
          "Suppose a manager says your work needs revision. Form: the body tightens. Feeling: the tone is unpleasant. Perception: the mind labels the comment as rejection. Mental formations: defensiveness and shame prepare a response. Consciousness: the whole experience is known moment by moment.",
          "Without practice, the mind may turn this into, I am not good enough. With mindfulness, the aggregates can be seen as changing events. The body can soften, the feeling can be known, the perception can be questioned, the reaction can be restrained, and the response can become more useful."
        ]
      },
      {
        heading: "Observing the Aggregates in Meditation",
        paragraphs: [
          "During breathing meditation, the aggregates are not distant theory. Form is the body breathing. Feeling may be pleasant ease, unpleasant restlessness, or neutral repetition. Perception labels breath, sound, thought. Mental formations include impatience, effort, curiosity, and returning. Consciousness knows each object as it appears.",
          "A beginner can use this gently. You do not need to analyze every moment. Sometimes it is enough to notice, This is a feeling, this is a thought, this is a body sensation. That small naming can loosen the belief that every experience is a fixed self."
        ]
      },
      {
        heading: "Key Takeaways",
        paragraphs: [
          "The Five Aggregates show that experience is made of changing parts: body, feeling tone, perception, mental formations, and consciousness. What feels like a solid self can be observed more carefully.",
          "This teaching is useful in emotional moments. Instead of becoming a story like I am failing or I am angry, the mind can notice body tension, unpleasant feeling, interpretation, reaction, and awareness.",
          "Seeing the aggregates does not make life meaningless. It can make practice kinder because painful states become workable processes rather than permanent identities."
        ]
      },
      {
        heading: "Frequently Asked Questions",
        paragraphs: [
          "<strong>What are the Five Aggregates in Buddhism?</strong> They are form, feeling, perception, mental formations, and consciousness.",
          "<strong>Why are the Five Aggregates important?</strong> They help us observe experience as changing processes rather than a permanent self.",
          "<strong>Are the aggregates the same as the soul?</strong> No. They are conditioned aspects of experience that arise and change.",
          "<strong>How do the aggregates relate to non-self?</strong> They show that what we call self is made of changing parts, not a fixed independent essence.",
          "<strong>Can beginners practice with the aggregates?</strong> Yes. Start by noticing body, feeling tone, thoughts, and reactions during ordinary moments."
        ]
      }
    ],
    takeaway:
      "The Five Aggregates help us observe body, feeling, perception, mental formations, and consciousness as changing processes rather than a fixed self.",
    practice:
      "During one strong emotion today, name the body sensation, feeling tone, perception, reaction, and knowing. Keep it simple and kind.",
    relatedLinks: [
      { label: "Anatta Definition", href: "/learn/buddhist-dictionary/anatta/" },
      { label: "Three Marks of Existence", href: "/learn/buddhism-101/three-marks-of-existence/" },
      { label: "Meditation for Beginners", href: "/meditation/meditation-for-beginners/" }
    ],
    sourceNote:
      "Source note: The Five Aggregates are a traditional Buddhist framework for understanding experience and non-self. Echo Buddha presents this overview in original beginner-friendly language.",
    terms: ["Anatta", "Dukkha", "Mindfulness"]
  },
  {
    section: "buddhism-101",
    slug: "what-is-impermanence",
    title: "What Is Impermanence?",
    description:
      "Understand impermanence in Buddhism and how noticing change can deepen gratitude, patience, and wise letting go.",
    eyebrow: "Buddhism 101",
    intro:
      "Impermanence means that all conditioned things change. Seeing this clearly can soften clinging and deepen appreciation.",
    sections: [
      {
        heading: "Everything Is Changing",
        paragraphs: [
          "In Buddhism, impermanence is often called anicca. It points to the changing nature of bodies, feelings, thoughts, relationships, seasons, possessions, and plans. Nothing made of conditions stays exactly the same forever.",
          "This teaching is not meant to make life cold. It can make life more tender. When we know a moment will not last, we may meet it with more care."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Impermanence helps us understand why clinging hurts. We want a feeling, person, role, or situation to remain fixed, but life keeps moving. The practice is not to stop caring. It is to care with open hands.",
          "Change can include loss, but it also includes growth, repair, learning, forgiveness, and new beginnings."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "A child grows, a friendship changes, a mood lifts, a flower fades. Each example can become a teacher. Instead of asking life never to change, we learn to meet change with steadiness."
        ]
      }
    ],
    takeaway: "Impermanence teaches that change is part of life and can guide gratitude, patience, and letting go.",
    practice: "Notice three small changes today: a sound fading, light shifting, or a feeling moving. Say gently, “Changing.”",
    relatedLinks: [
      { label: "Anicca Dictionary Term", href: "/learn/buddhist-dictionary/anicca/" },
      { label: "Three Marks of Existence", href: "/learn/buddhism-101/three-marks-of-existence/" },
      { label: "Impermanence Article", href: "/articles/impermanence-in-buddhism/" },
      { label: "Impermanence Quotes", href: "/quotes/impermanence/" }
    ],
    sourceNote:
      "Source note: This page is an original Echo Buddha explanation of impermanence, or anicca, written in plain language for general Buddhist education and daily reflection.",
    terms: ["Anicca", "Letting Go", "Dukkha"]
  },
  {
    section: "buddhism-101",
    slug: "what-is-mindfulness",
    title: "What Is Mindfulness?",
    description:
      "A simple Buddhist explanation of mindfulness as remembering to be present with body, feelings, mind, and daily life.",
    eyebrow: "Buddhism 101",
    intro:
      "Mindfulness is the practice of remembering to notice what is happening with clarity, steadiness, and care.",
    sections: [
      {
        heading: "More Than Relaxation",
        paragraphs: [
          "Mindfulness is often used today to mean relaxation or present-moment awareness. In Buddhist practice, it is deeper than a calm mood. It includes remembering the body, feelings, mind states, and patterns clearly enough to respond wisely.",
          "Mindfulness can be peaceful, but it can also reveal restlessness, anger, sadness, or craving. The point is not to force a pleasant state. The point is to know experience honestly."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Mindfulness appears when you notice the breath before replying, feel the body while walking, hear another person fully, or recognize a repeated thought as a thought. It helps create a small space between stimulus and reaction.",
          "That space is where kindness and wisdom can enter."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "While washing dishes, the mind may plan, remember, or complain. Mindfulness gently returns to warm water, movement, sound, and posture. An ordinary chore becomes a training in presence."
        ]
      }
    ],
    takeaway: "Mindfulness is clear, caring awareness of present experience, used to support wiser responses.",
    practice: "Give one ordinary task your full attention today. When the mind wanders, return without criticism.",
    relatedLinks: [
      { label: "Sati Dictionary Term", href: "/learn/buddhist-dictionary/sati/" },
      { label: "Mindfulness vs Meditation", href: "/articles/mindfulness-vs-meditation/" },
      { label: "Mindfulness Quotes", href: "/quotes/mindfulness/" }
    ],
    sourceNote:
      "Source note: This page explains mindfulness in simplified language for general readers. In Buddhist practice, mindfulness is traditionally connected with ethics, concentration, and insight, so deeper study with teachers and translations is encouraged.",
    terms: ["Sati", "Mindfulness", "Meditation"]
  },
  {
    section: "buddhism-101",
    slug: "right-livelihood-buddhism",
    title: "Right Livelihood in Buddhism",
    seoTitle: "Right Livelihood in Buddhism: A Beginner's Guide to Ethical Work",
    description:
      "Learn Right Livelihood in Buddhism and how it applies to modern work, money, business, ambition, honesty, stress, and ethical daily choices.",
    eyebrow: "Buddhism 101",
    intro:
      "Right livelihood is the practice of earning and working in ways that reduce harm and support honesty, care, and wisdom.",
    sections: [
      {
        heading: "What Is Right Livelihood?",
        paragraphs: [
          "Right livelihood is one part of the <a href='/learn/buddhism-101/the-noble-eightfold-path-explained/'>Noble Eightfold Path</a>. It asks how work, earning, business, ambition, and daily responsibility can be guided by non-harming. For beginners, the basic question is simple: does the way I make a living support harm, deception, exploitation, or heedlessness, or does it move as much as possible toward honesty and care?",
          "This does not mean every person can instantly choose ideal work. Many people have families, debts, limited options, immigration pressures, health needs, or local economic limits. Right livelihood should be approached with compassion and realism. It is a direction for practice, not a reason to shame people who are trying to survive."
        ]
      },
      {
        heading: "Right Livelihood Within the Eightfold Path",
        paragraphs: [
          "Right livelihood belongs to the ethical training of the Eightfold Path, together with right speech and right action. Work is not separate from practice because work shapes speech, intention, money, time, and relationships. A person may meditate each morning and still need to practice Buddhism during meetings, emails, sales, hiring, buying, and leadership.",
          "Right livelihood asks us to bring the same care into work that we bring into meditation. Are we truthful? Are we increasing fear? Are we treating people as tools? Are we ignoring harm because profit is convenient? These questions may be uncomfortable, but they can make work more humane."
        ]
      },
      {
        heading: "Work as a Field of Practice",
        paragraphs: [
          "A workplace can train patience, generosity, humility, and mindfulness. It can also train comparison, resentment, overwork, and dishonesty. Buddhist practice asks us to notice what our work is training in us. The answer is often more important than the job title.",
          "For example, a teacher may practice patience with students. A shop owner may practice fairness with customers. A manager may practice truthful feedback without humiliation. A remote worker may practice attention and boundaries. A student preparing for a career may practice honesty before professional identity hardens."
        ]
      },
      {
        heading: "Honest Work and Harmful Work",
        paragraphs: [
          "Traditional Buddhist discussions warn against livelihoods that directly support serious harm. Modern readers can apply the principle by asking whether their work depends on violence, exploitation, deception, addiction, environmental harm, or the deliberate creation of confusion.",
          "The answer is not always simple. A person may work in a large system where some parts help and some parts harm. Right livelihood begins with honest seeing. From there, a person may reduce harm inside the current role, speak up where possible, refuse dishonest tasks, seek better work over time, or support others through ethical choices."
        ]
      },
      {
        heading: "Money, Ambition, and Buddhist Practice",
        paragraphs: [
          "Buddhism does not require lay people to hate money or reject responsibility. Money can feed families, support education, care for elders, fund generosity, and provide stability. The question is how money is earned, held, and used. Does it increase greed and fear, or does it support a balanced life?",
          "Ambition also needs examination. Ambition can be wholesome when it means developing skill, serving others, and doing careful work. It becomes painful when self-worth depends on status, praise, or endless comparison. This is where <a href='/learn/buddhism-101/five-precepts-buddhism/'>the Five Precepts</a> can guide daily choices."
        ]
      },
      {
        heading: "Modern Examples of Right Livelihood",
        paragraphs: [
          "Right livelihood may appear as refusing to exaggerate a product's benefits, giving accurate information to a client, protecting customer privacy, avoiding gossip about coworkers, paying people fairly when you have authority, or admitting a mistake before it becomes larger.",
          "It may also appear as setting boundaries around overwork. If work consumes the whole heart, relationships, health, and practice may suffer. A mindful worker asks not only, How much can I achieve? but also, What kind of person is this schedule training me to become?"
        ]
      },
      {
        heading: "Right Livelihood Is Not Perfectionism",
        paragraphs: [
          "A common misunderstanding is that right livelihood requires a perfectly pure job. In a complex world, this thought can lead to despair or pride. The Buddhist path usually begins where we are. The first step may be to become more honest in the work we already do.",
          "Perfectionism can become another form of self-centeredness. Sincere practice is humbler. It asks what harm can be reduced today, what truth can be spoken today, what responsibility can be met today, and what longer-term change may be possible."
        ]
      },
      {
        heading: "A Simple Right Livelihood Practice",
        paragraphs: [
          "At the beginning of a workday, choose one intention: honesty, patience, usefulness, fairness, or non-harm. At midday, pause and ask whether the intention is still alive. At the end of the day, reflect without harshness: Where did work support wisdom? Where did it feed greed, fear, or carelessness?",
          "This simple review can be paired with <a href='/learn/buddhism-101/a-simple-daily-buddhist-practice/'>daily Buddhist practice</a>. Over time, patterns become clearer. You may discover one conversation to repair, one habit to protect, or one larger career question to hold with patience."
        ]
      },
      {
        heading: "Key Takeaways",
        paragraphs: [
          "Right livelihood brings Buddhist ethics into work, business, money, ambition, and responsibility. It asks whether earning a living is connected with honesty and non-harming.",
          "The practice is not perfectionism. Many people must begin from imperfect conditions. A sincere step may be clearer speech, less deception, more fairness, or a gradual move away from work that causes harm.",
          "Work can become a field of practice when daily tasks are guided by mindfulness, the Five Precepts, and the Eightfold Path. Even one ethical choice can change the tone of a day."
        ]
      },
      {
        heading: "Frequently Asked Questions",
        paragraphs: [
          "<strong>What does right livelihood mean in Buddhism?</strong> It means earning and working in ways that avoid unnecessary harm and support honesty, responsibility, and wisdom.",
          "<strong>Is right livelihood only about choosing a job?</strong> No. It also includes how you behave inside a job: speech, fairness, privacy, money, ambition, and responsibility.",
          "<strong>Can I practice right livelihood if my job is imperfect?</strong> Yes. Begin by reducing harm and increasing honesty where you are, while considering wiser long-term options when possible.",
          "<strong>Does Buddhism say money is bad?</strong> No. The concern is craving, dishonesty, harm, and attachment around money, not responsible support of life.",
          "<strong>What is one simple right livelihood practice?</strong> Choose one work intention each day and review whether your actions supported it."
        ]
      }
    ],
    takeaway:
      "Right livelihood brings Buddhist ethics into work, money, ambition, and daily responsibility by asking how earning can reduce harm and support honesty.",
    practice:
      "Before work or study today, choose one intention such as honesty or fairness. Let it guide one email, decision, or conversation.",
    relatedLinks: [
      { label: "Noble Eightfold Path", href: "/learn/buddhism-101/the-noble-eightfold-path-explained/" },
      { label: "Five Precepts", href: "/learn/buddhism-101/five-precepts-buddhism/" },
      { label: "Right Speech Article", href: "/articles/right-speech-buddhism/" }
    ],
    sourceNote:
      "Source note: Right livelihood is traditionally taught as one factor of the Noble Eightfold Path. Echo Buddha presents a practical modern overview for general education and reflection.",
    terms: ["Dhamma", "Karma", "Right Speech"]
  },
  {
    section: "buddhism-101",
    slug: "how-to-practice-buddhism-at-home",
    title: "How to Practice Buddhism at Home",
    description:
      "Learn simple ways to practice Buddhist-inspired wisdom at home through meditation, speech, kindness, reflection, and daily habits.",
    eyebrow: "Buddhism 101",
    intro:
      "Home practice can be simple: a few quiet minutes, kinder speech, honest reflection, and small repeated choices that reduce harm.",
    sections: [
      {
        heading: "Begin With What Is Realistic",
        paragraphs: [
          "Practicing Buddhism at home does not require turning your home into a monastery. Begin with a small, repeatable practice. Sit for five minutes, read one teaching, speak more carefully, or pause before reacting.",
          "The best home practice is one you can return to without resentment. A small sincere practice is better than an impressive plan that disappears after three days."
        ]
      },
      {
        heading: "Three Simple Areas",
        paragraphs: [
          "You can practice meditation by following the breath. You can practice ethics by reducing harsh speech and unnecessary harm. You can practice wisdom by noticing impermanence, craving, and the results of your choices.",
          "These areas support each other. A few quiet breaths can change speech. Kinder speech can reduce regret. Less regret can make meditation more settled."
        ]
      },
      {
        heading: "A Daily Life Example",
        paragraphs: [
          "A home practice might be this: sit for five minutes after waking, choose one intention for speech, and end the day by reflecting on one action to continue and one action to repair."
        ]
      }
    ],
    takeaway: "Home practice grows through small repeatable actions: meditation, ethical speech, reflection, and kindness.",
    practice: "Choose one practice cue at home, such as morning tea or closing a door, and pair it with one mindful breath.",
    relatedLinks: [
      { label: "Meditation Hub", href: "/meditation/" },
      { label: "Simple Daily Practice", href: "/learn/buddhism-101/a-simple-daily-buddhist-practice/" },
      { label: "Daily Practice Quote", href: "/quotes/practice/small-actions-shape-the-mind/" }
    ],
    sourceNote:
      "Source note: This page is original Echo Buddha educational guidance for home practice. It is not a substitute for learning with reputable teachers, communities, or tradition-specific instruction.",
    terms: ["Practice", "Mindfulness", "Compassion"]
  },
  {
    section: "buddhism-101",
    slug: "a-simple-daily-buddhist-practice",
    title: "A Simple Daily Buddhist Practice",
    description:
      "A gentle daily Buddhist-inspired practice for beginners, including breathing, intention, kind speech, and evening reflection.",
    eyebrow: "Buddhism 101",
    intro:
      "A daily Buddhist practice can be simple, peaceful, and realistic. The aim is not perfection, but steady return.",
    sections: [
      {
        heading: "Morning: Set an Intention",
        paragraphs: [
          "Begin with one or two minutes of breathing. Feel the body, notice the day beginning, and choose one intention. It might be patience, truthfulness, careful listening, or compassion.",
          "An intention is not a guarantee that the day will go smoothly. It is a direction to remember when the day becomes ordinary."
        ]
      },
      {
        heading: "Daytime: Practice in Speech and Action",
        paragraphs: [
          "During the day, choose one place to practice. Before replying to a message, pause. Before criticizing, check your intention. Before rushing, feel your feet. These small moments are not separate from the path.",
          "Buddhist wisdom becomes real when it touches ordinary conduct."
        ]
      },
      {
        heading: "Evening: Reflect Without Harshness",
        paragraphs: [
          "At night, ask three gentle questions: What helped today? What caused harm or confusion? What can be repaired or practiced tomorrow? Reflection is not self-punishment. It is learning with honesty."
        ]
      }
    ],
    takeaway: "Daily practice can be one breath, one intention, one careful action, and one honest reflection.",
    practice: "Try this rhythm for one day: morning breath, midday pause, evening reflection.",
    relatedLinks: [
      { label: "5-Minute Meditation", href: "/meditation/5-minute-meditation-practice/" },
      { label: "Right Intention Quote", href: "/quotes/practice/right-intention-turns-the-heart/" },
      { label: "Questions About Buddhism", href: "/learn/questions-about-buddhism/" }
    ],
    sourceNote:
      "Source note: This page is original Echo Buddha guidance for a simple daily Buddhist practice, written for general education and reflection rather than formal religious instruction.",
    terms: ["Practice", "Sati", "Metta"]
  },
  {
    section: "buddhism-101",
    slug: "middle-way-explained-for-beginners",
    title: "The Middle Way Explained for Beginners",
    seoTitle: "The Middle Way in Buddhism Explained for Beginners",
    description:
      "Learn the Middle Way in Buddhism as a practical path between harsh self-denial and careless indulgence.",
    eyebrow: "Buddhism 101",
    intro:
      "The Middle Way is the Buddha's practical path of avoiding extremes and training wisdom, ethics, and meditation in ordinary life.",
    sections: [
      {
        heading: "A Path Between Extremes",
        paragraphs: [
          "For beginners, the Middle Way means that Buddhist practice is not about punishing the body or chasing every comfort. It asks for a wiser relationship with desire, discipline, pleasure, effort, and care.",
          "In the traditional first-teaching context, the Buddha points away from two unhelpful extremes: indulgence that feeds craving and harsh self-mortification that damages clarity. The path is neither laziness nor violence toward oneself."
        ]
      },
      {
        heading: "How It Works in Daily Life",
        paragraphs: [
          "A Middle Way response might look like resting without escaping responsibility, working without making achievement into identity, eating with gratitude instead of guilt, or practicing meditation without demanding a special state.",
          "This keeps practice human. The Middle Way can guide a difficult email, a purchase, a family duty, a meditation session, or a season of grief by asking what reduces harm and supports clearer seeing."
        ]
      },
      {
        heading: "Common Misunderstanding",
        paragraphs: [
          "The Middle Way is not simply compromise between any two opinions, and it is not the midpoint between any two choices. Some actions still cause harm and need firm boundaries. The teaching is about a path that avoids extremes while moving toward wisdom, ethical care, and freedom from clinging.",
          "Read this page as a foundation support for <a href='/learn/buddhism-for-beginners/'>Buddhism for Beginners</a>, not as a replacement for the Four Noble Truths or the Noble Eightfold Path."
        ]
      }
    ],
    takeaway: "The Middle Way is a practical Buddhist path that avoids harmful extremes and supports wise, steady practice.",
    practice:
      "Choose one area today where you tend to swing between force and avoidance. Ask what a kinder, steadier middle path would look like.",
    relatedLinks: [
      { label: "Buddhism for Beginners", href: "/learn/buddhism-for-beginners/" },
      { label: "Four Noble Truths", href: "/learn/four-noble-truths/" },
      { label: "Eightfold Path", href: "/learn/eightfold-path/" }
    ],
    sourceNote:
      "Source note: This is an original Echo Buddha beginner explanation of the Middle Way using traditional first-teaching context. It summarizes themes rather than reproducing translation text.",
    terms: ["Dhamma", "Sutta", "Pali Canon"]
  },
  {
    section: "buddhism-101",
    slug: "threefold-training-sila-samadhi-panna",
    title: "The Threefold Training: Sila, Samadhi, and Panna",
    seoTitle: "Threefold Training in Buddhism: Sila, Samadhi, and Panna",
    description:
      "Understand the Threefold Training in Buddhism: ethical conduct, concentration, and wisdom in daily practice.",
    eyebrow: "Buddhism 101",
    intro:
      "The Threefold Training is a simple way to understand Buddhist practice as ethical conduct, mental cultivation, and wisdom working together.",
    sections: [
      {
        heading: "Three Trainings, One Path",
        paragraphs: [
          "Sila, often written with diacritics as sīla, means ethical conduct or moral training. Samadhi, or samādhi, points to concentration, collectedness, and steadiness of mind. Panna, or paññā, means wisdom or discernment. Together they help beginners see that Buddhism is not only meditation and not only belief.",
          "Ethics steadies the life around practice. Meditation steadies attention. Wisdom sees what leads to suffering and what leads away from it. These trainings support one another like three legs of the same seat."
        ]
      },
      {
        heading: "How They Appear in Ordinary Life",
        paragraphs: [
          "Sila may appear as honest speech, keeping a promise, or refusing to pass along gossip. Samadhi may appear as returning to one breath, one task, or one conversation. Panna may appear as noticing that a reaction is rooted in fear, pride, craving, or compassion.",
          "This is why the <a href='/learn/eightfold-path/'>Noble Eightfold Path</a> matters for daily life. The path is not separate from emails, work, money, family, attention, and repair."
        ]
      },
      {
        heading: "Common Misunderstanding",
        paragraphs: [
          "The Threefold Training should not be used to rank people or pretend practice is linear. A person may need to strengthen speech, meditation, and understanding at the same time.",
          "This page gives a beginner map. It does not promise meditative attainment or a guaranteed state of concentration. Different Buddhist traditions explain training in their own voices, and deeper study should include teachers, communities, and reputable translations."
        ]
      }
    ],
    takeaway: "The Threefold Training shows Buddhist practice as ethical conduct, mental steadiness, and wisdom working together.",
    practice:
      "Before the day ends, choose one training to make visible: one honest sentence, one steady breath, or one wiser interpretation.",
    relatedLinks: [
      { label: "Eightfold Path", href: "/learn/eightfold-path/" },
      { label: "Five Precepts", href: "/learn/buddhism-101/five-precepts-buddhism/" },
      { label: "Meditation Hub", href: "/meditation/" }
    ],
    sourceNote:
      "Source note: This page is original Echo Buddha educational guidance on a widely used Buddhist training framework. It avoids presenting the explanation as scripture or tradition-specific authority.",
    terms: ["Dhamma", "Mindfulness", "Sutta"]
  },
  {
    section: "buddhism-101",
    slug: "five-hindrances-in-buddhism",
    title: "The Five Hindrances in Buddhism",
    seoTitle: "Five Hindrances in Buddhism Explained for Beginners",
    description:
      "Learn the five hindrances in Buddhism and how desire, ill will, dullness, restlessness, and doubt affect practice.",
    eyebrow: "Buddhism 101",
    intro:
      "The five hindrances are common states that cloud meditation and daily practice; they are obstacles to understand gently, not flaws to hate.",
    sections: [
      {
        heading: "What the Hindrances Are",
        paragraphs: [
          "The five hindrances are usually named as sensual desire, ill will, sloth and torpor, restlessness and worry, and doubt. They describe ways the mind becomes sticky, foggy, agitated, or discouraged.",
          "A beginner does not need to memorize them as a harsh checklist. The point is recognition. When the hindrance is seen clearly, the mind has more room to respond."
        ]
      },
      {
        heading: "How They Show Up",
        paragraphs: [
          "Desire may keep reaching for stimulation. Ill will may rehearse blame. Dullness may make practice heavy. Restlessness may jump ahead. Doubt may say, \"This is pointless,\" before practice has had time to teach.",
          "These states also appear outside meditation: shopping, scrolling, arguments, work pressure, avoidance, or comparing oneself with others. Seeing them as conditions can reduce shame."
        ]
      },
      {
        heading: "What This Teaching Does Not Say",
        paragraphs: [
          "The hindrances are not medical labels, personality labels, or proof that you are bad at meditation. They also should not be used to judge ordinary tiredness, anxiety, grief, or uncertainty as spiritual failure. If practice feels overwhelming or distressing, shorten it, open the eyes, ground in the body, stop, or seek qualified support.",
          "For practical support during difficult sessions, use <a href='/meditation/when-meditation-feels-hard/'>What to Do When Meditation Feels Hard</a> and the <a href='/meditation-safety/'>Meditation Safety</a> page."
        ]
      }
    ],
    takeaway: "The five hindrances name common obstacles so they can be met with awareness, patience, and wise adjustment.",
    practice:
      "During one distracted moment, name the pattern gently: wanting, irritation, dullness, restlessness, or doubt. Then return to one workable action.",
    relatedLinks: [
      { label: "Meditation Hub", href: "/meditation/" },
      { label: "When Meditation Feels Hard", href: "/meditation/when-meditation-feels-hard/" },
      { label: "Mindfulness", href: "/learn/buddhist-dictionary/mindfulness/" }
    ],
    sourceNote:
      "Source note: This is original Echo Buddha educational guidance on a traditional Buddhist practice framework. It is not clinical advice or a diagnostic guide.",
    terms: ["Mindfulness", "Sati", "Dhamma"]
  },
  {
    section: "buddhism-101",
    slug: "four-brahmaviharas",
    title: "The Four Brahmaviharas",
    seoTitle: "The Four Brahmaviharas: Loving-Kindness, Compassion, Joy, and Equanimity",
    description:
      "Learn the Four Brahmaviharas in Buddhism: loving-kindness, compassion, appreciative joy, and equanimity.",
    eyebrow: "Buddhism 101",
    intro:
      "The Four Brahmaviharas are four qualities of heart that can be cultivated: loving-kindness, compassion, appreciative joy, and equanimity.",
    sections: [
      {
        heading: "Four Qualities of the Heart",
        paragraphs: [
          "Metta is loving-kindness or goodwill. Karuna is compassion for suffering. Mudita is appreciative joy in another person's wellbeing. Upekkha is equanimity, the balanced steadiness that does not collapse into control or indifference.",
          "Together these qualities train the heart away from ill will, cruelty, envy, and reactivity. They are not decorative feelings; they are ways of meeting beings and situations with less harm."
        ]
      },
      {
        heading: "Daily Life Practice",
        paragraphs: [
          "Metta may appear as refusing to add a cutting word. Compassion may appear as helping while keeping a clear boundary. Mudita may appear as rejoicing in another person's good fortune without comparison. Equanimity may appear as doing your part without trying to control every result.",
          "The Four Brahmaviharas connect naturally with <a href='/meditation/loving-kindness-meditation/'>loving-kindness meditation</a> and with practical pages on compassion, speech, and boundaries."
        ]
      },
      {
        heading: "Common Misunderstanding",
        paragraphs: [
          "These practices do not require pretending harm is harmless or forcing warm feelings toward unsafe people. Goodwill and compassion can include distance, truth, accountability, and protection.",
          "Equanimity is also not coldness. It is steadiness with care, especially when life cannot be controlled. Later Buddhist teaching sometimes warns against look-alike states such as pity replacing compassion or indifference replacing equanimity; Echo Buddha uses that caution as practical guidance, not as a complete commentarial study."
        ]
      }
    ],
    takeaway: "The Four Brahmaviharas train the heart in goodwill, compassion, appreciative joy, and balanced care.",
    practice:
      "Choose one quality today: goodwill, compassion, appreciative joy, or equanimity. Let it guide one sentence or decision.",
    relatedLinks: [
      { label: "Compassion", href: "/learn/buddhist-dictionary/compassion/" },
      { label: "Loving-Kindness Meditation", href: "/meditation/loving-kindness-meditation/" },
      { label: "Compassion With Boundaries", href: "/articles/compassion-with-boundaries/" }
    ],
    sourceNote:
      "Source note: This page is original Echo Buddha educational guidance on the Four Brahmaviharas. It summarizes traditional themes and keeps practice boundaries visible.",
    terms: ["Metta", "Karuna", "Compassion"]
  }
];

export const dictionaryPages: LearningPage[] = [
  {
    section: "buddhist-dictionary",
    slug: "anicca",
    title: "Anicca",
    seoTitle: "Anicca Meaning: Impermanence in Buddhism Explained Simply",
    description:
      "Learn the meaning of Anicca, the Buddhist teaching on impermanence, with daily-life examples and related terms.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Anicca, often pronounced ah-nee-chah, means impermanence: the changing nature of all conditioned things.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Anicca teaches that bodies, feelings, thoughts, relationships, possessions, and circumstances are always changing. Nothing made from conditions remains fixed forever.",
          "This does not make life meaningless. It can make attention more tender. Because moments change, they become worth meeting while they are here."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "A mood shifts, a child grows, a plan changes, a sound fades. Seeing anicca helps us care without demanding that life freeze in place. It also reminds us that painful states are not permanent identities."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Anicca is closely connected with dukkha, because clinging to what changes creates distress. It also supports letting go, gratitude, and wise patience."
        ]
      }
    ],
    takeaway: "Anicca means impermanence, the truth that conditioned life is constantly changing.",
    practice: "Notice one small change today and silently name it: changing.",
    relatedLinks: [
      { label: "What Is Impermanence?", href: "/learn/buddhism-101/what-is-impermanence/" },
      { label: "Three Marks of Existence", href: "/learn/buddhism-101/three-marks-of-existence/" },
      { label: "Impermanence Article", href: "/articles/impermanence-in-buddhism/" },
      { label: "Impermanence Quotes", href: "/quotes/impermanence/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Dukkha", "Anatta", "Letting Go"]
  },
  {
    section: "buddhist-dictionary",
    slug: "dukkha",
    title: "Dukkha",
    seoTitle: "Dukkha Meaning: Suffering and Unsatisfactoriness in Buddhism",
    description:
      "Understand Dukkha in simple language as suffering, stress, and dissatisfaction, with examples for daily life.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Dukkha is often translated as suffering, stress, or unsatisfactoriness. It points to the unease that appears when life is clung to in confused ways.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Dukkha includes obvious pain such as grief, illness, fear, and disappointment. It also includes subtler dissatisfaction: the feeling that what we have is not enough, or that what changes should not change.",
          "The teaching of dukkha is not meant to make life dark. It helps us name the places where the heart is struggling so practice can begin."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Dukkha can appear when plans fail, praise fades, possessions break, or relationships do not meet every expectation. Seeing dukkha clearly lets us ask what craving, fear, or clinging might be adding to the pain."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Dukkha is the first of the Four Noble Truths. It is closely related to anicca because clinging to changing things creates distress."
        ]
      }
    ],
    takeaway: "Dukkha names suffering, stress, and dissatisfaction so they can be understood rather than denied.",
    practice: "When stress appears, gently ask, “What am I resisting or clinging to right now?”",
    relatedLinks: [
      { label: "Four Noble Truths", href: "/learn/buddhism-101/the-four-noble-truths-explained/" },
      { label: "Dependent Origination", href: "/learn/buddhism-101/dependent-origination-explained/" },
      { label: "Four Noble Truths Article", href: "/articles/four-noble-truths-explained/" },
      { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Anicca", "Karma", "Dhamma"]
  },
  {
    section: "buddhist-dictionary",
    slug: "anatta",
    title: "Anatta",
    seoTitle: "Anatta Meaning: Non-Self in Buddhism Explained for Beginners",
    description:
      "Learn Anatta, the Buddhist teaching of non-self, in simple beginner-friendly language with daily reflection.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Anatta, often translated as non-self, points to the fact that what we call self is changing, conditioned, and not fully controllable.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Anatta does not mean you do not exist in an ordinary sense. It means the self we cling to as fixed and separate cannot be found as a permanent, independent thing. Body, feelings, perceptions, habits, and thoughts keep changing.",
          "This teaching can sound abstract at first. In practice, it helps soften rigid identity: I am always angry, I am a failure, I must be seen this way."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "When you notice a mood changing, a belief maturing, or an old habit weakening, you are seeing that identity is less solid than it feels. This can create humility and hope."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Anatta is often studied with anicca and dukkha. Together, these teachings point toward freedom from clinging."
        ]
      }
    ],
    takeaway: "Anatta teaches that the self is not a fixed, permanent possession, which can soften clinging to identity.",
    practice: "When a strong self-judgment appears, add: “This is a changing pattern, not my whole being.”",
    relatedLinks: [
      { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" },
      { label: "Five Aggregates", href: "/learn/buddhism-101/five-aggregates-buddhism/" },
      { label: "Three Marks of Existence", href: "/learn/buddhism-101/three-marks-of-existence/" },
      { label: "Buddhism 101", href: "/learn/buddhism-101/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Anicca", "Dukkha", "Nirvana"]
  },
  {
    section: "buddhist-dictionary",
    slug: "metta",
    title: "Metta",
    seoTitle: "Metta Meaning: Loving-Kindness in Buddhism",
    description:
      "Learn Metta, or loving-kindness, as a Buddhist practice of goodwill toward oneself and others.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Metta means loving-kindness or goodwill. It is the sincere wish for beings, including oneself, to be safe and free from unnecessary suffering.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Metta is not sentimental affection. It is a steady intention of goodwill. It can be practiced toward oneself, loved ones, neutral people, difficult people, and all beings.",
          "The practice often uses simple phrases such as wishes for safety, ease, health, and peace. The words are not magic; they train the direction of the heart."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Metta appears when we choose not to add harm, speak with care, or remember that another person also wants to be free from pain. It can coexist with boundaries."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Metta is closely related to karuna, compassion. Loving-kindness wishes well; compassion responds to suffering."
        ]
      }
    ],
    takeaway: "Metta is loving-kindness, a trainable intention of goodwill toward oneself and others.",
    practice: "Silently repeat: “May I meet this moment with kindness. May others meet this moment with kindness.”",
    relatedLinks: [
      { label: "Loving-Kindness Meditation", href: "/meditation/loving-kindness-meditation/" },
      { label: "Metta Sutta Explained", href: "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/" },
      { label: "Loving-Kindness Article", href: "/articles/loving-kindness-meditation-beginners/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Karuna", "Compassion", "Meditation"]
  },
  {
    section: "buddhist-dictionary",
    slug: "karuna",
    title: "Karuna",
    seoTitle: "Karuna Meaning: Compassion in Buddhism",
    description:
      "A simple explanation of Karuna, Buddhist compassion, with daily-life meaning and related teachings.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Karuna means compassion: the trembling of the heart in response to suffering and the wish to reduce harm.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Compassion in Buddhism is not pity from above. It is the recognition that suffering is real and that beings are worthy of care. Karuna includes tenderness, but also wise action.",
          "Compassion does not require approving harmful behavior. It can include boundaries, truth, and protection."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Karuna may appear when you listen before judging, help someone without needing praise, or speak honestly without cruelty. It may also appear as self-compassion after a mistake."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Karuna works with metta. Goodwill opens the heart; compassion moves toward suffering with care."
        ]
      }
    ],
    takeaway: "Karuna is compassion that sees suffering clearly and responds with wise care.",
    practice: "When someone is difficult, ask: “What pain might be present, and what boundary is still needed?”",
    relatedLinks: [
      { label: "Compassion Article", href: "/articles/compassion-as-a-daily-discipline/" },
      { label: "Compassion Quotes", href: "/quotes/compassion/" },
      { label: "Metta", href: "/learn/buddhist-dictionary/metta/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Metta", "Compassion", "Right Speech"]
  },
  {
    section: "buddhist-dictionary",
    slug: "sati",
    title: "Sati",
    seoTitle: "Sati Meaning: Mindfulness in Buddhist Practice",
    description:
      "Learn Sati, the Buddhist term often translated as mindfulness, with simple examples for daily awareness.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Sati is often translated as mindfulness. It includes remembering to stay aware of body, feelings, mind, and experience.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Sati is not only present-moment calm. It is the ability to remember what is happening and what matters. In practice, it notices breathing, posture, feeling tone, thoughts, intentions, and reactions.",
          "This remembering interrupts automatic habit. It gives wisdom a chance to enter before speech or action hardens."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Sati appears when you notice anger in the body before speaking, hear a sound without irritation, or return to the task in front of you. It is practical and repeatable."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Sati is part of the Noble Eightfold Path as right mindfulness. It supports meditation, ethical conduct, and insight."
        ]
      }
    ],
    takeaway: "Sati is mindful remembering: clear awareness of present experience and the path of practice.",
    practice: "Choose one daily cue, such as opening a door, and use it to remember the body and breath.",
    relatedLinks: [
      { label: "What Is Mindfulness?", href: "/learn/buddhism-101/what-is-mindfulness/" },
      { label: "Mindfulness in Daily Life", href: "/meditation/mindfulness-in-daily-life/" },
      { label: "Mindfulness Quotes", href: "/quotes/mindfulness/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Mindfulness", "Meditation", "Dhamma"]
  },
  {
    section: "buddhist-dictionary",
    slug: "karma",
    title: "Karma",
    seoTitle: "Karma Meaning in Buddhism: Intention, Action, and Consequences",
    description:
      "Learn the Buddhist meaning of karma as intentional action and the way choices shape habits and consequences.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Karma means intentional action. In Buddhist practice, intention matters because it shapes speech, behavior, habits, and consequences.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Karma is not a simple cosmic scoreboard. It points to the fact that actions rooted in greed, hatred, and confusion tend to produce suffering, while actions rooted in generosity, kindness, and clarity tend to support wellbeing.",
          "Many causes shape life, so karma should not be used to blame people for pain. It is best used as a teaching on responsibility for our own intentions."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Each repeated action trains the mind. Speaking harshly makes harshness easier. Pausing before speech makes pausing easier. Small choices matter because they become conditions for future choices."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Karma connects with right intention, right speech, and right action on the Noble Eightfold Path."
        ]
      }
    ],
    takeaway: "Karma is intentional action and the way choices shape future habits and conditions.",
    practice: "Before one action today, check whether the intention is helpful, harmful, fearful, or kind.",
    relatedLinks: [
      { label: "Karma Lesson", href: "/learn/buddhism-101/what-is-karma-in-buddhism/" },
      { label: "Dependent Origination", href: "/learn/buddhism-101/dependent-origination-explained/" },
      { label: "Karma Article", href: "/articles/what-is-karma-in-buddhism/" },
      { label: "Right Intention Quote", href: "/quotes/practice/right-intention-turns-the-heart/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Right Intention", "Dhamma", "Practice"]
  },
  {
    section: "buddhist-dictionary",
    slug: "dhamma",
    title: "Dhamma",
    seoTitle: "Dhamma Meaning: Buddhist Teaching and Truth",
    description:
      "Understand Dhamma as Buddhist teaching, truth, practice, Dharma spelling, and the way things are seen through wisdom.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Dhamma means the Buddha's teaching, the truth it points toward, and the practice of living with clearer wisdom.",
    sections: [
      {
        heading: "Simple Meaning of Dhamma",
        paragraphs: [
          "Dhamma is a rich Pali word. In everyday Buddhist use, it often means the Buddha's teaching: the path, principles, and practices that help people understand suffering and reduce harm.",
          "It can also point to truth itself: the way experience works when seen clearly. Studying Dhamma is therefore not only reading ideas. It is testing them in speech, meditation, relationships, and daily choices."
        ]
      },
      {
        heading: "Dhamma vs Dharma",
        paragraphs: [
          "Dhamma is the Pali form. Dharma is the Sanskrit form. English readers may see both spellings depending on the Buddhist tradition, translation, or teacher being referenced.",
          "On Echo Buddha, Dhamma is used mainly for early Buddhist and Pali-context explanations. Dharma may appear when a page is speaking more broadly across Buddhist traditions. The spelling should not become a separate competing topic unless the page has a clear tradition or language role."
        ]
      },
      {
        heading: "Dhamma in the Three Jewels",
        paragraphs: [
          "Dhamma is one of the Three Jewels, together with Buddha and Sangha. In that context, Dhamma is not a motivational idea. It is the teaching and truth that practitioners take seriously enough to study, test, and live.",
          "The Buddha points to awakening, the Dhamma points to the teaching and path, and the Sangha points to the community that preserves and practices the teaching. For the community side of this refuge, see <a href='/learn/buddhist-dictionary/sangha/'>Sangha</a> and <a href='/articles/what-is-sangha-buddhist-community/'>What Is Sangha?</a>."
        ]
      },
      {
        heading: "Practice Meaning in Daily Life",
        paragraphs: [
          "Dhamma appears when a teaching helps you pause before anger, understand impermanence, speak more carefully, forgive wisely, or return to the breath. It becomes alive when it changes how we live.",
          "A beginner can ask a simple question: does this teaching reduce greed, hatred, confusion, and unnecessary harm? If it remains only an interesting idea, keep studying. If it changes one real action, Dhamma has begun to enter practice."
        ]
      },
      {
        heading: "Common Misunderstandings",
        paragraphs: [
          "Dhamma is not a slogan for whatever feels calming. It has a Buddhist context, a path context, and a relationship to practice. It should not be stretched into generic positivity.",
          "Dhamma also should not be treated as one English sentence that settles every tradition. Buddhist communities explain details differently, so this dictionary page gives a beginner orientation and points readers toward source-study pages, reputable teachers, and practice communities."
        ]
      }
    ],
    takeaway: "Dhamma is the teaching and truth that guide Buddhist practice toward wisdom and freedom.",
    practice: "Take one teaching you know and apply it to one ordinary action today: one careful sentence, one generous choice, or one pause before reaction.",
    relatedLinks: [
      { label: "Dhamma vs Dharma", href: "/articles/dhamma-vs-dharma/" },
      { label: "Three Jewels", href: "/learn/buddhism-101/the-three-jewels-explained/" },
      { label: "Dhammapada Reflections", href: "/learn/dhammapada-reflections/" },
      { label: "The Mind Leads All Things", href: "/learn/dhammapada-reflections/the-mind-leads-all-things/" },
      { label: "Right Speech in Daily Life", href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/" },
      { label: "Sutta for Daily Life", href: "/learn/sutta-for-daily-life/" }
    ],
    sourceNote:
      "This dictionary page gives a beginner explanation of Dhamma as teaching, truth, and practice. It uses source context from traditional Three Jewels and path references without presenting Echo Buddha wording as scripture.",
    terms: ["Buddha", "Sangha", "Practice", "Right Speech", "Dhammapada"]
  },
  {
    section: "buddhist-dictionary",
    slug: "sangha",
    title: "Sangha",
    seoTitle: "Sangha Meaning: Buddhist Community Explained Simply",
    description:
      "Learn the meaning of Sangha as Buddhist community and how wise support helps daily practice.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Sangha means Buddhist community. This dictionary page gives the short definition and points to a deeper beginner guide.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "The Sangha is one of the Three Jewels. In traditional Buddhism, the monastic Sangha preserves and practices the teachings. Many modern readers also use the word for sincere practice community.",
          "Community matters because the mind forgets. Good companions help us return to patience, wisdom, and care."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "A Sangha may be a temple, meditation group, teacher, study circle, or a few friends committed to honest practice. It should encourage humility, ethics, and compassion rather than pressure or dependency."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Sangha supports the Buddha's example and the Dhamma's teaching. Together, the Three Jewels offer refuge. For a fuller explanation of monastic Sangha, broader community use, online practice, and temple visits, read <a href='/articles/what-is-sangha-buddhist-community/'>What Is Sangha? Why Buddhist Community Matters</a>."
        ]
      }
    ],
    takeaway: "Sangha is the community of practice that supports learning, ethical living, and steady return.",
    practice: "Reach toward one wholesome support: a reliable teaching, teacher, group, or practice friend.",
    relatedLinks: [
      { label: "Three Jewels", href: "/learn/buddhism-101/the-three-jewels-explained/" },
      { label: "What Is Sangha?", href: "/articles/what-is-sangha-buddhist-community/" },
      { label: "Visiting a Temple Respectfully", href: "/articles/visiting-a-buddhist-temple-respectfully/" },
      { label: "Buddhist Resources", href: "/learn/buddhist-resources/" },
      { label: "Questions About Buddhism", href: "/learn/questions-about-buddhism/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Dhamma", "Buddha", "Refuge"]
  },
  {
    section: "buddhist-dictionary",
    slug: "nirvana",
    title: "Nirvana",
    seoTitle: "Nirvana Meaning in Buddhism Explained Simply",
    description:
      "A gentle beginner-friendly explanation of Nirvana as the ending of greed, hatred, and delusion.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Nirvana, or Nibbana in Pali, points to liberation: the extinguishing of greed, hatred, and delusion.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Nirvana is sometimes imagined as a place, but in Buddhist teaching it is better understood as liberation from the fires that burn in the mind. Greed, hatred, and delusion no longer rule.",
          "For beginners, it is enough to understand Nirvana as the direction of freedom. Small moments of non-greed, non-hatred, and clear seeing give a faint taste of that direction."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "When anger softens before becoming harm, when craving loosens, or when confusion clears, the mind experiences a small release. These moments do not equal final liberation, but they show why practice matters."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Nirvana is connected with the Four Noble Truths, especially the truth that release from suffering is possible."
        ]
      }
    ],
    takeaway: "Nirvana points to liberation from greed, hatred, and delusion.",
    practice: "Notice one moment today when grasping or anger loosens. Let that release be known.",
    relatedLinks: [
      { label: "Four Noble Truths", href: "/learn/buddhism-101/the-four-noble-truths-explained/" },
      { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" },
      { label: "Wisdom Quotes", href: "/quotes/wisdom/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Dukkha", "Anatta", "Dhamma"]
  },
  {
    section: "buddhist-dictionary",
    slug: "mindfulness",
    title: "Mindfulness",
    seoTitle: "Mindfulness Meaning in Buddhist Practice",
    description:
      "Learn mindfulness as clear awareness and remembering, with practical examples for Buddhist-inspired daily life.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Mindfulness is clear, caring awareness of present experience and the remembering to return to what matters.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Mindfulness notices body, feelings, thoughts, and actions. It is not a demand to feel peaceful. It is a way to know what is happening without being completely carried away.",
          "In Buddhist practice, mindfulness supports insight, ethics, and meditation."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Mindfulness can be practiced while breathing, walking, listening, eating, working, or pausing before speech. It turns ordinary moments into opportunities for clear seeing."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Mindfulness is closely related to sati and is part of the Noble Eightfold Path as right mindfulness."
        ]
      }
    ],
    takeaway: "Mindfulness is the practice of knowing present experience clearly enough to respond wisely.",
    practice: "Pause before one routine action and feel the body for one breath.",
    relatedLinks: [
      { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
      { label: "What Is Mindfulness?", href: "/learn/buddhism-101/what-is-mindfulness/" },
      { label: "Mindfulness Articles", href: "/articles/category/mindfulness/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Sati", "Meditation", "Awareness"]
  },
  {
    section: "buddhist-dictionary",
    slug: "compassion",
    title: "Compassion",
    seoTitle: "Compassion Meaning in Buddhist Wisdom",
    description:
      "Learn compassion in Buddhist wisdom as clear care for suffering with boundaries, kindness, and wise action.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "Compassion is the caring response to suffering. In Buddhist wisdom, it is warm, clear, and practical.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Compassion sees pain and wishes to reduce harm. It does not look down on others. It remembers that all beings experience fear, loss, aging, confusion, and the wish to be safe.",
          "Compassion is not the same as allowing harm. Wise compassion can say no, protect boundaries, and speak truth."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Compassion appears when you listen carefully, help without needing attention, apologize sincerely, or speak to yourself gently after a mistake."
        ]
      },
      {
        heading: "Related Teaching",
        paragraphs: [
          "Compassion is related to karuna and metta. Together they train the heart toward care and goodwill."
        ]
      }
    ],
    takeaway: "Compassion is wise care for suffering, joined with kindness, truth, and boundaries.",
    practice: "When judging someone, pause and ask what suffering may be present without excusing harmful behavior.",
    relatedLinks: [
      { label: "Karuna", href: "/learn/buddhist-dictionary/karuna/" },
      { label: "Compassion Article", href: "/articles/compassion-as-a-daily-discipline/" },
      { label: "Compassion Quotes", href: "/quotes/compassion/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Karuna", "Metta", "Right Speech"]
  },
  {
    section: "buddhist-dictionary",
    slug: "sutta",
    title: "Sutta",
    seoTitle: "Sutta Meaning in Buddhism",
    description:
      "Learn what a sutta is in Buddhism, how suttas relate to Buddhist texts, and how beginners can read them carefully.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "A sutta is a Buddhist discourse or teaching text. Beginners can read suttas as source material while remembering that translation, tradition, and commentary matter.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "Sutta is the Pali word often used for a discourse, scripture, or teaching preserved in Buddhist textual collections. Sanskrit sources often use sutra. English readers may meet both words depending on tradition and source.",
          "A sutta is not the same as a modern blog post or quote card. It belongs to a textual tradition and should be approached with source awareness, translation care, and humility."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "Reading a sutta can support practice when the reader asks: What is this teaching saying? What is it not saying? How does it connect with conduct, meditation, wisdom, and compassion today?"
        ]
      },
      {
        heading: "Common Misunderstanding",
        paragraphs: [
          "A short summary of a sutta is not a translation. The term also does not mean that every Buddhist tradition organizes, names, or uses its texts in exactly the same way. Echo Buddha source-study pages explain themes in original language and link to source/citation standards so readers can compare reputable translations."
        ]
      }
    ],
    takeaway: "A sutta is a Buddhist teaching discourse that should be read with translation and tradition context.",
    practice: "When reading a sutta summary, ask whether you are reading scripture, translation, paraphrase, commentary, or reflection.",
    relatedLinks: [
      { label: "Sutta for Daily Life", href: "/learn/sutta-for-daily-life/" },
      { label: "Pali Canon", href: "/learn/buddhist-dictionary/pali-canon/" },
      { label: "Buddhist Sources", href: "/buddhist-sources-and-citations/" }
    ],
    sourceNote:
      "Source note: This dictionary page gives a beginner definition of sutta and does not reproduce translation text.",
    terms: ["Pali Canon", "Dhamma", "Sutta"]
  },
  {
    section: "buddhist-dictionary",
    slug: "pali-canon",
    title: "Pali Canon",
    seoTitle: "Pali Canon Meaning for Beginners",
    description:
      "Learn what the Pali Canon is, why it matters in Buddhist study, and how beginners can approach it carefully.",
    eyebrow: "Buddhist Dictionary",
    intro:
      "The Pali Canon is a major collection of Buddhist texts preserved in Pali and especially important in Theravada Buddhist traditions.",
    sections: [
      {
        heading: "Simple Meaning",
        paragraphs: [
          "The Pali Canon, also called the Tipitaka or Three Baskets, is a major Pali-language textual collection that forms the doctrinal foundation of Theravada Buddhism. It includes discourses, monastic discipline, and analytical teachings preserved in Pali.",
          "It is especially central in Theravada contexts. Other Buddhist traditions preserve and study other canons and textual collections, so beginners should avoid treating the Pali Canon as the complete canon for every Buddhist tradition."
        ]
      },
      {
        heading: "Meaning in Daily Life",
        paragraphs: [
          "A beginner does not need to read the entire Pali Canon before practicing. It is enough to understand that many common teachings, such as the Four Noble Truths and Noble Eightfold Path, are connected with traditional textual sources."
        ]
      },
      {
        heading: "Common Misunderstanding",
        paragraphs: [
          "A modern explanation of a Pali Canon theme is not the same as a canonical translation. Echo Buddha also avoids unsupported claims such as saying the collection is simply the oldest complete Buddhist canon without careful scholarly qualification. These pages use original plain-English summaries and point readers toward reputable translations and teachers for formal study."
        ]
      }
    ],
    takeaway: "The Pali Canon is a major Pali textual collection, especially important in Theravada Buddhist study.",
    practice: "When a page mentions a Pali Canon source, notice whether it links to a source, summary, translation, or reflection.",
    relatedLinks: [
      { label: "Sutta", href: "/learn/buddhist-dictionary/sutta/" },
      { label: "Buddhist Resources", href: "/learn/buddhist-resources/" },
      { label: "Buddhist Sources", href: "/buddhist-sources-and-citations/" }
    ],
    sourceNote:
      "Source note: This dictionary page gives a simplified source-study orientation and does not claim tradition-wide authority.",
    terms: ["Sutta", "Dhamma", "Buddhist texts"]
  }
];

export const dhammapadaPages: LearningPage[] = [
  {
    section: "dhammapada-reflections",
    slug: "avoid-evil-do-good-purify-the-mind",
    title: "Avoid Evil, Do Good, Purify the Mind",
    description:
      "An original Dhammapada-inspired reflection on avoiding harm, cultivating good, and training the mind.",
    eyebrow: "Dhammapada Reflection",
    intro:
      "This reflection is based on a well-known Dhammapada theme: avoid harmful action, cultivate what is good, and purify the mind through practice.",
    sections: [
      {
        heading: "Simple Explanation",
        paragraphs: [
          "The teaching is simple enough to remember and deep enough to practice for a lifetime. Avoiding harm begins with body, speech, and mind. Doing good means cultivating generosity, patience, honesty, and compassion. Purifying the mind means seeing greed, hatred, and confusion clearly so they lose strength.",
          "The order matters. Ethical care supports meditation. Meditation reveals the mind. Clear seeing supports wiser action."
        ]
      },
      {
        heading: "Daily Life Meaning",
        paragraphs: [
          "In daily life, this may mean not sending the harsh message, doing the small helpful task, and then looking honestly at the resentment or pride that appeared. The teaching is not abstract. It lives in the next choice."
        ]
      },
      {
        heading: "Short Reflection Story",
        paragraphs: [
          "A worker wanted to expose a colleague's mistake in a way that would win praise. He paused, corrected the issue quietly, and later spoke privately with honesty. He avoided harm, did good, and saw the pride in his own mind. That was the teaching in one afternoon."
        ]
      }
    ],
    takeaway: "The path can be remembered as three trainings: reduce harm, cultivate good, and purify the mind.",
    practice: "Choose one harmful habit to pause, one good action to complete, and one mind state to observe today.",
    relatedLinks: [
      { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" },
      { label: "Daily Practice", href: "/learn/buddhism-101/a-simple-daily-buddhist-practice/" },
      { label: "Practice Quotes", href: "/quotes/practice/" }
    ],
    sourceNote:
      "This page offers an original reflection on a traditional Dhammapada theme. It does not reproduce a copyrighted translation.",
    terms: ["Dhamma", "Karma", "Practice"]
  },
  {
    section: "dhammapada-reflections",
    slug: "the-mind-leads-all-things",
    title: "The Mind Leads All Things",
    description:
      "A Dhammapada-inspired reflection on how intention, thought, and attention shape speech and action.",
    eyebrow: "Dhammapada Reflection",
    intro:
      "A central Dhammapada theme teaches that the mind comes first. What we cultivate inwardly shapes how we speak and act outwardly.",
    sections: [
      {
        heading: "Simple Explanation",
        paragraphs: [
          "The mind does not merely watch life. It colors life. A resentful mind hears insult quickly. A fearful mind predicts danger quickly. A generous mind notices opportunities to help.",
          "This does not mean every event is created by thought. It means the quality of mind strongly affects our response and the suffering or peace that follows."
        ]
      },
      {
        heading: "Daily Life Meaning",
        paragraphs: [
          "Before speech, there is intention. Before action, there is a leaning of the heart. Training the mind is therefore practical. It changes emails, meals, arguments, work, and apologies."
        ]
      },
      {
        heading: "Short Reflection Story",
        paragraphs: [
          "A mother heard a child's spilled cup and felt anger rise. Then she noticed the thought: another problem. She softened it to: a child learning. Her words changed immediately. The spilled water was the same; the mind leading the response was different."
        ]
      }
    ],
    takeaway: "The state of mind shapes the direction of speech, action, and experience.",
    practice: "Before one reply today, ask: “What mind is leading these words?”",
    relatedLinks: [
      { label: "Karma", href: "/learn/buddhist-dictionary/karma/" },
      { label: "Mindfulness", href: "/learn/buddhist-dictionary/mindfulness/" },
      { label: "Overthinking Article", href: "/articles/buddhist-wisdom-for-overthinking/" }
    ],
    sourceNote:
      "This is an original explanation of a traditional Dhammapada theme using paraphrase and daily-life reflection.",
    terms: ["Mindfulness", "Karma", "Sati"]
  },
  {
    section: "dhammapada-reflections",
    slug: "hatred-is-not-ended-by-hatred",
    title: "Hatred Is Not Ended by Hatred",
    description:
      "A Dhammapada-inspired reflection on meeting hostility with wisdom, boundaries, and non-hatred.",
    eyebrow: "Dhammapada Reflection",
    intro:
      "This reflection explores the traditional teaching that hatred is not healed by more hatred, but by non-hatred and wise care.",
    sections: [
      {
        heading: "Simple Explanation",
        paragraphs: [
          "Hatred promises strength but often repeats the wound. When anger becomes hatred, the mind reduces another person to an enemy and loses the ability to see clearly.",
          "Non-hatred does not mean silence in the face of harm. It means refusing to let the heart become shaped by the same violence it opposes."
        ]
      },
      {
        heading: "Daily Life Meaning",
        paragraphs: [
          "In ordinary conflict, this teaching may mean setting a boundary without contempt, telling the truth without cruelty, or stepping away before words become weapons."
        ]
      },
      {
        heading: "Short Reflection Story",
        paragraphs: [
          "A man received an insulting message and wrote a sharper one in return. Before sending it, he imagined the chain continuing all evening. He deleted it, waited, and later answered firmly without insult. The conflict did not vanish, but hatred did not receive new fuel."
        ]
      }
    ],
    takeaway: "Non-hatred is not weakness; it is the strength to stop passing harm forward.",
    practice: "When resentment rises, ask what boundary is needed and what hatred would add.",
    relatedLinks: [
      { label: "Compassion", href: "/learn/buddhist-dictionary/compassion/" },
      { label: "Right Speech", href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/" },
      { label: "Anger Article", href: "/articles/buddhist-approach-to-anger/" }
    ],
    sourceNote: "This page uses original wording to reflect on a traditional Dhammapada theme.",
    terms: ["Karuna", "Right Speech", "Compassion"]
  },
  {
    section: "dhammapada-reflections",
    slug: "better-than-a-thousand-empty-words",
    title: "Better Than a Thousand Empty Words",
    description:
      "A Dhammapada-inspired reflection on meaningful speech, silence, and words that bring peace.",
    eyebrow: "Dhammapada Reflection",
    intro:
      "This reflection explores the value of one meaningful word over many careless words.",
    sections: [
      {
        heading: "Simple Explanation",
        paragraphs: [
          "Words can fill space without helping anyone. They can defend the ego, repeat gossip, or make confusion louder. A few words spoken with truth and care can be more valuable than long speech that leaves the mind restless.",
          "Buddhist wisdom does not reject speech. It asks speech to become useful."
        ]
      },
      {
        heading: "Daily Life Meaning",
        paragraphs: [
          "In daily life, meaningful speech may be an apology, a clear boundary, a kind encouragement, or silence where a complaint would add nothing. The value of speech is measured by its effect, not its volume."
        ]
      },
      {
        heading: "Short Reflection Story",
        paragraphs: [
          "During a tense meeting, everyone repeated positions until the room grew tired. One quiet person finally said, “What are we actually trying to protect?” The question changed the conversation. A few useful words carried more peace than an hour of noise."
        ]
      }
    ],
    takeaway: "Wise speech is measured by truth, kindness, usefulness, and timing.",
    practice: "Before speaking today, ask whether fewer words would be more helpful.",
    relatedLinks: [
      { label: "Right Speech Article", href: "/articles/right-speech-buddhism/" },
      { label: "Wise Silence Quote", href: "/quotes/wisdom/wise-silence/" },
      { label: "Right Speech in Daily Life", href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/" }
    ],
    sourceNote: "This reflection uses original wording inspired by a traditional Dhammapada theme.",
    terms: ["Right Speech", "Wisdom", "Dhamma"]
  },
  {
    section: "dhammapada-reflections",
    slug: "peace-comes-from-a-trained-mind",
    title: "Peace Comes from a Trained Mind",
    description:
      "A Dhammapada-inspired reflection on training the mind through meditation, patience, and daily awareness.",
    eyebrow: "Dhammapada Reflection",
    intro:
      "This reflection considers the traditional Buddhist idea that a trained mind brings steadiness and peace.",
    sections: [
      {
        heading: "Simple Explanation",
        paragraphs: [
          "A trained mind is not a controlled or frozen mind. It is a mind familiar with returning, observing, softening, and choosing wisely. Training happens through meditation and through daily conduct.",
          "Without training, the mind is easily pulled by praise, blame, fear, memory, and desire. With practice, it still feels these things, but it is less ruled by them."
        ]
      },
      {
        heading: "Daily Life Meaning",
        paragraphs: [
          "Training the mind may look like one breath before replying, five minutes of meditation, or noticing a repeated worry without following it for an hour. Peace grows through repetition."
        ]
      },
      {
        heading: "Short Reflection Story",
        paragraphs: [
          "A student complained that meditation was repetitive. Her teacher asked how many times she had practiced anger. The student smiled. Repetition had already trained the mind; now she was choosing a different training."
        ]
      }
    ],
    takeaway: "Peace grows through repeated training of attention, intention, and response.",
    practice: "Choose one repeated moment today and train it gently: breathing, listening, or pausing.",
    relatedLinks: [
      { label: "Meditation Hub", href: "/meditation/" },
      { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
      { label: "Daily Practice Quote", href: "/quotes/practice/small-actions-shape-the-mind/" }
    ],
    sourceNote: "This page offers original reflection on a traditional Dhammapada theme.",
    terms: ["Sati", "Meditation", "Practice"]
  }
];

export const suttaPages: LearningPage[] = [
  {
    section: "sutta-for-daily-life",
    slug: "metta-sutta-explained-for-daily-life",
    title: "The Metta Sutta Explained for Daily Life",
    description:
      "A simple, practical explanation of the Metta Sutta and how loving-kindness can shape speech, family life, and daily practice.",
    eyebrow: "Sutta for Daily Life",
    intro:
      "The Metta Sutta is loved for its teaching on goodwill. This page explains its daily meaning in original, beginner-friendly language.",
    sections: [
      {
        heading: "Simple Background",
        paragraphs: [
          "The Metta Sutta is a well-known Buddhist discourse on loving-kindness. It encourages a heart of goodwill, humility, contentment, ethical care, and wishes of safety for living beings.",
          "Rather than treating metta as a sentimental mood, the teaching presents goodwill as a way of living."
        ]
      },
      {
        heading: "Main Teaching",
        paragraphs: [
          "Metta asks us to cultivate the wish that beings be safe, peaceful, and free from unnecessary suffering. This includes oneself, loved ones, strangers, difficult people, and beings we will never meet.",
          "The practice does not erase boundaries. Goodwill can remain clear and wise."
        ]
      },
      {
        heading: "Modern Daily Life",
        paragraphs: [
          "Metta can shape how we write messages, speak to family, drive, work, and think about people we disagree with. It begins with the simple refusal to add more harm."
        ]
      }
    ],
    takeaway: "The Metta Sutta teaches goodwill as a daily practice of non-harm and care.",
    practice: "Repeat slowly: “May I be safe. May others be safe. May this moment be met with kindness.”",
    relatedLinks: [
      { label: "Metta Dictionary Term", href: "/learn/buddhist-dictionary/metta/" },
      { label: "Loving-Kindness Meditation", href: "/meditation/loving-kindness-meditation/" },
      { label: "Metta Meditation Script", href: "/articles/metta-meditation-script/" }
    ],
    sourceNote:
      "This explanation is an original educational reflection on the Metta Sutta theme. It does not reproduce copyrighted translation text.",
    terms: ["Metta", "Karuna", "Compassion"]
  },
  {
    section: "sutta-for-daily-life",
    slug: "kalama-sutta-and-wise-thinking",
    title: "The Kalama Sutta and Wise Thinking",
    description:
      "A beginner-friendly explanation of the Kalama Sutta theme of wise inquiry, testing teachings, and recognizing harmful or helpful qualities.",
    eyebrow: "Sutta for Daily Life",
    intro:
      "The Kalama Sutta is often remembered for encouraging careful inquiry rather than blind acceptance.",
    sections: [
      {
        heading: "Simple Background",
        paragraphs: [
          "In this teaching, people are unsure which teachers to trust. The Buddha advises careful examination of what leads to harm or benefit rather than accepting claims simply because of tradition, popularity, or authority.",
          "This does not mean rejecting all guidance. It means learning with both respect and discernment."
        ]
      },
      {
        heading: "Main Teaching",
        paragraphs: [
          "Wise thinking looks at results. Do greed, hatred, and confusion increase? Or do kindness, clarity, and freedom from harm increase? This practical test protects the mind from both gullibility and cynicism."
        ]
      },
      {
        heading: "Modern Daily Life",
        paragraphs: [
          "Online advice, spiritual claims, and strong opinions appear constantly. The Kalama Sutta theme reminds us to slow down, examine consequences, and see whether a teaching makes the heart wiser and less harmful."
        ]
      }
    ],
    takeaway: "Wise inquiry asks whether a teaching leads toward less harm and more clarity.",
    practice: "Before accepting advice today, ask what qualities it strengthens in the mind.",
    relatedLinks: [
      { label: "Wisdom Dictionary", href: "/learn/buddhist-dictionary/dhamma/" },
      { label: "What Is Buddhism?", href: "/learn/buddhism-101/what-is-buddhism/" },
      { label: "Buddhist Wisdom Articles", href: "/articles/category/buddhist-wisdom/" }
    ],
    sourceNote:
      "This is an original practical explanation of a traditional sutta theme. Readers may compare reputable public-domain translations for formal study.",
    terms: ["Dhamma", "Wisdom", "Karma"]
  },
  {
    section: "sutta-for-daily-life",
    slug: "right-speech-in-daily-life",
    title: "Right Speech in Daily Life",
    description:
      "A practical Buddhist explanation of right speech: truthful, kind, useful, and timely communication.",
    eyebrow: "Sutta for Daily Life",
    intro:
      "Right speech is a daily-life teaching about using words to reduce harm and support understanding.",
    sections: [
      {
        heading: "Simple Background",
        paragraphs: [
          "Buddhist teachings often emphasize speech because words shape relationships, memory, trust, and the mind that speaks them. Speech can wound quickly or heal slowly.",
          "Right speech asks that words be truthful, kind, useful, and timely."
        ]
      },
      {
        heading: "Main Teaching",
        paragraphs: [
          "Right speech avoids lying, divisive talk, harshness, and empty chatter that feeds confusion. It does not require silence about hard truths. It asks truth to travel with care."
        ]
      },
      {
        heading: "Modern Daily Life",
        paragraphs: [
          "Right speech applies to family conversations, workplace feedback, social media, and private self-talk. A mindful pause before speaking can prevent hours of repair."
        ]
      }
    ],
    takeaway: "Right speech uses truth, kindness, usefulness, and timing to reduce harm.",
    practice: "Before one important sentence, ask: Is it true, kind, useful, and timely?",
    relatedLinks: [
      { label: "Right Speech Article", href: "/articles/right-speech-buddhism/" },
      { label: "Right Speech Quote", href: "/quotes/wisdom/right-speech-with-kindness/" },
      { label: "Mindful Listening", href: "/articles/mindful-listening-in-everyday-life/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Right Speech", "Sati", "Compassion"]
  },
  {
    section: "sutta-for-daily-life",
    slug: "mindfulness-of-breathing-explained-simply",
    title: "Mindfulness of Breathing Explained Simply",
    description:
      "A simple explanation of mindfulness of breathing and how the breath supports attention, steadiness, and daily practice.",
    eyebrow: "Sutta for Daily Life",
    intro:
      "Mindfulness of breathing is a foundational Buddhist meditation practice that uses the natural breath as an anchor for awareness.",
    sections: [
      {
        heading: "Simple Background",
        paragraphs: [
          "Many Buddhist meditation instructions use the breath because it is always close, ordinary, and changing. The breath gives attention a gentle place to return.",
          "The practice does not require controlling the breath. A long breath is known as long. A short breath is known as short."
        ]
      },
      {
        heading: "Main Teaching",
        paragraphs: [
          "By staying with breathing, the practitioner learns to notice wandering, return kindly, and see body and mind more clearly. The breath becomes a teacher of impermanence and patience."
        ]
      },
      {
        heading: "Modern Daily Life",
        paragraphs: [
          "One breath before a reply, meeting, or decision can change the quality of action. Breath practice is portable, quiet, and humble."
        ]
      }
    ],
    takeaway: "Mindfulness of breathing trains attention through the repeated, gentle return to the natural breath.",
    practice: "Feel three natural breaths without changing them. Begin again whenever attention wanders.",
    relatedLinks: [
      { label: "Breathing Meditation", href: "/meditation/breathing-meditation/" },
      { label: "Meditation Guide", href: "/meditation-guide/" },
      { label: "Sati", href: "/learn/buddhist-dictionary/sati/" }
    ],
    sourceNote:
      "This page is an original, simplified explanation of a traditional Buddhist breathing practice.",
    terms: ["Sati", "Meditation", "Anicca"]
  },
  {
    section: "sutta-for-daily-life",
    slug: "dhammacakkappavattana-sutta-four-noble-truths",
    title: "Dhammacakkappavattana Sutta: Four Noble Truths in Context",
    seoTitle: "Dhammacakkappavattana Sutta and the Four Noble Truths",
    description:
      "A source-aware beginner guide to the Dhammacakkappavattana Sutta, the Middle Way, and the Four Noble Truths.",
    eyebrow: "Sutta for Daily Life",
    intro:
      "The Dhammacakkappavattana Sutta is traditionally remembered as the Buddha's first teaching, where the Middle Way and Four Noble Truths are introduced.",
    sections: [
      {
        heading: "What This Teaching Says",
        paragraphs: [
          "This sutta, identified as SN 56.11 in the Saṁyutta Nikāya, is traditionally associated with setting the wheel of Dhamma in motion. It introduces the two extremes to avoid, the Middle Way, and the Four Noble Truths: dukkha, the arising of dukkha, the cessation of dukkha, and the path leading toward cessation.",
          "Echo Buddha summarizes the teaching in original plain English. This page does not reproduce a translation and should be read beside reputable translations for formal study."
        ]
      },
      {
        heading: "Why Context Matters",
        paragraphs: [
          "The sutta is not merely a list of ideas. It points to a practice movement: understand dukkha without flattening it into ordinary stress alone, see craving and clinging, trust that release is possible, and walk a path of wisdom, ethics, and meditation.",
          "For beginners, this protects the Four Noble Truths from becoming either pessimism or positivity. The teaching is compassionate realism."
        ]
      },
      {
        heading: "What It Does Not Say",
        paragraphs: [
          "The teaching does not say that life is only pain, that every hardship is your fault, or that grief should be rushed. It does not invite blame. It invites understanding and practice.",
          "Use the full <a href='/learn/four-noble-truths/'>Four Noble Truths</a> hub for the broad beginner path, and this page for source-study context."
        ]
      }
    ],
    takeaway: "The Dhammacakkappavattana Sutta gives source context for the Middle Way and Four Noble Truths.",
    practice:
      "When a difficulty appears today, ask which part you can understand: pain, craving, release, or the next wise step.",
    relatedLinks: [
      { label: "Four Noble Truths", href: "/learn/four-noble-truths/" },
      { label: "Middle Way", href: "/learn/buddhism-101/middle-way-explained-for-beginners/" },
      { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" }
    ],
    sourceNote:
      "Source note: This page is an original source-aware explanation of SN 56.11 themes. It distinguishes sutta context, translation, paraphrase, and Echo Buddha reflection.",
    terms: ["Sutta", "Pali Canon", "Dhamma"]
  },
  {
    section: "sutta-for-daily-life",
    slug: "magga-vibhanga-sutta-eightfold-path",
    title: "Magga-vibhanga Sutta: Eightfold Path Explained Simply",
    seoTitle: "Magga-vibhanga Sutta and the Noble Eightfold Path",
    description:
      "A simple source-aware guide to the Magga-vibhanga Sutta and the Noble Eightfold Path in daily life.",
    eyebrow: "Sutta for Daily Life",
    intro:
      "The Magga-vibhanga Sutta gives a compact analysis of the Noble Eightfold Path, showing how wisdom, conduct, and mental training support one another.",
    sections: [
      {
        heading: "What This Teaching Says",
        paragraphs: [
          "The sutta, identified as SN 45.8 in the Saṁyutta Nikāya, analyzes the eight path factors: right view, right intention or resolve, right speech, right action, right livelihood, right effort, right mindfulness, and right concentration or immersion.",
          "These factors should not be treated as eight unrelated tasks. They describe a path where seeing, intention, speech, conduct, work, effort, mindfulness, and concentration shape each other."
        ]
      },
      {
        heading: "Why Context Matters",
        paragraphs: [
          "A source-study page helps readers see that the Eightfold Path is not only a modern self-improvement list. It is a Buddhist path of training that connects the mind with speech, action, livelihood, and meditation.",
          "This page supports the <a href='/learn/eightfold-path/'>Eightfold Path</a> hub, which remains the broad beginner owner for the topic."
        ]
      },
      {
        heading: "What It Does Not Say",
        paragraphs: [
          "The word right should not be used as a weapon for harsh judgment. A safer beginner reading is wise, skillful, or leading away from harm.",
          "Different translators may choose different English words for the same path factors, so no single wording on this page should be treated as the only valid translation. The teaching also does not isolate meditation from ethics. If practice is sincere, it gradually touches emails, work, promises, attention, and repair."
        ]
      }
    ],
    takeaway: "The Magga-vibhanga Sutta gives source context for the Eightfold Path as an integrated daily training.",
    practice:
      "Choose one path factor today and let it guide one ordinary action, such as a message, work decision, or five minutes of attention.",
    relatedLinks: [
      { label: "Eightfold Path", href: "/learn/eightfold-path/" },
      { label: "Threefold Training", href: "/learn/buddhism-101/threefold-training-sila-samadhi-panna/" },
      { label: "Right Speech", href: "/articles/right-speech-buddhism/" }
    ],
    sourceNote:
      "Source note: This page is an original source-aware explanation of SN 45.8 themes. It summarizes rather than reproduces translation text.",
    terms: ["Sutta", "Pali Canon", "Right Speech"]
  },
  {
    section: "sutta-for-daily-life",
    slug: "buddhas-teaching-on-patience",
    title: "The Buddha's Teaching on Patience",
    description:
      "A practical reflection on patience in Buddhist teaching, including delay, conflict, anger, and daily practice.",
    eyebrow: "Sutta for Daily Life",
    intro:
      "Patience is a quiet strength in Buddhist practice. It protects the mind from being ruled by irritation and urgency.",
    sections: [
      {
        heading: "Simple Background",
        paragraphs: [
          "Many Buddhist teachings praise patience as a powerful practice. Patience is not passivity. It is the strength to remain steady while choosing a wise response.",
          "Without patience, anger and craving make decisions quickly. With patience, wisdom has time to arrive."
        ]
      },
      {
        heading: "Main Teaching",
        paragraphs: [
          "Patience includes waiting, enduring discomfort wisely, listening fully, and allowing growth to take time. It does not require accepting harm. It supports clear boundaries without hatred."
        ]
      },
      {
        heading: "Modern Daily Life",
        paragraphs: [
          "Patience is practiced in traffic, family life, slow work, unanswered messages, meditation restlessness, and the long process of changing habits."
        ]
      }
    ],
    takeaway: "Patience gives wisdom enough room to respond instead of react.",
    practice: "During one delay today, relax the body and silently say, “This too is practice.”",
    relatedLinks: [
      { label: "Patience Article", href: "/articles/three-ways-to-practice-patience/" },
      { label: "Patience Quotes", href: "/quotes/patience/" },
      { label: "Anger Article", href: "/articles/buddhist-approach-to-anger/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Patience", "Right Speech", "Compassion"]
  }
];

export const meditationGuidePages: LearningPage[] = [
  {
    section: "meditation",
    slug: "meditation-for-beginners",
    title: "Meditation for Beginners",
    description:
      "A gentle beginner's guide to meditation with posture, breathing, common mistakes, encouragement, and safety notes.",
    eyebrow: "Meditation Practice",
    intro:
      "Meditation begins with a simple willingness to sit, notice, and return. You do not need a silent mind to begin.",
    sections: [
      {
        heading: "How to Practice",
        paragraphs: [
          "Sit on a chair or cushion with a stable posture. Let the hands rest. Feel the natural breath at the nose, chest, or belly. When attention wanders, notice gently and return.",
          "Begin with three to five minutes. A short practice repeated often is more useful than a long practice that creates pressure."
        ]
      },
      {
        heading: "Common Mistakes",
        paragraphs: [
          "Beginners often try to stop thinking, judge wandering as failure, or sit too long too soon. Meditation is not a test of calm. Returning is the practice."
        ]
      },
      {
        heading: "Gentle Encouragement",
        paragraphs: [
          "Some sessions feel peaceful; others feel restless. Both can teach. If meditation feels overwhelming, open the eyes, feel the feet, shorten the session, or stop."
        ]
      }
    ],
    takeaway: "Beginner meditation is the repeated practice of noticing and returning with kindness.",
    practice: "Sit for five minutes and return to one natural breath whenever you remember.",
    relatedLinks: [
      { label: "Meditation Guide", href: "/meditation-guide/" },
      { label: "Breathing Meditation", href: "/meditation/breathing-meditation/" },
      { label: "Meditation Quotes", href: "/quotes/meditation/" }
    ],
    sourceNote:
      "Meditation guidance on Echo Buddha is educational and reflective. It is not a substitute for medical or mental health care.",
    terms: ["Meditation", "Sati", "Mindfulness"]
  },
  {
    section: "meditation",
    slug: "breathing-meditation",
    title: "Breathing Meditation",
    description:
      "Learn a simple breathing meditation practice for steady attention, mindful returning, and daily calm without forcing the breath.",
    eyebrow: "Meditation Practice",
    intro:
      "Breathing meditation uses the natural breath as a steady place for attention to return.",
    sections: [
      {
        heading: "Step-by-Step Practice",
        paragraphs: [
          "Sit comfortably and notice where breathing is easiest to feel. Let the breath move naturally. Stay with one inhale and one exhale at a time.",
          "When sounds, thoughts, or feelings pull attention away, acknowledge them and return to the next breath without criticism."
        ]
      },
      {
        heading: "Common Mistakes",
        paragraphs: [
          "Do not force the breath to become deep or peaceful. A tight breath can be known as tight. A shallow breath can be known as shallow. Honest awareness matters more than control."
        ]
      },
      {
        heading: "Daily Use",
        paragraphs: [
          "One mindful breath before speaking, driving, working, or checking messages can reconnect the mind with the body."
        ]
      }
    ],
    takeaway: "Breathing meditation trains attention by returning to the breath as it is.",
    practice: "Feel ten natural breaths. If you lose count, begin again at one.",
    relatedLinks: [
      { label: "Mindfulness of Breathing", href: "/learn/sutta-for-daily-life/mindfulness-of-breathing-explained-simply/" },
      { label: "Mindful Breathing Quote", href: "/quotes/meditation/one-honest-breath/" },
      { label: "Meditation Guide", href: "/meditation-guide/" }
    ],
    sourceNote:
      "This practice is educational. If stillness increases distress, pause and seek appropriate support.",
    terms: ["Sati", "Meditation", "Mindfulness"]
  },
  {
    section: "meditation",
    slug: "loving-kindness-meditation",
    title: "Loving-Kindness Meditation",
    description:
      "Learn loving-kindness meditation with simple goodwill phrases, common difficulties, boundaries, and daily-life practice.",
    eyebrow: "Meditation Practice",
    intro:
      "Loving-kindness meditation trains goodwill toward oneself and others through sincere, gentle phrases.",
    sections: [
      {
        heading: "Step-by-Step Practice",
        paragraphs: [
          "Sit comfortably and begin with yourself or someone easy to care about. Silently repeat phrases such as: May I be safe. May I be peaceful. May I meet this day with kindness.",
          "Then, if steady, extend goodwill to a friend, a neutral person, a difficult person, and all beings. Move slowly. There is no need to force emotion."
        ]
      },
      {
        heading: "Common Mistakes",
        paragraphs: [
          "Do not use loving-kindness to deny hurt or remove boundaries. If a difficult person feels too hard, return to yourself or a neutral person. Goodwill can be gentle and honest."
        ]
      },
      {
        heading: "Daily Use",
        paragraphs: [
          "Metta can be practiced before a family conversation, while reading difficult news, or when self-criticism becomes harsh."
        ]
      }
    ],
    takeaway: "Loving-kindness meditation trains the heart toward goodwill without denying truth or boundaries.",
    practice: "Repeat three phrases of goodwill for yourself and one other person today.",
    relatedLinks: [
      { label: "Metta", href: "/learn/buddhist-dictionary/metta/" },
      { label: "Metta Sutta", href: "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/" },
      { label: "Loving-Kindness Article", href: "/articles/loving-kindness-meditation-beginners/" }
    ],
    sourceNote: "This is educational meditation guidance and not a substitute for professional care.",
    terms: ["Metta", "Karuna", "Compassion"]
  },
  {
    section: "meditation",
    slug: "walking-meditation",
    title: "Walking Meditation",
    description:
      "A simple walking meditation guide for beginners, including step-by-step practice, common mistakes, and daily mindfulness.",
    eyebrow: "Meditation Practice",
    intro:
      "Walking meditation brings awareness to standing, lifting, moving, placing, and the whole body in motion.",
    sections: [
      {
        heading: "Step-by-Step Practice",
        paragraphs: [
          "Choose a short path. Stand still and feel the feet. Walk slowly enough to notice lifting, moving, and placing each foot. Let the eyes rest softly ahead.",
          "When the mind wanders, return to the feeling of the next step. You may use simple labels: lifting, moving, placing."
        ]
      },
      {
        heading: "Common Mistakes",
        paragraphs: [
          "Do not worry about looking spiritual. Walking meditation is not a performance. If very slow walking feels awkward, walk naturally and feel contact with the ground."
        ]
      },
      {
        heading: "Daily Use",
        paragraphs: [
          "Use walking meditation between tasks, from car to door, or during a short break. It can help reconnect the mind and body."
        ]
      }
    ],
    takeaway: "Walking meditation turns ordinary movement into steady embodied awareness.",
    practice: "Take ten mindful steps today, feeling each foot meet the ground.",
    relatedLinks: [
      { label: "Walking Meditation Article", href: "/articles/walking-meditation-step-by-step/" },
      { label: "Present Moment Quote", href: "/quotes/mindfulness/present-moment-one-step/" },
      { label: "Sati", href: "/learn/buddhist-dictionary/sati/" }
    ],
    sourceNote: "Practice gently and adapt movement to your body and surroundings.",
    terms: ["Sati", "Mindfulness", "Practice"]
  },
  {
    section: "meditation",
    slug: "mindfulness-in-daily-life",
    title: "Mindfulness in Daily Life",
    description:
      "Learn how to practice mindfulness during work, conversations, chores, meals, and ordinary transitions.",
    eyebrow: "Meditation Practice",
    intro:
      "Mindfulness in daily life means remembering awareness during ordinary moments, not only during formal meditation.",
    sections: [
      {
        heading: "Step-by-Step Practice",
        paragraphs: [
          "Choose one daily activity: washing hands, opening a door, eating, or beginning work. Feel the body during that activity. Notice sounds, movement, and intention.",
          "When the mind rushes ahead, return to the action already happening."
        ]
      },
      {
        heading: "Common Mistakes",
        paragraphs: [
          "Do not try to be mindful of everything all day. That becomes exhausting. Choose small repeatable moments. Let practice grow through friendliness, not pressure."
        ]
      },
      {
        heading: "Daily Use",
        paragraphs: [
          "Mindfulness can support listening, patient speech, simpler work, and less automatic reaction. It brings the path into the places you already live."
        ]
      }
    ],
    takeaway: "Daily mindfulness grows through small moments of remembered awareness.",
    practice: "Pick one routine action and make it a mindfulness bell for one day.",
    relatedLinks: [
      { label: "What Is Mindfulness?", href: "/learn/buddhism-101/what-is-mindfulness/" },
      { label: "Mindfulness at Work Quote", href: "/quotes/practice/mindfulness-at-work-breath/" },
      { label: "Mindfulness Articles", href: "/articles/category/mindfulness/" }
    ],
    sourceNote: commonSourceNote,
    terms: ["Mindfulness", "Sati", "Practice"]
  }
];

export const questionsAboutBuddhism = [
  {
    question: "Is Buddhism a religion or a philosophy?",
    answer:
      "Buddhism can be approached as a religion, a spiritual path, a philosophy, an ethical training, and a meditation tradition. In many cultures it includes temples, rituals, devotion, monastic communities, and sacred texts. For other readers, especially beginners, it may first appear as a practical way to understand suffering, cultivate compassion, and live with more awareness. Echo Buddha presents Buddhism respectfully as a living tradition with many expressions, not as a single narrow category. A helpful first step is to study the Buddha's core teachings and notice how they apply to speech, intention, and daily conduct.",
    links: [
      { label: "What Is Buddhism?", href: "/learn/buddhism-101/what-is-buddhism/" },
      { label: "Buddhism 101", href: "/learn/buddhism-101/" },
      { label: "Buddhist Resources", href: "/learn/buddhist-resources/" }
    ]
  },
  {
    question: "Do Buddhists believe in God?",
    answer:
      "Buddhist traditions vary widely across countries and schools, but Buddhism does not center its path on worship of a creator god. The main concern is awakening from greed, hatred, and delusion through wisdom, ethical conduct, meditation, and compassion. Some Buddhist cultures include devotional practices, celestial beings, rituals, and protective chants, while others emphasize meditation and philosophy. For beginners, the safest summary is this: Buddhism asks less, “Who created the world?” and more, “What causes suffering, and how can the heart become free from harmful patterns?”",
    links: [
      { label: "Who Was the Buddha?", href: "/learn/buddhism-101/who-was-the-buddha/" },
      { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" },
      { label: "The Three Jewels", href: "/learn/buddhism-101/the-three-jewels-explained/" }
    ]
  },
  {
    question: "What is the purpose of meditation in Buddhism?",
    answer:
      "Meditation in Buddhism trains attention, steadies the mind, supports compassion, and helps practitioners see thoughts, feelings, intentions, and habits more clearly. It is not mainly an escape from life or a technique for forcing calm. A breathing practice may reveal restlessness. Loving-kindness practice may reveal self-criticism. Walking meditation may reveal how often the mind rushes ahead. These discoveries are useful because they make wise response possible. Meditation may support calm and self-awareness, but it is not a replacement for medical or mental health care.",
    links: [
      { label: "Meditation Hub", href: "/meditation/" },
      { label: "Meditation for Beginners", href: "/meditation/meditation-for-beginners/" },
      { label: "Sati", href: "/learn/buddhist-dictionary/sati/" }
    ]
  },
  {
    question: "What does Buddhism say about anger?",
    answer:
      "Buddhist wisdom treats anger as a powerful state to be understood before it becomes harmful speech or action. Anger can sometimes point toward pain, fear, violated boundaries, or injustice, so the practice is not to deny it. The practice is to know anger clearly, feel its heat in the body, and avoid letting it turn into cruelty or revenge. Right speech, patience, and compassion help anger become information rather than a master. A wise response may still be firm, protective, or truthful.",
    links: [
      { label: "Anger Article", href: "/articles/buddhist-approach-to-anger/" },
      { label: "Right Speech", href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/" },
      { label: "Patience Teaching", href: "/learn/sutta-for-daily-life/buddhas-teaching-on-patience/" }
    ]
  },
  {
    question: "What is the Buddhist view of suffering?",
    answer:
      "Buddhism begins by honestly recognizing suffering, stress, and dissatisfaction. This includes obvious pain such as grief, sickness, aging, and loss, but also subtler unease: wanting praise to last, fearing change, clinging to identity, or expecting life to satisfy every demand. This honesty is not pessimism. It is the start of understanding causes. When craving and clinging are seen more clearly, the mind can practice a wiser path through ethics, meditation, insight, and compassion.",
    links: [
      { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" },
      { label: "Four Noble Truths", href: "/learn/buddhism-101/the-four-noble-truths-explained/" },
      { label: "Three Marks", href: "/learn/buddhism-101/three-marks-of-existence/" }
    ]
  },
  {
    question: "What does it mean to take refuge?",
    answer:
      "Taking refuge means turning toward the Buddha, Dhamma, and Sangha for guidance. The Buddha represents awakening and the possibility of clear seeing. The Dhamma is the teaching and practice. The Sangha is the community of those who preserve, practice, and support the path. Refuge is not hiding from life; it is choosing reliable guidance when the mind is pulled by fear, pride, anger, or confusion. In daily life, refuge may look like pausing before harmful speech, reading a teaching, meditating, or asking wise companions for support.",
    links: [
      { label: "Three Jewels", href: "/learn/buddhism-101/the-three-jewels-explained/" },
      { label: "Sangha", href: "/learn/buddhist-dictionary/sangha/" },
      { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" }
    ]
  },
  {
    question: "Can anyone practice Buddhist mindfulness?",
    answer:
      "Anyone can explore mindfulness respectfully, especially simple awareness of breathing, body, speech, and intention. Formal Buddhist practice may include particular traditions, teachers, ethics, chanting, and study, so it is good to approach the roots of mindfulness with humility. Basic mindful awareness can still be practiced in ordinary life: noticing the body before replying, feeling the breath while waiting, or listening without preparing an argument. In Buddhism, mindfulness is connected with wisdom and ethical care, not only stress reduction.",
    links: [
      { label: "What Is Mindfulness?", href: "/learn/buddhism-101/what-is-mindfulness/" },
      { label: "Mindfulness in Daily Life", href: "/meditation/mindfulness-in-daily-life/" },
      { label: "Mindfulness", href: "/learn/buddhist-dictionary/mindfulness/" }
    ]
  },
  {
    question: "What is attachment in Buddhism?",
    answer:
      "Attachment is grasping: the mind's attempt to make changing life secure by force. It can appear around people, possessions, opinions, plans, success, identity, or even spiritual experiences. Buddhism does not ask us to stop caring. It invites us to care without clinging. A parent can love a child deeply while still accepting that the child changes. A worker can do excellent work without making self-worth depend on praise. Non-attachment is not coldness; it is love and effort with a more open hand.",
    links: [
      { label: "Attachment Article", href: "/articles/how-to-let-go-of-attachment-in-buddhism/" },
      { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" },
      { label: "Dependent Origination", href: "/learn/buddhism-101/dependent-origination-explained/" }
    ]
  },
  {
    question: "What is compassion in Buddhism?",
    answer:
      "Compassion in Buddhism is wise care for suffering. It is not pity from a distance and not the need to rescue everyone. Compassion sees pain clearly and asks what response reduces harm. Sometimes that response is listening, sometimes practical help, sometimes apology, and sometimes a firm boundary. Compassion also includes oneself; harsh self-judgment rarely creates wisdom. Buddhist compassion works best with mindfulness, because clear seeing helps kindness become skillful rather than overwhelmed.",
    links: [
      { label: "Compassion", href: "/learn/buddhist-dictionary/compassion/" },
      { label: "Compassion Article", href: "/articles/compassion-as-a-daily-discipline/" },
      { label: "Karuna", href: "/learn/buddhist-dictionary/karuna/" }
    ]
  },
  {
    question: "How can I practice Buddhism at home?",
    answer:
      "Begin with small repeatable practices: five minutes of breathing, one careful conversation, one kind action, and a short evening reflection. You can read a beginner lesson, choose a quote for the day, practice right speech during one difficult moment, or offer loving-kindness before sleep. Home practice does not need to look impressive. It becomes meaningful when it reduces harm and increases honesty, patience, and compassion. If possible, learn from reputable teachers or communities when questions deepen.",
    links: [
      { label: "Practice at Home", href: "/learn/buddhism-101/how-to-practice-buddhism-at-home/" },
      { label: "Simple Daily Practice", href: "/learn/buddhism-101/a-simple-daily-buddhist-practice/" },
      { label: "Five Precepts", href: "/learn/buddhism-101/five-precepts-buddhism/" }
    ]
  }
];

export const resourceGroups = [
  {
    title: "Buddhist Texts",
    description: "Useful starting points for readers who want to explore Buddhist teachings carefully.",
    links: [
      { label: "SuttaCentral", href: "https://suttacentral.net/", description: "A large collection of early Buddhist texts and translations." },
      { label: "Access to Insight Archive", href: "https://www.accesstoinsight.org/", description: "A long-standing archive of Theravada Buddhist texts and essays." }
    ]
  },
  {
    title: "Meditation Learning",
    description: "Simple places to continue learning meditation with care and context.",
    links: [
      { label: "Insight Meditation Society", href: "https://www.dharma.org/", description: "Meditation teachings and retreat information." },
      { label: "Buddhist Society", href: "https://www.thebuddhistsociety.org/", description: "Educational resources and talks for general learners." }
    ]
  },
  {
    title: "Buddhist Dictionaries",
    description: "Reference tools for Buddhist terms and concepts.",
    links: [
      { label: "Pali Text Society", href: "https://palitextsociety.org/", description: "Resources for Pali studies and Buddhist texts." },
      { label: "Wisdom Library Buddhist Terms", href: "https://www.wisdomlib.org/", description: "A broad reference site with Buddhist entries and related material." }
    ]
  },
  {
    title: "Beginner Buddhism",
    description: "Accessible learning for readers beginning Buddhist study.",
    links: [
      { label: "Tricycle Beginner Resources", href: "https://tricycle.org/beginners/", description: "Beginner-friendly Buddhist explanations and practice articles." },
      { label: "Lion's Roar Buddhism Guides", href: "https://www.lionsroar.com/", description: "Articles and guides from a contemporary Buddhist publication." }
    ]
  },
  {
    title: "Sri Lankan Buddhist Resources",
    description: "Resources connected with Sri Lankan Buddhist learning and culture.",
    links: [
      { label: "Buddhist Publication Society", href: "https://www.bps.lk/", description: "A Sri Lankan publisher of Buddhist books and essays." },
      { label: "Buddhist and Pali University of Sri Lanka", href: "https://www.bpu.ac.lk/", description: "Academic institution for Buddhist and Pali studies." }
    ]
  },
  {
    title: "Global Buddhist Resources",
    description: "International Buddhist education and practice resources.",
    links: [
      { label: "84000 Translating the Words of the Buddha", href: "https://84000.co/", description: "A translation initiative for Tibetan Buddhist texts." },
      { label: "BuddhaNet", href: "https://www.buddhanet.net/", description: "An educational Buddhist website with general resources." }
    ]
  }
];

export const learningSections: LearningSection[] = [
  {
    slug: "buddhism-101",
    title: "Buddhism 101",
    shortTitle: "Buddhism 101",
    description: "Beginner-friendly lessons on the Buddha, core teachings, karma, mindfulness, and daily practice.",
    intro:
      "Start here for simple explanations of foundational Buddhist ideas and how they connect with ordinary life.",
    href: "/learn/buddhism-101/",
    eyebrow: "Start Here",
    items: buddhism101Pages
  },
  {
    slug: "buddhist-dictionary",
    title: "Buddhist Dictionary",
    shortTitle: "Dictionary",
    description: "A practical glossary of Buddhist terms explained in simple, beginner-friendly English.",
    intro:
      "Explore Buddhist terms through clear meanings, daily-life examples, and related teachings.",
    href: "/learn/buddhist-dictionary/",
    eyebrow: "Glossary",
    items: dictionaryPages
  },
  {
    slug: "dhammapada-reflections",
    title: "Dhammapada Reflections",
    shortTitle: "Dhammapada",
    description: "Original reflections on public-domain-safe Dhammapada themes for daily life.",
    intro:
      "Read gentle, original explanations of Dhammapada themes without relying on copyrighted translation text.",
    href: "/learn/dhammapada-reflections/",
    eyebrow: "Reflections",
    items: dhammapadaPages
  },
  {
    slug: "sutta-for-daily-life",
    title: "Sutta for Daily Life",
    shortTitle: "Sutta Daily Life",
    description: "Simple explanations of Buddhist teachings from sutta themes, written for ordinary readers.",
    intro:
      "Learn how traditional Buddhist teachings can support wise thinking, speech, patience, and meditation today.",
    href: "/learn/sutta-for-daily-life/",
    eyebrow: "Teachings",
    items: suttaPages
  }
];

export const learnHubCards: LearningLink[] = [
  { label: "Start Here", href: "/start-here/", description: "A gentle path for new visitors to begin learning and practicing." },
  { label: "Buddhism for Beginners", href: "/learn/buddhism-for-beginners/", description: "Start with the Buddha, core teachings, mindfulness, and meditation." },
  { label: "Four Noble Truths", href: "/learn/four-noble-truths/", description: "Understand suffering, causes, release, and the path in simple language." },
  { label: "Noble Eightfold Path", href: "/learn/eightfold-path/", description: "Practice wisdom, conduct, effort, mindfulness, and concentration in daily life." },
  { label: "Buddhism 101", href: "/learn/buddhism-101/", description: "Begin with core Buddhist teachings in simple language." },
  { label: "Buddhist Dictionary", href: "/learn/buddhist-dictionary/", description: "Look up terms like anicca, dukkha, metta, and sati." },
  { label: "Dhammapada Reflections", href: "/learn/dhammapada-reflections/", description: "Read original reflections on classic Buddhist themes." },
  { label: "Sutta for Daily Life", href: "/learn/sutta-for-daily-life/", description: "Explore teachings through practical daily examples." },
  { label: "Meditation Practice", href: "/meditation/", description: "Learn breathing, loving-kindness, walking meditation, and daily mindfulness." },
  { label: "Questions About Buddhism", href: "/learn/questions-about-buddhism/", description: "Find calm answers to common beginner questions." },
  { label: "Buddhist Resources", href: "/learn/buddhist-resources/", description: "A curated list of trusted learning resources." }
];

export const popularLearningPaths = [
  {
    title: "New to Buddhism",
    links: [
      { label: "Buddhism for Beginners", href: "/learn/buddhism-for-beginners/" },
      { label: "The Middle Way", href: "/learn/buddhism-101/middle-way-explained-for-beginners/" },
      { label: "First Week Buddhist Practice", href: "/articles/first-week-buddhist-practice/" },
      { label: "The Four Noble Truths", href: "/learn/four-noble-truths/" },
      { label: "The Noble Eightfold Path", href: "/learn/eightfold-path/" }
    ]
  },
  {
    title: "Start Meditating",
    links: [
      { label: "Meditation for Beginners", href: "/meditation/meditation-for-beginners/" },
      { label: "Breathing Meditation", href: "/meditation/breathing-meditation/" },
      { label: "5-Minute Practice", href: "/meditation/5-minute-meditation-practice/" },
      { label: "10-Minute Practice", href: "/meditation/10-minute-meditation-practice/" }
    ]
  },
  {
    title: "Understand Buddhist Terms",
    links: [
      { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" },
      { label: "Dhamma vs Dharma", href: "/articles/dhamma-vs-dharma/" },
      { label: "Sangha", href: "/learn/buddhist-dictionary/sangha/" },
      { label: "Sutta", href: "/learn/buddhist-dictionary/sutta/" },
      { label: "Pali Canon", href: "/learn/buddhist-dictionary/pali-canon/" }
    ]
  }
];

export const meditationHubTopics: LearningLink[] = [
  { label: "Meditation for Beginners", href: "/meditation/meditation-for-beginners/", description: "A gentle first guide to sitting and returning." },
  { label: "Breathing Meditation", href: "/meditation/breathing-meditation/", description: "Use the natural breath as a steady anchor." },
  { label: "Loving-Kindness Meditation", href: "/meditation/loving-kindness-meditation/", description: "Practice goodwill toward yourself and others." },
  { label: "Walking Meditation", href: "/meditation/walking-meditation/", description: "Bring awareness into steps and movement." },
  { label: "Mindfulness in Daily Life", href: "/meditation/mindfulness-in-daily-life/", description: "Practice awareness during ordinary routines." },
  { label: "Meditation Posture", href: "/meditation/meditation-posture-for-beginners/", description: "Find a stable, accessible posture without performance." },
  { label: "When Meditation Feels Hard", href: "/meditation/when-meditation-feels-hard/", description: "Work gently with restlessness, discouragement, and overwhelm." },
  { label: "5-Minute Meditation Practice", href: "/meditation/5-minute-meditation-practice/", description: "A short practice for busy days." },
  { label: "10-Minute Meditation Practice", href: "/meditation/10-minute-meditation-practice/", description: "A simple ten-minute structure for steady returning." }
];

export const shortMeditationPages: LearningPage[] = [
  {
    section: "meditation",
    slug: "5-minute-meditation-practice",
    title: "5-Minute Meditation Practice",
    description:
      "A simple five-minute meditation practice for beginners using posture, breath, and a gentle return from distraction.",
    eyebrow: "Meditation Practice",
    intro:
      "Five minutes is enough to begin. This short practice is designed for ordinary days when a small steady pause is possible.",
    sections: [
      {
        heading: "Step-by-Step Practice",
        paragraphs: [
          "Minute one: sit comfortably and feel the support beneath the body. Minute two: notice the natural breath. Minutes three and four: return to breathing each time attention wanders. Minute five: widen awareness to the room and choose one kind intention."
        ]
      },
      {
        heading: "Common Mistakes",
        paragraphs: [
          "Do not rush to feel peaceful. A five-minute practice may feel restless, sleepy, or ordinary. The value is in returning."
        ]
      },
      {
        heading: "Safety Note",
        paragraphs: [
          "If meditation feels overwhelming, open the eyes, feel the feet, shorten the practice, or stop. Meditation is not a replacement for professional medical or mental health care."
        ]
      }
    ],
    takeaway: "A short meditation can train the habit of returning without adding pressure.",
    practice: "Try this five-minute structure once today.",
    relatedLinks: [
      { label: "Meditation for Beginners", href: "/meditation/meditation-for-beginners/" },
      { label: "Breathing Meditation", href: "/meditation/breathing-meditation/" },
      { label: "Meditation Guide", href: "/meditation-guide/" }
    ],
    sourceNote: "Educational meditation guidance only; adapt practice to your needs and seek support when appropriate.",
    terms: ["Meditation", "Sati", "Mindfulness"]
  },
  {
    section: "meditation",
    slug: "10-minute-meditation-practice",
    title: "10-Minute Meditation Practice",
    description:
      "A gentle ten-minute meditation practice for beginners with posture, breath awareness, returning, and safety boundaries.",
    eyebrow: "Meditation Practice",
    intro:
      "Ten minutes can give a beginner enough time to settle, wander, return, and end with one clear intention for the day.",
    sections: [
      {
        heading: "A Simple Ten-Minute Structure",
        paragraphs: [
          "Minutes one and two: settle posture and feel the body. Minutes three through seven: rest attention with the natural breath, hands, feet, sounds, or another workable anchor, returning whenever the mind wanders. Minutes eight and nine: widen awareness to sounds, body, and mood. Minute ten: choose one kind or careful intention.",
          "Use a timer if it helps. The point is not to produce calm. The point is to practice returning with patience."
        ]
      },
      {
        heading: "When the Mind Wanders",
        paragraphs: [
          "Wandering is expected. Each return is part of the practice, not an interruption. If the breath feels uncomfortable, use the hands, feet, sounds, or posture as the anchor.",
          "If ten minutes is too much today, use the <a href='/meditation/5-minute-meditation-practice/'>5-minute meditation practice</a> instead, or sit for one minute and stop while practice still feels workable."
        ]
      },
      {
        heading: "Safety Note",
        paragraphs: [
          "If meditation feels overwhelming, open the eyes, feel the feet, shorten the session, change anchors, or stop. This practice is educational and does not diagnose, treat, cure, or guarantee any outcome."
        ]
      }
    ],
    takeaway: "A ten-minute practice trains patient returning without making calm into a demand.",
    practice: "Try one ten-minute session this week, then adjust the length honestly.",
    relatedLinks: [
      { label: "5-Minute Meditation", href: "/meditation/5-minute-meditation-practice/" },
      { label: "Meditation Posture", href: "/meditation/meditation-posture-for-beginners/" },
      { label: "Breathing Meditation", href: "/meditation/breathing-meditation/" }
    ],
    sourceNote:
      "Educational meditation guidance only. Adapt the practice to your body and circumstances, and seek qualified support for serious or persistent distress.",
    terms: ["Meditation", "Sati", "Mindfulness"]
  },
  {
    section: "meditation",
    slug: "meditation-posture-for-beginners",
    title: "Meditation Posture for Beginners",
    description:
      "Learn beginner meditation posture options for sitting on a chair or cushion with steadiness, comfort, and accessibility.",
    eyebrow: "Meditation Practice",
    intro:
      "Meditation posture should support awareness without turning the body into a performance. Stable, upright, and workable is enough.",
    sections: [
      {
        heading: "A Workable Posture",
        paragraphs: [
          "Sit on a chair, cushion, bench, folded blanket, or any stable support that works for your body. Standing, lying down, or using a mobility aid can also be appropriate when sitting is not workable. Let the body be upright where possible but not rigid. Let the hands rest. Let the eyes close or soften if that feels safe.",
          "A good posture is one you can inhabit without fighting the body. Accessibility matters more than looking traditional, and no single posture proves spiritual seriousness."
        ]
      },
      {
        heading: "Chair and Cushion Options",
        paragraphs: [
          "On a chair, place both feet on the floor if possible and sit forward enough that the back supports itself gently. On a cushion, let the knees and hips find a stable base. Adjust height if the knees or back strain.",
          "If pain, numbness, dizziness, breathing difficulty, panic, or overwhelm appears, change posture, open the eyes, stand, walk, or stop. Do not endure pain to prove discipline; this page is not medical, ergonomic, or physiotherapy advice."
        ]
      },
      {
        heading: "Common Misunderstanding",
        paragraphs: [
          "Posture is not proof of spiritual seriousness. A person sitting in a chair with honest awareness is practicing more truly than a person forcing a beautiful posture with resentment.",
          "Use posture as a support for mindfulness, not as another way to judge yourself."
        ]
      }
    ],
    takeaway: "Meditation posture should be stable, accessible, and kind enough to support awareness.",
    practice: "Before your next sit, adjust one thing so the body feels supported rather than forced.",
    relatedLinks: [
      { label: "Meditation for Beginners", href: "/meditation/meditation-for-beginners/" },
      { label: "10-Minute Meditation", href: "/meditation/10-minute-meditation-practice/" },
      { label: "Meditation Safety", href: "/meditation-safety/" }
    ],
    sourceNote:
      "Educational posture guidance only; it is not medical or ergonomic advice. Adapt for your body and seek qualified support when needed.",
    terms: ["Meditation", "Mindfulness", "Sati"]
  },
  {
    section: "meditation",
    slug: "when-meditation-feels-hard",
    title: "What to Do When Meditation Feels Hard",
    description:
      "Gentle guidance for beginners when meditation feels restless, dull, discouraging, emotional, or overwhelming.",
    eyebrow: "Meditation Practice",
    intro:
      "Meditation sometimes feels hard. That does not mean you are failing; it means practice is meeting real conditions.",
    sections: [
      {
        heading: "Name What Is Happening",
        paragraphs: [
          "Hard practice may include restlessness, sleepiness, doubt, irritation, sadness, boredom, or pressure to get it right. Begin by naming the experience gently: restless, tired, doubtful, tight, sad, or trying too hard.",
          "Naming is not a diagnosis. It is a way to stop being completely swallowed by the state. Ordinary distraction is different from intense distress, dissociation, traumatic re-experiencing, or feeling unsafe."
        ]
      },
      {
        heading: "Adjust the Practice",
        paragraphs: [
          "Shorten the session. Open the eyes. Feel the feet or hands. Use sounds instead of breath. Stand or walk slowly. Return to one simple phrase such as, \"This is hard, and I can be gentle.\"",
          "If breath focus feels uncomfortable, do not force it. A different anchor can still support mindfulness."
        ]
      },
      {
        heading: "When to Stop or Seek Support",
        paragraphs: [
          "If practice feels overwhelming, unsafe, dissociative, or connected with intense distress, stop and ground in ordinary surroundings. Look around the room, touch a stable object, contact a trusted person, or seek qualified support. Meditation can be helpful for many people, but it is not right for every person in every moment.",
          "Meditation is not a replacement for medical or mental health care. The wisest practice is sometimes to stop."
        ]
      }
    ],
    takeaway: "Hard meditation can be met by naming, shortening, grounding, changing anchors, stopping, or seeking support.",
    practice: "Choose one kind adjustment before the next session begins, not after frustration has already taken over.",
    relatedLinks: [
      { label: "Meditation Safety", href: "/meditation-safety/" },
      { label: "Five Hindrances", href: "/learn/buddhism-101/five-hindrances-in-buddhism/" },
      { label: "5-Minute Meditation", href: "/meditation/5-minute-meditation-practice/" }
    ],
    sourceNote:
      "Educational meditation guidance only. This page does not diagnose, treat, cure, guarantee calm, or replace qualified support.",
    terms: ["Meditation", "Mindfulness", "Sati"]
  }
];

export const allMeditationPages = [...meditationGuidePages, ...shortMeditationPages];

export function getLearningSection(slug: string) {
  return learningSections.find((section) => section.slug === slug);
}

export function getLearningPage(section: string, slug: string) {
  return learningSections.flatMap((item) => item.items).find((page) => page.section === section && page.slug === slug);
}

export function getAllLearningPages() {
  return learningSections.flatMap((section) => section.items);
}

export function getLearningQualityNote(page: LearningPage) {
  return learningQualityNotes[`${page.section}/${page.slug}`];
}

export function getSourceLinks(page: LearningPage) {
  return sourceLinksByPage[`${page.section}/${page.slug}`] ?? [];
}

export function getTermLinks(terms: string[] = []): TermLink[] {
  return terms.map((term) => {
    const dictionaryPage = dictionaryPages.find((page) => page.title.toLowerCase() === term.toLowerCase());

    return {
      label: term,
      href: dictionaryPage ? `/learn/buddhist-dictionary/${dictionaryPage.slug}/` : undefined
    };
  });
}

export function getLearningBreadcrumbs(page: LearningPage) {
  const section = getLearningSection(page.section);

  return [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn/" },
    { name: section?.title ?? "Learning", href: section?.href ?? "/learn/" },
    { name: page.title, href: `/learn/${page.section}/${page.slug}/` }
  ];
}

export function getBreadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.href, SITE.url).toString()
    }))
  };
}
