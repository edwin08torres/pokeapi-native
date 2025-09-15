import type { PokemonListItem } from "./pokeapi";
import { getEvolutionStage } from "./filterHelpers";
import { ensureStageIndex } from "./getPokemonsByStage";
import { getIdFromUrl } from "../utils/pokemonAssets";

const CONCURRENCY = 24;
const FALLBACK_SCAN = 450;

type StageMaps = { base1: Map<number, number>; baby0: Map<number, number> };

let building = false;

export function prewarmStageIndex() {
  if (building) return;
  building = true;
  ensureStageIndex()
    .catch(() => { })
    .finally(() => {
      building = false;
    });
}

export async function fastStageFilter(
  items: PokemonListItem[],
  targetStage: 1 | 2 | 3,
  limit: number,
  opts?: { includeBabyAsStage0?: boolean }
): Promise<PokemonListItem[]> {
  const includeBaby = !!opts?.includeBabyAsStage0;

  try {
    const maps = (await ensureStageIndex()) as StageMaps;
    const map = includeBaby ? maps.baby0 : maps.base1;

    if (map && map.size > 0) {
      const out: PokemonListItem[] = [];
      for (const it of items) {
        const id = getIdFromUrl(it.url);
        if (id <= 0) continue;
        if (map.get(id) === targetStage) {
          out.push(it);
          if (out.length >= limit) break;
        }
      }
      if (out.length >= limit) return out;
    }
  } catch {
  }

  prewarmStageIndex();

  const out: PokemonListItem[] = [];
  const slice = items.slice(0, FALLBACK_SCAN);

  let i = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, slice.length) }).map(
    async () => {
      while (i < slice.length && out.length < limit) {
        const cur = slice[i++];
        try {
          const st = await getEvolutionStage(cur.name);
          if (st === targetStage) {
            out.push(cur);
          }
        } catch {
        }
      }
    }
  );

  await Promise.all(workers);
  return out.slice(0, limit);
}
