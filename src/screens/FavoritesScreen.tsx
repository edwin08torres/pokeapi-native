// src/screens/FavoritesScreen.tsx
import React, { useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { useFavorites } from "../store/useFavorites";
import PokemonCard from "../components/PokemonCard";

export default function FavoritesScreen({ navigation }: any) {
  const favorites = useFavorites((s) => s.favorites); // ← objeto estable
  const names = useMemo(() => Object.keys(favorites).sort(), [favorites]);

  if (names.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text style={{ color: "#777", textAlign: "center" }}>
          Aún no tienes favoritos. Toca el ♥ en una tarjeta.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
      <FlatList
        data={names}
        keyExtractor={(name) => name}
        numColumns={3}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <PokemonCard
            name={item}
            onPress={() => navigation.navigate("Details", { name: item })}
          />
        )}
      />
    </View>
  );
}
