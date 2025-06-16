// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function Layout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index" options={{ title: "Home" }} />
            <Tabs.Screen name="search" options={{ title: "Search" }} />
        </Tabs>
    );
}
