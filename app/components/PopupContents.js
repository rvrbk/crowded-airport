"use client";

import { useState, useEffect } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon, MapPinIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';

const PopupContents = ({thing, appleDevice, setLoading, setMessage}) => {
    const [voted, hasVoted] = useState(false);

    const navigationUrl = `${appleDevice ? 'http://maps.apple.com/?daddr=' : 'https://www.google.com/maps/dir/?api=1&destination='}${thing.latitude},${thing.longitude}`;

    useEffect(() => {
        const votedCookie = Cookies.get(`voted_${thing.id}`);

        if (votedCookie) {
            hasVoted(true);
        }
    }, [thing]);

    const handleNavigationClick = async (e) => {
        try {
            await fetch('api/navigation_clicks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    thing_id: thing.id
                }) 
            });
        }
        catch (error) {
            console.error(error);
        }
    };

    const handleThumbClick = async (votes) => {
        setLoading(true);

        let registerEndpoint = 'downvote_clicks';

        if (votes === 'up') {
            registerEndpoint = 'upvote_clicks';
        }

        try {
            await fetch(`api/${registerEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    thing_id: thing.id
                }) 
            });
        }
        catch (error) {
            console.error(error);
        }

        try {
            const body = {
                id: thing.id,
                votes
            };

            const response = await fetch('/api/thing', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            setLoading(false);

            if (response.ok) {
                Cookies.set(`voted_${thing.id}`, 'true', { expires: 3650, path: '/', 'SameSite': 'None', secure: process.env.ENVIRONMENT === 'production' }); // 10 years expiry
                hasVoted(true);
            }
            else {
                setMessage({
                    type: 'error',
                    message: 'Something went wrong'
                });
            }
        }
        catch (error) {
            setLoading(false);

            console.error('Error upvoting:', error);
            setMessage({
                type: 'error',
                message: 'An error occured'
            });
        }
    };
    
    return (
        <div className="min-w-[200px] flex flex-col space-y-2 p-2">
            <div className="flex-grow mb-4">
                <h3 className="text-indigo-500 text-2xl">{thing.thing}</h3>
            </div>
            <div className="mt-auto flex flex-col w-full space-y-2">
                <a
                    href={navigationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleNavigationClick}
                    className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 flex items-center justify-between w-full text-white px-4 py-2 rounded-md"
                >
                    <span className="text-white">Navigate</span>
                    <MapPinIcon className="text-white h-5 w-5" />
                </a>
                <button 
                    onClick={!voted ? () => handleThumbClick('up') : null} 
                    className={`${voted ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} flex items-center justify-between w-full text-white px-4 py-2 rounded-md`}
                    disabled={voted}
                >
                    <span>Found it!</span>
                    <HandThumbUpIcon className="h-5 w-5" />
                </button>
                <button 
                    onClick={!voted ? () => handleThumbClick('down') : null} 
                    className={`${voted ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} flex items-center justify-between w-full text-white px-4 py-2 rounded-md`}
                    disabled={voted}
                >
                    <span>It is not here</span>
                    <HandThumbDownIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default PopupContents;