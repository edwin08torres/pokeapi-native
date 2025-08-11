import React, { useMemo, useState } from "react";
import { FlatList, View, Text, TextInput } from "react-native";
import { usePokemons } from "../hooks/usePokemons";
import PokemonCard from "../components/PokemonCard";

export default function HomeScreen({ navigation }: any) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePokemons();
  const [query, setQuery] = useState("");

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data]
  );
  const filtered = useMemo(
    () => items.filter((p) => p.name.includes(query.toLowerCase())),
    [items, query]
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
        keyExtractor={(item) => item.name}
        numColumns={3}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        onEndReached={() =>
          hasNextPage && !isFetchingNextPage && fetchNextPage()
        }
        renderItem={({ item }) => (
          <PokemonCard
            name={item.name}
            onPress={() => navigation.navigate("Details", { name: item.name })}
          />
        )}
      />
    </View>
  );
}
