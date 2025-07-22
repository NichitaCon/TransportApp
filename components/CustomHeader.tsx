import { View, Text, Pressable } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Dimensions } from "react-native";

type CustomHeaderProps = {
    header: string;
    back: () => void;
    directionDepartsView: boolean;
    isSaved: boolean;
    savedToggle: () => void;
};

export default function Header({
    header,
    back,
    directionDepartsView,
    isSaved,
    savedToggle,
}: CustomHeaderProps) {
    const insets = useSafeAreaInsets();
    const AdjustedInset = insets.top;
    const HeaderWidth = Dimensions.get("window").width / 1.3;

    return (
        <View
            style={{
                paddingTop: AdjustedInset,
                paddingBottom: 6,
            }}
            className="p-4 bg-white"
        >
            {/* Title */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    {back && (
                        <Pressable onPress={back}>
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
                            paddingTop: 6,
                            textAlignVertical: "center",
                            maxWidth: HeaderWidth, // adjust as needed
                        }}
                    >
                        {header}
                    </Text>
                </View>
                {savedToggle && (
                    isSaved ? (
                        <Pressable onPress={savedToggle}>
                            <Entypo
                                name="heart"
                                size={24}
                                color="black"
                                className="justify-center mb-1 mr-2"
                            />
                        </Pressable>
                    ) : (
                        <Pressable onPress={savedToggle}>
                            <Entypo
                                name="heart-outlined"
                                size={24}
                                color="black"
                                className="justify-center mb-1 mr-2"
                            />
                        </Pressable>
                    )
                )}
            </View>

            {/* Direction + Departs */}
            {directionDepartsView && (
                <View className="flex-row mt-2 pb-2 px-2 justify-between">
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
