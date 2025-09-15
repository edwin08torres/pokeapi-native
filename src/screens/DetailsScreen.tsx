import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import type { RootStackParamList } from "../app/navigation/RootNavigator";

import {
  usePokemonDetails,
  useEvolutionChain,
  usePokemonMoves,
  usePokemonLocations,
} from "@/hooks";

import { colorForType } from "../theme/typeColors";
import { useCompare } from "../store/useCompare";

import type { PokemonStat } from "@/api";

import {
  Chip,
  StatBar,
  MoveCard,
  CompareReadyModal,
  PokeLoader,
  ErrorState,
} from "@/components";

type DetailsRouteProp = RouteProp<RootStackParamList, "Details">;
type Nav = NativeStackNavigationProp<RootStackParamList, "Details">;

export default function DetailsScreen() {
  const navigation = useNavigation<Nav>();
  const {
    params: { name },
  } = useRoute<DetailsRouteProp>();

  const { data, isLoading, isError, refetch } = usePokemonDetails(name);
  const evo = useEvolutionChain(name);
  const moves = usePokemonMoves(name, 14);
  const locs = usePokemonLocations(data?.id);

  const selectRef = useCompare((s) => s.selectRef);
  const compareWith = useCompare((s) => s.compareWith);
  const isFull = useCompare((s) => s.isFull());
  const ref = useCompare((s) => s.refName());
  const refInfo = usePokemonDetails(ref, { enabled: !!ref });
  const isRef = ref === name;

  const [showConfirm, setShowConfirm] = useState(false);
  const [showLocs, setShowLocs] = useState(false);

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

  if (!data) return null;

  const mainType = data.types[0];
  const mainColor = colorForType(mainType);

  const goToCompare = () => {
    setShowConfirm(false);
    navigation.navigate("Tabs", { screen: "Compare" });
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#000" }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          {!!data.image && (
            <Image
              source={data.image}
              style={{ width: 240, height: 240 }}
              contentFit="contain"
              transition={200}
              cachePolicy="disk"
            />
          )}
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "800",
              textTransform: "capitalize",
            }}
          >
            {data.name}{" "}
            <Text style={{ color: "#9CA3AF", fontSize: 18 }}>#{data.id}</Text>
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {data.types.map((t) => (
              <Chip key={t} label={t} color={colorForType(t)} />
            ))}
          </View>

          <View style={{ gap: 8, marginTop: 12 }}>
            <Chip
              label={
                isRef
                  ? "Quitar referencia"
                  : ref && ref !== data.name
                    ? `Referencia actual: ${ref}`
                    : "Marcar como referencia"
              }
              onPress={!ref || isRef ? () => selectRef(data.name) : undefined}
              color={!ref || isRef ? mainColor : "#1f2937"}
              style={{ opacity: !ref || isRef ? 1 : 0.6, alignSelf: "center" }}
            />

            <Chip
              label={
                ref && ref !== data.name
                  ? isFull
                    ? "Comparación completa (2/2)"
                    : "Comparar con la referencia"
                  : "Selecciona una referencia primero"
              }
              onPress={
                ref && ref !== data.name && !isFull
                  ? () => {
                      compareWith(data.name);
                      setShowConfirm(true);
                    }
                  : undefined
              }
              color={
                ref && ref !== data.name && !isFull ? "#16a34a" : "#1f2937"
              }
              style={{
                opacity: ref && ref !== data.name && !isFull ? 1 : 0.6,
                alignSelf: "center",
              }}
            />
          </View>
        </View>

        {/* Stats */}
        <Text
          style={{
            color: "#fff",
            marginTop: 8,
            marginBottom: 8,
            fontWeight: "800",
          }}
        >
          Stats
        </Text>
        <View style={{ gap: 10, paddingHorizontal: 4 }}>
          {data.stats.map((s: PokemonStat) => (
            <View key={s.name}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: "#9CA3AF", textTransform: "capitalize" }}>
                  {s.name}
                </Text>
                <Text style={{ color: "#9CA3AF" }}>{s.value}</Text>
              </View>
              <StatBar value={s.value} color={mainColor} />
            </View>
          ))}
        </View>

        {/* Evolutions */}
        <Text
          style={{
            color: "#fff",
            marginTop: 18,
            marginBottom: 10,
            fontWeight: "800",
          }}
        >
          Evolutions
        </Text>
        {evo.isLoading ? (
          <Text style={{ color: "#aaa" }}>Cargando…</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {evo.data?.map((n, idx) => (
                <React.Fragment key={n}>
                  <Chip
                    label={n}
                    onPress={() => navigation.push("Details", { name: n })}
                    color="#111"
                    tint="#fff"
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "#222",
                    }}
                  />
                  {idx < (evo.data?.length ?? 1) - 1 && (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Moves */}
        <Text
          style={{
            color: "#fff",
            marginTop: 18,
            marginBottom: 10,
            fontWeight: "800",
            paddingHorizontal: 4,
          }}
        >
          Moves (level-up)
        </Text>
        {moves.isLoading ? (
          <Text style={{ color: "#aaa" }}>Cargando…</Text>
        ) : (
          <View style={{ paddingHorizontal: 2 }}>
            {moves.data?.map((m) => (
              <MoveCard key={m.name} m={m} />
            ))}
          </View>
        )}

        {/* Locations */}
        <Text style={{ color: "#fff", marginTop: 18, fontWeight: "800" }}>
          Locations
        </Text>
        {locs.isLoading ? (
          <Text style={{ color: "#aaa", marginTop: 6 }}>Cargando…</Text>
        ) : (
          <View style={{ marginTop: 6 }}>
            <Text
              onPress={() => setShowLocs((v) => !v)}
              style={{ color: "#60a5fa", marginBottom: 8 }}
            >
              {showLocs
                ? "Ocultar ubicaciones"
                : `Ver ubicaciones (${locs.data?.length || 0})`}
            </Text>
            {showLocs &&
              (locs.data?.length ? (
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {locs.data.map((l) => (
                    <Chip
                      key={l}
                      label={l.replaceAll("-", " ")}
                      outlined
                      tint="#9CA3AF"
                    />
                  ))}
                </View>
              ) : (
                <Text style={{ color: "#9CA3AF" }}>
                  No hay datos de encuentros.
                </Text>
              ))}
          </View>
        )}
      </ScrollView>

      <CompareReadyModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onOpenCompare={goToCompare}
        aName={ref ?? "—"}
        bName={data.name}
        aImage={refInfo.data?.image ?? undefined}
        bImage={data.image ?? undefined}
        color={mainColor}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
