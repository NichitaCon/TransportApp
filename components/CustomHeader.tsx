import { View, Text, Pressable, TouchableOpacity } from "react-native";

import Entypo from "@expo/vector-icons/Entypo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

type CustomHeaderProps = {
    header: string;
    back: boolean;
    directionDepartsView: boolean;
    rightButtons?: Array<any>;
};

export default function Header({
    header,
    back,
    directionDepartsView,
    rightButtons = [],
}: CustomHeaderProps) {
    const insets = useSafeAreaInsets();
    const AdjustedInset = insets.top;
    const [isBackEnabled, setIsBackEnabled] = useState(
        back === undefined ? true : back,
    );

    console.log("header passed into component", header);
    return (
        <View
            style={{
                paddingTop: AdjustedInset,
                paddingBottom: 6,
            }}
            className="p-4 bg-white"
        >
            {/* Title and back */}
            <View className="flex-row items-center">
                {isBackEnabled == true && (
                    <Pressable onPress={() => router.back()}>
                        <Entypo
                            name="chevron-left"
                            size={24}
                            color="black"
                            className="justify-center mb-1 mr-2"
                        />
                    </Pressable>
                )}
                <Text
                    className="text-4xl font-poppins-semibold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                        letterSpacing: -1,
                        paddingTop: 6, // Add padding to prevent clipping
                        textAlignVertical: "center", // Ensure vertical alignment
                    }}
                >
                    {header}
                </Text>
            </View>

            {/* Direction + Departs */}
            {directionDepartsView && (
                <View className="flex-row mt-2 pb-2 gap-11">
                    <Text className="text-2xl font-poppins-medium">
                        Direction
                    </Text>
                    <View className="border border-gray-300" />
                    <Text className="text-2xl font-poppins-medium">
                        Departs
                    </Text>
                </View>
            )}
        </View>
    );
}
