import { useMemo } from "react";

export function useRandomSubset<T>(arr: T[], size: number, seed: number) {
    return useMemo(() => {
        if (!Array.isArray(arr) || arr.length <= size) return arr;
        let s = (seed >>> 0) || 1;
        const rand = () => {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, size);
    }, [arr, size, seed]);
}
