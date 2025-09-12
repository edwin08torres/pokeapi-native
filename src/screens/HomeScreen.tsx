import React, { useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  View,
  Text,
  TextInput,
} from "react-native";
import { usePokemons } from "../hooks/usePokemons";
import PokemonCard from "../components/PokemonCard";
import { useFavorites } from "../store/useFavorites";
import type { PokemonListItem } from "../api/pokeapi";

const getIdFromUrl = (url: string) =>
  Number(url.match(/\/pokemon\/(\d+)\/?$/)?.[1] ?? 0);

const spriteUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export default function HomeScreen({ navigation }: any) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePokemons();

  const favorites = useFavorites((s) => s.favorites);
  const toggleFav = useFavorites((s) => s.toggle);

  const [query, setQuery] = useState("");

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data]
  );

  const filtered = useMemo(
    () => items.filter((p) => p.name.includes(query.toLowerCase())),
    [items, query]
  );

  const keyExtractor = useCallback((item: PokemonListItem) => item.name, []);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: PokemonListItem }) => {
      const id = getIdFromUrl(item.url);
      const image = id ? spriteUrl(id) : undefined;
      const isFavorite = !!favorites[item.name];

      return (
        <PokemonCard
          name={item.name}
          id={id}
          image={image}
          isFavorite={isFavorite}
          onToggleFavorite={() => toggleFav(item.name)}
          onPress={() => navigation.navigate("Details", { name: item.name })}
        />
      );
    },
    [favorites, navigation, toggleFav]
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Cargando…</Text>
      </View>
    );
  }
  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Error al cargar.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
    >
      <TextInput
        placeholder="Buscar..."
        value={query}
        onChangeText={setQuery}
        placeholderTextColor="#888"
        style={{
          color: "#fff",
          borderWidth: 1,
          borderColor: "#222",
          padding: 10,
          borderRadius: 10,
          marginBottom: 12,
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        numColumns={1}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        onEndReachedThreshold={0.6}
        onEndReached={handleEndReached}
        renderItem={renderItem}
        extraData={favorites}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ paddingVertical: 16 }} />
          ) : null
        }
      />
    </View>
  );
}
