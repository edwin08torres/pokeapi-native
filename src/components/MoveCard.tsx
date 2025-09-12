import React, { ComponentProps } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorForType } from "../theme/typeColors";
import type { MoveInfo } from "../api/pokeapi";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function MoveCard({ m }: { m: MoveInfo }) {
  const strip = colorForType(m.type);

  const icon: IconName =
    m.damage_class === "special"
      ? "star-outline" 
      : m.damage_class === "physical"
        ? "fitness-outline"
        : "leaf-outline";

  return (
    <View
      style={{
        backgroundColor: "#0b0b0b",
        borderColor: "#222",
        borderWidth: 1,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <View style={{ height: 4, backgroundColor: strip }} />

      <View style={{ padding: 12, gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name={icon} size={18} color={strip} />
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
              textTransform: "capitalize",
            }}
          >
            {m.name}
          </Text>
        </View>

        <Text style={{ color: "#9CA3AF" }}>
          {m.damage_class} • {m.type}
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <Ionicons name="flash-outline" size={16} color="#9CA3AF" />
            <Text style={{ color: "#9CA3AF" }}>power: {m.power ?? "–"}</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <Ionicons name="locate-outline" size={16} color="#9CA3AF" />
            <Text style={{ color: "#9CA3AF" }}>acc: {m.accuracy ?? "–"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
