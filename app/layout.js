"use client";

import "./globals.css";
import { GoogleAnalytics } from "nextjs-google-analytics";
import Head from "next/head";

export const metadata = {
  title: "Crowded Airport",
  description: "Find your way on any airport in the world.",
  keywords: "airport, coffeeshop, toilet, lost and found, crowd sourced, crowd, finder, aviation, travel, bags, belts, security",
  openGraph: {
    type: "website",
    url: "https://crowded-airport.com",
    title: "Crowded Airport",
    description: "Find your way on any airport in the world.",
    image: "https://crowded-airport.com/graph.jpg",
  },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <Head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <meta name="keywords" content={metadata.keywords} />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <meta property="og:type" content={metadata.openGraph.type} />
                <meta property="og:url" content={metadata.openGraph.url} />
                <meta property="og:title" content={metadata.openGraph.title} />
                <meta property="og:description" content={metadata.openGraph.description} />
                <meta property="og:image" content={metadata.openGraph.image} />
                
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metadata.openGraph.title} />
                <meta name="twitter:description" content={metadata.openGraph.description} />
                <meta name="twitter:image" content={metadata.openGraph.image} />

                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body>
                <GoogleAnalytics trackPageViews />
                {children}
            </body>
        </html>
    );
}
