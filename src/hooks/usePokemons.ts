import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPokemonList } from "../api/pokeapi";

export function usePokemons() {
  return useInfiniteQuery({
    queryKey: ["pokemons"],
    queryFn: ({ pageParam = 0 }) => fetchPokemonList({ pageParam }),
    getNextPageParam: (last) => last.nextOffset,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });
}
