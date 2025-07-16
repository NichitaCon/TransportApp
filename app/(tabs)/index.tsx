import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    Modal,
    TextInput,
    Button,
    FlatList,
    Keyboard,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import MapView, { Marker, Region } from "react-native-maps";
import { isPointCluster, useClusterer } from "react-native-clusterer";
import { router } from "expo-router";
import { useDebounce } from "../../hooks/useDebounce";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useStopSearch } from "~/hooks/useStopSearch";
import { useTransportStops } from "~/hooks/useTransportStops";

const initialRegion: Region = {
    latitude: 53.3498,
    longitude: -6.2603,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

const { width, height } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SEARCH_BAR_VISIBLE_HEIGHT = 145;

const SHEET_OPEN_Y = 60; // How far from the top of the screen it should be when open
const SHEET_CLOSED_Y = SCREEN_HEIGHT - SEARCH_BAR_VISIBLE_HEIGHT;

// --- Main App Component ---
export default function App() {
    const mapRef = useRef<MapView>(null);

    //  ------ //

    // Stop positions
    const [region, setRegion] = useState<Region>(initialRegion);
    const { stops, loading, error } = useTransportStops(region);
    const [points] = useClusterer(stops, { width, height }, region, {
        radius: 40,
        maxZoom: 14,
    });

    //  ------ //

    // Search
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [query, setQuery] = useState("");
    const {
        searchResults,
        loading: searchLoading,
        error: searchError,
    } = useStopSearch(query);

    //  ------ //

    //Animation State
    const searchSheetY = useSharedValue(SHEET_CLOSED_Y);
    const isSheetOpen = useSharedValue(false);

    const searchSheetAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: searchSheetY.value }],
        };
    });

    const openSearchSheet = () => {
        console.log("opening search sheet");
        searchSheetY.value = withSpring(SHEET_OPEN_Y, { damping: 15 });
        isSheetOpen.value = true;
        setIsSearchVisible(true);
    };

    const closeSearchSheet = () => {
        console.log("closing search sheet");
        Keyboard.dismiss();
        searchSheetY.value = withSpring(SHEET_CLOSED_Y, { damping: 255 });
        isSheetOpen.value = false;
        setIsSearchVisible(false);
        setQuery("");
    };

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
                <View className="absolute bottom-44 left-1/2 -translate-x-1/2 items-center justify-center bg-gray-500 flex-row p-2 rounded-2xl">
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

            {/* SEARCH SECTION */}
            <Animated.View
                className="px-3 py-3"
                style={[
                    StyleSheet.absoluteFillObject,
                    {
                        backgroundColor: "white",
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -3 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                    },
                    searchSheetAnimatedStyle,
                ]}
            >
                {/* A handle to indicate it's a draggable sheet, need to add react-gesture support later */}
                {/* <View className="w-10 h-1 self-center bg-gray-300 rounded-full my-3" /> */}

                <Pressable onPress={openSearchSheet}>
                    <View className="flex-row">
                        {/* search bar */}
                        <View className="flex-row flex-1 justify-between items-center px-4 rounded-xl bg-gray-200 h-12">
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                onPress={openSearchSheet}
                                placeholder="Search"
                                placeholderTextColor="#4B5563"
                                className="flex-1 h-full"
                            />
                            <FontAwesome
                                name="search"
                                size={20}
                                color="#4B5563"
                            />
                        </View>
                        {isSearchVisible && (
                            <Pressable
                                onPress={closeSearchSheet}
                                className="p-2"
                            >
                                <FontAwesome
                                    name="close"
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </Pressable>
                        )}
                    </View>
                </Pressable>

                <View style={{ flex: 1, paddingTop: 16 }}>
                    {searchLoading && (
                        <ActivityIndicator className="mt-6" size="large" />
                    )}
                    {searchError && (
                        <Text className="text-red-500 text-center mt-4">
                            {searchError}
                        </Text>
                    )}

                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.properties.stopKey}
                        renderItem={({ item }) => (
                            <Pressable
                                className="px-6 py-4 border-b border-gray-200"
                                onPress={() => {
                                    router.push({
                                        pathname: "/selectedStop/[onestop_id]",
                                        params: {
                                            onestop_id:
                                                item.properties.oneStopId,
                                            stopName: item.properties.name,
                                        },
                                    });
                                }}
                            >
                                <Text className="font-bold text-base">
                                    {item.properties.name}
                                </Text>
                            </Pressable>
                        )}
                        contentInset={{ bottom: 50 }}
                    />
                </View>
            </Animated.View>
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
