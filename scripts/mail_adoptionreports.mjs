import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// get all the amenities that have been viewed in the last week
// loop through them and get their clicks, also what their popularity is 
// in terms od upvotes/downvotes and if it is about to be deleted

async function fetchAmenitiesAndMail() {
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

        let message = `<h1>Hey ${user.name}!</h1>
        <p>It’s that time of the week! We’re here to bring you the latest scoop on your adopted amenities at Crowded Airport. Let’s see how much sparkle your additions brought.</p>`;

        for (const amenity of amenities) {
            let { airport } = amenity.thing;
            let { thing } = amenity;

            let navigationClicks = await prisma.navigationClicks.findMany({
                where: {
                    thing_id: thing.id,
                    createdAt: {
                        gt: oneWeekAgo
                    } 
                }
            });
            
            message += `<h2>Amenity: ${thing.thing}</h2>
            <h2>Located at ${airport.name}</h2>`;

            if (navigationClicks.length > 0) {
                message += `<p>Here's the good stuff:</p>
                <ul>
                <li>Your amenity was a beacon, guiding ${navigationClicks.length === 1 ? '<b>one</b> traveler' : `<b>${navigationClicks.length}</b> travelers`} to their destination. Way to go!</li>
                </ul>`;
            }
            else {
                message += `<li>While there might not be any new stats to report right now, your contribution is still playing a vital role for travelers using ${airport.name}. Every amenity counts, and yours is no exception, helping to make the airport experience smoother and more enjoyable.</li>`;
            }
        }

        message += `<p>Keep your eyes peeled for more updates. We appreciate all you do to help our community thrive!</p>
        <p>Cheers to more happy travels,</p>
        <b>Crowded Airport</b> – Where Your Contributions Make Journeys Brighter!`;

        console.log(message);

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