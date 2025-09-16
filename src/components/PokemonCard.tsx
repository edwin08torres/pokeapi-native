import React, { memo, useMemo, useRef, useCallback } from "react";
import { Pressable, View, Text, Animated } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colorForType } from "@/theme/typeColors";

type Props = {
  name: string;
  id?: number;
  image?: string | null;
  types?: string[];
  isFavorite?: boolean;
  compareSlot?: "A" | "B" | null;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

const withAlpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const iconForType: Record<string, keyof typeof Ionicons.glyphMap> = {
  fire: "flame",
  water: "water",
  grass: "leaf",
  electric: "flash",
  rock: "trail-sign-outline",
  ground: "earth-outline",
  bug: "bug-outline",
  ice: "snow-outline",
  poison: "beaker-outline",
  psychic: "sparkles-outline",
  ghost: "skull-outline",
  dark: "moon-outline",
  steel: "cube-outline",
  dragon: "aperture-outline",
  fairy: "color-wand-outline",
  flying: "paper-plane-outline",
  fighting: "hand-left-outline",
  normal: "ellipse-outline",
};

function TypePill({ t }: { t: string }) {
  const tint = colorForType(t);
  const icon = iconForType[t] ?? "ellipse-outline";
  return (
    <View
      style={{
        backgroundColor: tint,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Ionicons name={icon} size={12} color="#0b0b0b" />
      <Text
        style={{
          color: "#0b0b0b",
          fontWeight: "800",
          fontSize: 11,
          textTransform: "capitalize",
        }}
      >
        {t}
      </Text>
    </View>
  );
}

function PokemonCard({
  name,
  id,
  image,
  types = [],
  isFavorite = false,
  compareSlot = null,
  onPress,
  onToggleFavorite,
}: Props) {
  const primary = colorForType(types[0] ?? "normal");
  const grad = useMemo(
    () => [withAlpha(primary, 0.35), withAlpha(primary, 0.07)] as const,
    [primary]
  );

  const press = useRef(new Animated.Value(0)).current;
  const scale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  const favScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current; 

  const onPressIn = () =>
    Animated.spring(press, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  const onPressOut = () =>
    Animated.spring(press, {
      toValue: 0,
      useNativeDriver: true,
      friction: 6,
    }).start();

  const handleFavPress = useCallback(() => {
    requestAnimationFrame(() => onToggleFavorite?.());

    favScale.setValue(0.85);
    Animated.spring(favScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 180,
    }).start();

    pulse.setValue(0);
    Animated.timing(pulse, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [onToggleFavorite, favScale, pulse]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.4],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <LinearGradient
      colors={grad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 1 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          android_ripple={{ color: "#121212" }}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${name}`}
          style={{
            width: "100%",
            backgroundColor: "#0b0b0b",
            borderColor: "#1c1c1c",
            borderWidth: 1,
            borderRadius: 18,
            padding: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {compareSlot && (
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "rgba(0,0,0,.5)",
                borderColor: "#1f2937",
                borderWidth: 1,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                zIndex: 2,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                {compareSlot}
              </Text>
            </View>
          )}

          <Animated.View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 3,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: withAlpha("#ef4444", 0.25),
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              }}
            />
            <Animated.View style={{ transform: [{ scale: favScale }] }}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleFavPress();
                }}
                hitSlop={10}
                style={{
                  backgroundColor: "rgba(0,0,0,.35)",
                  borderRadius: 999,
                  padding: 6,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                }}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={16}
                  color={isFavorite ? "#ef4444" : "#fff"}
                />
              </Pressable>
            </Animated.View>
          </Animated.View>

          <View
            style={{
              aspectRatio: 1,
              borderRadius: 14,
              backgroundColor: "#0f0f14",
              borderWidth: 1,
              borderColor: "#15151a",
              overflow: "hidden",
              marginBottom: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LinearGradient
              colors={[withAlpha(primary, 0.35), "transparent"]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 2 }}
              style={{
                position: "absolute",
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: 16,
                opacity: 0.35,
              }}
            />
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                transition={150}
                cachePolicy="disk"
              />
            ) : (
              <Ionicons name="image-outline" size={28} color="#1f2937" />
            )}
          </View>

          {/* nombre + id */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: "#fff",
                fontWeight: "800",
                textTransform: "capitalize",
              }}
            >
              {name}
            </Text>
            {id ? (
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>#{id}</Text>
            ) : null}
          </View>

          <View
            style={{ flexDirection: "row", gap: 6, justifyContent: "center" }}
          >
            {types.slice(0, 2).map((t) => (
              <TypePill key={t} t={t} />
            ))}
          </View>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

export default memo(PokemonCard);
