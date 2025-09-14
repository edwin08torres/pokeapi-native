import { useEffect, useState } from "react";
import { ensurePokemonIndex } from "../api/pokemonIndex";
import type { PokemonListItem } from "../api/pokeapi";

export function usePokemonIndex() {
    const [all, setAll] = useState<PokemonListItem[] | null>(null);

    useEffect(() => {
        let alive = true;
        ensurePokemonIndex().then((items) => {
            if (alive) setAll(items);
        });
        return () => {
            alive = false;
        };
    }, []);

    return all;
}
