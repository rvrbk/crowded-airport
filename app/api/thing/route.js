import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { serialize } from 'cookie';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    
    const iata = searchParams.get('iata');
    const thing = searchParams.get('thing');
   
    try {
        const currentDate = new Date();
        const conditions = {};

        if (iata) {
            conditions.where = {
                iata,
                OR: [
                    {
                        fromDate: {
                            lte: currentDate
                        },
                        tillDate: {
                            gte: currentDate
                        }
                    },
                    {
                        fromDate: null,
                        tillDate: null
                    }
                ]
            };

            if (!thing) {
                conditions.distinct = ['thing'];
            }
        }

        if (thing) {
            conditions.where.thing = {
                contains: thing
            };
        }

        conditions.orderBy = {
            thing: 'asc'
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
        const { thing, iata, latitude, longitude, userName, userEmail, fromDate, tillDate } = await request.json();

        if (thing && iata && longitude && latitude) {
            let data = {
                thing,
                iata,
                latitude,
                longitude
            };

            // Handle temporary amenity
            if (fromDate && tillDate) {
                data.fromDate = fromDate;
                data.tillDate = tillDate;
            }

            const newThing = await prisma.thing.create({
                data,
            });

            // Handle adoption
            if (userName && userEmail) {
                let user = await prisma.user.findUnique({
                    where: {
                        email: userEmail
                    }
                });
                
                if (user) {
                    user = await prisma.user.update({
                        where: {
                            email: userEmail
                        },
                        data: {
                            name: userName
                        }
                    });
                }
                else {
                    user = await prisma.user.create({
                        data: {
                            name: userName,
                            email: userEmail
                        }
                    });
                }

                await prisma.userThing.create({
                    data: {
                        user_id: user.id,
                        thing_id: newThing.id
                    }
                });
                
                dotenv.config();

                // Send welcome email
                
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);

                const templatePath = path.join(process.cwd(), 'mail-templates', 'thanks-for-adopting.hbs');
                const templateFile = fs.readFileSync(templatePath, 'utf8');
                const template = handlebars.compile(templateFile);
        
                let message = template({
                    name: user.name,
                    amenity: newThing
                });
        
                sgMail.send({
                    to: user.email,
                    from: 'noreply@crowded-airport.com',
                    subject: 'Crowded Airport | Your adoption',
                    html: message,
                }).then(() => {
                    console.log('Email sent')
                }).catch((error) => {
                    console.error(error)
                });
            }

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
 