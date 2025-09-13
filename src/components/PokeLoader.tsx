import React from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";

type Props = { size?: number };

export default function PokeLoader({ size = 64 }: Props) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 16 }}>
      <LottieView
        source={require("../../assets/pokemon.json")}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
}
