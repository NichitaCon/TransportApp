import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";
import { Region } from "react-native-maps";

const TRANSITLAND_API_URL = "https://transit.land/api/v2/rest";
type GeoJSONStop = {
    type: "Feature";
    id: string;
    geometry: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
    properties: {
        name: string;
        oneStopId: string;
        stopKey: string;
    };
};

/**
 * A custom hook to fetch transport stops based on the visible map region.
 * @param region The current map region.
 */

export const useTransportStops = (region: Region | null) => {
    const [stops, setStops] = useState<Map<string, GeoJSONStop>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedRegion = useDebounce(region, 500); // 500ms delay

    useEffect(() => {
        if (!debouncedRegion) {
            return;
        }

        const fetchStopsData = async () => {
            setLoading(true);
            setError(null);

            // Calculate bounding box from the debounced region
            const { latitude, longitude, latitudeDelta, longitudeDelta } =
                debouncedRegion;
            const minLng = longitude - longitudeDelta / 2;
            const minLat = latitude - latitudeDelta / 2;
            const maxLng = longitude + longitudeDelta / 2;
            const maxLat = latitude + latitudeDelta / 2;
            const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;

            const key = process.env.EXPO_PUBLIC_TRANSITLAND_KEY;
            const url = `${TRANSITLAND_API_URL}/stops?bbox=${bbox}&limit=500&api_key=${key}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `API request failed with status: ${response.status}`,
                    );
                }
                const data = await response.json();

                if (data.stops && Array.isArray(data.stops)) {
                    const newStops = new Map<string, GeoJSONStop>();
                    data.stops.forEach((stop: any) => {
                        const [longitude, latitude] =
                            stop.geometry?.coordinates || [];

                        // Ensure we have a valid stop with an ID and coordinates
                        if (stop.id && latitude != null && longitude != null) {
                            const formattedStop: GeoJSONStop = {
                                type: "Feature",
                                id: stop.id, // Use the primary Transitland ID for the map key
                                geometry: {
                                    type: "Point",
                                    coordinates: [longitude, latitude],
                                },
                                properties: {
                                    name: stop.stop_name || "Unnamed Stop",
                                    oneStopId: stop.onestop_id,
                                    stopKey: stop.id, // Use the stable ID for React keys
                                },
                            };
                            newStops.set(formattedStop.id, formattedStop);
                        }
                    });

                    // Merge new stops with existing ones to accumulate data as user pans
                    setStops((prevStops) => {
                        const updatedStops = new Map(prevStops);
                        newStops.forEach((value, key) => {
                            updatedStops.set(key, value);
                        });
                        return updatedStops;
                    });
                }
            } catch (e) {
                console.error("Failed to fetch or process stops:", e);
                setError(
                    "Failed to load transport data. Please try again later.",
                );
            } finally {
                console.log("loading = ", loading);
                setLoading(false);
            }
        };

        fetchStopsData();
    }, [debouncedRegion]);

    return { stops: Array.from(stops.values()), loading, error };
};
