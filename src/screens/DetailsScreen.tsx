import { View, Text, Image, ScrollView } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import type { RootStackParamList } from "../app/navigation/RootNavigator";
import type { PokemonStat } from "../api/pokeapi";

type DetailsRouteProp = RouteProp<RootStackParamList, "Details">;

export default function DetailsScreen() {
  const { params: { name } } = useRoute<DetailsRouteProp>();
  const { data, isLoading } = usePokemonDetails(name);

  if (isLoading) return <Text style={{ color: "#fff" }}>Cargando…</Text>;
  if (!data) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000", padding: 16 }}>
      {!!data.image && (
        <Image
          source={{ uri: data.image }}
          style={{ width: 220, height: 220, alignSelf: "center" }}
        />
      )}

      <Text
        style={{
          color: "#fff",
          fontSize: 22,
          textTransform: "capitalize",
          textAlign: "center",
          marginVertical: 8,
        }}
      >
        {data.name} #{data.id}
      </Text>

      <Text style={{ color: "#fff", marginTop: 12 }}>
        Tipos: {data.types.join(", ")}
      </Text>
      <Text style={{ color: "#fff", marginTop: 8 }}>
        Habilidades: {data.abilities.join(", ")}
      </Text>

      <Text style={{ color: "#fff", marginTop: 12, marginBottom: 6 }}>Stats</Text>
      {data.stats.map((s: PokemonStat) => (
        <View key={s.name} style={{ marginBottom: 6 }}>
          <Text style={{ color: "#aaa", marginBottom: 2 }}>{s.name}</Text>
          <View style={{ height: 8, backgroundColor: "#222", borderRadius: 6 }}>
            <View
              style={{
                width: `${Math.min(s.value, 100)}%`,
                height: 8,
                backgroundColor: "#4ade80",
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
