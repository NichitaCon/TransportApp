import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { isPointCluster, useClusterer } from "react-native-clusterer";
import { router } from "expo-router";

// --- Configuration ---
const TRANSITLAND_API_URL = "https://transit.land/api/v2/rest";

// --- Type Definitions ---
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

// --- Helper Hooks ---

/**
 * A custom hook to debounce a value. It will only update the returned value
 * after the input value has not changed for the specified delay.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if the value changes before the delay has passed
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * A custom hook to fetch transport stops based on the visible map region.
 * @param region The current map region.
 */
const useTransportStops = (region: Region | null) => {
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
                setLoading(false);
            }
        };

        fetchStopsData();
    }, [debouncedRegion]);

    return { stops: Array.from(stops.values()), loading, error };
};

const initialRegion: Region = {
    latitude: 53.3498,
    longitude: -6.2603,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

const { width, height } = Dimensions.get("window");

// --- Main App Component ---
export default function App() {
    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region>(initialRegion);
    const { stops, loading, error } = useTransportStops(region);

    const [points] = useClusterer(stops, { width, height }, region, {
        radius: 40,
        maxZoom: 14,
    });

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={initialRegion}
                onRegionChangeComplete={setRegion}
            >
                {points.map((point) => {
                    // Cluster
                    if (isPointCluster(point)) {
                        const size = Math.min(
                            60,
                            30 + point.properties.point_count / 2,
                        );
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
                                        300,
                                    );
                                }}
                                style={{ zIndex: 2 }}
                            >
                                <View
                                    style={[
                                        styles.clusterContainer,
                                        {
                                            width: size,
                                            height: size,
                                            borderRadius: size / 2,
                                        },
                                    ]}
                                >
                                    <Text style={styles.clusterText}>
                                        {point.properties.point_count}
                                    </Text>
                                </View>
                            </Marker>
                        );
                    }

                    // Single stop
                    return (
                        <Marker
                            key={`stop-${point.properties.stopKey}`}
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
                            style={{ zIndex: 1 }}
                        />
                    );
                })}
            </MapView>

            {/* Loading Indicator */}
            {loading && (
                <View className="absolute bottom-10 left-1/2 -translate-x-1/2 items-center justify-center bg-gray-500 flex-row p-2 rounded-2xl">
                    <ActivityIndicator size={30} color="#FFFFFF" />
                    <Text className="text-white text-base">
                        Fetching stops...
                    </Text>
                </View>
            )}

            {/* Error Display */}
            {error && (
                <View className="absolute top-12 inset-x-5 p-4 bg-red-700 rounded-lg">
                    <Text className="text-white text-base">{error}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    clusterContainer: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(61, 90, 254, 0.8)",
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
    },
    clusterText: {
        color: "white",
        fontWeight: "bold",
    },
});
