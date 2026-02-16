export default function ArticleListSchema({
  items,
}: {
  items: Array<{ title: string; description: string; date: string; image?: string; url?: string; source?: string }>;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items
      .filter((x) => x.url)
      .map((x, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: x.url,
        item: {
          "@type": "NewsArticle",
          headline: x.title,
          datePublished: x.date,
          dateModified: x.date,
          description: x.description,
          publisher: x.source ? { "@type": "Organization", name: x.source } : undefined,
          image: x.image ? [x.image] : undefined,
          mainEntityOfPage: x.url,
        },
      })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
