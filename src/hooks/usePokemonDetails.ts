import { useQuery } from '@tanstack/react-query';
import { fetchPokemonDetails, PokemonDetails } from '../api/pokeapi';

export function usePokemonDetails(name: string) {
  return useQuery<PokemonDetails>({
    queryKey: ['pokemon', name],
    queryFn: () => fetchPokemonDetails(name),
    enabled: !!name,
    staleTime: 1000 * 60 * 10,
  });
}
