"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PopupContents from "./PopupContents";

const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

const FlyToLocation = ({ coordinates }) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates) {
            map.flyTo([coordinates.lat, coordinates.lng], coordinates.zoom, { duration: 3 });
        }
    }, [coordinates, map]);
  
    return null;
};

const Map = ({coordinates, selectedThing, similarThings, appleDevice, setLoading, setMessage}) => {
    return (
        <MapContainer center={[37, -50]} zoom={3} className="h-full w-full absolute inset-0 z-0">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" attribution='&copy; <a href="https://carto.com/">CartoDB</a>' />
            <FlyToLocation coordinates={coordinates} />
            {coordinates && selectedThing && (
                <Marker position={[coordinates.lat, coordinates.lng]} icon={customIcon}>
                    <Popup>
                        <PopupContents 
                            thing={selectedThing} 
                            appleDevice={appleDevice}
                            setLoading={setLoading}
                            setMessage={setMessage} 
                        />
                    </Popup>
                </Marker>
            )}
            {similarThings && similarThings.map((thing) => (
                <Marker key={thing.id} position={[thing.latitude, thing.longitude]} icon={customIcon}>
                    <Popup>
                        <PopupContents 
                            thing={thing}   
                            appleDevice={appleDevice}
                            setLoading={setLoading}
                            setMessage={setMessage} 
                        />
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
