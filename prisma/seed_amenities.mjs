import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fetchAndInsertAmenities() {
    if (process.env.NEXT_PUBLIC_EVIRONMENT === 'develop') {
        await prisma.$queryRaw`TRUNCATE TABLE "Thing" CASCADE`;
        await prisma.$queryRaw`TRUNCATE TABLE "PlacesImport" CASCADE`;
    }

    // Fetching IATA codes already in placesImport
    const usedIATAs = await prisma.placesImport.findMany({
        select: {
            iata: true // Select only the iata field
        }
    });

    const usedIATACodes = usedIATAs.map(iataRecord => iataRecord.iata);

    // Fetching airports excluding the ones in placesImport
    const airports = await prisma.airport.findMany({
        where: {
            iata: {
                notIn: usedIATACodes
            }
        }
    });

    // Iterate through each airport and fetch amenities
    for (const airport of airports) {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${airport.latitude},${airport.longitude}&radius=1500&type=restaurant|bar|cafe|bakery|store|clothing_store|convenience_store|car_rental|bus_station|subway_station|train_station&key=${process.env.GOOGLE_PLACES_API_KEY}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const amenities = await response.json();

                // Process each amenity and check if IATA code is inserted
                await Promise.all(amenities.results.map((amenity) => {
                    return prisma.thing.create({
                        data: {
                            thing: amenity.name,
                            latitude: parseFloat(amenity.geometry.location.lat),
                            longitude: parseFloat(amenity.geometry.location.lng),
                            iata: airport.iata
                        }
                    });
                }));
                
                // Insert the IATA code into placesImport if amenities are processed
                await prisma.placesImport.create({
                    data: {
                        iata: airport.iata
                    }
                });

                console.log('All amenities and IATA code have been inserted for', airport.iata);
            } else {
                throw new Error('Failed to fetch amenities');
            }
        } catch (error) {
            console.error('Error processing airport amenities:', error);
        }
    }
}

// Call the async function
fetchAndInsertAmenities()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
