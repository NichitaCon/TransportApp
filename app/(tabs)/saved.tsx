import { Stack } from "expo-router";
import { Text } from "react-native";

import { Container } from "~/components/Container";
import { ScreenContent } from "~/components/ScreenContent";

export default function Saved() {
    return (
        <>
            <Stack.Screen options={{ title: "Saved" }} />
            <Container>
                <Text>hi</Text>
            </Container>
        </>
    );
}
