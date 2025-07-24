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
import { useSavedStops } from "~/store/savedStopStore";
import { useTransportArrivals } from "~/hooks/useTransportArrivals";
import { ArrivalsSkeleton } from "~/components/ArrivalSkeleton";

export default function SelectedStop() {
    const { stopName, stopNum, onestop_id, backTo } = useLocalSearchParams();
    const { arrivals, loading, error } = useTransportArrivals(onestop_id);
    const { toggle, isSaved } = useSavedStops();
    // console.log("stopNum:", stopNum, "for", stopName);

    const handleBack = () => {
        if (backTo === "saved") {
            router.replace("/saved");
        } else {
            router.back();
        }
    };
    // console.log(onestop_id, stopName);

    // Loading State UI
    if (loading) {
        return (
            <View style={{ backgroundColor: "#f9f9f9" }}  className="flex-1">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        header: () => (
                            // You can make the title dynamic based on the stop ID or fetched data
                            <CustomHeader
                                back={handleBack}
                                header={stopName}
                                directionDepartsView={true}
                                isSaved={isSaved(onestop_id)}
                                savedToggle={() =>
                                    toggle(onestop_id, stopName, stopNum)
                                }
                            />
                        ),
                    }}
                />
                <ArrivalsSkeleton stopNum={stopNum}/>
            </View>
        );
    }

    // Error State UI
    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-5 bg-red-50">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        header: () => (
                            <CustomHeader
                                back={handleBack}
                                header={stopName}
                                directionDepartsView={true}
                                isSaved={isSaved(onestop_id)}
                                savedToggle={() =>
                                    toggle(onestop_id, stopName, stopNum)
                                }
                            />
                        ),
                    }}
                />
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
                <Stack.Screen
                    options={{
                        headerShown: true,
                        header: () => (
                            <CustomHeader
                                back={handleBack}
                                header={stopName}
                                directionDepartsView={true}
                                isSaved={isSaved(onestop_id)}
                                savedToggle={() =>
                                    toggle(onestop_id, stopName, stopNum)
                                }
                            />
                        ),
                    }}
                />
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
                        <CustomHeader
                            back={handleBack}
                            header={stopName}
                            directionDepartsView={true}
                            isSaved={isSaved(onestop_id)}
                            savedToggle={() =>
                                toggle(onestop_id, stopName, stopNum)
                            }
                        />
                    ),
                }}
            />

            <View style={{ backgroundColor: "#f9f9f9" }} className=' flex-1'>
                <FlatList
                    className="px-5"
                    data={arrivals}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center justify-between my-4 px-1">
                            {stopNum !== undefined && stopNum !== "0" ? (
                                <View className="gap-1">
                                    <Text className="text-2xl font-poppins-medium">
                                        {item.tripBusHeadSign}
                                    </Text>
                                    <Text>{item.tripHeadSign}</Text>
                                </View>
                            ) : (
                                <Text className="text-2xl font-poppins-medium">
                                    {item.tripHeadSign}
                                </Text>
                            )}

                            <Text className="text-2xl">
                                {item.estimatedDepartureDuration === 0
                                    ? "Now"
                                    : `${item.estimatedDepartureDuration} Min`}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </>
    );
}
