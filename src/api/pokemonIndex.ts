import type { PokemonListItem } from "../api/pokeapi";

const API = "https://pokeapi.co/api/v2";
const getIdFromUrl = (url: string) =>
    Number(url.match(/\/(\d+)\/?$/)?.[1] ?? 0);

let cache: PokemonListItem[] | null = null;

type SpeciesPage = {
    results: { name: string; url: string }[];
    next: string | null;
};

export async function ensurePokemonIndex(): Promise<PokemonListItem[]> {
    if (cache) return cache;

    const out: PokemonListItem[] = [];
    let next: string | null = `${API}/pokemon-species?limit=200`;

    while (next) {
        const r: Response = await fetch(next);
        if (!r.ok) throw new Error("species page fetch failed");
        const json: SpeciesPage = (await r.json()) as SpeciesPage;

        for (const s of json.results ?? []) {
            const id = getIdFromUrl(String(s.url));
            if (id > 0) {
                out.push({
                    name: String(s.name).toLowerCase(),
                    url: `${API}/pokemon/${id}/`,
                } as PokemonListItem);
            }
        }

        next = json.next;
    }

    cache = out.sort(
        (a, b) => getIdFromUrl(a.url) - getIdFromUrl(b.url)
    );
    return cache!;
}
