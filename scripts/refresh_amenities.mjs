import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import haversine from 'haversine-distance';
import { pathToFileURL } from 'url';

dotenv.config();

const prisma = new PrismaClient();

const PLACE_TYPES = [
    'restaurant', 'bar', 'cafe', 'bakery', 'store', 'clothing_store', 'convenience_store',
    'car_rental', 'bus_station', 'subway_station', 'train_station'
];
const RADIUS_METERS = 1500;
const HOT_INTERVAL_DAYS = 7;
const COLD_INTERVAL_DAYS = 90;
const HOT_CLICKS_LAST_30_DAYS = 10;
const MISSES_BEFORE_STALE = 2;
const USER_THING_EXPIRY_DAYS = 365;
const ADOPT_DISTANCE_METERS = 75;

const AIRPORTS_PER_RUN = Number(process.env.REFRESH_AIRPORTS_PER_RUN || 25);
const MAX_PAGES_PER_TYPE = Number(process.env.REFRESH_MAX_PAGES || 2);
const MAX_REQUESTS_PER_RUN = Number(process.env.REFRESH_MAX_REQUESTS || 500);
const DRY_RUN = process.argv.includes('--dry-run');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stats = { airports: 0, requests: 0, added: 0, updated: 0, adopted: 0, closed: 0, stale: 0, expired: 0 };

/**
 * Pick the airports that are due, hot ones (recently clicked) first, never-refreshed next, then oldest.
 */
async function pickAirports() {
    const clicks = await prisma.$queryRaw`
        SELECT t."iata", COUNT(*)::int AS clicks
        FROM "MarkerClicks" m
        JOIN "Thing" t ON t."id" = m."thing_id"
        WHERE m."createdAt" > NOW() - INTERVAL '30 days'
        GROUP BY t."iata"`;
    const clicksByIata = new Map(clicks.map((row) => [row.iata, row.clicks]));

    const now = Date.now();
    const day = 86400000;
    const airports = await prisma.airport.findMany();

    return airports
        .map((airport) => {
            const hot = (clicksByIata.get(airport.iata) || 0) >= HOT_CLICKS_LAST_30_DAYS;
            const intervalMs = (hot ? HOT_INTERVAL_DAYS : COLD_INTERVAL_DAYS) * day;
            const age = airport.lastRefreshedAt ? now - airport.lastRefreshedAt.getTime() : Infinity;
            return { airport, hot, overdue: age - intervalMs, never: !airport.lastRefreshedAt };
        })
        .filter((candidate) => candidate.overdue >= 0)
        .sort((a, b) => Number(b.hot) - Number(a.hot) || Number(b.never) - Number(a.never) || b.overdue - a.overdue)
        .slice(0, AIRPORTS_PER_RUN)
        .map((candidate) => candidate.airport);
}

/**
 * Fetch every place of every type around the airport. Returns null if any request failed,
 * so a partial result is never used to mark things as missing.
 */
async function fetchPlaces(airport) {
    const places = new Map();

    for (const type of PLACE_TYPES) {
        let pageToken = null;

        for (let page = 0; page < MAX_PAGES_PER_TYPE; page++) {
            if (stats.requests >= MAX_REQUESTS_PER_RUN) {
                console.warn('Request budget reached.');
                return null;
            }

            const params = new URLSearchParams({ key: process.env.GOOGLE_PLACES_API_KEY });

            if (pageToken) {
                params.set('pagetoken', pageToken);
                await delay(2000);
            } else {
                params.set('location', `${airport.latitude},${airport.longitude}`);
                params.set('radius', String(RADIUS_METERS));
                params.set('type', type);
            }

            stats.requests++;
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`);

            if (!response.ok) {
                console.error(`HTTP ${response.status} for ${airport.iata} (${type})`);
                return null;
            }

            const body = await response.json();

            if (body.status !== 'OK' && body.status !== 'ZERO_RESULTS') {
                console.error(`Places status ${body.status} for ${airport.iata} (${type})`);
                return null;
            }

            for (const place of body.results || []) {
                places.set(place.place_id, place);
            }

            pageToken = body.next_page_token || null;

            if (!pageToken) {
                break;
            }
        }
    }

    return places;
}

async function refreshAirport(airport) {
    const places = await fetchPlaces(airport);

    if (!places || places.size === 0) {
        console.warn(`Skipping ${airport.iata}: no usable result, keeping existing data.`);
        return;
    }

    const existing = await prisma.thing.findMany({ where: { iata: airport.iata } });
    const byPlaceId = new Map(existing.filter((t) => t.placeId).map((t) => [t.placeId, t]));
    const legacy = existing.filter((t) => !t.placeId && t.source === 'user');
    const adoptedIds = new Set();
    const now = new Date();

    for (const [placeId, place] of places) {
        const latitude = parseFloat(place.geometry.location.lat);
        const longitude = parseFloat(place.geometry.location.lng);
        const closed = place.business_status === 'CLOSED_PERMANENTLY';
        let thing = byPlaceId.get(placeId);

        if (!thing) {
            // Adopt an old import (no place id yet): same name, within a few metres.
            thing = legacy.find((t) =>
                !adoptedIds.has(t.id) &&
                t.thing.trim().toLowerCase() === place.name.trim().toLowerCase() &&
                haversine({ latitude: t.latitude, longitude: t.longitude }, { latitude, longitude }) <= ADOPT_DISTANCE_METERS
            );

            if (thing) {
                adoptedIds.add(thing.id);
                stats.adopted++;
            }
        }

        const data = {
            thing: place.name,
            latitude,
            longitude,
            placeId,
            source: 'google',
            status: closed ? 'closed' : 'active',
            lastVerifiedAt: now,
            missedRefreshes: 0,
        };

        if (closed) {
            stats.closed++;
        }

        if (DRY_RUN) {
            thing ? stats.updated++ : stats.added++;
            continue;
        }

        if (thing) {
            await prisma.thing.update({ where: { id: thing.id }, data });
            stats.updated++;
        } else {
            await prisma.thing.create({ data: { ...data, iata: airport.iata } });
            stats.added++;
        }
    }

    // Google-sourced things that did not show up: stale after repeated misses.
    const missing = existing.filter((t) => t.source === 'google' && t.placeId && !places.has(t.placeId) && t.status === 'active');

    for (const thing of missing) {
        const misses = thing.missedRefreshes + 1;
        const status = misses >= MISSES_BEFORE_STALE ? 'stale' : 'active';

        if (status === 'stale') {
            stats.stale++;
        }

        if (!DRY_RUN) {
            await prisma.thing.update({ where: { id: thing.id }, data: { missedRefreshes: misses, status } });
        }
    }

    if (!DRY_RUN) {
        await prisma.airport.update({ where: { iata: airport.iata }, data: { lastRefreshedAt: now } });
    }
}

/**
 * User-added things nobody confirmed or clicked for a year are hidden.
 */
async function expireUserThings() {
    if (DRY_RUN) {
        return;
    }

    stats.expired = await prisma.$executeRaw`
        UPDATE "Thing" t SET "status" = 'stale'
        WHERE t."source" = 'user' AND t."status" = 'active'
          AND COALESCE(t."lastVerifiedAt", t."createdAt") < NOW() - make_interval(days => ${USER_THING_EXPIRY_DAYS})
          AND NOT EXISTS (
              SELECT 1 FROM "MarkerClicks" m
              WHERE m."thing_id" = t."id" AND m."createdAt" > NOW() - make_interval(days => ${USER_THING_EXPIRY_DAYS})
          )`;
}

export async function refreshAmenities() {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
        throw new Error('GOOGLE_PLACES_API_KEY is not set');
    }

    const airports = await pickAirports();
    console.log(`${DRY_RUN ? '[dry run] ' : ''}Refreshing ${airports.length} airports`);

    for (const airport of airports) {
        try {
            await refreshAirport(airport);
            stats.airports++;
        } catch (error) {
            console.error(`Failed refreshing ${airport.iata}:`, error);
        }

        if (stats.requests >= MAX_REQUESTS_PER_RUN) {
            break;
        }
    }

    await expireUserThings();
    console.log('Refresh finished', JSON.stringify(stats));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    refreshAmenities()
        .catch((e) => {
            console.error(e);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
