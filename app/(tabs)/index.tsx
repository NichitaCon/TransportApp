import { Stack, Link, router } from "expo-router";
import { View, Text } from "react-native";
import stops from "~/assets/convertedData/stops.json";

import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";
import MapView, { Marker } from "react-native-maps";
import "~/global.css";

export default function Home() {
    return (
        <View className="flex-1">
            <MapView style={{ flex: 1 }}>
                {stops.map((stop) => (
                    <Marker
                        key={stop.stop_id}
                        coordinate={{
                            latitude: parseFloat(stop.stop_lat),
                            longitude: parseFloat(stop.stop_lon),
                        }}
                        title={stop.stop_name}
                        onPress={() => {
                            console.log("stop pressed");
                            router.push({
                                pathname: `/stop/${stop.stop_id}`,
                                params: { name: stop.stop_name },
                            });
                        }}
                    />
                ))}
            </MapView>
            <Stack.Screen options={{ title: "Map" }} />
        </View>
    );
}
