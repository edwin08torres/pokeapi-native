import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PokemonListItem } from "../api/pokeapi";
import {
    getNamesByType,
    getEvolutionStage,
    getNamesByGeneration,
} from "../api/filterHelpers";
import { ensureFormsIndex } from "../api/pokemonFormsIndex";
import { fastStageFilter, prewarmStageIndex } from "../api/stageFast";

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

const MAX_STAGE_CANDIDATES = 1200;
const STAGE_FETCH_CHUNK = 24;
const APPLY_TIMEOUT_MS = 10_000;

export function useFilterEngine(
    items: PokemonListItem[],
    favorites: Record<string, boolean>,
    filters: FiltersIn
) {
    const [list, setList] = useState<PokemonListItem[]>(items);
    const [isApplying, setIsApplying] = useState(false);
    const [applyTimeoutExceeded, setApplyTimeoutExceeded] = useState(false);

    const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cachesRef = useRef<Caches>({
        typeSets: new Map(),
        genSets: new Map(),
        stages: new Map(),
    });

    const abortRef = useRef<AbortState>({ ctrl: null, seq: 0 });

    const byText = useMemo(() => {
        const q = filters.query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((p) => p.name.includes(q));
    }, [items, filters.query]);

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
        const lower = names.map((n) => n.toLowerCase());
        let missing = lower.filter((n) => !cachesRef.current.stages.has(n));

        if (missing.length > MAX_STAGE_CANDIDATES) {
            missing = missing.slice(0, MAX_STAGE_CANDIDATES);
        }
        if (missing.length === 0) return;

        for (let i = 0; i < missing.length; i += STAGE_FETCH_CHUNK) {
            const chunk = missing.slice(i, i + STAGE_FETCH_CHUNK);
            const pairs = await Promise.all(
                chunk.map(async (n) => [n, await getEvolutionStage(n)] as const)
            );
            for (const [n, s] of pairs) {
                cachesRef.current.stages.set(n, ((s ?? 0) as StageNum) || 0);
            }
        }
    }, []);

    const hasActive =
        filters.types.length > 0 ||
        (Number(filters.stage) as StageNum) > 0 ||
        filters.onlyFavorites ||
        filters.generation > 0 ||
        filters.query.trim().length > 0;

    const clearApplyTimer = () => {
        if (applyTimerRef.current) {
            clearTimeout(applyTimerRef.current);
            applyTimerRef.current = null;
        }
    };

    const startApplyTimer = () => {
        clearApplyTimer();
        applyTimerRef.current = setTimeout(() => {
            setApplyTimeoutExceeded(true);
        }, APPLY_TIMEOUT_MS);
    };

    const applyFilters = useCallback(
        async (opts?: { silent?: boolean }) => {
            const silent = !!opts?.silent;

            if (!silent) {
                setApplyTimeoutExceeded(false);
                setIsApplying(true);
                startApplyTimer();
            }

            const seq = ++abortRef.current.seq;
            abortRef.current.ctrl?.abort();
            abortRef.current.ctrl = new AbortController();

            try {
                const q = filters.query.trim().toLowerCase();
                let result = [...byText];

                const stage = Number(filters.stage) as StageNum;
                const onlyStageActive =
                    stage > 0 &&
                    filters.types.length === 0 &&
                    !filters.onlyFavorites &&
                    filters.generation === 0 &&
                    q.length === 0;

                if (onlyStageActive) {
                    prewarmStageIndex();
                    const fast = await fastStageFilter(items, stage as 1 | 2 | 3, 200, {
                        includeBabyAsStage0: false,
                    });
                    if (seq !== abortRef.current.seq) return;
                    setList(fast);
                    return;
                }

                const onlyTextSearch =
                    !!q &&
                    filters.types.length === 0 &&
                    !filters.onlyFavorites &&
                    filters.generation === 0 &&
                    stage === 0;

                if (onlyTextSearch) {
                    try {
                        const forms = await ensureFormsIndex();
                        if (forms.length) {
                            const baseNames = new Set(result.map((r) => r.name));
                            const extra = forms.filter(
                                (p) => p.name.includes(q) && !baseNames.has(p.name)
                            );
                            result = result.concat(extra.slice(0, 150));
                        }
                    } catch { }
                }

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

                if (filters.generation > 0) {
                    const gset = await ensureGenSet(filters.generation);
                    result = result.filter((r) => gset.has(r.name));
                }

                if (stage > 0 && result.length > 0) {
                    const names = result.map((r) => r.name);
                    await ensureStagesFor(names);
                    result = result.filter(
                        (r) => (cachesRef.current.stages.get(r.name.toLowerCase()) ?? 0) === stage
                    );
                }

                if (seq !== abortRef.current.seq) return;
                setList(result);
            } finally {
                if (!silent && seq === abortRef.current.seq) {
                    clearApplyTimer();
                    setIsApplying(false);
                }
            }
        },
        [
            byText,
            favorites,
            filters.onlyFavorites,
            filters.types,
            filters.generation,
            filters.stage,
            filters.query,
            ensureTypeSet,
            ensureGenSet,
            ensureStagesFor,
            items,
        ]
    );

    const hardReset = useCallback(() => {
        abortRef.current.ctrl?.abort();
        abortRef.current.ctrl = null;
        abortRef.current.seq++;

        cachesRef.current.typeSets.clear();
        cachesRef.current.genSets.clear();
        cachesRef.current.stages.clear();

        setApplyTimeoutExceeded(false);
        clearApplyTimer();
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
        filters.query,
    ]);

    useEffect(() => {
        return () => clearApplyTimer();
    }, []);

    return { list, isApplying, applyTimeoutExceeded, applyFilters, hardReset };
}
