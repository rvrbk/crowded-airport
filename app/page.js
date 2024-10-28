"use client";

import { useState, useEffect } from 'react';
import Select from 'react-select';
import { MapPinIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import haversine from 'haversine-distance';
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./components/Map'), { ssr:false });

export default function Home() {
    const [airports, setAirports] = useState([]);
    const [things, setThings] = useState([]);
    const [similarThings, setSimilarThings] = useState([]);
    const [coordinates, setCoordinates] = useState(null);
    const [selectedAirport, setSelectedAirport] = useState(null);
    const [selectedThing, setSelectedThing] = useState(null);
    const [activeForm, setActiveForm] = useState('airport-search');
    const [thingTitle, setThingTitle] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [appleDevice, isAppleDevice] = useState(true);
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    
    const handleWhereAmIClick = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            console.warn("Geolocation is not supported by your browser");
        } else {
            setLoading(true);
            
            navigator.geolocation.getCurrentPosition((position) => {
                setLoading(false);

                let airportCoordinates = null;
                let distanceInMeters = 0;
                let distanceInMiles = 0;

                let atAirport = null;

                airports.map((airport) => {
                    airportCoordinates = { lat: airport.latitude, lng: airport.longitude };
                    distanceInMeters = haversine(position.coords, airportCoordinates);
                    distanceInMiles = distanceInMeters / 1609.34;

                    // // 8 miles is the size of Atlanta airport, one of the biggest airports in the world
                    if (process.env.NEXT_PUBLIC_ENVIRONMENT  === 'production' && distanceInMiles <= 8 || process.env.NEXT_PUBLIC_ENVIRONMENT  !== 'production') {
                        setCurrentLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });

                        atAirport = airport;
                        handleAirportChange(atAirport);
                    }
                });

                if (atAirport) {
                    setMessage({
                        type: 'success',
                        message: `You're at ${atAirport.name}!`
                    });
                }
                else {
                    setMessage({
                        type: 'info',
                        message: 'You don\'t appear to be at an airport, select one from the list below'
                    });
                }
            }, (error) => {
                console.warn(error);
            });
        }
    }

    const handleLocationClick = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            console.warn("Geolocation is not supported by your browser");
        } else {
            setLoading(true);
            
            navigator.geolocation.getCurrentPosition((position) => {
                setLoading(false);

                const airportCoordinates = { lat: selectedAirport.latitude, lng: selectedAirport.longitude };
                const distanceInMeters = haversine(position.coords, airportCoordinates);
                const distanceInMiles = distanceInMeters / 1609.34;

                // 8 miles is the size of Atlanta airport, one of the biggest airports in the world
                if (process.env.NEXT_PUBLIC_ENVIRONMENT  === 'production' && distanceInMiles <= 8 || process.env.NEXT_PUBLIC_ENVIRONMENT  !== 'production') {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    
                    setCoordinates({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                } else {
                    setMessage({
                        type: 'error',
                        message: `You don't appear to be at ${selectedAirport.name}`}
                    );
                }
            }, (error) => {
                console.warn(error);
            });
        }
    }

    const fillThingsByAirport = async (airport) => {
        const { iata } = airport;
        
        try {
            const response = await fetch(`/api/thing?iata=${iata}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                },
            });
        
            if (response.ok) {
                const data = await response.json();
                setThings(data);
            } else {
                setMessage({
                    type: 'error',
                    message: 'An error occured'
                });
            } 
        } catch (error) {
            console.error('Error getting things:', error);
            setMessage({
                type: 'error',
                message: 'An error occured'
            });
        }
    }

    const handleAirportChange = (airport) => {
        setMessage(null);
        setSelectedAirport(airport);
        setSelectedThing(null);
        setActiveForm('thing-search');
        setCoordinates({
            lat: airport.latitude,
            lng: airport.longitude,
            zoom: 16
        });
    }

    const handleThingChange = async (thing) => {
        setSelectedThing(thing);

        try {
            const response = await fetch(`/api/thing?thing=${thing.thing}&iata=${selectedAirport.iata}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                },
            });
        
            if (response.ok) {
                const data = await response.json();
                setSimilarThings(data);
            } else {
                setMessage({
                    type: 'error',
                    message: 'An error occured'
                });
            } 
        } catch (error) {
            console.error('Error getting things:', error);
            setMessage({
                type: 'error',
                message: 'An error occured'
            });
        }
        
        setMessage(null);
        setActiveForm('thing');
        setCoordinates({
            lat: thing.latitude,
            lng: thing.longitude,
            zoom: 18
        });
    }

    const storeThing = async (e) => {
        e.preventDefault();

        if (!currentLocation) {
            setMessage({
                type: 'error',
                message: 'Please provide a location'
            });

            return;
        }
    
        setLoading(true);

        try {
            let body = {
                thing: thingTitle,
                iata: selectedAirport.iata
            };

            if (currentLocation) {
                body.latitude = currentLocation.lat;
                body.longitude = currentLocation.lng;
            }

            const response = await fetch('/api/thing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            setLoading(false);
        
            if (response.ok) {
                setThingTitle('');
                setCurrentLocation(null);

                setMessage({
                    type: 'success',
                    message: `Thank you for helping others find their way at ${selectedAirport.name}!`
                });
            } else {
                setMessage({
                    type: 'error',
                    message: 'An error occured'
                });
            } 
        } catch (error) {
            setLoading(false);
            
            console.error('Error saving thing:', error);
            setMessage({
                type: 'error',
                message: 'An error occured'
            });
        }
    };

    useEffect(() => {
        async function handleAirports() {
            try {
                const response = await fetch('/api/airport', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            
                if (response.ok) {
                    const data = await response.json();
                    setAirports(data);
                } else {
                    setMessage('Failed to get data');
                } 
            } catch (error) {
                console.error('Error getting data:', error);
                setMessage('An error occurred');
            }
        }

        handleAirports();
    }, []);

    useEffect(() => {
        if (activeForm === 'thing-search' && selectedAirport) {
            fillThingsByAirport(selectedAirport);
        }
    }, [activeForm, selectedAirport]);

    useEffect(() => {
        if (activeForm === 'airport-search') {
            setMessage({
                type: 'info',
                message: 'Never get lost at the airport again!'
            });
        }
    }, [activeForm]);

    useEffect(() => {
        isAppleDevice(/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent));
    });

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setIsFirstVisit(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    const handleHelpClick = () => {
        setIsFirstVisit(false);
        setShowPopup(true);
    };

    const closePopup = () => setShowPopup(false);

    return (
        <div className={`flex items-center justify-center h-dvh bg-gray-100`}>
            <div className={`${!loading ? 'hidden' : ''} flex items-center justify-center h-dvh fixed inset-0 z-50 bg-white bg-opacity-70`}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-solid"></div>
            </div>
            <Map 
                coordinates={coordinates} 
                selectedThing={selectedThing} 
                similarThings={similarThings} 
                appleDevice={appleDevice}
                setLoading={setLoading}
                setMessage={setMessage} 
            />
            <div className="w-full max-w-xs">
                <div className="relative">
                    <div className={`${!message ? 'hidden' : ''} text-center max-w-md mx-auto mb-3 p-2 ${message ? message.type === 'error' ? 'bg-red-100 text-red-700 border-red-400' : message.type === 'info' ? 'bg-indigo-100 text-indigo-700 border-indigo-400' : 'bg-green-100 text-green-700 border-green-400' : ''} border rounded-md shadow-xl`}>
                        <p>{ message ? message.message : '' }</p>
                    </div>
                    <div className={`${activeForm === 'thing' ? 'hidden' : ''} text-center max-w-md mx-auto mb-3 p-2 font-pacifico text-indigo-500 text-3xl`}>
                        <p>- Crowded Airport -</p>
                    </div>
                    <div className={activeForm === 'thing' ? 'hidden' : ''}>
                        <Select 
                            value={selectedAirport}
                            options={airports} 
                            isSearchable 
                            onChange={handleAirportChange} 
                            placeholder="Airport..." 
                            className="w-full shadow-xl mb-3 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                            getOptionLabel={(option) => `${option.name} (${option.iata})`} 
                            getOptionValue={(option) => option.iata}
                        />
                        <button 
                            onClick={handleWhereAmIClick} 
                            className={`${activeForm !== 'airport-search' ? 'hidden' : ''} w-full mb-3 shadow-xl px-4 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >Where am I?</button>
                    </div>
                    <div className={activeForm !== 'thing-search' ? 'hidden' : ''}>
                        <Select 
                            value={selectedThing}
                            options={things} 
                            isSearchable 
                            onChange={handleThingChange}
                            placeholder="What are you looking for?" 
                            className="w-full shadow-xl mb-3 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                            getOptionLabel={(option) => option.thing} 
                            getOptionValue={(option) => option.id}
                        />
                        <button name="add" onClick={() => setActiveForm('add-thing')} className="w-full mb-3 shadow-xl px-4 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">I know where something is</button>
                    </div>
                    <div className={activeForm !== 'add-thing' ? 'hidden' : ''}>
                        <form onSubmit={storeThing}>
                            <input placeholder="Amenity..." required onInput={(e) => setThingTitle(e.target.value)} value={thingTitle} className="w-full shadow-xl mb-3 px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <div className="flex items-center mb-3 overflow-hidden w-full shadow-xl border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <input required placeholder="Your current location..." value={currentLocation != null ? `${currentLocation.lat}, ${currentLocation.lng}` : ''} readOnly className="flex-grow px-4 py-2 outline-none" />
                                <button type="button" onClick={handleLocationClick} className="bg-indigo-500 text-white px-4 py-[10px] flex items-center justify-center hover:bg-indigo-600 focus:outline-none">
                                    <MapPinIcon className="h-5 w-5" />
                                </button> 
                            </div>
                            <div className="flex items-center space-x-2"> 
                                <button 
                                    onClick={() => {
                                        setMessage(null);
                                        setActiveForm('thing-search');
                                    }}
                                    type="button" 
                                    className="bg-indigo-500 text-white px-3 py-2 rounded-md flex items-center shadow-xl justify-center hover:bg-indigo-600 focus:outline-none"
                                >
                                    <span className="mr-1">Back</span>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                </button>
                                <button 
                                    type="submit" 
                                    className="w-full shadow-xl px-4 py-2 bg-indigo-500 text-white rounded-md shadow-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className={activeForm !== 'thing' ? 'hidden' : ''}>
                <button 
                    onClick={() => {
                        setMessage(null);
                        setSelectedThing(null);
                        setSimilarThings([]);
                        setActiveForm('thing-search');
                    }}
                    className="absolute bottom-4 left-4 bg-indigo-500 text-white px-3 py-2 rounded-md flex items-center shadow-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    <span>Back</span>
                </button>
            </div>
            <div className="absolute top-4 right-4">
                <button 
                    className={`bg-indigo-500 text-white border-2 border-white rounded-full h-8 w-8 flex items-center justify-center shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isFirstVisit ? 'animate-buzz' : ''}`}
                    aria-label="Help"
                    onClick={handleHelpClick}
                >
                    ?
                </button>
            </div>

            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full text-center">
                        <h2 className="text-lg font-semibold mb-2">Welcome to Crowded Airport</h2>
                        <p className="text-gray-700 mb-4">
                        Crowded Airport is a crowd-sourced platform that allows travelers to find and add amenities in airports worldwide. By contributing information about amenities such as restrooms, lounges, and restaurants, you help fellow travelers easily locate essential services.
<br /><br />
To add an amenity, simply select an airport and click the &#34;I know where something is&#34; button. This lets you mark the location of the amenity so other travelers can find it.
<br /><br />
Your contributions make it easier for everyone to navigate busy airports!
                        </p>
                        <button
                            onClick={closePopup}
                            className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
} 