import { SITE, getQuoteSlug, type Quote } from "./site";

export type EditorialReviewStatus =
  | "repository-reviewed"
  | "external-review-pending"
  | "owner-review-pending"
  | "no-change-required";

export type PageRole =
  | "cornerstone guide"
  | "beginner introduction"
  | "learning reference"
  | "dictionary definition"
  | "practical application"
  | "meditation instruction"
  | "source-study page"
  | "daily reflection"
  | "quote interpretation"
  | "topic hub"
  | "supporting article"
  | "trust page";

export type TopicRole = {
  cluster: string;
  href: string;
  role: PageRole;
  primary: boolean;
  publicSummary: string;
  reviewStatus: EditorialReviewStatus;
};

export type QuoteOriginRecord = {
  quoteId: string;
  quoteText: string;
  publicUrl: string;
  originClassification: "Original Echo Buddha writing";
  attributedAuthor: string;
  primarySource: string;
  secondaryVerificationSource: string;
  canonicalTextReference: string;
  translator: string;
  translationEdition: string;
  copyrightOrLicenseStatus: string;
  attributionWording: string;
  verificationStatus: EditorialReviewStatus;
  reviewerStatus: string;
  indexingRecommendation: "keep-indexable" | "keep-noindex";
  editorialNotes: string;
};

export type AdSuitability = {
  pageType: string;
  classification:
    | "Suitable with normal placement"
    | "Suitable with restricted placement"
    | "Avoid ads inside main instructions"
    | "Avoid ads near safety notes"
    | "Not suitable for ads"
    | "Requires owner review";
  note: string;
};

export type SafetyChecklistItem = {
  key: string;
  label: string;
  requiredStandard: string;
};

export type SourceReference = {
  label: string;
  href: string;
  note: string;
};

export const REVIEWED_AT = "2026-07-21";

export const topicRoleMap: TopicRole[] = [
  {
    cluster: "Beginner Buddhism",
    href: "/learn/buddhism-for-beginners/",
    role: "topic hub",
    primary: true,
    publicSummary: "Use this hub as the starting route for beginners who need a learning sequence.",
    reviewStatus: "repository-reviewed"
  },
  {
    cluster: "Beginner Buddhism",
    href: "/articles/what-is-buddhism-beginner-guide/",
    role: "cornerstone guide",
    primary: false,
    publicSummary: "Use this article for a fuller plain-language explanation of Buddhism's basic shape.",
    reviewStatus: "repository-reviewed"
  },
  {
    cluster: "Four Noble Truths",
    href: "/learn/four-noble-truths/",
    role: "topic hub",
    primary: true,
    publicSummary: "Use this hub as the primary route into the Four Noble Truths cluster.",
    reviewStatus: "repository-reviewed"
  },
  {
    cluster: "Four Noble Truths",
    href: "/articles/four-noble-truths-explained/",
    role: "cornerstone guide",
    primary: false,
    publicSummary: "Use this article for fuller explanation and daily-life examples.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Four Noble Truths",
    href: "/articles/four-noble-truths-explained-simply/",
    role: "beginner introduction",
    primary: false,
    publicSummary: "Use this article for the shortest beginner-friendly explanation before deeper study.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Noble Eightfold Path",
    href: "/learn/eightfold-path/",
    role: "topic hub",
    primary: true,
    publicSummary: "Use this hub as the primary navigation page for the Eightfold Path cluster.",
    reviewStatus: "repository-reviewed"
  },
  {
    cluster: "Noble Eightfold Path",
    href: "/articles/eightfold-path-explained/",
    role: "cornerstone guide",
    primary: false,
    publicSummary: "Use this article for a detailed explanation of the path factors.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Noble Eightfold Path",
    href: "/articles/eightfold-path-explained-daily-life/",
    role: "practical application",
    primary: false,
    publicSummary: "Use this article for applied daily-life examples after the main path explanation.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Noble Eightfold Path",
    href: "/articles/noble-eightfold-path-practical-guide/",
    role: "practical application",
    primary: false,
    publicSummary: "Use this article as the most practice-oriented Eightfold Path checklist.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Noble Eightfold Path",
    href: "/learn/buddhism-101/the-noble-eightfold-path-explained/",
    role: "learning reference",
    primary: false,
    publicSummary: "Use this lesson as the structured learning-reference version.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Impermanence",
    href: "/learn/buddhism-101/what-is-impermanence/",
    role: "learning reference",
    primary: true,
    publicSummary: "Use this lesson as the primary beginner reference for anicca.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Impermanence",
    href: "/articles/impermanence-in-buddhism/",
    role: "practical application",
    primary: false,
    publicSummary: "Use this article for applied reflection on accepting change.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Impermanence",
    href: "/articles/buddhist-teachings-on-impermanence/",
    role: "source-study page",
    primary: false,
    publicSummary: "Use this article for a teaching-focused explanation of anicca and change.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Impermanence",
    href: "/articles/impermanence-in-buddhism-letting-go/",
    role: "supporting article",
    primary: false,
    publicSummary: "Use this article for the letting-go application of impermanence.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/meditation/loving-kindness-meditation/",
    role: "meditation instruction",
    primary: true,
    publicSummary: "Use this page as the practice-instruction route for mettā meditation.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/learn/buddhist-dictionary/metta/",
    role: "dictionary definition",
    primary: false,
    publicSummary: "Use this page for the term meaning, scope, and related references.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/articles/loving-kindness-meditation-guide/",
    role: "practical application",
    primary: false,
    publicSummary: "Use this article for a guided explanation of loving-kindness practice.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/articles/loving-kindness-meditation-beginners/",
    role: "beginner introduction",
    primary: false,
    publicSummary: "Use this article as the gentlest beginner entry into metta practice.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/articles/metta-meditation-script/",
    role: "meditation instruction",
    primary: false,
    publicSummary: "Use this page as a script-style practice support, not the main metta explainer.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/learn/buddhist-dictionary/karuna/",
    role: "dictionary definition",
    primary: false,
    publicSummary: "Use this page for the Pali compassion term and related practice context.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/articles/compassion-in-buddhism-beginner-guide/",
    role: "beginner introduction",
    primary: false,
    publicSummary: "Use this article for compassion as a beginner Buddhist practice theme.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Loving-kindness and Metta",
    href: "/articles/compassion-as-a-daily-discipline/",
    role: "practical application",
    primary: false,
    publicSummary: "Use this article for daily discipline and ordinary-life compassion examples.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Mindfulness and Meditation",
    href: "/meditation/",
    role: "topic hub",
    primary: true,
    publicSummary: "Use this hub as the primary route for meditation practice choices.",
    reviewStatus: "repository-reviewed"
  },
  {
    cluster: "Mindfulness and Meditation",
    href: "/learn/buddhism-101/what-is-mindfulness/",
    role: "learning reference",
    primary: false,
    publicSummary: "Use this lesson for Buddhist mindfulness terminology and context.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Mindfulness and Meditation",
    href: "/articles/mindfulness-of-breathing-guide/",
    role: "meditation instruction",
    primary: false,
    publicSummary: "Use this article for breath-practice steps with safety context.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Mindfulness and Meditation",
    href: "/articles/mindfulness-vs-meditation/",
    role: "beginner introduction",
    primary: false,
    publicSummary: "Use this article for the comparison intent between mindfulness and meditation.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Mindfulness and Meditation",
    href: "/articles/how-to-meditate-for-beginners/",
    role: "beginner introduction",
    primary: false,
    publicSummary: "Use this article for first-session meditation guidance before deeper practice pages.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Mindfulness and Meditation",
    href: "/meditation/breathing-meditation/",
    role: "meditation instruction",
    primary: false,
    publicSummary: "Use this page for concise breathing-meditation instruction.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Mindfulness and Meditation",
    href: "/meditation/meditation-for-beginners/",
    role: "meditation instruction",
    primary: false,
    publicSummary: "Use this page for the meditation section's beginner practice route.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Right Speech",
    href: "/articles/right-speech-buddhism/",
    role: "practical application",
    primary: true,
    publicSummary: "Use this article as the main practical guide for speech in daily life.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Right Speech",
    href: "/learn/sutta-for-daily-life/right-speech-in-daily-life/",
    role: "source-study page",
    primary: false,
    publicSummary: "Use this learning page for sutta-context study and further references.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Right Livelihood",
    href: "/learn/buddhism-101/right-livelihood-buddhism/",
    role: "learning reference",
    primary: true,
    publicSummary: "Use this lesson as the main source-aware route for right livelihood.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Right Livelihood",
    href: "/articles/right-livelihood-modern-life/",
    role: "practical application",
    primary: false,
    publicSummary: "Use this article for modern work examples and applied ethical reflection.",
    reviewStatus: "external-review-pending"
  },
  {
    cluster: "Daily Reflections",
    href: "/daily-reflections/today/",
    role: "daily reflection",
    primary: false,
    publicSummary: "Use this as a no-change recurring-user utility page; archive pages remain permanent homes.",
    reviewStatus: "repository-reviewed"
  }
];

export const safetyReviewChecklist: SafetyChecklistItem[] = [
  {
    key: "diagnosis-claims",
    label: "Diagnosis claims",
    requiredStandard: "Do not diagnose or imply a reader has a condition."
  },
  {
    key: "treatment-claims",
    label: "Treatment claims",
    requiredStandard: "Do not present meditation or Buddhist practice as treatment or a cure."
  },
  {
    key: "guaranteed-outcomes",
    label: "Guaranteed outcomes",
    requiredStandard: "Avoid promises of calm, sleep, healing, relief, or spiritual progress."
  },
  {
    key: "breath-focus-discomfort",
    label: "Breath-focus discomfort",
    requiredStandard: "Offer permission to open the eyes, use grounding, shorten practice, or stop."
  },
  {
    key: "severe-distress",
    label: "Severe distress",
    requiredStandard: "Encourage qualified support when symptoms are serious, persistent, or unsafe."
  },
  {
    key: "boundaries-and-safety",
    label: "Boundaries and safety",
    requiredStandard: "Do not ask readers to override needed protection, boundaries, or practical help."
  },
  {
    key: "ad-placement",
    label: "Ad placement",
    requiredStandard: "Keep future ads away from practice steps, safety warnings, and sensitive distress content."
  }
];

export const adSuitabilityMatrix: AdSuitability[] = [
  {
    pageType: "homepage, hubs, and article indexes",
    classification: "Suitable with restricted placement",
    note: "Future ads should remain below core navigation and never obscure learning choices."
  },
  {
    pageType: "article detail",
    classification: "Suitable with restricted placement",
    note: "Review source and safety status before ads; avoid inserting ads inside sensitive explanations."
  },
  {
    pageType: "learning detail and dictionary",
    classification: "Suitable with restricted placement",
    note: "Ads should not interrupt source notes, definitions, or beginner learning flow."
  },
  {
    pageType: "meditation detail",
    classification: "Avoid ads inside main instructions",
    note: "Do not place ads inside practice steps or immediately beside safety notes."
  },
  {
    pageType: "quote story",
    classification: "Requires owner review",
    note: "Keep ads disabled until quote-origin and standalone-value review is complete."
  },
  {
    pageType: "daily reflection",
    classification: "Avoid ads near safety notes",
    note: "Avoid ads inside the reflection/practice flow; recurring utility pages should remain low-density."
  },
  {
    pageType: "search, 404, policy, privacy, terms, disclaimer",
    classification: "Not suitable for ads",
    note: "These pages are functional or trust pages and should not be monetized by default."
  }
];

export const authoritativeSourceReferences = [
  {
    sourceId: "google-helpful-content",
    title: "Google Search Central: Creating helpful, reliable, people-first content",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    sourceType: "Google Search guidance"
  },
  {
    sourceId: "adsense-site-readiness",
    title: "Google AdSense Help: Your site must be ready to show ads",
    url: "https://support.google.com/adsense/answer/7299563",
    sourceType: "Google AdSense guidance"
  },
  {
    sourceId: "publisher-policies",
    title: "Google Publisher Policies",
    url: "https://support.google.com/publisherpolicies/answer/10502938",
    sourceType: "Google Publisher policy"
  },
  {
    sourceId: "wcag-22",
    title: "WCAG 2.2",
    url: "https://www.w3.org/TR/WCAG22/",
    sourceType: "Accessibility standard"
  },
  {
    sourceId: "suttacentral-sn-56-11",
    title: "SuttaCentral: SN 56.11 Dhammacakkappavattana Sutta",
    url: "https://suttacentral.net/sn56.11",
    sourceType: "Primary Buddhist text reference"
  },
  {
    sourceId: "nccih-meditation",
    title: "NCCIH: Meditation and Mindfulness",
    url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
    sourceType: "Government health institution"
  },
  {
    sourceId: "nimh-anxiety",
    title: "NIMH: Anxiety Disorders",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    sourceType: "Government health institution"
  }
];

const commonHealthReferences: SourceReference[] = [
  {
    label: "NCCIH: Meditation and Mindfulness",
    href: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
    note: "Government health overview used for safety-aware meditation framing."
  }
];

const articleSourceReferences: Record<string, SourceReference[]> = {
  "/articles/what-is-buddhism-beginner-guide/": [
    {
      label: "SuttaCentral: SN 56.11",
      href: "https://suttacentral.net/sn56.11/en/sujato",
      note: "Primary-text reference for the Four Noble Truths as a central early Buddhist teaching."
    },
    {
      label: "Dhammatalks: SN 45.8",
      href: "https://www.dhammatalks.org/suttas/SN/SN45_8.html",
      note: "Primary-text reference for the Noble Eightfold Path."
    }
  ],
  "/articles/buddhism-for-beginners-simple-guide/": [
    {
      label: "SuttaCentral: SN 56.11",
      href: "https://suttacentral.net/sn56.11/en/sujato",
      note: "Reference for the beginner framing of dukkha, cessation, and practice."
    },
    {
      label: "Dhammatalks: SN 45.8",
      href: "https://www.dhammatalks.org/suttas/SN/SN45_8.html",
      note: "Reference for the path factors introduced on the page."
    }
  ],
  "/articles/four-noble-truths-explained/": [
    {
      label: "SuttaCentral: SN 56.11",
      href: "https://suttacentral.net/sn56.11/en/sujato",
      note: "Primary-text reference for the Four Noble Truths."
    },
    {
      label: "Access to Insight: SN 56.11",
      href: "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html",
      note: "Alternative translation/archive reference for comparison."
    }
  ],
  "/articles/four-noble-truths-explained-simply/": [
    {
      label: "SuttaCentral: SN 56.11",
      href: "https://suttacentral.net/sn56.11/en/sujato",
      note: "Primary-text reference for the teaching summarized in beginner language."
    }
  ],
  "/articles/eightfold-path-explained/": [
    {
      label: "Dhammatalks: SN 45.8",
      href: "https://www.dhammatalks.org/suttas/SN/SN45_8.html",
      note: "Primary-text reference for the eight path factors."
    }
  ],
  "/articles/eightfold-path-explained-daily-life/": [
    {
      label: "Dhammatalks: SN 45.8",
      href: "https://www.dhammatalks.org/suttas/SN/SN45_8.html",
      note: "Primary-text reference for the path factors applied in daily life."
    }
  ],
  "/articles/noble-eightfold-path-practical-guide/": [
    {
      label: "Dhammatalks: SN 45.8",
      href: "https://www.dhammatalks.org/suttas/SN/SN45_8.html",
      note: "Primary-text reference for the Noble Eightfold Path structure."
    }
  ],
  "/articles/buddhist-teachings-on-impermanence/": [
    {
      label: "Access to Insight: Dhammapada XX",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html",
      note: "Traditional reference for impermanence and the marks of existence."
    }
  ],
  "/articles/impermanence-in-buddhism/": [
    {
      label: "Access to Insight: Dhammapada XX",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html",
      note: "Traditional reference for impermanence as a Buddhist teaching."
    }
  ],
  "/articles/impermanence-in-buddhism-letting-go/": [
    {
      label: "Access to Insight: Dhammapada XX",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html",
      note: "Traditional reference for impermanence and release from clinging."
    }
  ],
  "/articles/mindfulness-of-breathing-guide/": [
    {
      label: "Access to Insight: MN 118",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Primary-text reference for mindfulness of breathing."
    },
    ...commonHealthReferences
  ],
  "/articles/how-to-meditate-for-beginners/": [
    {
      label: "Access to Insight: MN 118",
      href: "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html",
      note: "Primary-text reference for breath meditation context."
    },
    ...commonHealthReferences
  ],
  "/articles/how-to-meditate-for-anxiety/": commonHealthReferences,
  "/articles/mindfulness-for-better-sleep/": commonHealthReferences,
  "/articles/mindfulness-vs-meditation/": [
    {
      label: "Access to Insight: DN 22",
      href: "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html",
      note: "Traditional reference for mindfulness foundations."
    },
    ...commonHealthReferences
  ],
  "/articles/loving-kindness-meditation-guide/": [
    {
      label: "Access to Insight: Karaniya Metta Sutta",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for loving-kindness and goodwill practice."
    },
    ...commonHealthReferences
  ],
  "/articles/loving-kindness-meditation-beginners/": [
    {
      label: "Access to Insight: Karaniya Metta Sutta",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for mettā/goodwill practice."
    },
    ...commonHealthReferences
  ],
  "/articles/metta-meditation-script/": [
    {
      label: "Access to Insight: Karaniya Metta Sutta",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source used for broad metta context; page wording remains original."
    },
    ...commonHealthReferences
  ],
  "/articles/compassion-in-buddhism-beginner-guide/": [
    {
      label: "Access to Insight: Karaniya Metta Sutta",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for goodwill, non-harming, and care for beings."
    }
  ],
  "/articles/compassion-as-a-daily-discipline/": [
    {
      label: "Access to Insight: Karaniya Metta Sutta",
      href: "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html",
      note: "Traditional source for goodwill practice."
    }
  ],
  "/articles/right-speech-buddhism/": [
    {
      label: "Access to Insight: Right Speech overview",
      href: "https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-vaca/index.html",
      note: "Reference for right speech criteria in the path."
    }
  ],
  "/articles/buddhist-approach-to-anger/": [
    {
      label: "Access to Insight: Dhammapada I",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html",
      note: "Traditional reference for non-hatred and careful mental action."
    }
  ],
  "/articles/buddhist-teachings-on-forgiveness/": [
    {
      label: "Access to Insight: Dhammapada I",
      href: "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html",
      note: "Traditional reference for non-hatred; page avoids excusing harm."
    }
  ],
  "/articles/what-is-karma-in-buddhism/": [
    {
      label: "Access to Insight: Kalama Sutta",
      href: "https://www.accesstoinsight.org/tipitaka/an/an03/an03.065.than.html",
      note: "Reference for intention, action, and observable consequences."
    }
  ]
};

export function getTopicRole(href: string) {
  return topicRoleMap.find((item) => item.href === href);
}

export function getTopicRolesForCluster(cluster: string) {
  return topicRoleMap.filter((item) => item.cluster === cluster);
}

export function getQuoteOriginRecord(quote: Quote, canonicalPath?: string): QuoteOriginRecord {
  const storySlug = quote.story?.slug ?? getQuoteSlug(quote);
  const categorySlug = quote.theme.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const publicPath = canonicalPath ?? `/quotes/${categorySlug}/${storySlug}/`;
  const isIndexable = quote.story?.isIndexable ?? quote.isIndexable ?? true;

  return {
    quoteId: `${categorySlug}:${storySlug}`,
    quoteText: quote.text,
    publicUrl: `${SITE.url}${publicPath}`,
    originClassification: "Original Echo Buddha writing",
    attributedAuthor: "Echo Buddha Editorial",
    primarySource: "Echo Buddha original editorial record",
    secondaryVerificationSource: "Not applicable for current original-writing classification",
    canonicalTextReference: "Not a canonical quotation",
    translator: "Not applicable",
    translationEdition: "Not applicable",
    copyrightOrLicenseStatus: "Original site editorial copy; owner/legal review still required before external reuse.",
    attributionWording: "Original Echo Buddha reflection; not a Buddha quote or scripture translation.",
    verificationStatus: "repository-reviewed",
    reviewerStatus: "External Buddhist studies review not required for origin, but doctrine/context remains reviewable.",
    indexingRecommendation: isIndexable ? "keep-indexable" : "keep-noindex",
    editorialNotes:
      "Current repository data presents this as original Echo Buddha writing. Any future non-original attribution must be verified before publication."
  };
}

export function getSourceReferencesForRoute(href: string): SourceReference[] {
  return articleSourceReferences[href] ?? [];
}

export function getMeditationSafetyNotice() {
  return [
    "Meditation experiences vary. This page is educational and does not diagnose, treat, cure, or guarantee sleep, calm, or relief.",
    "If breath focus, stillness, or a difficult emotion feels overwhelming, open your eyes, feel the feet or hands, shorten the session, change anchors, or stop.",
    "For serious, persistent, or unsafe distress, seek qualified professional support rather than relying on a website practice."
  ];
}
