import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = { value: number; max?: number; color?: string };

export default function StatBar({
  value,
  max = 100,
  color = "#60A5FA",
}: Props) {
  const pct = Math.max(0, Math.min(value / max, 1));
  return (
    <View
      style={{
        height: 10,
        backgroundColor: "#1f2937",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[color, "#ffffff33"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: `${pct * 100}%`, height: 10 }}
      />
    </View>
  );
}
