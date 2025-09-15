const API = "https://pokeapi.co/api/v2";

export type BasicItem = { name: string; url: string; id?: number };

const getIdFromUrl = (url: string) => Number(url.match(/\/(\d+)\/?$/)?.[1] ?? 0);

async function fetchJson(url: string, signal?: AbortSignal) {
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`fetch failed: ${url}`);
    return r.json();
}

let genIndex: Map<number, Set<number>> | null = null;
let genPromise: Promise<void> | null = null;

async function ensureGenIndex(signal?: AbortSignal): Promise<Map<number, Set<number>>> {
    if (genIndex) return genIndex;
    if (genPromise) {
        await genPromise;
        return genIndex!;
    }
    genPromise = (async () => {
        const m = new Map<number, Set<number>>();
        for (let g = 1; g <= 9; g++) {
            try {
                const json = await fetchJson(`${API}/generation/${g}/`, signal);
                const set = new Set<number>();
                for (const s of json.pokemon_species ?? []) {
                    const id = getIdFromUrl(String(s.url));
                    if (id > 0) set.add(id);
                }
                m.set(g, set);
            } catch {
                m.set(g, new Set());
            }
        }
        genIndex = m;
    })();
    await genPromise;
    return genIndex!;
}

export async function fastGenFilter(
    items: BasicItem[],
    generation: number,
    limit = Infinity,
    opts?: { seed?: number; signal?: AbortSignal }
): Promise<BasicItem[]> {
    const index = await ensureGenIndex(opts?.signal);
    const allow = index.get(generation) ?? new Set<number>();

    let base: BasicItem[] = items.map((it) => ({
        ...it,
        id: it.id ?? getIdFromUrl(it.url),
    }));

    if (opts?.seed) {
        let seed = opts.seed >>> 0;
        const rand = () => {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            return seed / 0xffffffff;
        };
        for (let i = base.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [base[i], base[j]] = [base[j], base[i]];
        }
    }

    const out: BasicItem[] = [];
    for (const it of base) {
        const id = it.id ?? 0;
        if (id > 0 && allow.has(id)) {
            out.push(it);
            if (out.length >= limit) break;
        }
    }
    return out;
}
