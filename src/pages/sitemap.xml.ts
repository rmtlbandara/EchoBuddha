import type { APIRoute } from "astro";
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
  "/quotes/",
  "/articles/",
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
  const urls = [...staticPaths, ...articlePaths, ...articleCategoryPaths, ...quoteCategoryPaths, ...quoteStoryPaths]
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
