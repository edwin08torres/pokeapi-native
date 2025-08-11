Pokédex (React Native + Expo)
App móvil y web que muestra una Pokédex con lista infinita, búsqueda, detalle de cada Pokémon y favoritos persistidos.
Construida con Expo, React Navigation, TanStack Query, Zustand y PokeAPI.

Demo local: Android/iOS con Expo Go · Web con expo start --web
API: https://pokeapi.co

✨ Features
🔎 Listado con infinite scroll, búsqueda por nombre y estado de carga.

📄 Detalle: imagen oficial, tipos, habilidades y estadísticas.

❤️ Favoritos con persistencia (AsyncStorage).

⚡ Caché y reintentos con TanStack Query.

🔗 Deep linking (p. ej., /pokemon/pikachu en web abre el detalle).

🌓 Base de tema oscuro y estilo consistente.

🌐 Soporte Web (react-native-web + Expo Metro).

🧱 Stack
Expo (React Native)

TypeScript

React Navigation (Stack + Bottom Tabs)

@tanstack/react-query (v5)

Zustand + AsyncStorage

react-native-safe-area-context

@expo/vector-icons

PokeAPI

src/
  api/
    pokeapi.ts                  # Fetch + modelos
  app/
    AppProviders.tsx            # QueryClient, SafeArea, etc.
    navigation/
      RootNavigator.tsx         # Stack + deep linking + tema
      TabsNavigator.tsx         # Tabs con iconos
  components/
    PokemonCard.tsx             # Card + botón de favorito
    TypeBadge.tsx               # (opcional)
    StatBar.tsx                 # (opcional)
    Loading.tsx, ErrorState.tsx # (opcional)
  hooks/
    usePokemons.ts              # useInfiniteQuery
    usePokemonDetails.ts        # useQuery
  screens/
    HomeScreen.tsx              # Lista, búsqueda
    DetailsScreen.tsx           # Detalle
    FavoritesScreen.tsx         # Favoritos persistidos
  store/
    useFavorites.ts             # Zustand + persist
  theme/                        # tokens opcionales
  utils/                        # helpers
App.tsx                         # punto de entrada (src/)
index.js                        # registerRootComponent

# 1) Instalar dependencias
npm i

# 2) Alinear dependencias Expo (si lo pide)
npx expo doctor --fix-dependencies

# 3) Iniciar con caché limpia (recomendado)
npx expo start -c

# 4) Abrir plataforma
# a = Android (Emulador/Expo Go)
# i = iOS (simulador, en macOS)
# w = Web

Si levantas Web por primera vez y te lo pide:
npx expo install @expo/metro-runtime react-native-web react-dom

⚙️ Scripts útiles
{
  "scripts": {
    "start": "expo start",
    "start:clean": "expo start -c",
    "web": "expo start --web",
    "android": "expo run:android",
    "ios": "expo run:ios"
  }
}

🔌 Integraciones clave
// hooks/usePokemons.ts
export function usePokemons() {
  return useInfiniteQuery({
    queryKey: ["pokemons"],
    queryFn: ({ pageParam = 0 }) => fetchPokemonList({ pageParam }),
    getNextPageParam: (last) => last.nextOffset,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });
}

Persistencia de favoritos (Zustand)

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      favorites: {},
      toggle: (name) =>
        set((s) => {
          const f = { ...s.favorites };
          f[name] ? delete f[name] : (f[name] = true);
          return { favorites: f };
        }),
    }),
    { name: "favorites", storage: createJSONStorage(() => AsyncStorage) }
  )
);
En componentes, selecciono solo el estado crudo y derivo con useMemo para evitar loops de render (regla importante con useSyncExternalStore).

🔗 Deep Linking (Web)
En RootNavigator.tsx:
const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Tabs: { screens: { Home: "home", Favorites: "favorites" } },
      Details: "pokemon/:name",
    },
  },
};
