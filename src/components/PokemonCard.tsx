import React, { memo } from "react";
import { Pressable, View, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colorForType } from "../theme/typeColors";

type Props = {
  name: string;
  id?: number;
  image?: string | null;
  types?: string[];
  isFavorite?: boolean;
  compareSlot?: "A" | "B" | null;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

function PokemonCard({
  name,
  id,
  image,
  types = [],
  isFavorite = false,
  compareSlot = null,
  onPress,
  onToggleFavorite,
}: Props) {
  const primary = colorForType(types[0] ?? "normal");

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#111" }}
      style={({ pressed }) => ({
        width: "100%",
        backgroundColor: "#0b0b0b",
        borderColor: "#1e1e1e",
        borderWidth: 1,
        borderRadius: 16,
        padding: 10,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      })}
    >
      {/* Badge compare A/B */}
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          flexDirection: "row",
          gap: 6,
          zIndex: 1,
        }}
      >
        {compareSlot && (
          <View
            style={{
              backgroundColor: "rgba(0,0,0,.45)",
              borderColor: "#1f2937",
              borderWidth: 1,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
              {compareSlot}
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onToggleFavorite?.();
        }}
        hitSlop={10}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: "rgba(0,0,0,.35)",
          borderRadius: 999,
          padding: 6,
          borderWidth: 1,
          borderColor: "#1f2937",
        }}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={16}
          color={isFavorite ? "#ef4444" : "#fff"}
        />
      </Pressable>

      {/* Imagen */}
      <View
        style={{
          aspectRatio: 1,
          borderRadius: 12,
          backgroundColor: "#0f0f14",
          borderWidth: 1,
          borderColor: "#15151a",
          overflow: "hidden",
          marginBottom: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }} 
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={150}
            cachePolicy="disk"
          />
        ) : (
          <Ionicons name="image-outline" size={28} color="#1f2937" />
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: "#fff",
            fontWeight: "700",
            textTransform: "capitalize",
          }}
        >
          {name}
        </Text>
        {id ? (
          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>#{id}</Text>
        ) : null}
      </View>

      {/* Types */}
      <View style={{ flexDirection: "row", gap: 6, justifyContent: "center" }}>
        {types.slice(0, 2).map((t) => (
          <View
            key={t}
            style={{
              backgroundColor: colorForType(t),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: "#0b0b0b",
                fontWeight: "700",
                fontSize: 11,
                textTransform: "capitalize",
              }}
            >
              {t}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export default memo(PokemonCard);
