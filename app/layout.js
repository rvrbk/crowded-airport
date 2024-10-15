import { GoogleAnalytics } from "nextjs-google-analytics";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); // Marks that the component has mounted on the client side
    }, []);

    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                {isClient && <GoogleAnalytics trackPageViews />}
                {children}
            </body>
        </html>
    );
}
