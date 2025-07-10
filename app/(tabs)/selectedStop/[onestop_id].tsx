import { Stack, Link } from "expo-router";
import {
    Text,
    Pressable,
    ActivityIndicator,
    View,
    FlatList,
} from "react-native";
import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import CustomHeader from "~/components/CustomHeader";

type Arrival = {
    id: string;
    scheduledArrival: string;
    scheduledDepart: string;
    estimatedArrival: string;
    estimatedDeparture: string;
    estimatedDepartureDuration: number;
    scheduleRelationship: string;
    tripHeadSign: string;
};

const useTransportArrivals = () => {
    const [arrivals, setArrivals] = useState<Arrival[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { onestop_id } = useLocalSearchParams();

    useEffect(() => {
        // We define the async function inside useEffect to avoid it being recreated on every render.
        const fetchArrivalsData = async () => {
            setLoading(true);
            setError(null);
            const key = process.env.EXPO_PUBLIC_TRANSITLAND_KEY;
            // console.warn(key)

            const url = `https://transit.land/api/v2/rest/stops/${onestop_id}/departures?api_key=${key}&limit=15`;

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
                // const data = require("~/kilbarrackDepartures.json");

                // console.log(JSON.stringify(data.stops,null,2))
                console.log("Attempting to get arrivals");
                console.log(
                    "length of arrivals is",
                    data.stops[0].departures.length,
                );

                // Minor optimization: check for stops array before mapping
                if (data.stops && Array.isArray(data.stops)) {
                    console.log("passed first boolean");

                    const formattedArrivals = data.stops[0].departures
                        .map((stop) => {
                            console.log("returned an object");
                            const departureTimeStr =
                                stop.departure.estimated ||
                                stop.departure.scheduled;
                            console.log("departtimestr", departureTimeStr);
                            const now = new Date();
                            const [hours, minutes, seconds] = departureTimeStr
                                .split(":")
                                .map(Number);
                            const departureTime = new Date(
                                now.getFullYear(),
                                now.getMonth(),
                                now.getDate(),
                                hours,
                                minutes,
                                seconds,
                            );
                            // If the departure time has already passed today, assume it's for tomorrow
                            if (departureTime < now) {
                                departureTime.setDate(
                                    departureTime.getDate() + 1,
                                );
                            }
                            const estimatedDepartureDuration = Math.round(
                                (departureTime - now) / 60000,
                            );

                            console.warn(
                                "estimatedDepartureDuration",
                                estimatedDepartureDuration,
                            );

                            if (stop.trip.schedule_relationship == "STATIC") {
                                console.log(
                                    "STATIC DEPARTURE, EJECTED FROM FORMATTED ARRIVALS",
                                );
                                return null;
                            }

                            if (estimatedDepartureDuration > 80) return null;

                            return {
                                id: stop.trip.trip_id,
                                scheduledArrival: stop.arrival.scheduled,
                                scheduledDepart: stop.departure.scheduled,
                                estimatedArrival: stop.arrival.estimated,
                                estimatedDeparture: stop.departure.estimated,
                                estimatedDepartureDuration,
                                scheduleRelationship:
                                    stop.trip.schedule_relationship,
                                tripHeadSign: stop.trip.trip_headsign,
                            };
                        })
                        .filter(Boolean) // removes nulls
                        .sort(
                            (a, b) =>
                                a.estimatedDepartureDuration -
                                b.estimatedDepartureDuration,
                        );
                    setArrivals(formattedArrivals);
                    console.log(
                        `Successfully formatted ${formattedArrivals.length} arrivals.`,
                    );
                    // console.log(
                    //     "formatted stops",
                    //     JSON.stringify(formattedArrivals, null, 2),
                    // );
                } else {
                    setArrivals([]);
                    console.warn("No arrivals found in the API response.");
                }
            } catch (e) {
                console.error("Failed to fetch or process arrivals:", e);
                setError(
                    "Failed to load transport data. Please try again later.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchArrivalsData();
    }, [onestop_id]); // Empty dependency array ensures this runs only once.

    return { arrivals, loading, error };
};

export default function SelectedStop() {
    const { stopName } = useLocalSearchParams();
    const { arrivals, loading, error } = useTransportArrivals();
    // console.log(onestop_id, stopName);

    // Loading State UI
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        header: () => (
                            // You can make the title dynamic based on the stop ID or fetched data
                            <CustomHeader
                                back={true}
                                header={stopName}
                                directionDepartsView={true}
                            />
                        ),
                    }}
                />
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-lg text-gray-700">
                    Loading departures...
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

    if (arrivals.length == 0) {
        return (
            <View className="flex-1 justify-top items-center p-5 bg-gray-50">
                <Text className="text-xl mt-4 font-semibold text-gray-400 mb-2">
                    No upcoming departures
                </Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    header: () => (
                        // You can make the title dynamic based on the stop ID or fetched data
                        <CustomHeader
                            back={true}
                            header={stopName}
                            directionDepartsView={true}
                        />
                    ),
                }}
            />

            <Container>
                {/* <Text>THERE IS AN ISSUE WHERE THE DEPARTURES SEEM TO BE DOUBLED, might be an issue with creating an object for scheduled AND estimated time</Text> */}
                <FlatList
                    className=""
                    data={arrivals}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-2xl font-poppins-medium">
                                {item.tripHeadSign}
                            </Text>

                            <Text className="text-2xl mr-[110]">
                                {item.estimatedDepartureDuration} Min
                            </Text>
                        </View>
                    )}
                />
            </Container>
        </>
    );
}
