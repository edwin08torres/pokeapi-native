import { useQuery } from "@tanstack/react-query";
import { fetchEvolutionNamesFor } from "../api/pokeapi";

export function useEvolutionChain(idOrName: number | string) {
    return useQuery({
        queryKey: ["evolution", idOrName],
        queryFn: () => fetchEvolutionNamesFor(idOrName),
        staleTime: 1000 * 60 * 60, // 1h
    });
}
