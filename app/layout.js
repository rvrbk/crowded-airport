import "./globals.css";
import Analytics from "./components/Analytics";

const siteUrl = "https://crowded-airport.com";
const siteName = "Crowded Airport";
const siteDescription = "Find your way on any airport in the world. A crowdsourced map of coffee shops, toilets, lost and found, security and more, added and rated by travellers.";

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Crowded Airport | Crowdsourced airport maps and amenities",
        template: "%s | Crowded Airport",
    },
    description: siteDescription,
    applicationName: siteName,
    keywords: ["airport", "airport map", "coffeeshop", "toilet", "lost and found", "crowd sourced", "crowd", "finder", "aviation", "travel", "bags", "belts", "security"],
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        url: "/",
        siteName,
        title: siteName,
        description: siteDescription,
        images: [{ url: "/og.png", width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
        images: ["/og.png"],
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            url: siteUrl,
            name: siteName,
            description: siteDescription,
            inLanguage: "en",
        },
        {
            "@type": "WebApplication",
            "@id": `${siteUrl}/#app`,
            url: siteUrl,
            name: siteName,
            description: siteDescription,
            applicationCategory: "TravelApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript",
            isAccessibleForFree: true,
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
            },
            image: `${siteUrl}/og.png`,
            isPartOf: { "@id": `${siteUrl}/#website` },
        },
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                <script defer src="https://lore.verbeek.ug/heat.js" data-key="HnbiiR1X9h7VqgAAohJpG7rOpyXSi2mQ" data-lore-heat></script>
            </head>
            <body className="h-dvh">
                <Analytics />
                {children}
            </body>
        </html>
    );
}
