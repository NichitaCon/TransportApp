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
        stopNum: String;
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
        const searchForStops = async () => {
            setLoading(true);
            setError(null);
            // Only search if the debounced query is not empty
            // dont search short strings
            if (debouncedQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            console.log(`Searching for: "${debouncedQuery}"`);

            const url = `${TRANSITLAND_API_URL}/stops?search=${debouncedQuery}&served_by_onestop_ids=o-gc7-dublinbus,o-ey-BusEireann,o-gc7x-luas,o-gc-irishrail&limit=50&api_key=${key}`;

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
                                stopNum:
                                    stop.stop_code === "0"
                                        ? null
                                        : stop.stop_code,
                                oneStopId: stop.onestop_id,
                                stopKey: stop.id,
                            },
                        }),
                    );
                    // Sort so non bus stops (no stopNum) come first
                    formattedResults.sort((a, b) => {
                        if (!a.properties.stopNum && b.properties.stopNum)
                            return -1;
                        if (a.properties.stopNum && !b.properties.stopNum)
                            return 1;
                        return 0;
                    });
                    setSearchResults(formattedResults);
                }
                console.log("Parsed", searchResults.length, "search stop(s)");
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
