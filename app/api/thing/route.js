import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { serialize } from 'cookie';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    
    const iata = searchParams.get('iata');
    const thing = searchParams.get('thing');
   
    try {
        const conditions = {};

        if (iata) {
            conditions.where = {
                iata
            };

            if (!thing) {
                conditions.distinct = ['thing'];
            }
        }

        if (thing) {
            conditions.where = {
                iata,
                thing: {
                    contains: thing
                }
            };
        }

        const things = await prisma.thing.findMany(conditions);

        return NextResponse.json(things, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { thing, description, iata, latitude, longitude } = await request.json();

        if (thing && iata && longitude && latitude) {
            const data = {
                thing,
                iata,
                latitude,
                longitude
            };

            const newThing = await prisma.thing.create({
                data,
            });

            return NextResponse.json(newThing, { status: 200 });
        }

        return NextResponse.json('', { status: 200 });
    } catch (error) {
        console.error('Error saving thing:', error);
        return NextResponse.json({ error: 'Failed to save thing' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { votes, id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const existingThing = await prisma.thing.findUnique({
            where: { id: Number(id) },
        });

        if (!existingThing) {
            return NextResponse.json({ error: 'Thing not found' }, { status: 404 });
        }

        let update = true;
        let updatedData = {};

        if (votes) {
            const cookie = serialize(`voted_${id}`, 'true', {
                path: '/',
                maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'strict'
            });

            if (votes === 'up') {
                if (existingThing.votes < 5) {
                    updatedData.votes = existingThing.votes + 1;
                }
                else {
                    update = false;
                }
            }

            if (votes === 'down') {
                if (existingThing.votes > 0) {
                    updatedData.votes = existingThing.votes - 1;
                }
                else {
                    update = false;

                    await prisma.thing.delete({
                        where: { id: Number(id) },
                    });
                }
            }
        }

        if (update) {
            const updatedThing = await prisma.thing.update({
                where: { id: Number(id) },
                data: updatedData,
            });

            return NextResponse.json(updatedThing, { status: 200 });
        }

        return NextResponse.json('', { status: 200 });
    } catch (error) {
        console.error('Error updating thing:', error);
        return NextResponse.json({ error: 'Failed to update thing' }, { status: 500 });
    }
}
 