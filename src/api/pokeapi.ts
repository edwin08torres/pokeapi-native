const BASE = "https://pokeapi.co/api/v2";

export type PokemonListItem = { name: string; url: string };
export type PokemonStat = { name: string; value: number };
export type PokemonDetails = {
  id: number;
  name: string;
  image: string | null;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchPokemonList({
  pageParam = 0,
}: {
  pageParam?: number;
}) {
  const limit = 24;
  const url = `${BASE}/pokemon?limit=${limit}&offset=${pageParam}`;
  const json = await fetchJSON<{
    results: PokemonListItem[];
    next: string | null;
  }>(url);

  const nextOffset = json.next
    ? Number(new URL(json.next).searchParams.get("offset"))
    : undefined;

  return { items: json.results, nextOffset };
}

export async function fetchPokemonDetails(
  name: string
): Promise<PokemonDetails> {
  const d = await fetchJSON<any>(`${BASE}/pokemon/${name}`);

  const image =
    d?.sprites?.other?.["official-artwork"]?.front_default ??
    d?.sprites?.front_default ??
    null;

  return {
    id: d.id,
    name: d.name,
    image,
    types: d.types.map((t: any) => t.type.name),
    abilities: d.abilities.map((a: any) => a.ability.name),
    stats: d.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat })),
  };
}
