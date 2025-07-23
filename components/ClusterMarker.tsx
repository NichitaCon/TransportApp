import React, { memo } from "react";
import { View, Text } from "react-native";
import { Marker } from "react-native-maps";
import type { RefObject } from "react";
import type { Region } from "react-native-maps";

type PointFeature = {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    cluster_id: number;
    point_count: number;
    getExpansionRegion: () => Region;
  };
};

interface ClusterMarkerProps {
  point: PointFeature;
  mapRef: RefObject<any>;
}

const ClusterMarker = ({ point, mapRef }: ClusterMarkerProps) => {
  const size = Math.min(60, 30 + point.properties.point_count / 2);

  return (
    <Marker
      key={`cluster-${point.properties.cluster_id}`}
      coordinate={{
        longitude: point.geometry.coordinates[0],
        latitude: point.geometry.coordinates[1],
      }}
      onPress={() => {
        const expansionRegion = point.properties.getExpansionRegion();
        mapRef.current?.animateToRegion(expansionRegion, 300);
      }}
      style={{ zIndex: 2 }}
    >
      <View
        className="bg-blue-600 justify-center items-center"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "visible",
        }}
      >
        <Text className="text-white font-bold">{point.properties.point_count}</Text>
      </View>
    </Marker>
  );
};

export default memo(ClusterMarker);
