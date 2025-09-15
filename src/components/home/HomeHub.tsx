import React, { memo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colorForType } from "../../theme/typeColors";
import styles from "../../screens/homeStyles";
import type { Filters } from "../../store/useFilters";
import { spriteUrl } from "../../utils/pokemonAssets";

const ROMANS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
] as const;

const GENS_META: {
  g: Filters["generation"];
  starters: number[];
  grad: [string, string];
}[] = [
  // { g: 1, starters: [1, 4, 7], grad: ["#ff6a3d", "#7c3aed"] },
  // { g: 2, starters: [152, 155, 158], grad: ["#22c55e", "#2563eb"] },
  // { g: 3, starters: [252, 255, 258], grad: ["#f59e0b", "#9333ea"] },
  // { g: 4, starters: [387, 390, 393], grad: ["#60a5fa", "#1d4ed8"] },
  // { g: 5, starters: [495, 498, 501], grad: ["#fb7185", "#0ea5e9"] },
  // { g: 6, starters: [650, 653, 656], grad: ["#f97316", "#ef4444"] },
  // { g: 7, starters: [722, 725, 728], grad: ["#06b6d4", "#8b5cf6"] },
  // { g: 8, starters: [810, 813, 816], grad: ["#22d3ee", "#22c55e"] },
  // { g: 9, starters: [906, 909, 912], grad: ["#f43f5e", "#3b82f6"] },
  { g: 1, starters: [1, 4, 7], grad: ["#ef4444", "#5e1616ff"] },
  { g: 2, starters: [152, 155, 158], grad: ["#ef4444", "#5e1616ff"] },
  { g: 3, starters: [252, 255, 258], grad: ["#ef4444", "#5e1616ff"] },
  { g: 4, starters: [387, 390, 393], grad: ["#ef4444", "#5e1616ff"] },
  { g: 5, starters: [495, 498, 501], grad: ["#ef4444", "#5e1616ff"] },
  { g: 6, starters: [650, 653, 656], grad: ["#7c3aed", "#200c44ff"] },
  { g: 7, starters: [722, 725, 728], grad: ["#7c3aed", "#200c44ff"] },
  { g: 8, starters: [810, 813, 816], grad: ["#7c3aed", "#200c44ff"] },
  { g: 9, starters: [906, 909, 912], grad: ["#7c3aed", "#200c44ff"] },
];

const QUICK_TYPES = [
  "fire",
  "water",
  "grass",
  "electric",
  "rock",
  "ground",
  "psychic",
  "dragon",
] as const;

type Props = {
  draftQuery: string;
  setDraftQuery: (v: string) => void;
  onOpenFilters: () => void;
  onSubmitSearch: () => void;
  onSeeAll: () => void;
  onQuickGen: (g: Filters["generation"]) => void;
  onQuickType: (t: string) => void;
  onQuickStage: (s: 1 | 2 | 3) => void;
  warmup?: () => void;
};

const HomeHub = memo(function HomeHub({
  draftQuery,
  setDraftQuery,
  onOpenFilters,
  onSubmitSearch,
  onSeeAll,
  onQuickGen,
  onQuickType,
  onQuickStage,
  warmup,
}: Props) {
  useEffect(() => {
    warmup?.();
  }, [warmup]);
  const art = (id: number) => spriteUrl(id);

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b" }}>
      <LinearGradient
        colors={["#ef4444", "#ef4444", "#0b0b0b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        
        style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Text
            style={{ color: "#fff", fontSize: 22, fontWeight: "900", flex: 1 }}
          >
            PokeSpark
          </Text>
        </View>

        <View style={styles.searchPill}>
          <Ionicons
            name="search"
            size={18}
            color="#e5e7eb"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Buscar cualquier pokémon"
            placeholderTextColor="#d1d5db"
            value={draftQuery}
            onChangeText={setDraftQuery}
            onSubmitEditing={onSubmitSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, color: "#fff", fontSize: 16 }}
          />
          {draftQuery.length > 0 && (
            <Pressable onPress={() => setDraftQuery("")}>
              <Ionicons name="close-circle" size={18} color="#e5e7eb" />
            </Pressable>
          )}
        </View>

        <View style={{ alignItems: "center", marginTop: 10 }}>
          <View
            style={{
              width: 64,
              height: 5,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.25)",
            }}
          />
        </View>
      </LinearGradient>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 20,
        }}
      >
        <Text style={styles.sectionTitle}>Explora por generación</Text>
        <View style={styles.grid}>
          {GENS_META.map((meta, idx) => (
            <Pressable
              key={meta.g}
              onPress={() => onQuickGen(meta.g)}
              style={({ pressed }) => [
                styles.genCard,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={meta.grad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.genCardInner}
              >
                <Text
                  style={styles.genTitle}
                >{`GENERACIÓN ${ROMANS[idx]}`}</Text>
                <View style={styles.startersRow}>
                  {meta.starters.map((id, i) => (
                    <Image
                      key={id}
                      source={{ uri: art(id) }}
                      style={[
                        styles.starterImg,
                        { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i },
                      ]}
                      resizeMode="contain"
                    />
                  ))}
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Tipos</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {QUICK_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => onQuickType(t)}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                height: 38,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                // backgroundColor: colorForType(t),
                backgroundColor: '#ef4444',
                transform: [{ scale: pressed ? 0.98 : 1 }],
                marginRight: 8,
              })}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Fase de evolución</Text>
        <View style={styles.segmented}>
          {[1, 2, 3].map((s) => (
            <Pressable
              key={s}
              onPress={() => onQuickStage(s as 1 | 2 | 3)}
              style={({ pressed }) => [
                styles.segmentBtn,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Text style={styles.segmentText}>{`Fase ${s}`}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onSeeAll}
          style={({ pressed }) => [
            styles.cta,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={styles.ctaText}>Ver todos</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
});

export default HomeHub;
