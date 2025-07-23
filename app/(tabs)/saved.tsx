import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, Tabs, Link, router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";
import { useSavedStops } from "~/store/savedStopStore";

export default function Saved() {
    const { saved, toggle, isSaved, clear } = useSavedStops();

    console.log("saved stops:", JSON.stringify(saved, null, 2));
    return (
        <>
            <Tabs.Screen
                options={{ title: "Saved", directionDepartsView: false }}
            />
            <Container>
                <FlatList
                    className=""
                    data={saved}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => {
                                router.push({
                                    pathname: "/selectedStop/[onestop_id]",
                                    params: {
                                        onestop_id: item.id,
                                        stopName: item.name,
                                        stopNum: item.stopNum,
                                        backTo: "saved",
                                    },
                                });
                            }}
                            className="flex-row items-center justify-between py-2 mb-1"
                        >
                            {item.stopNum !== "0" && item.stopNum ? (
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
                                        {item.stopNum},{" "}
                                        {item.name}
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
                                        {item.name}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    )}
                />
                <Pressable
                    onPress={clear}
                    className="flex-row items-center justify-between"
                >
                    <Text className="text-2xl font-poppins-medium">clear</Text>
                </Pressable>
            </Container>
        </>
    );
}
