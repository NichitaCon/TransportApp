import { Stack, Link } from "expo-router";

import { Text, View } from "react-native";
import { Button } from "~/components/Button";

import MapView from "react-native-maps";
import { ScreenContent } from "~/components/ScreenContent";

export default function Home() {
    return (
        <>
            <Stack.Screen options={{ title: "Home" }} />

            <View style={{ flex: 1 }}>
                <MapView style={{ flex: 1 }} />
            </View>
        </>
    );
}
