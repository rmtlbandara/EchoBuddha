import type { APIRoute } from "astro";
import {
  allMeditationPages,
  getAllLearningPages,
  learningSections
} from "../data/learn";
import {
  SITE,
  articleCategories,
  fullArticles,
  getQuoteStoryPath,
  quoteCategories,
  quotes
} from "../data/site";

const staticPaths = [
  "/",
  "/about/",
  "/editorial-policy/",
  "/authors/echo-buddha-editorial/",
  "/learn/",
  "/learn/questions-about-buddhism/",
  "/learn/buddhist-resources/",
  "/quotes/",
  "/articles/",
  "/meditation/",
  "/meditation-guide/",
  "/contact/",
  "/privacy-policy/",
  "/terms-of-use/",
  "/disclaimer/"
];

export const GET: APIRoute = () => {
  const articlePaths = fullArticles.map((article) => `/articles/${article.slug}/`);
  const articleCategoryPaths = articleCategories.map((category) => `/articles/category/${category.slug}/`);
  const quoteCategoryPaths = quoteCategories.map((category) => `/quotes/${category.slug}/`);
  const quoteStoryPaths = quotes.map((quote) => getQuoteStoryPath(quote));
  const learningSectionPaths = learningSections.map((section) => section.href);
  const learningPagePaths = getAllLearningPages().map((page) => `/learn/${page.section}/${page.slug}/`);
  const meditationPagePaths = allMeditationPages.map((page) => `/meditation/${page.slug}/`);
  const urls = [
    ...staticPaths,
    ...learningSectionPaths,
    ...learningPagePaths,
    ...meditationPagePaths,
    ...articlePaths,
    ...articleCategoryPaths,
    ...quoteCategoryPaths,
    ...quoteStoryPaths
  ]
    .map((path) => {
      const loc = new URL(path, SITE.url).toString();
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};
