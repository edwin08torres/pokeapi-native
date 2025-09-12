import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type State = {
  favorites: Record<string, true>;
  toggle: (name: string) => void;
  isFavorite: (name: string) => boolean;
  clear: () => void;
};

export const useFavorites = create<State>()(
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
      isFavorite: (name) => !!get().favorites[name],
      clear: () => set({ favorites: {} }),
    }),
    {
      name: "favorites",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
