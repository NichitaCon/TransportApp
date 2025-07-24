import React, { useState, useRef } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    TextInput,
    FlatList,
    Keyboard,
    TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing,
} from "react-native-reanimated";
import MapView, { Marker, Region } from "react-native-maps";
import { isPointCluster, useClusterer } from "react-native-clusterer";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useStopSearch } from "~/hooks/useStopSearch";
import { useTransportStops } from "~/hooks/useTransportStops";
import ClusterMarker from "~/components/ClusterMarker";
import { MotiView } from "moti";

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
        searchSheetY.value = withSpring(SHEET_OPEN_Y, { damping: 153 });
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
                            <ClusterMarker
                                key={`cluster-${point.properties.cluster_id}`}
                                point={point}
                                mapRef={mapRef}
                            />
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
                            style={{ zIndex: 1 }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    router.push({
                                        pathname: "/selectedStop/[onestop_id]",
                                        params: {
                                            onestop_id: point.properties.oneStopId,
                                            stopName: point.properties.name,
                                            stopNum: point.properties.stopCode,
                                        },
                                    });
                                }}
                            >
                                {point.properties.vehicleType === "bus" ? (
                                    point.properties.stopCode !== "Unavailable" ? (
                                        <View className="p-2 bg-yellow-400 rounded-xl items-center">
                                            <FontAwesome
                                                name="bus"
                                                size={24}
                                                color="#fff"
                                            />
                                            <Text className="text-white pt-2 font-semibold">
                                                {point.properties.stopCode || ""}
                                            </Text>
                                        </View>
                                    ) : null
                                ) : (
                                    <View className="p-3 bg-blue-700 rounded-xl items-center">
                                        <FontAwesome
                                            name="train"
                                            size={24}
                                            color="#fff"
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Marker>
                    );
                })}
            </MapView>
            {/* Loading Indicator */}
            {loading && (
                <View className="absolute top-12 right-4 items-center justify-center  bg-gray-300 flex-row p-2 rounded-2xl">
                    <ActivityIndicator size={30} color="black" />
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

                <TouchableOpacity onPress={openSearchSheet}>
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
                            {searchLoading && query.length >= 2 ? (
                                <ActivityIndicator size={20} color="#4B5563" />
                            ) : (
                                <FontAwesome
                                    name="search"
                                    size={20}
                                    color="#4B5563"
                                />
                            )}
                        </View>
                        {isSearchVisible && (
                            <TouchableOpacity
                                onPress={closeSearchSheet}
                                className="p-2"
                            >
                                <FontAwesome
                                    name="close"
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={{ flex: 1, paddingTop: 8 }}>
                    {/* Conditional rendering couldve been done way better here but im tired :( sorrreey */}
                    {query.length < 2 && (
                        <View className="items-center flex-1">
                            <Text className="text-gray-600">
                                Search for stop names or bus code
                            </Text>
                        </View>
                    )}
                    {/* {searchLoading && query.length > 2 && <SearchSkeleton />} */}
                    {searchError && (
                        <Text className="text-red-500 text-center mt-4">
                            {searchError}
                        </Text>
                    )}
                    {query.length >= 2 && !searchLoading && (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.properties.stopKey}
                            renderItem={({ item, index }) => (
                                <MotiView
                                    from={{ opacity: 0, translateY: 10 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{
                                        delay: index * 100, // 100ms per item
                                        duration: 350 * Math.pow(0.95, index),
                                        type: "timing",
                                        easing: Easing.inOut(Easing.ease),
                                    }}
                                >

                                    <TouchableOpacity
                                        className="px-4 py-3 border-b border-gray-200"
                                        onPress={() => {
                                            router.push({
                                                pathname:
                                                    "/selectedStop/[onestop_id]",
                                                params: {
                                                    onestop_id:
                                                        item.properties
                                                            .oneStopId,
                                                    stopName:
                                                        item.properties.name,
                                                    stopNum:
                                                        item.properties.stopNum,
                                                },
                                            });
                                        }}
                                    >
                                        {item.properties.stopNum ? (
                                            <View className="flex-row items-center gap-4">
                                                <View className="p-3 bg-yellow-400 rounded-xl items-center">
                                                    <FontAwesome
                                                        name="bus"
                                                        size={24}
                                                        color="#fff"
                                                    />
                                                    {/* <Text className="text-white pt-2">
                                        {point.properties.stopNum || ""}
                                        </Text> */}
                                                </View>
                                                <Text className="font-medium text-xl">
                                                    {item.properties.stopNum},{" "}
                                                    {item.properties.name}
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="flex-row items-center gap-4">
                                                <View className="p-3 bg-blue-700 rounded-xl items-center">
                                                    <FontAwesome
                                                        name="train"
                                                        size={24}
                                                        color="#fff"
                                                    />
                                                    {/* <Text className="text-white pt-2">
                                        {point.properties.stopNum || ""}
                                        </Text> */}
                                                </View>
                                                <Text className="font-medium text-xl">
                                                    {item.properties.name}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </MotiView>
                            )}
                            contentInset={{ bottom: 50 }}
                        />
                    )}

                    {/* {
                        query.length > 2 &&
                        searchResults.length === 0 && (
                            <View className="flex-1 justify-start items-start">
                                <Text className="text-red-600 mb-44">
                                    No results :
                                </Text>
                            </View>
                        )} */}
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
