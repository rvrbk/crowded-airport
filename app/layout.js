"use client";

import "./globals.css";
import { GoogleAnalytics } from "nextjs-google-analytics";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                <GoogleAnalytics trackPageViews />
                {children}
            </body>
        </html>
  );
}
