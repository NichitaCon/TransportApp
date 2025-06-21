import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { router } from "expo-router";

// --- Configuration ---
const OPERATOR_IDS = {
    // LEAVE OUT DUBLIN BUS FOR NOW, THERE ARE TOO MANY BUS STOPS TO REQUEST THROUGH THE API RAAAAAH
    // DUBLIN_BUS: "o-gc7-dublinbus",
    LUAS: "o-gc7x-luas",
    IARNROD_EIREANN: "o-gc-irishrail",
};

const OPERATOR_INFO = {
    [OPERATOR_IDS.DUBLIN_BUS]: { name: "Dublin Bus", pinColor: "gold" },
    [OPERATOR_IDS.LUAS]: { name: "Luas", pinColor: "tomato" },
    [OPERATOR_IDS.IARNROD_EIREANN]: {
        name: "Iarnród Éireann / DART",
        pinColor: "dodgerblue",
    },
    UNKNOWN: { name: "Unknown", pinColor: "slategrey" },
};

const TRANSITLAND_API_URL = "https://transit.land/api/v2/rest";

/**
 * A custom hook to fetch and manage transport stop data.
 * This encapsulates the data fetching logic for better separation of concerns.
 */
type Stop = {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    operatorId?: string;
};

const useTransportStops = () => {
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // We define the async function inside useEffect to avoid it being recreated on every render.
        const fetchStopsData = async () => {
            setLoading(true);
            setError(null);
            const operatorsQuery = Object.values(OPERATOR_IDS).join(",");
            const key = process.env.EXPO_PUBLIC_TRANSITLAND_KEY;

            const url = `${TRANSITLAND_API_URL}/stops?served_by_onestop_ids=${operatorsQuery}&limit=9000&api_key=${key}`;

            // console.log("Fetching stops from:", url);

            try {
                // For production: uncomment the fetch below
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `API request failed with status: ${response.status}`,
                    );
                }
                const data = await response.json();

                // For development: load local JSON instead of fetching from API
                // const data = require("~/irishrail_stops.json");

                // console.log("data", data)

                // Minor optimization: check for stops array before mapping
                if (data.stops && Array.isArray(data.stops)) {
                    // console.log("passed first boolean");

                    const formattedStops = data.stops
                        .map((stop) => {
                            const [longitude, latitude] =
                                stop.geometry?.coordinates || [];
                            // const agency = Array.isArray(stop.agencies)
                            //     ? stop.agencies.find(
                            //           (a) =>
                            //               OPERATOR_INFO[a.operator_onestop_id],
                            //       )
                            //     : null;

                            // if (!agency) {
                            //     console.warn("NO AGENCY");
                            // }

                            // if (!longitude) {
                            //     console.warn("NO longitude");
                            // }

                            // if (!latitude) {
                            //     console.warn("NO latitude");
                            // }

                            return {
                                id: stop.onestop_id,
                                latitude,
                                longitude,
                                name: stop.stop_name || "Unnamed Stop",
                                operatorId: stop.operator_onestop_id,
                            };

                        })
                        .filter(Boolean); // removes nulls
                    setStops(formattedStops);
                    console.log(
                        `Successfully formatted ${formattedStops.length} stops.`,
                    );
                    // console.log(
                    //     "formatted stops",
                    //     JSON.stringify(formattedStops, null, 2),
                    // );
                    // console.log("stops: ", stops);
                } else {
                    setStops([]);
                    console.warn("No stops found in the API response.");
                }
            } catch (e) {
                console.error("Failed to fetch or process stops:", e);
                setError(
                    "Failed to load transport data. Please try again later.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStopsData();
    }, []); // Empty dependency array ensures this runs only once.

    return { stops, loading, error };
};

// --- Main App Component ---
export default function App() {
    const { stops, loading, error } = useTransportStops();
    // console.log("stopos length in app return", stops.length);

    // Loading State UI
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-lg text-gray-700">
                    Loading Dublin Transport Stops...
                </Text>
            </View>
        );
    }

    // Error State UI
    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-5 bg-red-50">
                <Text className="text-xl font-semibold text-red-700 mb-2">
                    An Error Occurred
                </Text>
                <Text className="text-base text-red-600 text-center">
                    {error}
                </Text>
            </View>
        );
    }

    // Main Map UI
    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{ flex: 1 }} // Nativewind class for flex
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: 53.349805,
                    longitude: -6.26031,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                }}
            >
                {stops.map((stop) => {
                    const info = OPERATOR_INFO[stop.operatorId];
                    return (
                        <Marker
                            key={stop.id}
                            coordinate={{
                                latitude: stop.latitude,
                                longitude: stop.longitude,
                            }}
                            title={stop.name}
                            // description={info.name}
                            // pinColor={info.pinColor}
                            onPress={() => {
                                console.log(stop.id, "marker pressed");
                                router.push({
                                    pathname: "/selectedStop/[onestop_id]",
                                    params: {
                                        onestop_id: stop.id,
                                        stopName: stop.name,
                                    },
                                });
                            }}
                        />
                    );
                })}
            </MapView>

            {/* Legend overlay using Nativewind */}
            {/* <View className="absolute bottom-6 left-3 bg-white/95 p-3 rounded-xl shadow-lg">
                <Text className="font-bold text-base mb-2">Legend</Text>
                {Object.keys(OPERATOR_INFO).map((opId) => {
                    const info = OPERATOR_INFO[opId];
                    if (info.name === "Unknown") return null; // Don't show 'Unknown' in legend
                    return (
                        <View
                            key={info.name}
                            className="flex-row items-center mb-1"
                        >
                            <View
                                style={{ backgroundColor: info.pinColor }}
                                className="w-4 h-4 rounded-md mr-2.5 border border-slate-300"
                            />
                            <Text className="text-sm text-gray-800">
                                {info.name}
                            </Text>
                        </View>
                    );
                })}
            </View> */}
        </View>
    );
}
