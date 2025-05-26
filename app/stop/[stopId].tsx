// app/stop/[stopId].tsx

import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { API_KEY } from '@env';



type Arrival = {
    routeId: string;
    arrivalTime: number; // Unix timestamp in seconds
};

export default function StopDetail() {
    const { stopId, name} = useLocalSearchParams();
    const [arrivals, setArrivals] = useState<Arrival[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArrivals();
    }, [stopId]);

console.log(API_KEY);


    async function fetchArrivals() {
        try {
            const response = await fetch(
                "https://api.nationaltransport.ie/gtfsr/v2/TripUpdates?format=json",
                {
                    headers: {
                        "x-api-key": API_KEY,
                    },
                },
            );
            const data = await response.json();
            if (!data) {
                console.error("No data received from API");
                return;
            }

            // Filter trips with stop_time_update matching stopId
            const incomingTrains = data.entity
                .filter((entity: any) =>
                    entity.trip_update?.stop_time_update?.some(
                        (stu: any) => stu.stop_id === stopId,
                    ),
                )
                .map((entity: any) => {
                    const stopUpdate = entity.trip_update.stop_time_update.find(
                        (stu: any) => stu.stop_id === stopId,
                    );

                    const delay =
                        stopUpdate?.arrival?.delay ??
                        stopUpdate?.departure?.delay ??
                        0;
                    const baseTime = parseInt(entity.trip_update.timestamp); // time of this update

                    return {
                        routeId: entity.trip_update.trip.route_id,
                        expectedArrival: new Date(
                            (baseTime + delay) * 1000,
                        ).toLocaleTimeString(),
                    };
                });

            setArrivals(incomingTrains);
            console.log(
                "Arrivals fetched:",
                JSON.stringify(incomingTrains, null, 2),
            );
        } catch (error) {
            console.error("Failed to fetch arrivals:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading)
        return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

    if (arrivals.length === 0)
        return (
            <Text style={{ padding: 20 }}>
                No upcoming arrivals at this stop.
            </Text>
        );

    return (
        <View style={{ padding: 20 }}>
            <Stack.Screen options={{ title: "Saved" }} />

            <Text
                style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
                Incoming trains at stop: {name}
            </Text>
            <FlatList
                data={arrivals}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                    <Text style={{ marginVertical: 5 }}>
                        Route {item.routeId} — Arriving at{" "}
                        {item.expectedArrival}
                    </Text>
                )}
            />
        </View>
    );
}
