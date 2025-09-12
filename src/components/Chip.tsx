import React from "react";
import { Text, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  color?: string;
  tint?: string;
  style?: ViewStyle;
  outlined?: boolean;
};

export default function Chip({
  label,
  onPress,
  color = "#111",
  tint = "#fff",
  outlined,
  style,
}: Props) {
  const base = {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start" as const,
    borderWidth: outlined ? 1 : 0,
    borderColor: outlined ? tint : "transparent",
    backgroundColor: outlined ? "transparent" : color,
  };

  const Comp: any = onPress
    ? TouchableOpacity
    : (props: any) => <Text {...props} />;
  return (
    <Comp onPress={onPress} style={[base, style]}>
      <Text
        style={{ color: tint, textTransform: "capitalize", fontWeight: "600" }}
      >
        {label}
      </Text>
    </Comp>
  );
}
