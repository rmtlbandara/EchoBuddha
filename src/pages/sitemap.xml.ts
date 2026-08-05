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
  isQuoteStoryIndexable,
  quoteCategories,
  quotes
} from "../data/site";
import { dailyReflections, getDailyReflectionPath } from "../data/dailyReflections";

type SitemapEntry = {
  path: string;
  lastmod?: string;
};

const asSitemapEntries = (entries: SitemapEntry[]) => entries;

const staticPaths: SitemapEntry[] = [
  { path: "/" },
  { path: "/about/" },
  { path: "/start-here/" },
  { path: "/editorial-policy/" },
  { path: "/how-echo-buddha-creates-content/" },
  { path: "/buddhist-sources-and-citations/" },
  { path: "/quote-attribution-policy/" },
  { path: "/meditation-safety/" },
  { path: "/corrections/" },
  { path: "/authors/echo-buddha-editorial/" },
  { path: "/learn/" },
  { path: "/learn/buddhism-for-beginners/" },
  { path: "/learn/four-noble-truths/" },
  { path: "/learn/eightfold-path/" },
  { path: "/learn/questions-about-buddhism/" },
  { path: "/learn/buddhist-resources/" },
  { path: "/daily-reflections/" },
  { path: "/mindful-living/" },
  { path: "/tools/" },
  { path: "/quotes/" },
  { path: "/articles/" },
  { path: "/meditation/" },
  { path: "/meditation-guide/" },
  { path: "/contact/" },
  { path: "/privacy-policy/", lastmod: "2026-07-03" },
  { path: "/terms-of-use/", lastmod: "2026-06-24" },
  { path: "/disclaimer/" }
];

export const GET: APIRoute = () => {
  const getArticleLastmod = (slug: string, fallback: string) => getArticleSeoDetails(slug)?.reviewedDate ?? fallback;
  const latestArticleLastmod = fullArticles
    .map((article) => getArticleLastmod(article.slug, article.date))
    .sort()
    .at(-1);
  const articlePaths = fullArticles.map((article) => ({
    path: `/articles/${article.slug}/`,
    lastmod: getArticleLastmod(article.slug, article.date)
  }));
  const articleCategoryPaths: SitemapEntry[] = articleCategories.map((category) => ({
    path: `/articles/category/${category.slug}/`,
    lastmod: fullArticles
      .filter((article) => article.category === category.name)
      .map((article) => getArticleLastmod(article.slug, article.date))
      .sort()
      .at(-1)
  }));
  const quoteCategoryPaths: SitemapEntry[] = quoteCategories.map((category) => ({
    path: `/quotes/${category.slug}/`
  }));
  const quoteStoryPaths: SitemapEntry[] = quotes
    .filter(isQuoteStoryIndexable)
    .map((quote) => ({
      path: getQuoteStoryPath(quote),
      lastmod: quote.story?.updatedDate
    }));
  const dailyReflectionPaths: SitemapEntry[] = dailyReflections.map((reflection) => ({
    path: getDailyReflectionPath(reflection)
  }));
  const learningSectionPaths: SitemapEntry[] = learningSections.map((section) => ({
    path: section.href
  }));
  const learningPagePaths: SitemapEntry[] = getAllLearningPages().map((page) => ({
    path: `/learn/${page.section}/${page.slug}/`
  }));
  const meditationPagePaths: SitemapEntry[] = allMeditationPages.map((page) => ({
    path: `/meditation/${page.slug}/`
  }));
  const entries = asSitemapEntries([
    ...staticPaths.map((entry) =>
      ["/", "/articles/"].includes(entry.path) && latestArticleLastmod
        ? { ...entry, lastmod: latestArticleLastmod }
        : entry
    ),
    ...learningSectionPaths,
    ...learningPagePaths,
    ...meditationPagePaths,
    ...articlePaths,
    ...articleCategoryPaths,
    ...quoteCategoryPaths,
    ...quoteStoryPaths,
    ...dailyReflectionPaths
  ]);
  const urls = entries
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
