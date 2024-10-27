import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    
    const top = parseInt(searchParams.get('top'), 10) || 5;
   
    try {
        const things = await prisma.thing.groupBy({
            by: ['thing'],
            _count: {
                thing: true
            },
            orderBy: {
                _count: {
                    thing: 'desc'
                }
            },
            take: top
        });

        return NextResponse.json(things, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}