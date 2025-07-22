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
                                        backTo: "saved",
                                    },
                                });
                            }}
                            className="flex-row items-center justify-between py-2 mb-1"
                        >
                            <Text className="text-2xl font-poppins-medium">
                                {item.name}
                            </Text>
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
