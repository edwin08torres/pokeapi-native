import React, { memo } from "react";
import { Pressable, Text, View, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorForType } from "@/theme/typeColors";

type Size = "sm" | "md" | "lg";
type Variant = "solid" | "soft" | "outline";

type Props = {
  type: string; 
  size?: Size;
  variant?: Variant; 
  onPress?: () => void; 
  style?: ViewStyle;
  textStyle?: TextStyle; 
};

const withAlpha = (hex: string, alpha = 0.16) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SIZES: Record<
  Size,
  { padV: number; padH: number; font: number; icon: number }
> = {
  sm: { padV: 4, padH: 10, font: 12, icon: 12 },
  md: { padV: 6, padH: 12, font: 13, icon: 14 },
  lg: { padV: 8, padH: 14, font: 15, icon: 16 },
};

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  fire: "flame-outline",
  water: "water-outline",
  grass: "leaf-outline",
  electric: "flash-outline",
  rock: "earth-outline", // “aprox”, no hay icon específico
  ground: "trail-sign-outline", // fallback simpático
  ice: "snow-outline",
  steel: "shield-outline",
  fairy: "sparkles-outline",
  psychic: "aperture-outline",
  dragon: "rocket-outline",
  dark: "moon-outline",
  ghost: "skull-outline",
  poison: "skull-outline",
  bug: "ellipse-outline",
  flying: "airplane-outline",
  normal: "ellipse-outline",
};

const TypeBadge = memo(function TypeBadge({
  type,
  size = "md",
  variant = "soft",
  onPress,
  style,
  textStyle,
}: Props) {
  const t = String(type || "").toLowerCase();
  const color = colorForType(t) ?? "#64748b";
  const { padV, padH, font, icon } = SIZES[size];

  const isSolid = variant === "solid";
  const isOutline = variant === "outline";

  const bg = isSolid
    ? color
    : isOutline
      ? "transparent"
      : withAlpha(color, 0.15);
  const borderC = isOutline ? color : withAlpha(color, 0.4);
  const txt = isSolid ? "#fff" : color;

  const content = (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: padV,
          paddingHorizontal: padH,
          backgroundColor: bg,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: borderC,
        },
        style,
      ]}
    >
      <Ionicons
        name={TYPE_ICON[t] ?? "ellipse-outline"}
        size={icon}
        color={txt}
      />
      <Text
        style={[
          {
            color: txt,
            fontSize: font,
            fontWeight: "800",
            textTransform: "capitalize",
          },
          textStyle,
        ]}
      >
        {t}
      </Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
});

export default TypeBadge;
