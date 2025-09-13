import React from "react";
import { View, Text, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onRetry?: () => void;
};

export default function ErrorState({ onRetry }: Props) {
  return (
    <View style={{ alignItems: "center", padding: 16 }}>
      <LottieView
        source={require("../../../assets/Error-Pokemon.json")}
        autoPlay
        loop
        style={{ width: 180, height: 180 }}
      />
      <Text style={{ color: "#fff", fontWeight: "700", marginTop: 8 }}>
        Ups, algo salió mal
      </Text>
      <Text style={{ color: "#9CA3AF", textAlign: "center", marginTop: 4 }}>
        No pudimos cargar los datos. Intenta de nuevo.
      </Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={{
            marginTop: 12,
            backgroundColor: "#3b82f6",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name="refresh" size={16} color="#0b0b0b" />
          <Text style={{ color: "#0b0b0b", fontWeight: "800" }}>
            Reintentar
          </Text>
        </Pressable>
      )}
    </View>
  );
}
