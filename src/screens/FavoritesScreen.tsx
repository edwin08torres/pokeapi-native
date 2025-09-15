import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonDetails } from "../api/pokeapi";
import type { PokemonDetails } from "../api/pokeapi";
import PokemonCard from "../components/PokemonCard";
import { useFavorites } from "../store/useFavorites";
import ErrorState from "@/components/states/ErrorState";

const CHUNK_SIZE = 8;  

async function fetchFavoritesBatch(names: string[]) {
  const items: PokemonDetails[] = [];
  let failed = 0;

  for (let i = 0; i < names.length; i += CHUNK_SIZE) {
    const chunk = names.slice(i, i + CHUNK_SIZE);
    const settled = await Promise.allSettled(
      chunk.map((n) => fetchPokemonDetails(n))
    );
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) items.push(r.value);
      else failed++;
    }
  }

  items.sort((a, b) => a.id - b.id);
  return { items, failed };
}

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

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["favorites/batch", namesKey],
    enabled: names.length > 0,
    staleTime: 30 * 60 * 1000, 
    queryFn: () => fetchFavoritesBatch(names),
    placeholderData: (prev) => prev,
    retry: 1,
    retryDelay: 800,
  });

  const items = data?.items ?? [];
  const failed = data?.failed ?? 0;

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

  if (isError || (failed === names.length && items.length === 0)) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}
      >
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
      {failed > 0 && items.length > 0 ? (
        <Text style={{ color: "#a3a3a3", marginBottom: 8 }}>
          {failed} favorito(s) no se pudieron cargar. Intenta refrescar.
        </Text>
      ) : null}

      {isFetching && items.length === 0 ? (
        <ActivityIndicator color="#60a5fa" style={{ marginTop: 12 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(d) => d.name}
          numColumns={1}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={renderItem}
          refreshing={isFetching}
          onRefresh={() => refetch()}
          extraData={namesKey}
        />
      )}
    </View>
  );
}
