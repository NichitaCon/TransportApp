import React from "react";
import SkeletonLoading from "expo-skeleton-loading";
import { View } from "react-native";

type ArrivalsSkeletonProps = {
    stopNum?: string;
};

export const ArrivalsSkeleton = ({ stopNum }: ArrivalsSkeletonProps) => {
    //if stopnum = 0 (IS a bus), use a bigger height/gap, if not use smaller xx
    const height = stopNum && stopNum !== "0" ? 55 : 42;
    const gap = stopNum && stopNum !== "0" ? 18 : 13 
    return (
        <View className="flex-1 p-5">
            <SkeletonLoading background={"#e5e7eb"} highlight={"#f3f4f6"}>
                <View style={{ gap }}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <View
                            key={idx}
                            className="flex-row rounded-lg bg-gray-200"
                            style={{ height }}
                        />
                    ))}
                </View>
            </SkeletonLoading>
        </View>
    );
};
