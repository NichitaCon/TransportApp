import { Stack, Tabs, Link } from "expo-router";
import { Text } from "react-native";
import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";

export default function Saved() {
    return (
        <>
            <Tabs.Screen options={{ title: "Saved", directionDepartsView: false }} />
            <Container>
                <Text>Search Screen</Text>
            </Container>
        </>
    );
}
