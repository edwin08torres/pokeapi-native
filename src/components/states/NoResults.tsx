import React from "react";
import { View, Text, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title?: string;
  subtitle?: string;
  onClear?: () => void; // limpiar filtros/búsqueda
};

export default function NoResults({
  title = "Sin resultados",
  subtitle = "Prueba con otros filtros o términos de búsqueda.",
  onClear,
}: Props) {
  return (
    <View style={{ alignItems: "center", padding: 16 }}>
      <LottieView
        source={require("../../../assets/NoFoundPokemon.json")}
        autoPlay
        loop
        style={{ width: 180, height: 180 }}
      />
      <Text style={{ color: "#fff", fontWeight: "700", marginTop: 8 }}>
        {title}
      </Text>
      <Text style={{ color: "#9CA3AF", textAlign: "center", marginTop: 4 }}>
        {subtitle}
      </Text>

      {onClear && (
        <Pressable
          onPress={onClear}
          style={{
            marginTop: 12,
            backgroundColor: "#111",
            borderWidth: 1,
            borderColor: "#1f2937",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name="close-circle-outline" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Limpiar filtros
          </Text>
        </Pressable>
      )}
    </View>
  );
}
