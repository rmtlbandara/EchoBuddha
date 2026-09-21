const publicationDateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric"
});

export function formatPublicationDate(date: string) {
  return publicationDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function countReadableWords(content: string) {
  return content
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getReadTimeFromWordCount(wordCount: number) {
  return `${Math.max(3, Math.ceil(wordCount / 200))} min read`;
}
