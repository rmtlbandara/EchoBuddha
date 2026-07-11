import type { APIRoute } from "astro";
import {
  allMeditationPages,
  getAllLearningPages,
  questionsAboutBuddhism,
  resourceGroups
} from "../data/learn";
import {
  fullArticles,
  getQuoteStoryPath,
  getQuoteStory,
  quotes
} from "../data/site";
import {
  dailyReflections,
  getDailyReflectionExample,
  getDailyReflectionPath,
  getDailyReflectionQuoteLinks
} from "../data/dailyReflections";

type SearchIndexItem = {
  title: string;
  url: string;
  type: string;
  excerpt: string;
  category?: string;
  section?: string;
  date?: string;
  keywords: string[];
  content: string;
};

const sectionTypes: Record<string, string> = {
  "buddhism-101": "Buddhism 101",
  "buddhist-dictionary": "Buddhist Term",
  "dhammapada-reflections": "Dhammapada Reflection",
  "sutta-for-daily-life": "Sutta Guide"
};

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function pageContent(page: { intro: string; sections: { heading: string; paragraphs: string[] }[]; takeaway: string; practice?: string; terms?: string[] }) {
  return [
    page.intro,
    page.takeaway,
    page.practice,
    ...(page.terms ?? []),
    ...(page.sections ?? []).flatMap((section) => [section.heading, ...(section.paragraphs ?? [])])
  ]
    .filter(Boolean)
    .map((item) => stripHtml(item))
    .join(" ");
}

const articleItems: SearchIndexItem[] = fullArticles.map((article) => ({
  title: article.title,
  url: `/articles/${article.slug}/`,
  type: "Article",
  excerpt: article.description,
  category: article.category,
  section: "Articles",
  date: article.date,
  keywords: [...article.tags, article.category],
  content: [
    article.title,
    article.description,
    article.category,
    ...article.tags,
    ...(article.content ?? []).flatMap((section) => [
      section.heading,
      section.subheading,
      ...(section.paragraphs ?? []).map(stripHtml)
    ])
  ]
    .filter(Boolean)
    .join(" ")
}));

const learningItems: SearchIndexItem[] = getAllLearningPages().map((page) => ({
  title: page.title,
  url: `/learn/${page.section}/${page.slug}/`,
  type: sectionTypes[page.section] ?? "Learning Page",
  excerpt: page.description,
  category: page.eyebrow,
  section: sectionTypes[page.section] ?? "Learn",
  keywords: [
    page.title,
    page.eyebrow,
    ...(page.terms ?? []),
    ...page.relatedLinks.map((link) => link.label)
  ],
  content: pageContent(page)
}));

const meditationItems: SearchIndexItem[] = allMeditationPages.map((page) => ({
  title: page.title,
  url: `/meditation/${page.slug}/`,
  type: "Meditation Guide",
  excerpt: page.description,
  category: "Meditation",
  section: "Meditation",
  keywords: [
    page.title,
    "meditation",
    "mindfulness",
    ...(page.terms ?? []),
    ...page.relatedLinks.map((link) => link.label)
  ],
  content: pageContent(page)
}));

const quoteItems: SearchIndexItem[] = quotes.map((quote) => {
  const story = getQuoteStory(quote);

  return {
    title: quote.text,
    url: getQuoteStoryPath(quote),
    type: "Quote",
    excerpt: story.description,
    category: quote.theme,
    section: "Quotes",
    keywords: [quote.theme, "quote", "reflection", story.title],
    content: [
      quote.text,
      quote.theme,
      story.title,
      story.description,
      story.intro,
      story.reflectionQuestion,
      ...(story.sections ?? []).flatMap((section) => [section.heading, ...(section.paragraphs ?? [])])
    ]
      .filter(Boolean)
      .join(" ")
  };
});

const dailyReflectionItems: SearchIndexItem[] = dailyReflections.map((reflection) => ({
  title: reflection.title,
  url: getDailyReflectionPath(reflection),
  type: "Daily Reflection",
  excerpt: reflection.reflection,
  category: reflection.relatedIdea,
  section: "Daily Reflections",
  keywords: [
    reflection.relatedIdea,
    "daily reflection",
    "practice",
    "journal question",
    ...reflection.relatedLinks.map((link) => link.label),
    ...getDailyReflectionQuoteLinks(reflection).map((link) => link.label)
  ],
  content: [
    reflection.title,
    reflection.reflection,
    reflection.meaning,
    getDailyReflectionExample(reflection),
    reflection.practice,
    reflection.journalQuestion,
    reflection.relatedIdea,
    ...reflection.relatedLinks.map((link) => link.label)
  ].join(" ")
}));

const faqItem: SearchIndexItem = {
  title: "Questions About Buddhism",
  url: "/learn/questions-about-buddhism/",
  type: "FAQ",
  excerpt: "Beginner-friendly answers about Buddhism, meditation, anger, suffering, compassion, attachment, and practice at home.",
  category: "Beginner Questions",
  section: "Learn",
  keywords: questionsAboutBuddhism.flatMap((item) => [item.question, ...item.links.map((link) => link.label)]),
  content: questionsAboutBuddhism.flatMap((item) => [item.question, item.answer]).join(" ")
};

const resourcesItem: SearchIndexItem = {
  title: "Buddhist Resources",
  url: "/learn/buddhist-resources/",
  type: "Resource",
  excerpt: "Curated Buddhist texts, meditation learning, dictionaries, beginner Buddhism, Sri Lankan resources, and global resources.",
  category: "Further Reading",
  section: "Learn",
  keywords: resourceGroups.flatMap((group) => [group.title, ...group.links.map((link) => link.label)]),
  content: resourceGroups
    .flatMap((group) => [group.title, group.description, ...group.links.flatMap((link) => [link.label, link.description])])
    .join(" ")
};

const hubItems: SearchIndexItem[] = [
  {
    title: "Start Here",
    url: "/start-here/",
    type: "Hub",
    excerpt: "Begin with simple Buddhist teachings, daily reflections, meditation, quotes, mindful living, and tools.",
    category: "Beginner Path",
    section: "Start Here",
    keywords: ["start here", "beginner", "Buddhism", "mindfulness", "meditation"],
    content: "New to Buddhism start meditation daily peace Buddhist quotes practical mindfulness seven step path"
  },
  {
    title: "Daily Buddhist Reflections",
    url: "/daily-reflections/",
    type: "Daily Reflection",
    excerpt: "Short Buddhist-inspired daily reflections with meanings, practices, and journal questions.",
    category: "Daily Practice",
    section: "Daily Reflections",
    keywords: ["daily reflections", "today", "journal", "practice", "mindfulness"],
    content: dailyReflections
      .flatMap((item) => [item.title, item.reflection, item.meaning, item.practice, item.journalQuestion, item.relatedIdea])
      .join(" ")
  },
  {
    title: "Today's Buddhist Reflection",
    url: "/daily-reflections/today/",
    type: "Daily Reflection",
    excerpt: "Open today's Buddhist-inspired reflection and mindful practice prompt.",
    category: "Today",
    section: "Daily Reflections",
    keywords: ["today", "daily reflection", "practice", "journal question"],
    content: dailyReflections.map((item) => item.title).join(" ")
  },
  {
    title: "Buddhist Mindfulness Tools",
    url: "/tools/",
    type: "Tool",
    excerpt: "Use a reflection generator, quote tool, meditation timer, breathing timer, mindfulness challenge, and mini glossary.",
    category: "Practice Tools",
    section: "Tools",
    keywords: ["tools", "timer", "meditation timer", "breathing", "quote tool", "glossary"],
    content: "daily Buddhist reflection tool random quote tool 5 minute meditation timer breathing practice timer 7 day mindfulness challenge Buddhist terms mini glossary"
  },
  {
    title: "Mindful Living",
    url: "/mindful-living/",
    type: "Hub",
    excerpt: "Practical Buddhist-inspired mindfulness for speech, work, relationships, patience, compassion, and letting go.",
    category: "Mindful Living",
    section: "Mindful Living",
    keywords: ["mindful living", "daily life", "right speech", "work", "relationships", "patience"],
    content: "mindful speech work family patience letting go compassion daily tools ordinary life practice"
  },
  {
    title: "Buddhism for Beginners",
    url: "/learn/buddhism-for-beginners/",
    type: "Learning Page",
    excerpt: "Start learning Buddhism with simple explanations of core teachings and beginner practice.",
    category: "Beginner Buddhism",
    section: "Learn",
    keywords: ["Buddhism for beginners", "beginner Buddhism", "what is Buddhism"],
    content: "Buddha Four Noble Truths Noble Eightfold Path mindfulness compassion beginner meditation"
  },
  {
    title: "Four Noble Truths Explained for Beginners",
    url: "/learn/four-noble-truths/",
    type: "Learning Page",
    excerpt: "A clear hub for suffering, the causes of suffering, release, and the path of practice.",
    category: "Core Teaching",
    section: "Learn",
    keywords: ["Four Noble Truths", "dukkha", "suffering", "Buddhist teaching"],
    content: "dukkha cause craving clinging release Noble Eightfold Path source notes"
  },
  {
    title: "Noble Eightfold Path for Daily Life",
    url: "/learn/eightfold-path/",
    type: "Learning Page",
    excerpt: "Learn the Eightfold Path as practical training in wisdom, conduct, mindfulness, and meditation.",
    category: "Core Practice",
    section: "Learn",
    keywords: ["Eightfold Path", "Noble Eightfold Path", "right speech", "right mindfulness"],
    content: "right view right intention right speech right action right livelihood right effort right mindfulness right concentration"
  }
];

const searchIndex = [
  ...hubItems,
  ...articleItems,
  ...dailyReflectionItems,
  ...quoteItems,
  ...learningItems,
  ...meditationItems,
  faqItem,
  resourcesItem
];

export const GET: APIRoute = () =>
  new Response(JSON.stringify(searchIndex), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
