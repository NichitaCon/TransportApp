import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Dimensions,
    Pressable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
    Clusterer,
    isPointCluster,
    useClusterer,
} from "react-native-clusterer";
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

type Region = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

const useTransportStops = () => {
    const [stops, setStops] = useState<GeoJSONStop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStopsData = async () => {
            setLoading(true);
            setError(null);
            const operatorsQuery = Object.values(OPERATOR_IDS).join(",");
            const key = process.env.EXPO_PUBLIC_TRANSITLAND_KEY;

            const url = `${TRANSITLAND_API_URL}/stops?served_by_onestop_ids=${operatorsQuery}&limit=9000&api_key=${key}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `API request failed with status: ${response.status}`,
                    );
                }
                const data = await response.json();

                if (data.stops && Array.isArray(data.stops)) {
                    const formattedStops = data.stops
                        .map((stop) => {
                            const [longitude, latitude] =
                                stop.geometry?.coordinates || [];

                            if (
                                !stop.onestop_id ||
                                stop.onestop_id == "stop-undefined"
                            ) {
                                console.warn("Stop missing id:", stop);
                            }

                            if (
                                // !stop.onestop_id ||
                                latitude == null ||
                                longitude == null
                            ) {
                                return null;
                            }
                            return {
                                type: "Feature",
                                id: stop.stop_id,
                                geometry: {
                                    type: "Point",
                                    coordinates: [longitude, latitude],
                                },
                                properties: {
                                    name: stop.stop_name || "Unnamed Stop",
                                    oneStopId: stop.onestop_id,
                                    stopKey: stop.id,
                                    // You can include more data here if needed
                                },
                            };
                        })
                        .filter(Boolean); // removes nulls

                    setStops(formattedStops);
                    console.log(
                        `Successfully formatted ${formattedStops.length} stops.`,
                    );
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
    }, []);

    return { stops, loading, error };
};

const initialRegion: Region = {
    latitude: 53.3498, // Centered on Dublin
    longitude: -6.2603,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

const { width, height } = Dimensions.get("window");

// --- Main App Component ---
export default function App() {
    const { stops, loading, error } = useTransportStops();
    const { width, height } = Dimensions.get("window");
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState(initialRegion);
    const [points] = useClusterer(stops, { width, height }, region, {
        // 4. Options object
        radius: 20, // Increase radius to cluster more aggressively
        minPoints: 2, // Optional: min points to form a cluster
        maxZoom: 28, // Optional: zoom level to stop clustering at
    });

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
                ref={mapRef}
                style={{ flex: 1 }}
                scrollEnabled={true}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
            >
                {points.map((point) => {
                    if (isPointCluster(point)) {
                        const size = Math.min(
                            60,
                            30 + point.properties.point_count / 2,
                        );

                        // Render a cluster marker
                        return (
                            <Marker
                                key={`cluster-${point.properties.cluster_id}`}
                                coordinate={{
                                    longitude: point.geometry.coordinates[0],
                                    latitude: point.geometry.coordinates[1],
                                }}
                                onPress={() => {
                                    const expansionRegion =
                                        point.properties.getExpansionRegion();
                                    mapRef.current?.animateToRegion(
                                        expansionRegion,
                                    );
                                }}
                            >
                                {/* Your cluster component */}
                                <View
                                    style={{
                                        width: size,
                                        height: size,
                                        borderRadius: size / 2,
                                        backgroundColor: "#3D5AFE",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderColor: "#fff",
                                        borderWidth: 2,
                                        elevation: 4,
                                        shadowColor: "#000",
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4,
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                    }}
                                >
                                    <Text>{point.properties.point_count}</Text>
                                </View>
                            </Marker>
                        );
                    }

                    // It's a single stop, render the stop marker
                    return (
                        <Marker
                            key={point.properties.stopKey} // The original stop ID
                            coordinate={{
                                longitude: point.geometry.coordinates[0],
                                latitude: point.geometry.coordinates[1],
                            }}
                            title={point.properties.name}
                            onPress={() => {
                                router.push({
                                    pathname: "/selectedStop/[onestop_id]",
                                    params: {
                                        onestop_id: point.properties.oneStopId,
                                        stopName: point.properties.name,
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

{
    /* <View
    style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#3D5AFE",
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#fff",
        borderWidth: 2,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    }}
>
    <Text
        style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 16,
        }}
    >
        {count}
    </Text>
</View>; */
}

// return (
//     <Marker
//         key={`stop-${point.id ?? point.properties.operatorId}`}
//         coordinate={{ latitude: lat, longitude: lng }}
//         title={point.properties.name}
//         onPress={() => {
//             router.push({
//                 pathname: "/selectedStop/[onestop_id]",
//                 params: {
//                     onestop_id: point.properties.operatorId,
//                     stopName: point.properties.name,
//                 },
//             });
//         }}
//     />
// );
