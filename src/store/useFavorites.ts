import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type FavState = {
  favorites: Record<string, true>;
  toggle: (name: string) => void;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      favorites: {},
      toggle: (name) =>
        set((s) => {
          const f = { ...s.favorites };
          if (f[name]) delete f[name];
          else f[name] = true;
          return { favorites: f };
        }),
    }),
    { name: "favorites", storage: createJSONStorage(() => AsyncStorage) }
  )
);
