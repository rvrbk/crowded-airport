import { useState, useEffect } from 'react';
import { MapPinIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import haversine from 'haversine-distance';

export default function AddThing({ setActiveForm, currentLocation, setCurrentLocation, isFirstVisit, setIsFirstVisit, setLoading, selectedAirport, setCoordinates, activeForm, setMessage, setPopupContents, setShowPopup }) {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTill, setDateTill] = useState('');
    const [isoDateFrom, setIsoDateFrom] = useState('');
    const [isoDateTill, setIsoDateTill] = useState('');
    const [iWantToAdoptChecked, setIwantToAdoptChecked] = useState(false);
    const [temporaryChecked, setTemporaryChecked] = useState(false);
    const [thingTitle, setThingTitle] = useState('');

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
        setTemporaryChecked(checked);
    };

    const setLocalUser = () => {
        localStorage.setItem('user', JSON.stringify({
            'email': userEmail
        }));
    };

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
    
    return (<>
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
                <div class="mb-3 flex justify-between">
                    <label class="flex items-center">From</label>
                    <input 
                        type="date"   
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setIsoDateFrom(e.target.valueAsDate.toISOString());
                        }}
                        value={dateFrom}
                        className="w-4/5 shadow-xl px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div class="mb-3 flex justify-between">
                    <label class="flex items-center">Till</label>
                    <input 
                        type="date"   
                        onChange={(e) => {
                            setDateTill(e.target.value);
                            setIsoDateTill(e.target.valueAsDate.toISOString());
                        }}
                        value={dateTill}
                        className="w-4/5 shadow-xl px-4 py-2 border color-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
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
    </>);
}