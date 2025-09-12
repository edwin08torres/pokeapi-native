import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPokemonDetails } from "../api/pokeapi";
import type { PokemonDetails } from "../api/pokeapi";
import PokemonCard from "../components/PokemonCard";
import { useFavorites } from "../store/useFavorites";

export default function FavoritesScreen({ navigation }: any) {
  const favorites = useFavorites((s) => s.favorites);
  const toggle = useFavorites((s) => s.toggle);

  const names = useMemo(() => Object.keys(favorites).sort(), [favorites]);
  const namesKey = useMemo(() => names.join(","), [names]);

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

  const { data = [], isFetching } = useQuery<PokemonDetails[]>({
    queryKey: ["fav-batch", namesKey],
    queryFn: async () => {
      const list = await Promise.all(names.map((n) => fetchPokemonDetails(n)));
      return list;
    },
    enabled: names.length > 0,
    staleTime: 1000 * 60 * 30,
    placeholderData: keepPreviousData,
  });

  const renderItem = useCallback(
    ({ item }: { item: PokemonDetails }) => (
      <PokemonCard
        name={item.name}
        id={item.id}
        image={item.image ?? undefined}
        types={item.types}
        isFavorite={true}
        onToggleFavorite={() => {
          if (favorites[item.name]) toggle(item.name);
        }}
        onPress={() => navigation.navigate("Details", { name: item.name })}
      />
    ),
    [favorites, toggle, navigation]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
      {isFetching && data.length === 0 ? (
        <ActivityIndicator color="#60a5fa" style={{ marginTop: 12 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(d) => d.name}
          numColumns={1}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={renderItem}
          extraData={namesKey}
        />
      )}
    </View>
  );
}
