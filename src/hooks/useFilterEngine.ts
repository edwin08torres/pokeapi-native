import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PokemonListItem } from "../api/pokeapi";
import { getNamesByType, getNamesByGeneration } from "../api/filterHelpers";
import { ensureStageIndex } from "../api/getPokemonsByStage";
import { getIdFromUrl } from "../utils/pokemonAssets";

type StageNum = 0 | 1 | 2 | 3;

type Caches = {
    typeSets: Map<string, Set<string>>;
    genSets: Map<number, Set<string>>;
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
    });

    const abortRef = useRef<AbortState>({ ctrl: null, seq: 0 });

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

            // invalidar corrida previa
            const seq = ++abortRef.current.seq;
            abortRef.current.ctrl?.abort();
            abortRef.current.ctrl = new AbortController();

            try {
                let result = [...byText];

                // Favoritos
                if (filters.onlyFavorites) {
                    const fav = new Set(Object.keys(favorites));
                    result = result.filter((r) => fav.has(r.name));
                }

                if (filters.types.length > 0) {
                    const sets: Set<string>[] = [];
                    for (const t of filters.types) sets.push(await ensureTypeSet(t));
                    let andSet: Set<string> | null = null;
                    for (const s of sets) andSet = andSet ? intersect(andSet, s) : new Set(s);
                    if (andSet) {
                        result = result.filter((r) => andSet!.has(r.name.toLowerCase()));
                    }
                }

                // Generación
                if (filters.generation > 0) {
                    const gset = await ensureGenSet(filters.generation);
                    result = result.filter((r) => gset.has(r.name.toLowerCase()));
                }

                const stage = Number(filters.stage) as StageNum;
                if (stage > 0 && result.length > 0) {
                    const { base1 } = await ensureStageIndex(abortRef.current.ctrl?.signal);
                    result = result.filter((r) => {
                        const id = getIdFromUrl(r.url);
                        return id > 0 && base1.get(id) === stage;
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
        ]
    );

    const hardReset = useCallback(() => {
        abortRef.current.ctrl?.abort();
        abortRef.current.ctrl = null;
        abortRef.current.seq++;

        cachesRef.current.typeSets.clear();
        cachesRef.current.genSets.clear();

        setList(items);
    }, [items]);

    useEffect(() => {
        if (!hasActive) {
            setList(byText);
            return;
        }
        applyFilters({ silent: false });
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
