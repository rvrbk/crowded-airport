"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from "react-leaflet";
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

const handleMarkerClick = async (thing) => {
    try {
        const body = {
            thing_id: thing.id
        };

        const response = await fetch('/api/marker_clicks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Error registering click:', error);
    }
};

const FlyToLocation = ({ coordinates }) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates) {
            map.flyTo([coordinates.lat, coordinates.lng], coordinates.zoom, { duration: 3 });
        }
    }, [coordinates, map]);
  
    return null;
};

let countriesPromise = null;
const loadCountries = () => {
    if (!countriesPromise) {
        countriesPromise = fetch("/countries.json").then((r) => r.json()).catch(() => null);
    }
    return countriesPromise;
};

const inRing = (lng, lat, ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
};

const inPolygon = (lng, lat, rings) =>
    inRing(lng, lat, rings[0]) && !rings.slice(1).some((hole) => inRing(lng, lat, hole));

const containsPoint = (geometry, lng, lat) =>
    geometry.type === "Polygon"
        ? inPolygon(lng, lat, geometry.coordinates)
        : geometry.coordinates.some((poly) => inPolygon(lng, lat, poly));

const CountryHighlight = ({ coordinates }) => {
    const [feature, setFeature] = useState(null);

    useEffect(() => {
        let cancelled = false;
        if (!coordinates) {
            setFeature(null);
            return;
        }
        loadCountries().then((data) => {
            if (cancelled || !data) return;
            setFeature(data.features.find((f) => containsPoint(f.geometry, coordinates.lng, coordinates.lat)) || null);
        });
        return () => { cancelled = true; };
    }, [coordinates]);

    if (!feature) return null;

    return (
        <GeoJSON
            key={feature.properties.name}
            data={feature}
            interactive={false}
            style={{ color: "#818cf8", weight: 2, fillColor: "#6366f1", fillOpacity: 0.35 }}
        />
    );
};

const Map = ({coordinates, selectedThing, similarThings, appleDevice, setLoading, setMessage}) => {
    return (
        <MapContainer center={[37, -50]} zoom={3} className="h-full w-full absolute inset-0 z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
            <CountryHighlight coordinates={coordinates} />
            <FlyToLocation coordinates={coordinates} />
            {coordinates && selectedThing && (
                <Marker 
                    eventHandlers={{
                        click: () => handleMarkerClick(selectedThing)
                    }}
                    position={[coordinates.lat, coordinates.lng]} 
                    icon={customIcon}
                >
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
                <Marker
                    eventHandlers={{
                        click: () => handleMarkerClick(thing)
                    }} 
                    onClick={handleMarkerClick} 
                    key={thing.id} 
                    position={[thing.latitude, thing.longitude]} 
                    icon={customIcon}
                >
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
