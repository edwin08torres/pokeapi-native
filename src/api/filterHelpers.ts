// --- Por tipo --------------------------------------------------------------
const typeCache = new Map<string, Set<string>>();

export async function getNamesByType(type: string): Promise<Set<string>> {
    if (typeCache.has(type)) return typeCache.get(type)!;
    const r = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const json = await r.json();
    const set = new Set<string>(json.pokemon.map((p: any) => p.pokemon.name));
    typeCache.set(type, set);
    return set;
}

// --- Por fase de evolución -------------------------------------------------
const speciesCache = new Map<string, any>();
const chainCache = new Map<number, any>();
const stageCache = new Map<string, number>();

export async function getEvolutionStage(name: string): Promise<number> {
    if (stageCache.has(name)) return stageCache.get(name)!;

    //species → evolution_chain.url
    let species = speciesCache.get(name);
    if (!species) {
        const rs = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
        if (!rs.ok) throw new Error("species");
        species = await rs.json();
        speciesCache.set(name, species);
    }
    const chainUrl: string = species.evolution_chain?.url;
    const chainId = Number(chainUrl.match(/\/(\d+)\/?$/)?.[1] ?? 0);

    let chain = chainCache.get(chainId);
    if (!chain) {
        const rc = await fetch(chainUrl);
        if (!rc.ok) throw new Error("chain");
        chain = await rc.json();
        chainCache.set(chainId, chain);
    }

    const stage = findStage(chain.chain, name, 1);
    stageCache.set(name, stage || 1);
    return stage || 1;
}

function findStage(node: any, name: string, depth: number): number {
    if (node?.species?.name === name) return depth;
    for (const child of node?.evolves_to ?? []) {
        const r = findStage(child, name, depth + 1);
        if (r) return r;
    }
    return 0;
}
