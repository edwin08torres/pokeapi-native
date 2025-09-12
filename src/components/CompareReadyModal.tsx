import React, { useEffect, useRef } from "react";
import { Modal, View, Text, Pressable, Animated } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpenCompare: () => void;
  aName: string; // referencia
  bName: string; // seleccionado actual
  aImage?: string | null; // opcional
  bImage?: string | null; // opcional
  color?: string; // acento (usa el del tipo principal)
};

export default function CompareReadyModal({
  visible,
  onClose,
  onOpenCompare,
  aName,
  bName,
  aImage,
  bImage,
  color = "#3b82f6",
}: Props) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 6,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 24,
          justifyContent: "center",
        }}
        onPress={onClose}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity,
            backgroundColor: "#0b0b0b",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#222",
            padding: 16,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "800",
              marginBottom: 4,
            }}
          >
            Comparación lista
          </Text>
          <Text style={{ color: "#9CA3AF", marginBottom: 12 }}>
            Seleccionaste{" "}
            <Text style={{ color: "#fff", textTransform: "capitalize" }}>
              {aName}
            </Text>{" "}
            y{" "}
            <Text style={{ color: "#fff", textTransform: "capitalize" }}>
              {bName}
            </Text>
            .
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Avatar image={aImage} fallback={aName} />
            <Ionicons name="git-compare-outline" size={20} color={color} />
            <Avatar image={bImage} fallback={bName} />
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onOpenCompare}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: color,
                paddingVertical: 12,
                borderRadius: 10,
                opacity: pressed ? 0.9 : 1,
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                ABRIR COMPARADOR
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: "#0f172a",
                borderWidth: 1,
                borderColor: "#1f2937",
                paddingVertical: 12,
                borderRadius: 10,
                opacity: pressed ? 0.9 : 1,
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#9CA3AF", fontWeight: "700" }}>
                SEGUIR EXPLORANDO
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Avatar({
  image,
  fallback,
}: {
  image?: string | null;
  fallback: string;
}) {
  return (
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "#111",
        borderColor: "#1f2937",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {image ? (
        <Image
          source={image}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={150}
        />
      ) : (
        <Text
          style={{
            color: "#9CA3AF",
            textTransform: "capitalize",
            fontWeight: "700",
          }}
        >
          {fallback.slice(0, 1)}
        </Text>
      )}
    </View>
  );
}
