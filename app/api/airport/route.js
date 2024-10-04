import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request) {
    try {
        const airports = await prisma.airport.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(airports, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
