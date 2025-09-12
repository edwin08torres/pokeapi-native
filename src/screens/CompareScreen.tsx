// src/screens/CompareScreen.tsx
import React, { useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { fetchPokemonDetails } from "../api/pokeapi";
import type { PokemonDetails } from "../api/pokeapi";
import { useCompare } from "../store/useCompare";
import Chip from "../components/Chip";
import StatBar from "../components/StatBar";
import { colorForType } from "../theme/typeColors";

const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;
type StatKey = (typeof STAT_KEYS)[number];

const COL_WIDTH = 148;
const GAP = 14;

export default function CompareScreen() {
  const names = useCompare((s) => s.selected);
  const clear = useCompare((s) => s.clear);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["compare-batch", names],
    queryFn: () => Promise.all(names.map((n) => fetchPokemonDetails(n))),
    staleTime: 1000 * 60 * 30,
  });

  const data = list as PokemonDetails[];

  const statVal = (p: PokemonDetails, key: StatKey) =>
    p.stats.find((s) => s.name === key)?.value ?? 0;

  const maxima: Record<StatKey, number> = useMemo(() => {
    const m = {} as Record<StatKey, number>;
    STAT_KEYS.forEach((k) => {
      m[k] = Math.max(...(data.length ? data.map((d) => statVal(d, k)) : [1]));
    });
    return m;
  }, [data]);

  const rowWidth = data.length * COL_WIDTH + Math.max(0, data.length - 1) * GAP;

  const labelPretty = (k: StatKey) =>
    k
      .replace("special-", "Special ")
      .replace("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{
        paddingVertical: 16,
        paddingBottom: 40,
        alignItems: "center",
      }}
    >
      <Text
        onPress={clear}
        style={{
          color: "#60a5fa",
          marginBottom: 12,
          alignSelf: "flex-start",
          marginLeft: 16,
        }}
      >
        Limpiar comparación
      </Text>

      {names.length === 0 ? (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ color: "#888", textAlign: "center" }}>
            Agrega Pokémon a comparar desde la pantalla de detalles.
          </Text>
        </View>
      ) : (
        <>
          <View
            style={{
              width: rowWidth,
              alignSelf: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: GAP,
              marginBottom: 12,
            }}
          >
            {data.map((d) => {
              const tint = colorForType(d.types[0]);
              return (
                <View
                  key={d.name}
                  style={{
                    width: COL_WIDTH,
                    backgroundColor: "#0b0b0b",
                    borderWidth: 1,
                    borderColor: "#222",
                    borderRadius: 16,
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      height: 90,
                      borderRadius: 12,
                      backgroundColor: "#0f172a",
                      borderWidth: 1,
                      borderColor: "#1f2937",
                      overflow: "hidden",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    {!!d.image && (
                      <Image
                        source={d.image}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="contain"
                        transition={150}
                      />
                    )}
                  </View>

                  <Text
                    style={{
                      color: "#fff",
                      textTransform: "capitalize",
                      fontWeight: "800",
                    }}
                    numberOfLines={1}
                  >
                    {d.name}{" "}
                    <Text style={{ color: "#9CA3AF", fontWeight: "600" }}>
                      #{d.id}
                    </Text>
                  </Text>

                  <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                    {d.types.slice(0, 2).map((t) => (
                      <Chip key={t} label={t} color={colorForType(t)} />
                    ))}
                  </View>

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="heart-outline" size={14} color={tint} />
                      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                        {statVal(d, "hp")}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="flash-outline" size={14} color={tint} />
                      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                        {statVal(d, "attack")}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="shield-outline" size={14} color={tint} />
                      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                        {statVal(d, "defense")}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {isLoading && (
            <View style={{ paddingVertical: 8 }}>
              <ActivityIndicator color="#60a5fa" />
            </View>
          )}

          {STAT_KEYS.map((key) => {
            const max = maxima[key];
            const winners = data
              .filter((d) => statVal(d, key) === max)
              .map((d) => d.name);

            return (
              <View key={key} style={{ marginBottom: 16, width: rowWidth }}>
                <Text
                  style={{
                    color: "#9CA3AF",
                    marginBottom: 8,
                    fontWeight: "700",
                  }}
                >
                  {labelPretty(key)}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    gap: GAP,
                    justifyContent: "center",
                  }}
                >
                  {data.map((d) => {
                    const v = statVal(d, key);
                    const tint = colorForType(d.types[0]);
                    const isWinner = winners.includes(d.name);

                    return (
                      <View
                        key={d.name}
                        style={{
                          width: COL_WIDTH,
                          backgroundColor: "#0b0b0b",
                          borderWidth: 1.2,
                          borderColor: isWinner ? tint : "#222",
                          borderRadius: 12,
                          padding: 10,
                          elevation: isWinner ? 3 : 1,
                          shadowColor: "#000",
                          shadowOpacity: 0.25,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 2 },
                        }}
                      >
                        <StatBar value={v} max={max} color={tint} />
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            marginTop: 6,
                          }}
                        >
                          {isWinner && (
                            <Ionicons
                              name="trophy-outline"
                              size={14}
                              color={tint}
                            />
                          )}
                          <Text style={{ color: "#9CA3AF", fontWeight: "600" }}>
                            {v}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}
