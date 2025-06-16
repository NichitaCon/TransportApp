import { Stack, Link } from "expo-router";
import { Text } from "react-native";
import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";

export default function Saved() {
    return (
        <>
            <Stack.Screen options={{ title: "Saved" }} />
            <Container>
                <Text>Search Screen</Text>
            </Container>
        </>
    );
}
