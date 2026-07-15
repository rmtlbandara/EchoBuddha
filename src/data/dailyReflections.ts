export type DailyReflection = {
  slug: string;
  title: string;
  reflection: string;
  meaning: string;
  practice: string;
  journalQuestion: string;
  relatedIdea: string;
  relatedLinks: {
    label: string;
    href: string;
  }[];
};

export type DailyReflectionQuoteLink = {
  label: string;
  href: string;
};

export type DailyReflectionDetails = {
  form: string;
  centralObservation: string;
  dailyLifeSituation: string;
  nextStep: string;
  wellbeingNote?: string;
};

const coreLinks = {
  mindfulness: { label: "Mindfulness", href: "/learn/buddhism-101/what-is-mindfulness/" },
  meditation: { label: "Meditation for Beginners", href: "/meditation/meditation-for-beginners/" },
  compassion: { label: "Compassion", href: "/learn/buddhist-dictionary/compassion/" },
  impermanence: { label: "Impermanence", href: "/learn/buddhism-101/what-is-impermanence/" },
  eightfoldPath: { label: "Noble Eightfold Path", href: "/learn/eightfold-path/" },
  fourNobleTruths: { label: "Four Noble Truths", href: "/learn/four-noble-truths/" },
  lettingGo: { label: "Letting Go", href: "/articles/how-to-let-go-of-attachment-in-buddhism/" },
  rightSpeech: { label: "Right Speech", href: "/articles/right-speech-buddhism/" }
};

const quoteLinksByIdea: Record<string, DailyReflectionQuoteLink[]> = {
  mindfulness: [
    { label: "Mindfulness quotes", href: "/quotes/mindfulness/" },
    { label: "Awareness quotes", href: "/quotes/awareness/" }
  ],
  meditation: [
    { label: "Meditation quotes", href: "/quotes/meditation/" },
    { label: "Practice quotes", href: "/quotes/practice/" }
  ],
  compassion: [
    { label: "Compassion quotes", href: "/quotes/compassion/" },
    { label: "Wisdom quotes", href: "/quotes/wisdom/" }
  ],
  impermanence: [
    { label: "Impermanence quotes", href: "/quotes/impermanence/" },
    { label: "Letting go quotes", href: "/quotes/letting-go/" }
  ],
  patience: [
    { label: "Patience quotes", href: "/quotes/patience/" },
    { label: "Awareness quotes", href: "/quotes/awareness/" }
  ],
  practice: [
    { label: "Practice quotes", href: "/quotes/practice/" },
    { label: "Wisdom quotes", href: "/quotes/wisdom/" }
  ],
  renewal: [
    { label: "Renewal quotes", href: "/quotes/renewal/" },
    { label: "Practice quotes", href: "/quotes/practice/" }
  ],
  wisdom: [
    { label: "Wisdom quotes", href: "/quotes/wisdom/" },
    { label: "Practice quotes", href: "/quotes/practice/" }
  ]
};

const reflectionDetailsBySlug: Record<string, DailyReflectionDetails> = {
  "patience-before-anger-speaks": {
    form: "ethical decision",
    centralObservation: "Anger becomes less dangerous when it is noticed before it becomes speech.",
    dailyLifeSituation: "A message lands badly, the face tightens, and the first reply wants to win more than understand.",
    nextStep: "Delay one reply until the body has softened enough for honesty to stay useful.",
    wellbeingNote: "This reflection invites non-harm; it does not ask anyone to stay silent in unsafe situations."
  },
  "one-honest-breath": {
    form: "short contemplative exercise",
    centralObservation: "A single natural breath can restart attention without demanding a peaceful mood.",
    dailyLifeSituation: "The day has become scattered before anything dramatic has happened.",
    nextStep: "Pick one doorway, sink, desk, or cushion as the place to take one complete breath."
  },
  "kindness-with-boundaries": {
    form: "relationship practice",
    centralObservation: "Kindness becomes steadier when it includes honest limits.",
    dailyLifeSituation: "Someone asks for more than you can offer without resentment or depletion.",
    nextStep: "Say one clear limit without adding a courtroom speech around it."
  },
  "impermanence-softens-clinging": {
    form: "observation",
    centralObservation: "Remembering change can make attention warmer instead of colder.",
    dailyLifeSituation: "A pleasant moment, plan, or mood starts to shift and the mind quietly reaches to hold it.",
    nextStep: "Let one changing thing be fully noticed before trying to keep it."
  },
  "listen-before-answering": {
    form: "relationship practice",
    centralObservation: "Listening can become right speech before words begin.",
    dailyLifeSituation: "A familiar person starts a familiar sentence and the answer forms too early.",
    nextStep: "Ask one clarifying question before giving advice or defense."
  },
  "small-actions-shape-the-mind": {
    form: "ethical decision",
    centralObservation: "Repeated small intentions quietly become the climate of the mind.",
    dailyLifeSituation: "A tiny choice appears: tell the truth, cut a corner, complain, help, delay, or repair.",
    nextStep: "Choose the smallest wholesome action that can be repeated tomorrow."
  },
  "let-the-feeling-pass": {
    form: "mindful activity",
    centralObservation: "A feeling can be honored without being promoted into identity.",
    dailyLifeSituation: "A mood arrives strongly and begins explaining who you are or what must happen next.",
    nextStep: "Notice one body sensation connected with the feeling and let the story wait.",
    wellbeingNote: "If a feeling is intense or persistent, this page is not a substitute for professional support."
  },
  "begin-again-without-shame": {
    form: "one-sentence reminder plus practice",
    centralObservation: "Returning is part of practice, not evidence that practice failed.",
    dailyLifeSituation: "A helpful habit was missed and shame tries to make the missed day the whole story.",
    nextStep: "Resume the habit once, quietly, without making identity out of the interruption."
  },
  "notice-before-fixing": {
    form: "question-led reflection",
    centralObservation: "Clear seeing often finds the real need before the fixing impulse does.",
    dailyLifeSituation: "Discomfort appears and the mind rushes to improve, explain, distract, or control.",
    nextStep: "Name what is happening before choosing whether anything needs to be changed."
  },
  "compassion-begins-nearby": {
    form: "relationship practice",
    centralObservation: "Compassion weakens when the person practicing it is excluded from care.",
    dailyLifeSituation: "Someone needs kindness, but the inner voice is speaking to you with contempt.",
    nextStep: "Offer goodwill in two directions: toward yourself and toward one other person."
  },
  "one-step-on-the-path": {
    form: "ethical decision",
    centralObservation: "The path becomes real through the next ordinary choice.",
    dailyLifeSituation: "A teaching feels inspiring but the next task is an email, chore, commute, or apology.",
    nextStep: "Let one path factor guide the next visible action."
  },
  "gratitude-notices-enough": {
    form: "observation",
    centralObservation: "Gratitude interrupts the mind's habit of stepping over enough.",
    dailyLifeSituation: "Something supportive is present but nearly invisible because attention is already reaching ahead.",
    nextStep: "Name one support while it is still serving you."
  },
  "anger-as-a-signal": {
    form: "ethical decision",
    centralObservation: "Anger can reveal a need without being allowed to steer the whole body.",
    dailyLifeSituation: "Irritation rises quickly and asks for speed, certainty, and a target.",
    nextStep: "Ask what anger is protecting before deciding what to say.",
    wellbeingNote: "This reflection does not ask for suppression; it asks for safer expression."
  },
  "letting-go-keeps-care": {
    form: "contemplative exercise",
    centralObservation: "Letting go can release control while preserving sincere effort.",
    dailyLifeSituation: "A result matters, but checking, replaying, and tightening no longer improve the work.",
    nextStep: "Separate the action still available from the outcome that cannot be forced."
  },
  "soften-the-inner-argument": {
    form: "question-led reflection",
    centralObservation: "Arguing with what already happened often adds a second burden.",
    dailyLifeSituation: "The mind keeps reopening a closed door and calling it problem-solving.",
    nextStep: "Name one fact, then choose one next step that belongs to the present."
  },
  "metta-for-a-difficult-person": {
    form: "relationship practice",
    centralObservation: "Goodwill can remain honest when it is not confused with approval.",
    dailyLifeSituation: "A difficult person comes to mind and the heart tightens around old harm or fear.",
    nextStep: "Offer a boundaried wish for safety and freedom from hatred.",
    wellbeingNote: "Do not use loving-kindness practice to override needed protection or boundaries."
  },
  "thoughts-are-visitors": {
    form: "short contemplative exercise",
    centralObservation: "A thought can be noticed without being obeyed as an order.",
    dailyLifeSituation: "A repeated thought arrives with the voice of certainty and starts narrowing the day.",
    nextStep: "Label it as thinking, then return to one external sound or simple task.",
    wellbeingNote: "Persistent distress is not a personal failure; seek qualified support when needed."
  },
  "speech-can-reduce-suffering": {
    form: "ethical decision",
    centralObservation: "Truth becomes more useful when timing and care are included.",
    dailyLifeSituation: "A sentence is accurate but could still land as punishment.",
    nextStep: "Revise one message so it is honest, necessary, and less likely to spread harm."
  },
  "walking-as-practice": {
    form: "mindful activity",
    centralObservation: "Walking can train presence without needing a special setting.",
    dailyLifeSituation: "You cross a room, sidewalk, or car park while the mind is already somewhere else.",
    nextStep: "Feel ten steps without turning the walk into a performance."
  },
  "see-the-conditions": {
    form: "observation",
    centralObservation: "Seeing conditions can soften blame and reveal leverage.",
    dailyLifeSituation: "A habit appears sudden until sleep, stress, hunger, company, or setting is included.",
    nextStep: "Change one condition around the habit rather than only scolding the habit."
  },
  "morning-intention": {
    form: "morning intention",
    centralObservation: "The day is shaped by what receives attention first.",
    dailyLifeSituation: "The phone, inbox, or news wants to set the tone before intention has spoken.",
    nextStep: "Choose one intention for speech before opening the first feed or thread."
  },
  "rest-without-escape": {
    form: "evening review",
    centralObservation: "Rest can support wise effort when it is not used to disappear from life.",
    dailyLifeSituation: "Tiredness is real, but the next input may not be the same as restoration.",
    nextStep: "Take a quiet pause that has a clear beginning and end.",
    wellbeingNote: "Rest is not laziness; ongoing exhaustion may need practical or professional support."
  },
  "forgiveness-without-approval": {
    form: "question-led reflection",
    centralObservation: "Release does not require pretending harm was harmless.",
    dailyLifeSituation: "A memory keeps replaying and each replay tightens the body again.",
    nextStep: "Ask what protection, truth, or repair is still needed before asking yourself to release."
  },
  "enough-for-this-moment": {
    form: "one-sentence reminder plus practice",
    centralObservation: "Mindfulness asks for honesty, not a perfect inner state.",
    dailyLifeSituation: "A normal task becomes heavy because it is being measured against an impossible version of calm.",
    nextStep: "Let one task be complete enough while you are doing it."
  },
  "the-first-truth-is-kind": {
    form: "observation",
    centralObservation: "Naming suffering can be compassionate when it ends denial and blame.",
    dailyLifeSituation: "Something hurts, and the mind is busy proving that it should not hurt.",
    nextStep: "State the difficulty plainly without adding a verdict about yourself."
  },
  "mindful-work": {
    form: "ethical decision",
    centralObservation: "Work becomes practice when values become visible in small choices.",
    dailyLifeSituation: "A deadline, customer, colleague, or task invites speed at the expense of care.",
    nextStep: "Make one work action more honest, more careful, or less rushed."
  },
  "family-patience": {
    form: "relationship practice",
    centralObservation: "Home is often where practice becomes least abstract.",
    dailyLifeSituation: "A repeated household irritation appears and the old script is ready.",
    nextStep: "Change one familiar line, tone, or timing before the pattern completes."
  },
  "simple-goodwill": {
    form: "mindful activity",
    centralObservation: "Goodwill becomes real through ordinary gestures that may never be noticed.",
    dailyLifeSituation: "A small chance to reduce friction appears and no one is keeping score.",
    nextStep: "Offer one useful kindness without explaining or collecting credit."
  },
  "evening-release": {
    form: "evening review",
    centralObservation: "Review can teach without becoming self-attack.",
    dailyLifeSituation: "The day is ending, but unfinished thoughts want to keep arranging a trial.",
    nextStep: "Write one helpful action, one lesson, and one thing that can wait until tomorrow.",
    wellbeingNote: "This reflection supports gentle review; it does not promise sleep."
  },
  "gratitude-for-change": {
    form: "observation",
    centralObservation: "Change can be unsettling and still become a condition for growth.",
    dailyLifeSituation: "A change that once felt only inconvenient now shows an unexpected support or lesson.",
    nextStep: "Name one change that made a wiser choice possible."
  }
};

export const dailyReflections: DailyReflection[] = [
  {
    slug: "patience-before-anger-speaks",
    title: "Patience Begins Before Anger Speaks",
    reflection: "Before anger becomes words, there is a small moment of awareness. In that moment, patience can begin.",
    meaning: "Buddhist practice often begins with noticing the mind before reacting. Patience is not weakness; it is the ability to pause before causing harm.",
    practice: "Before replying to something difficult, take one slow breath and notice what you are feeling.",
    journalQuestion: "Where can I practice one moment of patience today?",
    relatedIdea: "Patience",
    relatedLinks: [coreLinks.rightSpeech, coreLinks.mindfulness]
  },
  {
    slug: "one-honest-breath",
    title: "Return Through One Honest Breath",
    reflection: "The breath does not ask you to be perfect. It simply offers a place to begin again.",
    meaning: "Mindfulness grows through returning. Each breath can become a quiet reminder that attention can be trained gently.",
    practice: "Pause three times today and follow one natural breath from beginning to end.",
    journalQuestion: "What changed when I gave one breath my full attention?",
    relatedIdea: "Mindfulness of breathing",
    relatedLinks: [coreLinks.meditation, coreLinks.mindfulness]
  },
  {
    slug: "kindness-with-boundaries",
    title: "Kindness Can Have Boundaries",
    reflection: "A kind heart does not need to say yes to everything. Clear boundaries can protect compassion from exhaustion.",
    meaning: "Compassion is not people-pleasing. Buddhist-inspired practice asks for care that is honest, wise, and non-harming.",
    practice: "Choose one place where a gentle but clear no would reduce harm.",
    journalQuestion: "Where can kindness include clarity today?",
    relatedIdea: "Compassion",
    relatedLinks: [coreLinks.compassion, coreLinks.eightfoldPath]
  },
  {
    slug: "impermanence-softens-clinging",
    title: "Impermanence Softens Clinging",
    reflection: "Because this moment will change, meet it carefully while it is here.",
    meaning: "Impermanence is not meant to make life cold. It can make attention warmer because we remember that nothing can be possessed forever.",
    practice: "Notice one pleasant thing today without trying to hold it longer than it lasts.",
    journalQuestion: "What am I trying to keep unchanged?",
    relatedIdea: "Anicca",
    relatedLinks: [coreLinks.impermanence, coreLinks.lettingGo]
  },
  {
    slug: "listen-before-answering",
    title: "Listen Before Answering",
    reflection: "Many conversations soften when listening becomes more important than winning.",
    meaning: "Right speech begins before speech. It begins with the intention to understand, reduce harm, and speak truthfully.",
    practice: "In one conversation, let the other person finish before forming your response.",
    journalQuestion: "What did I hear when I stopped preparing my reply?",
    relatedIdea: "Right Speech",
    relatedLinks: [coreLinks.rightSpeech, coreLinks.eightfoldPath]
  },
  {
    slug: "small-actions-shape-the-mind",
    title: "Small Actions Shape the Mind",
    reflection: "A life is shaped not only by large decisions, but by the small intentions repeated every day.",
    meaning: "Karma can be understood as intentional action. Repeated choices become habits, and habits influence how the mind meets life.",
    practice: "Choose one small wholesome action and repeat it deliberately today.",
    journalQuestion: "What intention did I strengthen today?",
    relatedIdea: "Karma",
    relatedLinks: [{ label: "Karma", href: "/learn/buddhist-dictionary/karma/" }, coreLinks.eightfoldPath]
  },
  {
    slug: "let-the-feeling-pass",
    title: "Let the Feeling Pass Through",
    reflection: "A feeling can be real without becoming the whole story.",
    meaning: "Mindfulness helps us observe changing mental states. Seeing a feeling clearly can reduce the urge to obey it immediately.",
    practice: "Name one difficult feeling quietly: feeling, feeling. Then notice where it is felt in the body.",
    journalQuestion: "What feeling did I notice without building a story around it?",
    relatedIdea: "Awareness",
    relatedLinks: [coreLinks.mindfulness, coreLinks.impermanence]
  },
  {
    slug: "begin-again-without-shame",
    title: "Begin Again Without Shame",
    reflection: "The path welcomes your return more often than pride wants to admit.",
    meaning: "Practice is not a performance. Returning after forgetting is part of mindfulness, meditation, and ethical growth.",
    practice: "Restart one helpful habit today without making a speech to yourself about failure.",
    journalQuestion: "Where can I begin again more gently?",
    relatedIdea: "Renewal",
    relatedLinks: [coreLinks.meditation, { label: "Daily Practice", href: "/learn/buddhism-101/a-simple-daily-buddhist-practice/" }]
  },
  {
    slug: "notice-before-fixing",
    title: "Notice Before Fixing",
    reflection: "Sometimes the kindest first step is not to fix the moment, but to understand it.",
    meaning: "Mindfulness begins with honest seeing. Clear attention can reveal what is actually needed before habit rushes in.",
    practice: "When discomfort appears, ask: what is happening right now?",
    journalQuestion: "What became clearer when I paused before fixing?",
    relatedIdea: "Sati",
    relatedLinks: [{ label: "Sati", href: "/learn/buddhist-dictionary/sati/" }, coreLinks.mindfulness]
  },
  {
    slug: "compassion-begins-nearby",
    title: "Compassion Begins Nearby",
    reflection: "The person in front of you is not the only one who needs compassion. The person within you does too.",
    meaning: "Compassion includes wise care for oneself and others. It sees suffering clearly without turning it into blame.",
    practice: "Offer one sentence of goodwill to yourself and one to someone else.",
    journalQuestion: "Where did compassion feel possible today?",
    relatedIdea: "Karuna",
    relatedLinks: [coreLinks.compassion, { label: "Karuna", href: "/learn/buddhist-dictionary/karuna/" }]
  },
  {
    slug: "one-step-on-the-path",
    title: "The Path Is One Step",
    reflection: "The path is not far away. It is the next honest word, the next careful breath, the next kind choice.",
    meaning: "The Noble Eightfold Path becomes real through ordinary decisions. Practice is lived in speech, work, attention, and effort.",
    practice: "Choose one path factor to guide one decision today.",
    journalQuestion: "Which part of the path met my real life today?",
    relatedIdea: "Noble Eightfold Path",
    relatedLinks: [coreLinks.eightfoldPath, { label: "Daily Practice", href: "/learn/buddhism-101/how-to-practice-buddhism-at-home/" }]
  },
  {
    slug: "gratitude-notices-enough",
    title: "Gratitude Notices Enough",
    reflection: "Contentment often begins when attention stops searching past what is already here.",
    meaning: "Buddhist practice invites us to see craving clearly. Gratitude can loosen the habit of always reaching for the next thing.",
    practice: "Name three ordinary supports you received today.",
    journalQuestion: "What was enough for one quiet moment?",
    relatedIdea: "Contentment",
    relatedLinks: [{ label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" }, coreLinks.fourNobleTruths]
  },
  {
    slug: "anger-as-a-signal",
    title: "Anger Can Become a Signal",
    reflection: "Anger asks for speed. Awareness asks for one more breath.",
    meaning: "Anger is a human experience, but Buddhist practice asks us to meet it without letting it harm speech and action.",
    practice: "When irritation appears, feel your feet before speaking.",
    journalQuestion: "What was anger trying to protect or express?",
    relatedIdea: "Awareness",
    relatedLinks: [{ label: "Buddhist Approach to Anger", href: "/articles/buddhist-approach-to-anger/" }, coreLinks.rightSpeech]
  },
  {
    slug: "letting-go-keeps-care",
    title: "Letting Go Keeps the Care",
    reflection: "Release the outcome, but keep the care you bring to the work.",
    meaning: "Letting go is not indifference. It means acting sincerely without demanding that life obey every preference.",
    practice: "Do one task carefully, then let the result be unfinished for a while.",
    journalQuestion: "What outcome am I gripping too tightly?",
    relatedIdea: "Non-attachment",
    relatedLinks: [coreLinks.lettingGo, { label: "Non-Attachment", href: "/articles/how-to-practice-non-attachment/" }]
  },
  {
    slug: "soften-the-inner-argument",
    title: "Soften the Inner Argument",
    reflection: "Peace often begins when the mind stops arguing with what has already happened.",
    meaning: "Acceptance is not approval. It is the clear seeing that allows a wiser next step.",
    practice: "Name one fact you can accept today, then choose one helpful next action.",
    journalQuestion: "Where is resistance adding extra weight?",
    relatedIdea: "Acceptance",
    relatedLinks: [coreLinks.fourNobleTruths, coreLinks.mindfulness]
  },
  {
    slug: "metta-for-a-difficult-person",
    title: "Metta Without Pretending",
    reflection: "Goodwill does not require pretending harm was harmless.",
    meaning: "Loving-kindness can be warm and boundaried. It wishes freedom from suffering without approving unskillful behavior.",
    practice: "Offer a quiet wish: may I be safe; may others be free from hatred.",
    journalQuestion: "How can goodwill remain honest here?",
    relatedIdea: "Metta",
    relatedLinks: [{ label: "Metta", href: "/learn/buddhist-dictionary/metta/" }, { label: "Loving-Kindness Meditation", href: "/meditation/loving-kindness-meditation/" }]
  },
  {
    slug: "thoughts-are-visitors",
    title: "Thoughts Are Visitors",
    reflection: "You do not need to carry every thought that visits you.",
    meaning: "Meditation helps us see thoughts as changing events. A thought can be noticed without being treated as command or identity.",
    practice: "When a repeated thought appears, say quietly: thinking is here.",
    journalQuestion: "Which thought lost some power when I observed it?",
    relatedIdea: "Mindfulness",
    relatedLinks: [coreLinks.mindfulness, { label: "Overthinking", href: "/articles/buddhist-wisdom-for-overthinking/" }]
  },
  {
    slug: "speech-can-reduce-suffering",
    title: "Speech Can Reduce Suffering",
    reflection: "A truthful sentence can still choose gentleness.",
    meaning: "Right speech asks whether words are true, useful, timely, and kind. This is daily Buddhist practice in a very practical form.",
    practice: "Before one message, check whether it is both honest and helpful.",
    journalQuestion: "Which words today reduced harm?",
    relatedIdea: "Right Speech",
    relatedLinks: [coreLinks.rightSpeech, coreLinks.eightfoldPath]
  },
  {
    slug: "walking-as-practice",
    title: "Walking Can Be Practice",
    reflection: "Walk slowly enough to notice that the ground has been supporting you all along.",
    meaning: "Mindfulness does not belong only to a cushion. Ordinary movement can become a training in presence.",
    practice: "Take ten steps today while feeling each foot touch the ground.",
    journalQuestion: "What did walking reveal when I stopped rushing?",
    relatedIdea: "Walking meditation",
    relatedLinks: [{ label: "Walking Meditation", href: "/meditation/walking-meditation/" }, coreLinks.meditation]
  },
  {
    slug: "see-the-conditions",
    title: "See the Conditions",
    reflection: "What appears suddenly often has roots you have not yet seen.",
    meaning: "Dependent origination points to causes and conditions. Seeing conditions can soften blame and reveal wiser choices.",
    practice: "Notice one condition that makes a habit easier or harder today.",
    journalQuestion: "What condition could I change with care?",
    relatedIdea: "Dependent Origination",
    relatedLinks: [{ label: "Dependent Origination", href: "/learn/buddhism-101/dependent-origination-explained/" }, coreLinks.fourNobleTruths]
  },
  {
    slug: "morning-intention",
    title: "Begin With Intention",
    reflection: "A day can begin before the phone begins speaking for it.",
    meaning: "Right intention turns attention toward non-harming, kindness, and clarity before habit takes over.",
    practice: "Before checking your phone, choose one intention for your speech today.",
    journalQuestion: "What intention shaped my morning?",
    relatedIdea: "Right Intention",
    relatedLinks: [coreLinks.eightfoldPath, { label: "Morning Mindfulness", href: "/articles/mindfulness-morning-routine/" }]
  },
  {
    slug: "rest-without-escape",
    title: "Rest Without Escape",
    reflection: "Rest can be a way of caring for practice, not a way of leaving it.",
    meaning: "Wise effort includes balance. Practice asks for sincerity, not force or spiritual pressure.",
    practice: "Take one quiet pause today without filling it with input.",
    journalQuestion: "What kind of rest actually helped me return?",
    relatedIdea: "Wise Effort",
    relatedLinks: [coreLinks.eightfoldPath, coreLinks.meditation]
  },
  {
    slug: "forgiveness-without-approval",
    title: "Forgiveness Is Not Approval",
    reflection: "You can release the need to replay harm without calling the harm acceptable.",
    meaning: "Letting go can reduce inner suffering while still allowing truth, boundaries, and protection.",
    practice: "Notice one memory you replay often, then soften one breath around the body.",
    journalQuestion: "What would release look like without pretending?",
    relatedIdea: "Forgiveness",
    relatedLinks: [{ label: "Buddhist Teachings on Forgiveness", href: "/articles/buddhist-teachings-on-forgiveness/" }, coreLinks.lettingGo]
  },
  {
    slug: "enough-for-this-moment",
    title: "Enough for This Moment",
    reflection: "The present moment asks for your attention, not your perfection.",
    meaning: "Mindfulness is not a demand to feel calm. It is the practice of honestly meeting what is here.",
    practice: "Let one ordinary task be enough while you are doing it.",
    journalQuestion: "Where did I stop demanding perfection?",
    relatedIdea: "Present moment",
    relatedLinks: [coreLinks.mindfulness, { label: "Daily Mindfulness Practice", href: "/articles/beginning-a-daily-mindfulness-practice/" }]
  },
  {
    slug: "the-first-truth-is-kind",
    title: "The First Truth Is Kind",
    reflection: "Naming suffering honestly can be the first act of compassion.",
    meaning: "The Four Noble Truths do not condemn life. They help us understand pain, craving, release, and a path of practice.",
    practice: "Name one difficulty without blaming yourself for having it.",
    journalQuestion: "What suffering became more workable when I named it clearly?",
    relatedIdea: "Four Noble Truths",
    relatedLinks: [coreLinks.fourNobleTruths, { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" }]
  },
  {
    slug: "mindful-work",
    title: "Work Can Carry Practice",
    reflection: "The way you earn, answer, decide, and repair can become part of the path.",
    meaning: "Right livelihood and mindful work invite honesty, care, and reduced harm in ordinary responsibilities.",
    practice: "Choose one work action that can be more honest or less rushed.",
    journalQuestion: "Where did my values become visible today?",
    relatedIdea: "Right Livelihood",
    relatedLinks: [{ label: "Right Livelihood", href: "/learn/buddhism-101/right-livelihood-buddhism/" }, coreLinks.eightfoldPath]
  },
  {
    slug: "family-patience",
    title: "Patience at Home",
    reflection: "The path is tested in the rooms where we are most easily impatient.",
    meaning: "Daily practice is not separate from family, chores, and repeated conversations. These are places where patience becomes real.",
    practice: "Let one familiar irritation be met with one slower breath.",
    journalQuestion: "Where did home practice ask for patience?",
    relatedIdea: "Home practice",
    relatedLinks: [{ label: "Practice Buddhism at Home", href: "/learn/buddhism-101/how-to-practice-buddhism-at-home/" }, coreLinks.mindfulness]
  },
  {
    slug: "simple-goodwill",
    title: "Simple Goodwill Counts",
    reflection: "Small kindnesses often reach places that advice cannot.",
    meaning: "Metta and compassion are trained through repeated, ordinary gestures. They do not need an audience to matter.",
    practice: "Offer one small kindness without explaining it or seeking credit.",
    journalQuestion: "What quiet kindness did I practice today?",
    relatedIdea: "Metta",
    relatedLinks: [{ label: "Metta Meditation", href: "/articles/metta-meditation-script/" }, coreLinks.compassion]
  },
  {
    slug: "evening-release",
    title: "End the Day by Releasing",
    reflection: "You can review the day without asking it to become perfect.",
    meaning: "Evening reflection can support learning without self-attack. Wisdom grows when honesty and gentleness stay together.",
    practice: "Name one helpful action, one lesson, and one thing to release before sleep.",
    journalQuestion: "What can I learn from today and leave behind?",
    relatedIdea: "Reflection",
    relatedLinks: [coreLinks.mindfulness, { label: "Mindfulness for Sleep", href: "/articles/mindfulness-for-better-sleep/" }]
  },
  {
    slug: "gratitude-for-change",
    title: "Gratitude for Change",
    reflection: "Change takes nothing personally. It simply continues.",
    meaning: "Impermanence can feel unsettling, but it also means pain, confusion, and old habits are not fixed forever.",
    practice: "Notice one change that made growth possible.",
    journalQuestion: "What changed in a way I can now appreciate?",
    relatedIdea: "Impermanence",
    relatedLinks: [coreLinks.impermanence, { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" }]
  }
];

export function getDailyReflectionByIndex(index: number) {
  const normalizedIndex = ((index % dailyReflections.length) + dailyReflections.length) % dailyReflections.length;
  return dailyReflections[normalizedIndex];
}

export function getDailyReflectionPath(reflection: DailyReflection) {
  return `/daily-reflections/${reflection.slug}/`;
}

export function getDailyReflectionBySlug(slug: string) {
  return dailyReflections.find((reflection) => reflection.slug === slug);
}

export function getDailyReflectionDetails(reflection: DailyReflection) {
  return reflectionDetailsBySlug[reflection.slug];
}

export function getDailyReflectionForDate(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((today - start) / 86400000);
  return getDailyReflectionByIndex(dayOfYear - 1);
}

export function getDailyReflectionExample(reflection: DailyReflection) {
  const details = getDailyReflectionDetails(reflection);
  if (details) return details.dailyLifeSituation;

  const idea = reflection.relatedIdea.toLowerCase();

  if (idea.includes("speech") || idea.includes("patience") || idea.includes("anger")) {
    return "A difficult message arrives and the body wants to answer quickly. This reflection invites one breath before words, so the reply can be honest without adding harm.";
  }

  if (idea.includes("breath") || idea.includes("meditation") || idea.includes("walking")) {
    return "During a short pause, the mind keeps moving into plans and worries. This reflection brings attention back to one breath, one step, or one sensation already present.";
  }

  if (idea.includes("compassion") || idea.includes("karuna") || idea.includes("metta") || idea.includes("goodwill")) {
    return "Someone is struggling, and advice is not the first thing needed. This reflection points toward a small act of care, a warmer tone, or a kind boundary.";
  }

  if (idea.includes("impermanence") || idea.includes("anicca") || idea.includes("letting") || idea.includes("attachment")) {
    return "A plan changes, a pleasant moment ends, or an old expectation loosens. This reflection helps you meet change with care instead of gripping more tightly.";
  }

  if (idea.includes("karma") || idea.includes("path") || idea.includes("intention") || idea.includes("livelihood")) {
    return "A small choice appears ordinary: what to say, what to repeat, what to ignore. This reflection treats that choice as part of practice because intention shapes habit.";
  }

  return "An ordinary moment becomes a place to practice: a conversation, a task, a feeling, or a pause between activities. This reflection asks for one clear and kind next step.";
}

export function getDailyReflectionQuoteLinks(reflection: DailyReflection) {
  const idea = reflection.relatedIdea.toLowerCase();

  if (idea.includes("patience") || idea.includes("speech") || idea.includes("anger") || idea.includes("home")) {
    return quoteLinksByIdea.patience;
  }

  if (idea.includes("breath") || idea.includes("meditation") || idea.includes("walking")) {
    return quoteLinksByIdea.meditation;
  }

  if (idea.includes("compassion") || idea.includes("karuna") || idea.includes("metta") || idea.includes("goodwill") || idea.includes("forgiveness")) {
    return quoteLinksByIdea.compassion;
  }

  if (idea.includes("impermanence") || idea.includes("anicca") || idea.includes("letting") || idea.includes("attachment") || idea.includes("change")) {
    return quoteLinksByIdea.impermanence;
  }

  if (idea.includes("renewal") || idea.includes("reflection")) {
    return quoteLinksByIdea.renewal;
  }

  if (idea.includes("mindfulness") || idea.includes("awareness") || idea.includes("sati") || idea.includes("present")) {
    return quoteLinksByIdea.mindfulness;
  }

  if (idea.includes("path") || idea.includes("karma") || idea.includes("intention") || idea.includes("practice") || idea.includes("effort") || idea.includes("livelihood")) {
    return quoteLinksByIdea.practice;
  }

  return quoteLinksByIdea.wisdom;
}
