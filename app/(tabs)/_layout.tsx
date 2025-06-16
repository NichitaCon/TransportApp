import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Layout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5
                            name="map-marked-alt"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: "Saved",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="bookmark" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
