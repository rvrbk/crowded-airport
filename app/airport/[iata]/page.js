import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getAirportWithThings, groupThings, siteUrl } from "../../lib/airports";

export const revalidate = 3600;

export async function generateStaticParams() {
    return [];
}

function airportLabel(airport) {
    return airport.city ? `${airport.name} (${airport.iata}), ${airport.city}` : `${airport.name} (${airport.iata})`;
}

export async function generateMetadata({ params }) {
    const airport = await getAirportWithThings(params.iata);

    if (!airport) {
        return { title: "Airport not found", robots: { index: false, follow: false } };
    }

    const groups = groupThings(airport.things);
    const hasThings = groups.length > 0;
    const topThings = groups.slice(0, 5).map((group) => group.name).join(", ");
    const title = `${airport.name} (${airport.iata}) map and amenities`;
    const description = hasThings
        ? `Find ${topThings} and more at ${airportLabel(airport)}, ${airport.country}. Crowdsourced locations added and rated by travellers.`
        : `Help travellers find their way at ${airportLabel(airport)}, ${airport.country}. Add what you know about this airport on Crowded Airport.`;
    const path = `/airport/${airport.iata}`;

    return {
        title,
        description,
        alternates: { canonical: path },
        robots: { index: hasThings, follow: true },
        openGraph: {
            type: "website",
            url: path,
            siteName: "Crowded Airport",
            title,
            description,
            images: [{ url: "/og.png", width: 1200, height: 630, alt: "Crowded Airport" }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og.png"],
        },
    };
}

export default async function AirportPage({ params }) {
    if (params.iata !== params.iata.toUpperCase()) {
        permanentRedirect(`/airport/${params.iata.toUpperCase()}`);
    }

    const airport = await getAirportWithThings(params.iata);

    if (!airport) {
        notFound();
    }

    const groups = groupThings(airport.things);
    const url = `${siteUrl}/airport/${airport.iata}`;

    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Airport",
                "@id": `${url}#airport`,
                name: airport.name,
                iataCode: airport.iata,
                icaoCode: airport.icao,
                url,
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: airport.latitude,
                    longitude: airport.longitude,
                    elevation: airport.altitude,
                },
                address: {
                    "@type": "PostalAddress",
                    ...(airport.city ? { addressLocality: airport.city } : {}),
                    addressCountry: airport.country,
                },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Crowded Airport", item: siteUrl },
                    { "@type": "ListItem", position: 2, name: `${airport.name} (${airport.iata})`, item: url },
                ],
            },
        ],
    };

    return (
        <main className="min-h-dvh bg-gray-100 px-4 py-10">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <div className="mx-auto max-w-2xl">
                <p className="font-pacifico text-3xl text-indigo-500 text-center mb-6">
                    <Link href="/">- Crowded Airport -</Link>
                </p>

                <article className="rounded-md bg-white p-6 shadow-xl">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {airport.name} ({airport.iata})
                    </h1>
                    <p className="mt-1 text-gray-600">
                        {[airport.city, airport.country].filter(Boolean).join(", ")}
                    </p>

                    <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <dt className="font-medium">IATA code</dt>
                        <dd>{airport.iata}</dd>
                        <dt className="font-medium">ICAO code</dt>
                        <dd>{airport.icao}</dd>
                        {airport.timezone && (
                            <>
                                <dt className="font-medium">Time zone</dt>
                                <dd>{airport.timezone}</dd>
                            </>
                        )}
                        <dt className="font-medium">Elevation</dt>
                        <dd>{airport.altitude} ft</dd>
                    </dl>

                    <h2 className="mt-8 text-lg font-semibold text-gray-900">
                        What travellers found at {airport.name}
                    </h2>

                    {groups.length > 0 ? (
                        <ul className="mt-3 divide-y divide-gray-100">
                            {groups.map((group) => (
                                <li key={group.name} className="flex justify-between py-2 text-gray-700">
                                    <span className="capitalize">{group.name}</span>
                                    <span className="text-gray-500">
                                        {group.count} {group.count === 1 ? "location" : "locations"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-gray-700">
                            Nobody has added anything for this airport yet. If you know where things are, you can be the first.
                        </p>
                    )}

                    <Link
                        href={`/?airport=${airport.iata}`}
                        className="mt-8 inline-block rounded-md bg-indigo-500 px-4 py-2 text-white shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Open the interactive map
                    </Link>

                    <p className="mt-6 text-xs text-gray-500">
                        Locations are contributed by travellers and may be incomplete or out of date. Check airport signage when in doubt.
                    </p>
                </article>
            </div>
        </main>
    );
}
