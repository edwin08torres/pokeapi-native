import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Animated,
  Pressable,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { fetchPokemonDetails, PokemonDetails } from "@/api";
import { useCompare } from "@/store/useCompare";
import { TypeBadge, StatBar } from "@/components";
import { colorForType } from "@/theme/typeColors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;
type StatKey = (typeof STAT_KEYS)[number];

const statMeta: Record<
  StatKey | "bst",
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  bst: { label: "Total (BST)", icon: "stats-chart-outline" as any },
  hp: { label: "Hp", icon: "heart-outline" as any },
  attack: { label: "Attack", icon: "flash-outline" as any },
  defense: { label: "Defense", icon: "shield-outline" as any },
  "special-attack": {
    label: "Special Attack",
    icon: "sparkles-outline" as any,
  },
  "special-defense": {
    label: "Special Defense",
    icon: "shield-checkmark-outline" as any,
  },
  speed: { label: "Speed", icon: "speedometer-outline" as any },
};

const GAP = 14;
const CARD_W = 172;

type Mode = "absolute" | "relative";

export default function CompareScreen() {
  const names = useCompare((s) => s.selected);
  const clear = useCompare((s) => s.clear);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["compare-batch", names],
    queryFn: () => Promise.all(names.map((n) => fetchPokemonDetails(n))),
    staleTime: 1000 * 60 * 30,
    enabled: names.length > 0,
  });

  const data = list as PokemonDetails[];

  const get = (p: PokemonDetails, k: StatKey) =>
    p.stats.find((s) => s.name === k)?.value ?? 0;

  const bst = (p: PokemonDetails) =>
    STAT_KEYS.reduce((acc, k) => acc + get(p, k), 0);

  const maxima = useMemo(() => {
    const m = {
      bst: Math.max(...(data.length ? data.map(bst) : [1])),
    } as Record<StatKey | "bst", number>;
    STAT_KEYS.forEach((k) => {
      m[k] = Math.max(...(data.length ? data.map((d) => get(d, k)) : [1]));
    });
    return m;
  }, [data]);

  const winners = useMemo(() => {
    const w: Record<StatKey | "bst", string[]> = { bst: [] } as any;
    Object.keys(statMeta).forEach((key) => {
      const k = key as StatKey | "bst";
      const max = maxima[k];
      const arr =
        k === "bst"
          ? data.filter((d) => bst(d) === max).map((d) => d.name)
          : data.filter((d) => get(d, k as StatKey) === max).map((d) => d.name);
      w[k] = arr;
    });
    return w;
  }, [data, maxima]);

  const rowWidth = data.length * CARD_W + Math.max(0, data.length - 1) * GAP;
  const screenW = Dimensions.get("window").width;
  const padH = Math.max(16, (screenW - rowWidth) / 2);

  const [mode, setMode] = useState<Mode>("absolute");
  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = (screenW - 32 - 8) / 2;

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: mode === "absolute" ? 0 : pillW + 8,
      useNativeDriver: true,
      bounciness: 10,
    }).start();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [mode]);

  const appear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [names.join(",")]);

  const renderCard = (d: PokemonDetails) => {
    const tint = colorForType(d.types[0]);
    const isTop = winners.bst.includes(d.name);

    return (
      <Animated.View
        key={d.name}
        style={{
          width: CARD_W,
          transform: [
            {
              scale: appear.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
          opacity: appear,
        }}
      >
        <View
          style={{
            backgroundColor: "#0b0b0b",
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: isTop ? tint : "#222",
            padding: 10,
          }}
        >
          <View
            style={{
              height: 112,
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

            {isTop && (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  flexDirection: "row",
                  gap: 4,
                  backgroundColor: "#0b1220",
                  borderColor: tint,
                  borderWidth: 1,
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 999,
                }}
              >
                <Ionicons name="trophy-outline" size={12} color={tint} />
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}
                >
                  Top total
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              color: "#fff",
              textTransform: "capitalize",
              fontWeight: "900",
            }}
            numberOfLines={1}
          >
            {d.name}{" "}
            <Text style={{ color: "#9CA3AF", fontWeight: "700" }}>#{d.id}</Text>
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 6,
              flexWrap: "wrap",
            }}
          >
            {d.types.slice(0, 2).map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Ionicons name="stats-chart-outline" size={14} color={tint} />
            <Text style={{ color: "#9CA3AF", fontSize: 12, fontWeight: "600" }}>
              BST {bst(d)}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const statRow = (key: StatKey | "bst") => {
    const max = maxima[key];
    const icon = statMeta[key].icon;
    const label = statMeta[key].label;
    const winnersForRow = winners[key];

    return (
      <View
        key={key}
        style={{ marginBottom: 16, width: "100%", paddingHorizontal: padH }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons name={icon as any} size={16} color="#9CA3AF" />
          <Text style={{ color: "#9CA3AF", fontWeight: "700" }}>{label}</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: GAP,
            justifyContent: "center",
            width: rowWidth,
            alignSelf: "center",
          }}
        >
          {data.map((d) => {
            const tint = colorForType(d.types[0]);
            const value = key === "bst" ? bst(d) : get(d, key as StatKey);
            const maxForBar =
              mode === "relative" ? max : key === "bst" ? 720 : 200;
            const isWinner = winnersForRow.includes(d.name);

            const pct = Math.round((value / max) * 100);

            return (
              <View
                key={`${d.name}-${key}`}
                style={{
                  width: CARD_W,
                  backgroundColor: "#0b0b0b",
                  borderWidth: 1.2,
                  borderColor: isWinner ? tint : "#222",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <StatBar value={value} max={maxForBar} color={tint} />
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
                    <Ionicons name="trophy-outline" size={14} color={tint} />
                  )}
                  <Text style={{ color: "#9CA3AF", fontWeight: "700" }}>
                    {mode === "relative" ? `${pct}%` : value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <LinearGradient
        colors={["#ef4444", "#b91c1c", "#000000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 18 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* <Text
            style={{ color: "#fff", fontSize: 22, fontWeight: "900", flex: 1 }}
          >
            Comparar
          </Text> */}

          <Pressable
            onPress={clear}
            style={({ pressed }) => ({
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              backgroundColor: pressed ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.1)",
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Limpiar</Text>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            backgroundColor: "rgba(0,0,0,0.25)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: 6,
            marginTop: 12,
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              width: pillW,
              height: 30,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.15)",
              transform: [{ translateX: pillX }],
            }}
          />
          <Pressable
            onPress={() => setMode("absolute")}
            style={{
              flex: 1,
              height: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Valores</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("relative")}
            style={{
              flex: 1,
              height: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>% relativo</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {names.length === 0 ? (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ color: "#888", textAlign: "center" }}>
            Agrega Pokémon a comparar desde la pantalla de detalles.
          </Text>
        </View>
      ) : isLoading && data.length === 0 ? (
        <View style={{ paddingVertical: 16 }}>
          <ActivityIndicator color="#60a5fa" />
        </View>
      ) : (
        <>
          <View
            style={{
              paddingHorizontal: padH,
              marginTop: 14,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: rowWidth,
                alignSelf: "center",
                flexDirection: "row",
                gap: GAP,
                justifyContent: "center",
              }}
            >
              {data.map(renderCard)}
            </View>
          </View>

          {statRow("bst")}
          {STAT_KEYS.map((k) => statRow(k))}
        </>
      )}
    </ScrollView>
  );
}
