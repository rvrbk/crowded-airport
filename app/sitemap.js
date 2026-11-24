import { getIndexableIatas, siteUrl } from "./lib/airports";

export const dynamic = "force-dynamic";

export default async function sitemap() {
    const home = {
        url: `${siteUrl}/`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
    };

    try {
        const iatas = await getIndexableIatas();

        return [
            home,
            ...iatas.map((iata) => ({
                url: `${siteUrl}/airport/${iata}`,
                changeFrequency: "weekly",
                priority: 0.7,
            })),
        ];
    } catch (error) {
        console.error("Sitemap could not load airports:", error);

        return [home];
    }
}
