import { Stack, Link } from "expo-router";
import { View, Text } from "react-native";


import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";
import MapView from "react-native-maps";
import "~/global.css";

export default function Home() {
    return (
        <View className="flex-1">
            <MapView style={{ flex: 1 }} />
            <Stack.Screen options={{ title: "Map" }} />
        </View>
    );
}
