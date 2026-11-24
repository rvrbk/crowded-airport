"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "nextjs-google-analytics";

const CONSENT_KEY = "cookie-consent";

function removeAnalyticsCookies() {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
        window[`ga-disable-${measurementId}`] = true;
    }

    const parts = window.location.hostname.split(".");
    const domains = [window.location.hostname];
    for (let i = 1; i < parts.length - 1; i++) {
        domains.push(`.${parts.slice(i).join(".")}`);
    }

    document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        if (name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat")) {
            const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            document.cookie = expired;
            domains.forEach((domain) => {
                document.cookie = `${expired}; domain=${domain}`;
            });
        }
    });
}

/**
 * Loads Google Analytics only after the visitor accepted it, and shows the
 * consent banner until they have answered. The choice lives in localStorage.
 */
export default function Analytics() {
    const [consent, setConsent] = useState(null);
    const [bannerOpen, setBannerOpen] = useState(false);

    useEffect(() => {
        let stored = null;
        try {
            stored = window.localStorage.getItem(CONSENT_KEY);
        } catch (e) {
            stored = null;
        }

        setConsent(stored);
        setBannerOpen(stored !== "granted" && stored !== "denied");
        window.openCookieSettings = () => setBannerOpen(true);

        return () => {
            delete window.openCookieSettings;
        };
    }, []);

    const choose = (value) => {
        try {
            window.localStorage.setItem(CONSENT_KEY, value);
        } catch (e) {
            // Storage is unavailable; the choice only lasts for this visit.
        }

        if (value === "denied") {
            removeAnalyticsCookies();
        } else if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
            window[`ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`] = false;
        }

        setConsent(value);
        setBannerOpen(false);
    };

    return (
        <>
            {consent === "granted" && <GoogleAnalytics trackPageViews />}
            {bannerOpen && (
                <div
                    role="dialog"
                    aria-label="Cookie consent"
                    className="fixed inset-x-4 bottom-4 z-[10000] mx-auto max-w-sm rounded-lg border border-indigo-100 border-t-4 border-t-indigo-500 bg-white p-4 text-sm text-gray-700 shadow-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0"
                >
                    <p className="mb-3">
                        We use Google Analytics cookies to understand how this site is used. They are only set if you accept.
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => choose("denied")}
                            className="flex-1 rounded-md border border-indigo-500 bg-white px-3 py-2 font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Decline
                        </button>
                        <button
                            type="button"
                            onClick={() => choose("granted")}
                            className="flex-1 rounded-md border border-indigo-500 bg-indigo-500 px-3 py-2 font-medium text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
