import "../global.css";

import {
    useFonts,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold
} from "@expo-google-fonts/poppins";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

import CustomHeader from "~/components/CustomHeader";

export default function Layout() {
    const [fontsLoaded, fontError] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
        // Add other weights and styles as needed
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            // Hide the splash screen after the fonts have loaded and the layout is ready.
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null; // Render nothing until the fonts are loaded
    }
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                header: ({ options }) => (
                    <CustomHeader header={options.title} back={true} />
                ),
            }}
        />
    );
}
