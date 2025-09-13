import React from "react";
import { Modal, View, Text, Pressable, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFilters } from "../store/useFilters";
import { colorForType } from "../theme/typeColors";

const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
};

export default function FiltersModal({ visible, onClose, onApply }: Props) {
  const {
    types,
    toggleType,
    stage,
    setStage,
    onlyFavorites,
    toggleOnlyFavorites,
    reset,
  } = useFilters();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#0b0b0b",
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "85%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Filtros
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#aaa" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
            {/* Tipos */}
            <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>Tipos</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {ALL_TYPES.map((t) => {
                const selected = types.includes(t);
                return (
                  <Pressable
                    key={t}
                    onPress={() => toggleType(t)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: selected ? colorForType(t) : "#111",
                      borderWidth: 1,
                      borderColor: "#1f2937",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#0b0b0b" : "#fff",
                        fontWeight: "700",
                        textTransform: "capitalize",
                      }}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Fase de evolución */}
            <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>
              Fase de evolución
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {[0, 1, 2, 3].map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStage(s as 0 | 1 | 2 | 3)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: stage === s ? "#1f2937" : "#111",
                    borderWidth: 1,
                    borderColor: "#1f2937",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {s === 0 ? "Cualquiera" : `Fase ${s}`}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Solo favoritos */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Solo favoritos
              </Text>
              <Switch
                value={onlyFavorites}
                onValueChange={toggleOnlyFavorites}
              />
            </View>
          </ScrollView>

          {/* Footer botones */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={reset}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                backgroundColor: "#111",
                borderWidth: 1,
                borderColor: "#1f2937",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                Limpiar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onApply();
                onClose();
              }}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                backgroundColor: "#3b82f6",
              }}
            >
              <Text
                style={{
                  color: "#0b0b0b",
                  textAlign: "center",
                  fontWeight: "800",
                }}
              >
                Aplicar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
