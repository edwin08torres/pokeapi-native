import { useQuery } from "@tanstack/react-query";
import { fetchPokemonEncounterAreas } from "../api/pokeapi";

export function usePokemonLocations(id?: number) {
    return useQuery({
        queryKey: ["locations", id],
        queryFn: () => fetchPokemonEncounterAreas(id!),
        enabled: !!id,                 // espera a tener id
        staleTime: 1000 * 60 * 60,     // 1h
    });
}
