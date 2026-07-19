import { siteConfig } from "@/config/site";
import { CONTACT, SOCIAL_LINKS } from "@/lib/constants";

/**
 * Structured data (schema.org) for the bakery. Brownza is a cloud bakery, so
 * only the city is exposed — no physical street address.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${siteConfig.url}/#bakery`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    logo: `${siteConfig.url}/logo.png`,
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.emailDisplay,
    priceRange: "$$",
    servesCuisine: ["Bakery", "Desserts", "Cookies", "Brownies", "Fast Food"],
    areaServed: { "@type": "City", name: CONTACT.city },
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT.city,
      addressCountry: "PK",
    },
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is a trusted, static object we control.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
