import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function POST(request) {
    try {
        const { thing_id } = await request.json();

        if (thing_id) {
            const data = {
                thing_id
            };

            const markerClick = await prisma.markerClicks.create({
                data,
            });

            return NextResponse.json(markerClick, { status: 200 });
        }

        return NextResponse.json('', { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}