import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import CustomHeader from "~/components/CustomHeader";

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                header: ({ options }) => (
                    <CustomHeader
                        header={options.title}
                        directionDepartsView={false}
                        back={false}
                    />
                ),
                tabBarLabelStyle: {
                    fontSize: 12, // <-- Increase this value for bigger text
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Map",
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
                    headerShown: true,
                    title: "Saved",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="bookmark" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="selectedStop/[onestop_id]" // This matches the file path
                options={{
                    title: "Stop Details", // This will be the title passed to your header
                    headerShown: true,
                    // This is the crucial part: hide it from the tab bar
                    href: null,
                }}
            />
        </Tabs>
    );
}
