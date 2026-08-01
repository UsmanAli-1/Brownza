import { siteConfig } from "@/config/site";
import { getStartingPrice } from "@/data/products";
import type { Category, Product } from "@/types";

/**
 * Full schema.org Menu for the /products page specifically — one
 * MenuSection per category, one MenuItem per product with its real price.
 * Kept off every other page (the sitewide <JsonLd> just references this
 * page's URL via `hasMenu`) since this is the one place the content
 * actually lives; duplicating it everywhere would be redundant and could
 * read as spammy to Google.
 */
export function MenuJsonLd({
  categories,
  productsByCategory,
}: {
  categories: readonly Category[];
  productsByCategory: Record<string, Product[]>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${siteConfig.url}/products#menu`,
    name: `${siteConfig.name} Menu`,
    url: `${siteConfig.url}/products`,
    inLanguage: "en",
    hasMenuSection: categories
      .map((category) => {
        const items = productsByCategory[category.slug] ?? [];
        if (items.length === 0) return null;
        return {
          "@type": "MenuSection",
          name: category.name,
          description: category.description,
          hasMenuItem: items.map((product) => ({
            "@type": "MenuItem",
            name: product.name,
            description: product.description,
            offers: {
              "@type": "Offer",
              price: getStartingPrice(product),
              priceCurrency: "PKR",
              availability: product.available
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          })),
        };
      })
      .filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
