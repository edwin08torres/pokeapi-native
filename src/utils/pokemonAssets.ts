export const getIdFromUrl = (url: string) =>
    Number(url.match(/\/pokemon\/(\d+)\/?$/)?.[1] ?? 0);

export const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
