import React from "react";
import { Pressable, Image, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonDetails } from "../api/pokeapi";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../store/useFavorites";

export default function PokemonCard({
  name,
  onPress,
}: {
  name: string;
  onPress: () => void;
}) {
  const { data } = useQuery({
    queryKey: ["card", name],
    queryFn: () => fetchPokemonDetails(name),
  });

  const toggle = useFavorites((s) => s.toggle);
  const isFav = useFavorites((s) => !!s.favorites[name]); // ← sin métodos

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 8,
        position: "relative",
      }}
    >
      <Pressable
        onPress={(e) => {
          e?.stopPropagation?.();
          toggle(name);
        }}
        hitSlop={10}
        style={{ position: "absolute", bottom: 0, right: 4, zIndex: 2 }}
      >
        <Ionicons
          name={isFav ? "heart" : "heart-outline"}
          size={18}
          color={isFav ? "#ef4444" : "#fff"}
        />
      </Pressable>

      {!!data?.image && (
        <Image
          source={{ uri: data.image }}
          style={{ width: "100%", height: 100, borderRadius: 8 }}
        />
      )}
      <View style={{ marginTop: 6 }}>
        <Text
          style={{
            color: "#fff",
            textTransform: "capitalize",
            textAlign: "center",
          }}
        >
          {name}
        </Text>
      </View>
    </Pressable>
  );
}
