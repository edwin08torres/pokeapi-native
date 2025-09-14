import React, { useMemo, useState, useCallback, useRef } from "react";
import { FlatList, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { usePokemons } from "../hooks/usePokemons";
import PokemonCard from "../components/PokemonCard";
import { useFavorites } from "../store/useFavorites";
import { useFilters } from "../store/useFilters";
import type { Filters } from "../store/useFilters";
import FiltersModal from "../components/FiltersModal";
import PokeLoader from "../components/PokeLoader";
import type { PokemonListItem } from "../api/pokeapi";
import ErrorState from "../components/states/ErrorState";
import NoResults from "../components/states/NoResults";

import styles from "./homeStyles";
import HomeHub from "../components/home/HomeHub";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useFilterEngine } from "../hooks/useFilterEngine";
import { getIdFromUrl, spriteUrl } from "../utils/pokemonAssets";
import { useRandomSubset } from "../hooks/useRandomSubset";

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

  const {
    types,
    stage,
    onlyFavorites,
    generation,
    reset: resetFilters,
  } = useFilters();

  const [draftQuery, setDraftQuery] = useState("");
  const debouncedQuery = useDebouncedValue(draftQuery, 450);
  const [showFilters, setShowFilters] = useState(false);
  const [showHub, setShowHub] = useState(true);

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data]
  );

  const { list, isApplying, applyFilters, hardReset } = useFilterEngine(
    items,
    favorites,
    {
      types,
      stage: stage as any,
      onlyFavorites,
      generation,
      query: debouncedQuery,
    }
  );

  const hasActiveFilters =
    types.length > 0 ||
    Number(stage) > 0 ||
    onlyFavorites ||
    debouncedQuery.trim().length > 0 ||
    generation > 0;

  const keyExtractor = useCallback((item: PokemonListItem) => item.name, []);

  const [randomSeed, setRandomSeed] = useState<number>(Date.now());
  const limitedList = useRandomSubset(list, 200, randomSeed);

  const listRef = useRef<FlatList<PokemonListItem>>(null);
  const scrollTop = () =>
    listRef.current?.scrollToOffset({ offset: 0, animated: true });

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (limitedList.length >= 200) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, limitedList.length]);

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

  const clearAll = useCallback(() => {
    resetFilters(); 
    setDraftQuery("");
    hardReset(); 
    setRandomSeed(Date.now());
    setShowHub(true);
  }, [hardReset, resetFilters]);

  const handleSubmitSearch = useCallback(() => {
    resetFilters();
    setDraftQuery("");
    hardReset();
    setRandomSeed(Date.now());
    setShowHub(false);
  }, [hardReset, resetFilters]);

  const quickGen = useCallback(
    async (gen: Filters["generation"]) => {
      const st = useFilters.getState();
      useFilters.setState({
        types: [],
        generation: gen,
        stage: 0,
        onlyFavorites: st.onlyFavorites,
      });
      await applyFilters({ silent: false });
      setRandomSeed(Date.now()); 
      setShowHub(false);
      scrollTop();
    },
    [applyFilters]
  );

  const quickType = useCallback(
    async (t: string) => {
      const st = useFilters.getState();
      useFilters.setState({
        types: [t],
        generation: 0,
        stage: 0,
        onlyFavorites: st.onlyFavorites,
      });
      await applyFilters({ silent: false });
      setRandomSeed(Date.now());
      setShowHub(false);
      scrollTop();
    },
    [applyFilters]
  );

  const quickStage = useCallback(
    async (s: 1 | 2 | 3) => {
      const st = useFilters.getState();
      useFilters.setState({
        stage: s,
        types: [],
        generation: 0,
        onlyFavorites: st.onlyFavorites,
      });
      await applyFilters({ silent: false });
      setRandomSeed(Date.now());
      setShowHub(false);
      scrollTop();
    },
    [applyFilters]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
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

  if (showHub) {
    return (
      <HomeHub
        draftQuery={draftQuery}
        setDraftQuery={setDraftQuery}
        onOpenFilters={() => setShowFilters(true)}
        onSubmitSearch={handleSubmitSearch}
        onQuickGen={quickGen}
        onQuickType={quickType}
        onQuickStage={quickStage}
        warmup={undefined}
      />
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
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginBottom: 12,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={clearAll} 
          style={styles.iconBtn}
          android_ripple={{ color: "#1f2937" }}
        >
          <Ionicons name="grid-outline" size={18} color="#fff" />
        </Pressable>
        {/* 
        <Pressable
          onPress={() => { setRandomSeed(Date.now()); scrollTop(); }}
          style={styles.iconBtn}
          android_ripple={{ color: "#1f2937" }}
        >
          <Ionicons name="shuffle-outline" size={18} color="#fff" />
        </Pressable> */}
      </View>

      <FlatList
        ref={listRef}
        data={limitedList}
        keyExtractor={(it) => it.name}
        numColumns={1}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
        onEndReachedThreshold={0.6}
        onEndReached={handleEndReached}
        renderItem={renderItem}
        extraData={favorites}
        refreshing={isFetching && !isLoading}
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
        windowSize={11}
        removeClippedSubviews
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
      />

      <FiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={async () => {
          await applyFilters({ silent: false });
          setRandomSeed(Date.now());
          setShowHub(false);
          scrollTop();
        }}
      />
    </View>
  );
}
