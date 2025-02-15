"use client";

import { useState, useEffect } from 'react';
import Select from 'react-select';
import { MapPinIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import haversine from 'haversine-distance';
import dynamic from 'next/dynamic'
import { configDotenv } from 'dotenv';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

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
    const [popupContents, setPopupContents] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTill, setDateTill] = useState('');
    const [isoDateFrom, setIsoDateFrom] = useState('');
    const [isoDateTill, setIsoDateTill] = useState('');
    const [iWantToAdoptChecked, setIwantToAdoptChecked] = useState(false);
    const [temporaryChecked, setTemporaryChecked] = useState(false);
    
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

    const storeThing = async () => {
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

            if (temporaryChecked) {
                body.fromDate = isoDateFrom;
                body.tillDate = isoDateTill;
            }

            if (iWantToAdoptChecked) {
                body.userName = userName;
                body.userEmail = userEmail;
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
                setUserName('');
                setUserEmail('');
                setDateFrom('');
                setDateTill('');
                setTemporaryChecked(false);
                setIwantToAdoptChecked(false);

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

    const handleBuyMeACoffeeClick = () => {
        window.open('https://buymeacoffee.com/rvrbkdev4', '_blank');
    };

    const handleHelpClick = () => {
        setIsFirstVisit(false);
        setPopupContents({
            title: 'Welcome to Crowded Airport',
            contents: (<>Crowded Airport is a crowd-sourced platform that allows travelers to find and add amenities in airports worldwide. By contributing information about amenities such as restrooms, lounges, and restaurants, you help fellow travelers easily locate essential services.
<br /><br />
To add an amenity, simply select an airport and click the &#34;I know where something is&#34; button. This lets you mark the location of the amenity so other travelers can find it.
<br /><br />
Your contributions make it easier for everyone to navigate busy airports!</>)});
        setShowPopup(true);
    };

    const handleAdoptionHelpClick = () => {
        setIsFirstVisit(false);
        setPopupContents({
            title: 'Adopting an Amenity',
            contents: (<>Curious about how popular an airport amenity is? Adopt it and receive weekly updates on how often it gets clicked! It&apos;s a fun, light-hearted way to connect with your favorite spots at the airport. Whether it&apos;s a comfy lounge chair or a bustling café, adopting an amenity is like having a little piece of the airport all to yourself. Join in, adopt an amenity, and enjoy your weekly &quot;popularity report&quot; on the goings-on at your chosen spot!</>)});
        setShowPopup(true);
    };

    const handleIwantToAdoptCheckboxClick = (checked) => {
        setIwantToAdoptChecked(checked);
    };

    const handleTemporaryCheckboxClick = (checked) => {
        console.log(checked);
        setTemporaryChecked(checked);
    };

    const setLocalUser = () => {
        localStorage.setItem('user', JSON.stringify({
            'email': userEmail
        }));
    };

    const handleUserEmailInput = async (value) => {
        setUserEmail(value);

        if (value.length > 0) {
            try {
                const response = await fetch(`/api/user?email=${value}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data) {
                        setUserName(data.name);
                    }
                } else {
                    setMessage('Failed to get data');
                } 
            } catch (error) {
                console.error('Error getting data:', error);
                setMessage('An error occurred');
            }
        }
    };

    useEffect(() => {
        if (activeForm === 'add-thing') {
            if (localStorage.getItem('user') !== null) {
                const user = JSON.parse(localStorage.getItem('user'));
    
                setUserEmail(user.email);
                handleUserEmailInput(user.email);
            }
        }
    }, [activeForm]);

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
                        <form onSubmit={(e) => {
                                e.preventDefault();

                                if (userEmail !== '') {
                                    setLocalUser();
                                }

                                storeThing();
                            }}>
                            <input placeholder="Amenity..." required onInput={(e) => setThingTitle(e.target.value)} value={thingTitle} className="w-full shadow-xl mb-3 px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <div className="flex items-center mb-3 overflow-hidden w-full shadow-xl border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <input required placeholder="Your current location..." value={currentLocation != null ? `${currentLocation.lat}, ${currentLocation.lng}` : ''} readOnly className="flex-grow px-4 py-2 outline-none" />
                                <button type="button" onClick={handleLocationClick} className="bg-indigo-500 text-white px-4 py-[10px] flex items-center justify-center hover:bg-indigo-600 focus:outline-none">
                                    <MapPinIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div class="mb-3">
                                <label>
                                    <input
                                        type="checkbox"
                                        onClick={(e) => handleTemporaryCheckboxClick(e.target.checked)}
                                        checked={temporaryChecked}
                                        className="px-4 py-2"
                                    ></input>
                                    <span className="ml-2">This amenity is temporary</span>
                                </label>
                            </div>
                            {temporaryChecked && (<> 
                                <input 
                                    type="text" 
                                    placeholder="Date from..."  
                                    onChange={(e) => {
                                        setDateFrom(e.target.value);
                                        setIsoDateFrom(e.target.valueAsDate.toISOString());
                                    }}
                                    onFocus={(e) => {e.target.type = 'date'}} 
                                    onBlur={(e) => {e.target.type = 'text'}} 
                                    value={dateFrom}
                                    className="w-full shadow-xl mb-3 px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input 
                                    type="text" 
                                    placeholder="Date till..."  
                                    onChange={(e) => {
                                        setDateTill(e.target.value);
                                        setIsoDateTill(e.target.valueAsDate.toISOString());
                                    }}
                                    onFocus={(e) => {e.target.type = 'date'}} 
                                    onBlur={(e) => {e.target.type = 'text'}} 
                                    value={dateTill}
                                    className="w-full shadow-xl mb-3 px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </>)}
                            <div className="flex items-center mb-3">
                                <label>
                                <input
                                    type="checkbox"
                                    onClick={(e) => handleIwantToAdoptCheckboxClick(e.target.checked)}
                                    checked={iWantToAdoptChecked}
                                    className="px-4 py-2"
                                />
                                <span className="ml-2">I want to adopt this amenity</span>
                                </label>
                                <button 
                                    type="button"
                                    class="ml-2 bg-indigo-500 text-white border-2 border-white rounded-full h-6 w-6 flex items-center justify-center shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    aria-label="Help"
                                    onClick={handleAdoptionHelpClick}
                                >?</button>
                            </div>
                            {iWantToAdoptChecked && (<>
                                <input type="email" required placeholder="Your e-mail addess..." onInput={(e) => handleUserEmailInput(e.target.value)} value={userEmail} className="w-full shadow-xl mb-3 px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input placeholder="Your name..." required onInput={(e) => setUserName(e.target.value)} value={userName} className="w-full shadow-xl mb-3 px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </>)}
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
            <div className="absolute flex space-x-1 top-4 right-4">
                <button 
                    className={`bg-yellow-400 text-white border-2 border-white rounded-full h-8 w-8 flex items-center justify-center shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 ${isFirstVisit ? 'animate-buzz' : ''}`}
                    aria-label="Help"
                    onClick={handleBuyMeACoffeeClick}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white"
                        fill="currentColor" 
                        viewBox="0 0 50 50">
                            <path d="M15.427734 3C14.062745 3 12.859456 3.9323872 12.521484 5.2558594L12.074219 7L12 7C11.133553 7 10.343298 7.2932543 9.7636719 7.7890625C9.1840453 8.2848707 8.8153921 8.9380401 8.5664062 9.625C8.0684347 10.99892 8 12.57785 8 14 A 1.0001 1.0001 0 0 0 9 15L10.119141 15L13.970703 45.017578 A 1.0001 1.0001 0 0 0 13.974609 45.042969C14.160517 46.237774 15.204427 47 16.367188 47L33.630859 47C34.794193 47 35.83786 46.235688 36.023438 45.042969 A 1.0001 1.0001 0 0 0 36.027344 45.017578L39.880859 15L41 15 A 1.0001 1.0001 0 0 0 42 14C42 12.57785 41.931565 10.99892 41.433594 9.625C41.184608 8.9380401 40.815955 8.2848707 40.236328 7.7890625C39.656702 7.2932543 38.866447 7 38 7L37.90625 7L37.474609 5.2734375 A 1.0001 1.0001 0 0 0 37.474609 5.2714844C37.141393 3.9416023 35.934385 3 34.5625 3L15.427734 3 z M 15.427734 5L34.5625 5C35.026615 5 35.42042 5.3076915 35.533203 5.7578125L35.84375 7L14.138672 7L14.458984 5.7519531C14.573013 5.3054253 14.966724 5 15.427734 5 z M 12.912109 8.9960938 A 1.0001 1.0001 0 0 0 13 9L37 9 A 1.0001 1.0001 0 0 0 37.064453 8.9980469 A 1.0001 1.0001 0 0 0 37.125 9L38 9C38.459053 9 38.706095 9.1106518 38.9375 9.3085938C39.168905 9.5065356 39.385047 9.8386001 39.554688 10.306641C39.802098 10.989256 39.830025 12.022136 39.878906 13L11.166016 13 A 1.0001 1.0001 0 0 0 10.955078 12.986328 A 1.0001 1.0001 0 0 0 10.835938 13L10.121094 13C10.169974 12.022136 10.197905 10.989256 10.445312 10.306641C10.614953 9.8386001 10.831095 9.5065355 11.0625 9.3085938C11.293905 9.1106518 11.540947 9 12 9L12.849609 9 A 1.0001 1.0001 0 0 0 12.912109 8.9960938 z M 12.136719 15L37.863281 15L36.708984 24L31.984375 24C30.659565 21.085293 28.095496 19.012008 24.992188 19.003906C24.945978 19.002306 24.902818 19.004791 24.857422 19.007812C21.786193 19.059813 19.278095 21.123031 17.988281 24L13.291016 24L12.136719 15 z M 24.945312 20.998047C24.966323 20.999147 24.947809 21 24.974609 21C27.392834 21 29.474358 22.682557 30.451172 25.34375 A 1.0001 1.0001 0 0 0 31.388672 26L31.490234 26L36.451172 26L35.810547 31L31.527344 31L31.388672 31 A 1.0001 1.0001 0 0 0 30.447266 31.660156C30.227471 32.270178 29.97672 32.828834 29.671875 33.296875C28.538498 35.034193 26.884731 35.976012 25.087891 35.998047L25.021484 35.998047C23.246013 35.998047 21.592289 35.09639 20.431641 33.398438 A 1.0001 1.0001 0 0 0 20.431641 33.396484C20.091871 32.900328 19.8123 32.306572 19.574219 31.65625 A 1.0001 1.0001 0 0 0 18.634766 31L18.521484 31L14.189453 31L13.548828 26L18.484375 26L18.589844 26 A 1.0001 1.0001 0 0 0 19.529297 25.339844C20.477663 22.708373 22.511851 21.026828 24.917969 21 A 1.0001 1.0001 0 0 0 24.945312 20.998047 z M 24.939453 23C23.705063 23.01347 22.665152 23.777929 22.001953 24.794922C21.338753 25.811913 20.978618 27.119966 20.994141 28.542969C21.009661 29.965972 21.398756 31.267249 22.083984 32.269531C22.769211 33.271814 23.826157 34.013466 25.060547 34C26.294937 33.98654 27.334848 33.22207 27.998047 32.205078C28.661247 31.188086 29.021382 29.880035 29.005859 28.457031C28.990339 27.034028 28.601244 25.732752 27.916016 24.730469C27.230789 23.728186 26.173843 22.986534 24.939453 23 z M 24.960938 25C25.386064 24.9954 25.843602 25.244939 26.263672 25.859375C26.683742 26.473812 26.994273 27.416385 27.005859 28.478516C27.017449 29.540646 26.728831 30.489827 26.322266 31.113281C25.915699 31.736734 25.464189 31.995363 25.039062 32C24.613936 32.0046 24.156399 31.755062 23.736328 31.140625C23.316259 30.526189 23.005727 29.583615 22.994141 28.521484C22.982551 27.459353 23.271169 26.510173 23.677734 25.886719C24.084301 25.263265 24.535811 25.004637 24.960938 25 z M 14.445312 33L18.021484 33C18.24578 33.51991 18.454188 34.047503 18.78125 34.525391C20.264602 36.695438 22.552956 37.998047 25.021484 37.998047L25.091797 37.998047 A 1.0001 1.0001 0 0 0 25.101562 37.998047C27.60154 37.971307 29.89481 36.614655 31.345703 34.390625 A 1.0001 1.0001 0 0 0 31.347656 34.390625C31.635588 33.948746 31.81459 33.471059 32.013672 33L35.554688 33L34.048828 44.736328C34.042405 44.777609 33.827526 45 33.630859 45L16.367188 45C16.173946 45 15.95727 44.775524 15.951172 44.736328L14.445312 33 z"/>
                        </svg>
                </button>
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
                        <h2 className="text-lg font-semibold mb-2">{popupContents.title}</h2>
                        <p className="text-gray-700 mb-4">{popupContents.contents}</p>
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