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

const searchIndex = [
  ...articleItems,
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
