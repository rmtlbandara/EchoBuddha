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
  getArticleSeoDetails,
  getQuoteStoryPath,
  quoteCategories,
  quotes
} from "../data/site";

const siteLastModified = "2026-07-03";

type SitemapEntry = {
  path: string;
  lastmod?: string;
};

const staticPaths: SitemapEntry[] = [
  { path: "/", lastmod: siteLastModified },
  { path: "/about/", lastmod: siteLastModified },
  { path: "/editorial-policy/", lastmod: siteLastModified },
  { path: "/authors/echo-buddha-editorial/", lastmod: siteLastModified },
  { path: "/learn/", lastmod: siteLastModified },
  { path: "/learn/questions-about-buddhism/", lastmod: siteLastModified },
  { path: "/learn/buddhist-resources/", lastmod: siteLastModified },
  { path: "/quotes/", lastmod: siteLastModified },
  { path: "/articles/", lastmod: siteLastModified },
  { path: "/meditation/", lastmod: siteLastModified },
  { path: "/meditation-guide/", lastmod: siteLastModified },
  { path: "/contact/", lastmod: siteLastModified },
  { path: "/privacy-policy/", lastmod: siteLastModified },
  { path: "/terms-of-use/", lastmod: siteLastModified },
  { path: "/disclaimer/", lastmod: siteLastModified }
];

export const GET: APIRoute = () => {
  const articlePaths = fullArticles.map((article) => ({
    path: `/articles/${article.slug}/`,
    lastmod: getArticleSeoDetails(article.slug)?.reviewedDate ?? article.date
  }));
  const articleCategoryPaths = articleCategories.map((category) => ({
    path: `/articles/category/${category.slug}/`,
    lastmod: siteLastModified
  }));
  const quoteCategoryPaths = quoteCategories.map((category) => ({
    path: `/quotes/${category.slug}/`,
    lastmod: siteLastModified
  }));
  const quoteStoryPaths = quotes.map((quote) => ({
    path: getQuoteStoryPath(quote),
    lastmod: siteLastModified
  }));
  const learningSectionPaths = learningSections.map((section) => ({
    path: section.href,
    lastmod: siteLastModified
  }));
  const learningPagePaths = getAllLearningPages().map((page) => ({
    path: `/learn/${page.section}/${page.slug}/`,
    lastmod: siteLastModified
  }));
  const meditationPagePaths = allMeditationPages.map((page) => ({
    path: `/meditation/${page.slug}/`,
    lastmod: siteLastModified
  }));
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
    .map((entry) => {
      const loc = new URL(entry.path, SITE.url).toString();
      const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url><loc>${loc}</loc>${lastmod}</url>`;
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
