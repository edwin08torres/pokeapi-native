import { useQuery } from "@tanstack/react-query";
import { fetchPokemonDetails } from "../api/pokeapi";

export function usePokemonDetails(
  name?: string,
  opts?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["pokemon", name],
    queryFn: () => fetchPokemonDetails(name!), 
    enabled: !!name && (opts?.enabled ?? true),
    staleTime: 1000 * 60 * 30,
  });
}
