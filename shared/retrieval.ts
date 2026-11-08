export type ManualSource = {
  id: string;
  title: string;
  brand: string;
  model: string;
  revision: string;
  source: string;
  pages: string[];
};
export type Passage = {
  id: string;
  title: string;
  page: number;
  quote: string;
  source: string;
  model: string;
};
const normal = (text: string) =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
export function retrieve(
  manuals: ManualSource[],
  model: string,
  query: string,
): Passage[] {
  if (!normal(model) || normal(model).length < 3) return [];
  const words = [
    ...new Set(query.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || []),
  ].filter(
    (w) => !["the", "and", "with", "not", "for", "what", "this"].includes(w),
  );
  if (!words.length) return [];
  return manuals
    .filter((m) => normal(m.model) === normal(model))
    .flatMap((m) =>
      m.pages.flatMap(
        (page, index) =>
          page
            .match(/[\s\S]{1,900}/g)
            ?.map((quote, chunk) => ({
              id: `${m.id}:p${index + 1}:c${chunk + 1}`,
              title: m.title,
              page: index + 1,
              quote,
              source: m.source,
              model: m.model,
              score: words.filter((w) => quote.toLowerCase().includes(w))
                .length,
            })) || [],
      ),
    )
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map(({ score, ...p }) => p);
}
