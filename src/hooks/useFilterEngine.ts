import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PokemonListItem } from "../api/pokeapi";
import {
    getNamesByType,
    getEvolutionStage,
    getNamesByGeneration,
} from "../api/filterHelpers";

type StageNum = 0 | 1 | 2 | 3;

type Caches = {
    typeSets: Map<string, Set<string>>;
    genSets: Map<number, Set<string>>;
    stages: Map<string, StageNum>; 
};

type FiltersIn = {
    types: string[];
    stage: StageNum | string;
    onlyFavorites: boolean;
    generation: number;
    query: string;
};

type AbortState = { ctrl: AbortController | null; seq: number };

export function useFilterEngine(
    items: PokemonListItem[],
    favorites: Record<string, boolean>,
    filters: FiltersIn
) {
    const [list, setList] = useState<PokemonListItem[]>(items);
    const [isApplying, setIsApplying] = useState(false);

    const cachesRef = useRef<Caches>({
        typeSets: new Map(),
        genSets: new Map(),
        stages: new Map(),
    });

    const abortRef = useRef<AbortState>({ ctrl: null, seq: 0 });

    // Texto
    const byText = useMemo(() => {
        const q = filters.query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((p) => p.name.includes(q));
    }, [items, filters.query]);

    // Utils set
    const intersect = (a: Set<string>, b: Set<string>) => {
        const out = new Set<string>();
        for (const v of a) if (b.has(v)) out.add(v);
        return out;
    };

    const ensureTypeSet = useCallback(async (typeName: string) => {
        const k = typeName.toLowerCase();
        const c = cachesRef.current.typeSets.get(k);
        if (c) return c;
        const set = await getNamesByType(k);
        cachesRef.current.typeSets.set(k, set);
        return set;
    }, []);

    const ensureGenSet = useCallback(async (gen: number) => {
        const c = cachesRef.current.genSets.get(gen);
        if (c) return c;
        const set = await getNamesByGeneration(gen);
        cachesRef.current.genSets.set(gen, set);
        return set;
    }, []);

    const ensureStagesFor = useCallback(async (names: string[]) => {
        const miss = names
            .map((n) => String(n).toLowerCase())
            .filter((n) => !cachesRef.current.stages.has(n));
        if (miss.length === 0) return;

        const pairs = await Promise.all(
            miss.map(async (n) => [n, await getEvolutionStage(n)] as const)
        );
        for (const [n, s] of pairs) {
            cachesRef.current.stages.set(n, ((s ?? 0) as StageNum) || 0);
        }
    }, []);

    const hasActive =
        filters.types.length > 0 ||
        (Number(filters.stage) as StageNum) > 0 ||
        filters.onlyFavorites ||
        filters.generation > 0 ||
        filters.query.trim().length > 0;

    const applyFilters = useCallback(
        async (opts?: { silent?: boolean }) => {
            const silent = !!opts?.silent;
            if (!silent) setIsApplying(true);

            const seq = ++abortRef.current.seq;
            abortRef.current.ctrl?.abort();
            abortRef.current.ctrl = new AbortController();

            try {
                let result = [...byText];

                if (filters.onlyFavorites) {
                    const fav = new Set(Object.keys(favorites));
                    result = result.filter((r) => fav.has(r.name));
                }

                if (filters.types.length > 0) {
                    const sets: Set<string>[] = [];
                    for (const t of filters.types) sets.push(await ensureTypeSet(t));
                    let andSet: Set<string> | null = null;
                    for (const s of sets) andSet = andSet ? intersect(andSet, s) : new Set(s);
                    if (andSet) result = result.filter((r) => andSet!.has(r.name));
                }

                // Generación
                if (filters.generation > 0) {
                    const gset = await ensureGenSet(filters.generation);
                    result = result.filter((r) => gset.has(r.name));
                }

                const stage = Number(filters.stage) as StageNum;
                if (stage > 0 && result.length > 0) {
                    const names = result.map((r) => r.name);
                    await ensureStagesFor(names);
                    result = result.filter((r) => {
                        const key = r.name.toLowerCase();
                        const st = cachesRef.current.stages.get(key) ?? 0; 
                        return st === stage;
                    });
                }

                if (seq !== abortRef.current.seq) return;
                setList(result);
            } finally {
                if (!silent && seq === abortRef.current.seq) setIsApplying(false);
            }
        },
        [
            byText,
            favorites,
            filters.onlyFavorites,
            filters.types,
            filters.generation,
            filters.stage,
            ensureTypeSet,
            ensureGenSet,
            ensureStagesFor,
        ]
    );

    const hardReset = useCallback(() => {
        abortRef.current.ctrl?.abort();
        abortRef.current.ctrl = null;
        abortRef.current.seq++;

        cachesRef.current.typeSets.clear();
        cachesRef.current.genSets.clear();
        cachesRef.current.stages.clear();

        setList(items);
    }, [items]);

    useEffect(() => {
        if (!hasActive) {
            setList(byText);
            return;
        }
        applyFilters({ silent: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        byText,
        filters.types,
        filters.stage,
        filters.onlyFavorites,
        filters.generation,
    ]);

    return { list, isApplying, applyFilters, hardReset };
}
