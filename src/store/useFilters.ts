import { create } from "zustand";

export type Filters = {
    types: string[];       
    stage: 0 | 1 | 2 | 3;  
    onlyFavorites: boolean;
};

type State = Filters & {
    reset: () => void;
    toggleType: (t: string) => void;
    setStage: (s: 0 | 1 | 2 | 3) => void;
    toggleOnlyFavorites: () => void;
};

const initial: Filters = { types: [], stage: 0, onlyFavorites: false };

export const useFilters = create<State>((set, get) => ({
    ...initial,
    reset: () => set(initial),
    toggleType: (t) => {
        const cur = get().types;
        set({ types: cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t] });
    },
    setStage: (s) => set({ stage: s }),
    toggleOnlyFavorites: () => set({ onlyFavorites: !get().onlyFavorites }),
}));
