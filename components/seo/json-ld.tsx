import { siteConfig } from "@/config/site";
import { CONTACT, SOCIAL_LINKS } from "@/lib/constants";

/**
 * Structured data (schema.org) for the bakery — three linked entities in one
 * @graph so Google (and LLM answer engines that read JSON-LD) get a single
 * consistent picture instead of guessing from prose:
 *  - Organization: the brand itself — name, logo, social profiles.
 *  - WebSite: the site as a crawlable entity (enables a Sitelinks search box).
 *  - Bakery (LocalBusiness subtype): the actual business — city, phone,
 *    cuisine. Only the city is exposed since Brownza is a cloud bakery with
 *    no physical storefront address.
 */
export function JsonLd() {
  const sameAs = SOCIAL_LINKS.map((s) => s.href);
  const logo = `${siteConfig.url}/logo.png`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        alternateName: `${siteConfig.name} Bakery`,
        url: siteConfig.url,
        logo,
        image: logo,
        email: CONTACT.emailDisplay,
        telephone: CONTACT.phoneDisplay,
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        publisher: { "@id": `${siteConfig.url}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "Bakery",
        "@id": `${siteConfig.url}/#bakery`,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        image: `${siteConfig.url}${siteConfig.ogImage}`,
        logo,
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
        sameAs,
        parentOrganization: { "@id": `${siteConfig.url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is a trusted, static object we control.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
