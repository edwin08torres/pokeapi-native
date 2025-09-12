import { create } from "zustand";

type CompareState = {
    selected: string[];               
    clear: () => void;
    remove: (name: string) => void;
    toggle: (name: string) => void;     
    selectRef: (name: string) => void;   
    compareWith: (name: string) => void;
    isSelected: (name: string) => boolean;
    isFull: () => boolean;
    refName: () => string | undefined;
};

export const useCompare = create<CompareState>((set, get) => ({
    selected: [],

    clear: () => set({ selected: [] }),

    remove: (name) =>
        set((s) => ({ selected: s.selected.filter((n) => n !== name) })),

    toggle: (name) =>
        set((s) => {
            const sel = s.selected;
            if (sel.includes(name)) return { selected: sel.filter((n) => n !== name) };
            if (sel.length === 0) return { selected: [name] };
            if (sel.length === 1) return { selected: [sel[0], name] };
            return { selected: [sel[0], name] };
        }),

    selectRef: (name) =>
        set((s) => {
            if (s.selected[0] === name) return { selected: [] }
            return { selected: [name] };                     
        }),

    compareWith: (name) =>
        set((s) => {
            const sel = s.selected;
            if (sel.length === 0) return { selected: [name] };
            if (sel.length === 1 && sel[0] !== name) return { selected: [sel[0], name] };
            if (sel.length === 2) {
                if (sel.includes(name)) return s as any;         
                return { selected: [sel[0], name] };               
            }
            return s as any;
        }),

    isSelected: (name) => get().selected.includes(name),
    isFull: () => get().selected.length >= 2,
    refName: () => get().selected[0],
}));
