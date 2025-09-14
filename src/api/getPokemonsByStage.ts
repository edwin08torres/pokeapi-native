export type PokemonListItem = { id: number; name: string; url: string };

const API = "https://pokeapi.co/api/v2";

const getIdFromUrl = (url: string) => Number(url.match(/\/(\d+)\/?$/)?.[1] ?? 0);

async function fetchJson(url: string, signal?: AbortSignal) {
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`fetch failed: ${url}`);
    return r.json();
}

async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    mapper: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
    const out: R[] = new Array(items.length);
    let i = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }).map(
        async () => {
            while (true) {
                const idx = i++;
                if (idx >= items.length) break;
                out[idx] = await mapper(items[idx], idx);
            }
        }
    );
    await Promise.all(workers);
    return out;
}

async function listAllChainUrls(): Promise<string[]> {
    const urls: string[] = [];
    let next: string | null = `${API}/evolution-chain?limit=200`;
    while (next) {
        const page = await fetchJson(next);
        for (const it of page.results ?? []) urls.push(String(it.url));
        next = page.next;
    }
    return Array.from(new Set(urls));
}

type SpeciesBrief = { id: number; name: string };
let speciesListCache: SpeciesBrief[] | null = null;

async function getAllSpecies(): Promise<SpeciesBrief[]> {
    if (speciesListCache) return speciesListCache;
    const out: SpeciesBrief[] = [];
    let next: string | null = `${API}/pokemon-species?limit=200`;
    while (next) {
        const page = await fetchJson(next);
        for (const s of page.results ?? []) {
            const id = getIdFromUrl(String(s.url));
            if (id > 0) out.push({ id, name: String(s.name) });
        }
        next = page.next;
    }
    speciesListCache = out.sort((a, b) => a.id - b.id);
    return speciesListCache!;
}

type EvoNode = {
    species: { name: string; url: string };
    is_baby?: boolean;
    evolves_to: EvoNode[];
};

function accumulateStagesFromChain(
    root: EvoNode,
    stageBase1: Map<number, number>,
    stageBaby0: Map<number, number>
) {
    type Q = { node: EvoNode; base1: number; baby0: number };
    const startBase1 = 1;
    const startBaby0 = root.is_baby ? 0 : 1;
    const q: Q[] = [{ node: root, base1: startBase1, baby0: startBaby0 }];

    const setMin = (map: Map<number, number>, id: number, val: number) => {
        const prev = map.get(id);
        if (prev == null || val < prev) map.set(id, val);
    };

    while (q.length) {
        const { node, base1, baby0 } = q.shift()!;
        const id = getIdFromUrl(node.species.url);
        if (id > 0) {
            setMin(stageBase1, id, Math.min(3, base1 | 0));
            setMin(stageBaby0, id, Math.min(3, baby0 | 0));
        }

        for (const child of node.evolves_to ?? []) {
            const isBaby = !!(child as any).is_baby;
            q.push({
                node: child,
                base1: base1 + 1,
                baby0: isBaby ? 0 : baby0 + 1,
            });
        }
    }
}

let stageIndexBase1: Map<number, number> | null = null;
let stageIndexBaby0: Map<number, number> | null = null;
let stageIndexReady = false;
let stageIndexPromise: Promise<void> | null = null;

export async function ensureStageIndex(signal?: AbortSignal): Promise<{
    base1: Map<number, number>;
    baby0: Map<number, number>;
}> {
    if (stageIndexReady && stageIndexBase1 && stageIndexBaby0) {
        return { base1: stageIndexBase1, baby0: stageIndexBaby0 };
    }
    if (stageIndexPromise) {
        await stageIndexPromise;
        return { base1: stageIndexBase1!, baby0: stageIndexBaby0! };
    }

    stageIndexPromise = (async () => {
        const urls = await listAllChainUrls();
        const base1 = new Map<number, number>();
        const baby0 = new Map<number, number>();

        await mapWithConcurrency(urls, 10, async (url) => {
            try {
                const chain = await fetchJson(url, signal);
                const root: EvoNode = chain?.chain;
                if (root) accumulateStagesFromChain(root, base1, baby0);
            } catch {
                /* aca ira algo TODO: */
            }
        });

        stageIndexBase1 = base1;
        stageIndexBaby0 = baby0;
        stageIndexReady = true;
    })();

    await stageIndexPromise;
    return { base1: stageIndexBase1!, baby0: stageIndexBaby0! };
}

export async function getPokemonsByStage(
    targetStage: 1 | 2 | 3,
    opts?: { babyAs0?: boolean; signal?: AbortSignal }
): Promise<PokemonListItem[]> {
    const { base1, baby0 } = await ensureStageIndex(opts?.signal);
    const stageMap = opts?.babyAs0 ? baby0 : base1;
    const species = await getAllSpecies();

    const filtered = species
        .filter((s) => stageMap.get(s.id) === targetStage)
        .map((s) => ({
            id: s.id,
            name: s.name,
            url: `${API}/pokemon/${s.id}/`,
        }))
        .sort((a, b) => a.id - b.id);

    return filtered;
}

export const getPokemonsFase1 = (babyAs0 = false) =>
    getPokemonsByStage(1, { babyAs0 });
export const getPokemonsFase2 = (babyAs0 = false) =>
    getPokemonsByStage(2, { babyAs0 });
export const getPokemonsFase3 = (babyAs0 = false) =>
    getPokemonsByStage(3, { babyAs0 });
