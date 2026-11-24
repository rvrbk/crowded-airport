import { prisma } from './prisma';

export const siteUrl = "https://crowded-airport.com";

/**
 * Things that are currently valid, same rule as the /api/thing endpoint:
 * either inside their from/till window or without a window.
 */
function activeThingsFilter() {
    const now = new Date();

    return {
        OR: [
            { fromDate: { lte: now }, tillDate: { gte: now } },
            { fromDate: null, tillDate: null },
        ],
    };
}

/**
 * Finds an airport by IATA code together with its currently valid things.
 *
 * @param {string} iata
 */
export async function getAirportWithThings(iata) {
    return prisma.airport.findUnique({
        where: { iata: iata.toUpperCase() },
        include: {
            things: {
                where: activeThingsFilter(),
                orderBy: { thing: 'asc' },
            },
        },
    });
}

/**
 * IATA codes of every airport that has at least one currently valid thing.
 * Airports without things are left out of the sitemap because they would be thin pages.
 *
 * @returns {Promise<string[]>}
 */
export async function getIndexableIatas() {
    const airports = await prisma.airport.findMany({
        where: { things: { some: activeThingsFilter() } },
        select: { iata: true },
        orderBy: { iata: 'asc' },
    });

    return airports.map((airport) => airport.iata);
}

/**
 * Groups things by their (case-insensitive) name and counts them.
 *
 * @param {{ thing: string }[]} things
 * @returns {{ name: string, count: number }[]}
 */
export function groupThings(things) {
    const groups = new Map();

    for (const { thing } of things) {
        const key = thing.trim().toLowerCase();
        const existing = groups.get(key);

        if (existing) {
            existing.count += 1;
        } else {
            groups.set(key, { name: thing.trim(), count: 1 });
        }
    }

    return [...groups.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
