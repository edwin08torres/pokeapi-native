import type { PokemonListItem } from "./pokeapi";

const API = "https://pokeapi.co/api/v2";
const getIdFromUrl = (url: string) =>
    Number(url.match(/\/pokemon\/(\d+)\/?$/)?.[1] ?? 0);


let formsCache: PokemonListItem[] | null = null;

export async function ensureFormsIndex(): Promise<PokemonListItem[]> {
    if (formsCache) return formsCache;

    const res = await fetch(`${API}/pokemon?limit=20000&offset=0`);
    if (!res.ok) throw new Error("pokemon list failed");
    const json = await res.json();

    const out: PokemonListItem[] = [];
    for (const s of json.results ?? []) {
        const id = getIdFromUrl(String(s.url));
        if (id <= 0) continue;

        out.push({
            name: String(s.name).toLowerCase(),
            url: `${API}/pokemon/${id}/`,
        });
    }

    out.sort((a, b) => getIdFromUrl(a.url) - getIdFromUrl(b.url));
    formsCache = out;
    return formsCache;
}
