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
export type MoveInfo = {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  damage_class: string;
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

export async function fetchEvolutionNamesFor(
  idOrName: number | string
): Promise<string[]> {
  const species = await fetchJSON<{ evolution_chain: { url: string } }>(
    `${BASE}/pokemon-species/${idOrName}`
  );
  const chain = await fetchJSON<any>(species.evolution_chain.url);

  const out: string[] = [];
  const walk = (n?: any) => {
    if (!n) return;
    out.push(n.species.name);
    (n.evolves_to ?? []).forEach(walk); // soporta ramas (ej. eevee)
  };
  walk(chain.chain);
  return out;
}

// --- Moves: prioriza los aprendidos por "level-up" y trae detalles del move ---
export async function fetchPokemonMovesLevelUp(
  idOrName: number | string,
  limit = 12
): Promise<MoveInfo[]> {
  const p = await fetchJSON<any>(`${BASE}/pokemon/${idOrName}`);

  const levelUp = p.moves.filter((m: any) =>
    m.version_group_details?.some(
      (d: any) => d.move_learn_method?.name === "level-up"
    )
  );

  const top = levelUp.slice(0, limit);
  const details = await Promise.all(
    top.map(async (m: any) => {
      const d = await fetchJSON<any>(m.move.url);
      return {
        name: d.name,
        type: d.type?.name ?? "unknown",
        power: d.power ?? null,
        accuracy: d.accuracy ?? null,
        damage_class: d.damage_class?.name ?? "unknown",
      } as MoveInfo;
    })
  );
  return details;
}

// --- Locations: áreas de encuentro /encounters ---
export async function fetchPokemonEncounterAreas(
  idOrName: number | string
): Promise<string[]> {
  const arr = await fetchJSON<any[]>(`${BASE}/pokemon/${idOrName}/encounters`);
  const names = Array.from(
    new Set(arr.map((x: any) => x.location_area?.name).filter(Boolean))
  );
  return names.sort();
}