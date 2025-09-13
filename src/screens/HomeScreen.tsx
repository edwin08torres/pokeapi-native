import React, { useMemo, useState, useCallback } from "react";
import { FlatList, View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePokemons } from "../hooks/usePokemons";
import PokemonCard from "../components/PokemonCard";
import { useFavorites } from "../store/useFavorites";
import { useFilters } from "../store/useFilters";
import FiltersModal from "../components/FiltersModal";
import PokeLoader from "../components/PokeLoader";
import type { PokemonListItem } from "../api/pokeapi";
import { getNamesByType, getEvolutionStage } from "../api/filterHelpers";
import ErrorState from "../components/states/ErrorState";
import NoResults from "../components/states/NoResults";

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
    refetch, 
    isFetching,
  } = usePokemons();

  const favorites = useFavorites((s) => s.favorites);
  const toggleFav = useFavorites((s) => s.toggle);

  const filters = useFilters(); 
  const { reset: resetFilters } = useFilters();

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filteredData, setFilteredData] = useState<PokemonListItem[] | null>(
    null
  );

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data]
  );

  const byText = useMemo(
    () => items.filter((p) => p.name.includes(query.toLowerCase())),
    [items, query]
  );

  const applyFilters = useCallback(async () => {
    setIsFiltering(true);
    try {
      let result = [...byText];

      if (filters.onlyFavorites) {
        const favNames = new Set(Object.keys(favorites));
        result = result.filter((r) => favNames.has(r.name));
      }

      if (filters.types.length > 0) {
        const typeSets = await Promise.all(filters.types.map(getNamesByType));
        const union = new Set<string>();
        typeSets.forEach((s) => s.forEach((n) => union.add(n)));
        result = result.filter((r) => union.has(r.name));
      }

      if (filters.stage > 0) {
        const stages = await Promise.all(
          result.map(
            async (r) => [r.name, await getEvolutionStage(r.name)] as const
          )
        );
        const map = new Map<string, number>(stages);
        result = result.filter((r) => map.get(r.name) === filters.stage);
      }

      setFilteredData(result);
    } catch {
      setFilteredData(byText);
    } finally {
      setIsFiltering(false);
    }
  }, [byText, favorites, filters]);

  React.useEffect(() => {
    if (filteredData !== null) applyFilters();
  }, [byText]);

  const list = filteredData ?? byText;

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

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.stage > 0 ||
    filters.onlyFavorites ||
    query.length > 0;

  const clearAll = () => {
    resetFilters();
    setQuery("");
    setFilteredData(null);
  };

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
        <PokeLoader size={96} />
        <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Cargando…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}
      >
        <ErrorState onRetry={() => refetch()} />
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
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          placeholder="Buscar..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#888"
          style={{
            flex: 1,
            color: "#fff",
            borderWidth: 1,
            borderColor: "#222",
            padding: 10,
            borderRadius: 10,
          }}
        />
        <Pressable
          onPress={() => setShowFilters(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111",
            borderWidth: 1,
            borderColor: "#222",
          }}
          android_ripple={{ color: "#1f2937" }}
        >
          <Ionicons name="options-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      {isFiltering && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <PokeLoader size={72} />
          <Text style={{ color: "#9CA3AF", marginTop: 8 }}>
            Aplicando filtros…
          </Text>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={keyExtractor}
        numColumns={1}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
        onEndReachedThreshold={0.6}
        onEndReached={handleEndReached}
        renderItem={renderItem}
        extraData={favorites}
        refreshing={isFetching && !isLoading}
        onRefresh={() => refetch()}
        ListEmptyComponent={
          <NoResults
            title="No encontramos pokémon"
            subtitle={
              hasActiveFilters
                ? "Prueba cambiar la búsqueda o limpiar los filtros."
                : "Intenta con otro nombre."
            }
            onClear={hasActiveFilters ? clearAll : undefined}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? <PokeLoader size={64} /> : null
        }
      />

      <FiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={applyFilters}
      />
    </View>
  );
}
