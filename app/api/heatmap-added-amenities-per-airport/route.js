import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request) {
    try {
        const topAirports = await prisma.thing.groupBy({
            by: ['iata'],
            _count: {
                thing: true
            },
            orderBy: {
                _count: {
                    thing: 'desc'
                }
            },
            take: 12
        });

        const iatas = topAirports.map((airport) => airport.iata);

        const airportDetails = await prisma.airport.findMany({
            where: {
                iata: { in: iatas }
            },
            select: {
                iata: true,
                name: true
            }
        });

        const topAirportsWithNames = topAirports.map((airport) => {
            const airportDetail = airportDetails.find((detail) => detail.iata === airport.iata);
            return {
                iata: airport.iata,
                name: airportDetail ? airportDetail.name : null,
                count: airport._count.thing
            };
        });

        return NextResponse.json(topAirportsWithNames, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}