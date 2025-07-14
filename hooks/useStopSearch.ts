import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";

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

const TRANSITLAND_API_URL = "https://transit.land/api/v2/rest";
const key = process.env.EXPO_PUBLIC_TRANSITLAND_KEY;

export const useStopSearch = (query: string) => {
    const [searchResults, setSearchResults] = useState<GeoJSONStop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedQuery = useDebounce(query, 500); // 500ms delay

    useEffect(() => {
        // Only search if the debounced query is not empty
        // dont search short strings
        if (debouncedQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const searchForStops = async () => {
            setLoading(true);
            setError(null);
            console.log(`Searching for: "${debouncedQuery}"`);

            const url = `${TRANSITLAND_API_URL}/stops?search=${debouncedQuery}&operator_onestop_id=o-gc-dublinbus,o-ey-BusEireann,o-gc-luas,o-gc-irishrail&limit=50&api_key=${key}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                const data = await response.json();

                if (data.stops && Array.isArray(data.stops)) {
                    const formattedResults: GeoJSONStop[] = data.stops.map(
                        (stop: any) => ({
                            type: "Feature",
                            id: stop.id,
                            geometry: {
                                type: "Point",
                                coordinates: stop.geometry.coordinates,
                            },
                            properties: {
                                name: stop.stop_name || "Unnamed Stop",
                                oneStopId: stop.onestop_id,
                                stopKey: stop.id,
                            },
                        }),
                    );
                    setSearchResults(formattedResults);
                }
            } catch (e: any) {
                console.error("Failed to search for stops:", e);
                setError("Failed to search. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        searchForStops();
    }, [debouncedQuery]);

    return { searchResults, loading, error };
};
