import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Helper function to introduce a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndInsertAirports() {
  // Empty the table
  await prisma.airport.deleteMany({});
  console.log('Airport table emptied.');

  // Track the number of requests to adhere to the rate limit
  let requestCount = 0;

  for (let page = 1; page < 204; page++) {
    try {
      const response = await fetch(`https://airportgap.com/api/airports?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRPORTGAP_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Fetching page ${page} - Status: ${response.status}`);

      // Check if rate-limited (HTTP 429 Too Many Requests)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60; // Default retry after 60 seconds if header is missing
        console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
        await delay(retryAfter * 1000);  // Delay in milliseconds
        page--; // Retry the same page after delay
        continue;
      }

      if (!response.ok) {
        console.error(`Error: Received status code ${response.status} for page ${page}`);
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        continue;
      }

      const airports = await response.json();

      // Insert airports data into the database
      await Promise.all(
        airports.data.map(async (airport) => {
          console.log(airport.attributes);
          if (airport.attributes.city !== null) {
            return prisma.airport.create({
              data: {
              name: airport.attributes.name,
              city: airport.attributes.city,
              country: airport.attributes.country,
              iata: airport.attributes.iata,
              icao: airport.attributes.icao,
              latitude: parseFloat(airport.attributes.latitude),
              longitude: parseFloat(airport.attributes.longitude),
              altitude: parseInt(airport.attributes.altitude),
              timezone: airport.attributes.timezone,
              },
            });
          }
        })
      );

      // Increment request count and add a delay between requests
      requestCount++;

      // If we hit 100 requests, wait for 60 seconds before continuing
      if (requestCount >= 100) {
        console.log('Rate limit reached, waiting for 60 seconds...');
        await delay(60000); // Wait 60 seconds
        requestCount = 0; // Reset request count after waiting
      } else {
        await delay(600); // Add a 600ms delay between requests to stay under the rate limit
      }

    } catch (error) {
      console.error('Error fetching or inserting data:', error);
    }
  }

  console.log('Airports inserted successfully');
}

// Call the async function
fetchAndInsertAirports()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
