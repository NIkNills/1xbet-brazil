export default function ReviewSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "1xBet Bônus Brasil (guia afiliado)",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      reviewCount: "327",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Lucas" },
        reviewRating: { "@type": "Rating", ratingValue: "5" },
        reviewBody:
          "Consegui ativar o bônus rápido e gostei do live em jogos de futebol.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
