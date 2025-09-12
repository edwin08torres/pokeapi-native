import { useQuery } from "@tanstack/react-query";
import { fetchPokemonMovesLevelUp, MoveInfo } from "../api/pokeapi";

export function usePokemonMoves(idOrName: number | string, limit = 12) {
    return useQuery<MoveInfo[]>({
        queryKey: ["moves", idOrName, limit],
        queryFn: () => fetchPokemonMovesLevelUp(idOrName, limit),
        staleTime: 1000 * 60 * 30, // 30m
    });
}
