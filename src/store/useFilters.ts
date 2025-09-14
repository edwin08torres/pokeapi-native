import { create } from "zustand";

export type Filters = {
    types: string[];
    stage: 0 | 1 | 2 | 3;
    onlyFavorites: boolean;
    generation: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};

type State = Filters & {
    reset: () => void;
    toggleType: (t: string) => void;
    setStage: (s: 0 | 1 | 2 | 3) => void;
    toggleOnlyFavorites: () => void;
    setGeneration: (g: Filters["generation"]) => void;
};

const initial: Filters = { types: [], stage: 0, onlyFavorites: false, generation: 0 };

export const useFilters = create<State>((set, get) => ({
    ...initial,

    reset: () => set(initial),

    toggleType: (t) => {
        const key = t.trim().toLowerCase();
        const cur = get().types;
        set({ types: cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key] });
    },

    setStage: (s) => set({ stage: s }),

    toggleOnlyFavorites: () => set({ onlyFavorites: !get().onlyFavorites }),

    setGeneration: (g) => set({ generation: g }),
}));
