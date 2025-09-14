const BASE = "https://pokeapi.co/api/v2";

const typeCache = new Map<string, Set<string>>();

export async function getNamesByType(type: string): Promise<Set<string>> {
    const key = String(type).toLowerCase();
    if (typeCache.has(key)) return typeCache.get(key)!;

    const r = await fetch(`${BASE}/type/${key}`);
    if (!r.ok) throw new Error(`type '${key}' fetch failed`);
    const json = await r.json();

    const set = new Set<string>(
        (json?.pokemon ?? []).map((p: any) => String(p?.pokemon?.name ?? "").toLowerCase())
    );
    typeCache.set(key, set);
    return set;
}

const speciesCache = new Map<string, any>(); 
const chainCache = new Map<number, any>();  
const stageCache = new Map<string, number>(); 

function clampStage(n: number) {
    return Math.max(0, Math.min(3, n | 0));
}

function chainIdFromUrl(url?: string | null): number | null {
    if (!url) return null;
    const m = url.match(/evolution-chain\/(\d+)\/?$/);
    return m ? Number(m[1]) : null;
}

function findStage(node: any, wanted: string, depth: number): number {
    if (!node) return 0;
    const name = String(node?.species?.name ?? "").toLowerCase();
    if (name === wanted) return depth;
    const kids: any[] = node?.evolves_to ?? [];
    for (const k of kids) {
        const d = findStage(k, wanted, depth + 1);
        if (d) return d;
    }
    return 0;
}

export async function getEvolutionStage(name: string): Promise<number> {
    const key = String(name).toLowerCase();
    if (stageCache.has(key)) return stageCache.get(key)!;

    let species = speciesCache.get(key);
    if (!species) {
        const rs = await fetch(`${BASE}/pokemon-species/${key}`);
        if (!rs.ok) {
            stageCache.set(key, 0);
            return 0;
        }
        species = await rs.json();
        speciesCache.set(key, species);
    }

    const chainUrl: string | undefined = species?.evolution_chain?.url;
    const chainId = chainIdFromUrl(chainUrl);
    if (chainId == null || !chainUrl) {
        stageCache.set(key, 0);
        return 0;
    }

    let chain = chainCache.get(chainId);
    if (!chain) {
        const rc = await fetch(chainUrl);
        if (!rc.ok) {
            stageCache.set(key, 0);
            return 0;
        }
        chain = await rc.json();
        chainCache.set(chainId, chain);
    }

    const depth = findStage(chain?.chain, key, 1);
    const out = clampStage(depth);
    stageCache.set(key, out);
    return out;
}

const genCache = new Map<number, Set<string>>();

export async function getNamesByGeneration(gen: number): Promise<Set<string>> {
    if (genCache.has(gen)) return genCache.get(gen)!;

    const res = await fetch(`${BASE}/generation/${gen}/`);
    if (!res.ok) throw new Error(`generation ${gen} fetch failed`);
    const json = await res.json();

    const out = new Set<string>(
        (json?.pokemon_species ?? []).map((s: any) => String(s?.name ?? "").toLowerCase())
    );
    genCache.set(gen, out);
    return out;
}