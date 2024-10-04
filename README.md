This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Outline
A crowdsourced information source on airports worldwide. Think about information such as
- Location of coffeeshops
- Location of resturants
- Location of bathrooms
- Location of seats
- Location of power outlets
- Location of WiFi
- Name of WiFi provider
- Location of charging stations
- Location of luggage carts
- Location of ATMs
- Location of lost and found
- Location of security checkpoints
- Location of immigration
- Location of customs
- Location of baggage claim
- Location of car rentals
- Location of taxis
- Location of buses
- Locations of different terminals and their uses (international, domestic, cargo, etc.)
- Airlines currently in the airport
- Terminal maps
- Information on current security alerts
- Information on current travel advisories
- Information on current weather
- Information on current delays
- Information on current construction
- Information on current events

The idea is to have users put in information that they know about an airport, and then have other users be able to search for and find that information. The tricky part is how do you handle the updating of information. How does a coffeeshop get added to the database? Does a user have to go through a bunch of approval processes? How does one verify the information they put in is correct?

## Upvoting by adding the same type of information
Once 2 users add the same type of information, we can assume that the information is correct and can show it on the page or as search result, otherwise it will only show up in the adding section.

## Deleting or updating information
Users should be able to delete or update information that they have added. For deleting an entry only one user deleting it is enough. For updating an entry, we can have a system where users can vote to update the entry. The entry with the most votes wins. Each entry should have a button for upvoting, downvoting, deletion or update.

## Search
Users should be able to search for information about an airport. They should be able to search by airport name, city, country, or airport code. They should also be able to search by information such as "resturants", "wifi", "seats", "bathrooms", etc.

## API (nice to have)
The information should be publicly accessible via an API. This is important for a few reasons. First, it allows for easy access to the information. Second, it allows for easy integration with other applications. Third, it allows for easy analysis of the information.

## Displaying information
Since the content is crowdsourced we can't be certain that a map of the airport is available or correct. When adding information users must be able to upload a map of the airport with the location of the information they are adding. We can use this map to display the information along with other information.

## Using AI to verify information
We can use AI to verify information. For example, if a user adds a new coffeeshop, we can use AI to determine if the information is correct. We can use AI to verify the location of the coffeeshop. We can use AI to verify the name of the coffeeshop. We can use AI to verify the opening and closing times of the coffeeshop. We can use AI to verify the amenities of the coffeeshop. We can use AI to verify the map of the airport.

## Using AI to compose a map of all the different types of maps in the system
We can use AI to compose a map of all the different types of maps in the system. We can use this map to display the information to the user.

## User accounts
We can have a user account system. Users can sign up for an account. They can log in and log out. They can add information. They can upvote information. They can delete information. They can update information.

## Data storage
We can use a database to store the information. We can use a 3rd party database service. We can use a relational database. We can use a non-relational database. We can use a graph database. We can use a document database. We can use a key-value database. We can use a column-oriented database. We can use a time-series database. We can use a graph database. We can use a document database. We can use a key-value database. We can use a column-oriented database. We can use a time-series database.
 
## Minimal viable product (MVP)
We can start with a minimal viable product. We can start with a list of airports. We can start with a list of information types. We can start with a list of amenities. We can start with a list of airlines. We can start with a list of terminals. We can start with a list of security checkpoints. We can start with a list of immigration. We can start with a list of customs. We can start with a list of baggage claim. We can start with a list of car rentals. We can start with a list of taxis. We can start with a list of buses. We can start with a list of different terminals and their uses (international, domestic, cargo, etc.)

## User interface
We can use a user interface to allow users to add information. We can use a user interface to allow users to search for information. We can use a user interface to allow users to view information. We can use a user interface to allow users to upvote information. We can use a user interface to allow users to delete information. We can use a user interface to allow users to update information.

# Ideas/brainfarts
- Google Analytics
- meta tags
- Stripe payments
- Buy me a beer
## Monetize
Yes, you can monetize your crowd-sourced airport place finder by offering companies the option to feature their locations with logos. This approach can provide value to both your business and the companies interested in increased visibility. Here are some considerations to help you implement this strategy effectively: 1. Market Research: • Assess Demand: Determine if there is interest from businesses operating within airports (e.g., restaurants, shops, lounges) to invest in additional visibility on your platform. • Competitor Analysis: Look at similar apps or services to see if they offer paid features and how successful they are. 2. Value Proposition: • Highlight Benefits: Clearly communicate to potential advertisers how featuring their logo will increase foot traffic and brand recognition among travelers. • User Engagement Metrics: Provide data or projections on user engagement to strengthen your pitch. 3. Pricing Strategy: • Tiered Plans: Offer different levels of exposure (e.g., basic listing, logo inclusion, featured placement). • Flexible Options: Consider monthly subscriptions or one-time fees to accommodate different business sizes and budgets. 4. User Experience: • Non-Intrusive Ads: Ensure that paid listings enhance the user experience without overwhelming them with advertisements. • Relevance: Keep the focus on providing valuable and accurate information to users. 5. Transparency and Trust: • Clear Labeling: Mark sponsored or featured listings to maintain transparency with your users. • Reviews and Ratings: Allow users to rate and review all places equally, regardless of sponsorship. 6. Legal and Ethical Considerations: • Advertising Regulations: Comply with advertising laws and regulations in the jurisdictions where your app operates. • Permission for Logos: Obtain proper authorization to use company logos to avoid intellectual property infringements. 7. Technical Implementation: • Easy Integration: Make it simple for companies to upload their logos and manage their listings. • Analytics Dashboard: Provide advertisers with access to analytics to track the performance of their listings. 8. Marketing and Outreach: • Direct Contact: Reach out to businesses directly to offer your advertising opportunities. • Partnerships: Form partnerships with airport authorities or business associations for broader reach. 9. Feedback Loop: • Gather Insights: Regularly solicit feedback from both users and advertisers to improve the service. • Adapt and Evolve: Be prepared to adjust your strategy based on what works and what doesn’t. By offering paid logo placements, you create a revenue stream while providing businesses with a platform to reach potential customers. Just ensure that the monetization strategy aligns with the overall goals of your app and adds value for all stakeholders involved.

# Goals
## Goal 1
Interface with logo/title, input field for airport (autocomplete on api list), if airport not yet exists in database add it, otherwise use database entry. Input field for key - value pair with searches in the database for simular keys, displaying those keys with their values. User can select them and decide if he wants to upvote, downvote or delete, these choices should be stored in the database with how many votes. A cron should later administer them according to above rules (Upvoting by clicking thumbs up or thumbs down).

## Goal 2
Users