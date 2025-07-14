// components/CustomTabBar.js
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export function CustomTabBar(props) {
  const [query, setQuery] = useState("");
  // animated value for vertical offset
  const offsetAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e) => {
      Animated.timing(offsetAnim, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    };
    const onHide = (e) => {
      Animated.timing(offsetAnim, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [offsetAnim]);

  const handleSearch = (text) => setQuery(text);

  return (
    <View className="absolute bottom-0 left-0 right-0 w-full">
      {/* Animated wrapper for the search bar */}
      <Animated.View
        style={{
          transform: [{ translateY: Animated.multiply(offsetAnim, -.76) }],
        }}
      >
        <View className="bg-white rounded-t-[28] p-3 z-50" style={{ marginBottom: -2 }}>
          <View className="flex-row justify-between items-center px-4 rounded-full bg-gray-100 w-full">
            <TextInput
              value={query}
              onChangeText={handleSearch}
              placeholder="Search..."
              placeholderTextColor="#4B5563"
              className="h-12 flex-1"
            />
            <FontAwesome name="search" size={20} color="#4B5563" />
          </View>
        </View>
      </Animated.View>

      {/* Tab buttons stay pinned to the bottom */}
      <BottomTabBar
        {...props}
        style={{
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        }}
      />
    </View>
  );
}
