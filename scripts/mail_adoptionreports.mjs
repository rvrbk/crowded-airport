import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

dotenv.config();

const prisma = new PrismaClient();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// get all the amenities that have been viewed in the last week
// loop through them and get their clicks, also what their popularity is 
// in terms od upvotes/downvotes and if it is about to be deleted

export async function fetchAmenitiesAndMail() {
    const users = await prisma.user.findMany();
    let oneWeekAgo = new Date();
    oneWeekAgo = new Date(oneWeekAgo.setDate(oneWeekAgo.getDate() - 7));

    users.map(async user => {
        let amenities = await prisma.UserThing.findMany({
            where: {
                user_id: user.id
            },
            include: {
                thing: {
                    include: {
                        airport: true
                    }
                }
            }
        });

        for (const amenity of amenities) {
            let { airport } = amenity.thing;
            let { thing } = amenity;

            let upvoteClicks = await prisma.upvoteClicks.findMany({
                where: {
                    thing_id: thing.id,
                    createdAt: {
                        gt: oneWeekAgo
                    } 
                }
            });
            
            let navigationClicks = await prisma.navigationClicks.findMany({
                where: {
                    thing_id: thing.id,
                    createdAt: {
                        gt: oneWeekAgo
                    } 
                }
            });

            amenity.upvoteClicks = upvoteClicks;
            amenity.navigationClicks = navigationClicks;
        }

        const templatePath = path.join(process.cwd(), 'mail-templates', 'adoptionreport.hbs');
        const templateFile = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateFile);

        let message = template({
            name: user.name,
            amenities: amenities
        });

        sgMail.send({
            to: user.email,
            from: 'noreply@crowded-airport.com',
            subject: 'Crowded Airport | Weekly update',
            html: message,
        }).then(() => {
            console.log('Email sent')
        }).catch((error) => {
            console.error(error)
        });
    });
}

fetchAmenitiesAndMail().catch((e) => {
    console.error(e);
}).finally(async () => {
    await prisma.$disconnect();
});