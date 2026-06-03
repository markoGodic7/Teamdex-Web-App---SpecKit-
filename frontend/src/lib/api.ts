export async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export type NameIndexEntry = { name: string; url: string };

export async function listPokemonNames(): Promise<NameIndexEntry[]> {
  const data = await fetchJSON('https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0');
  return data.results as NameIndexEntry[];
}

export async function getPokemon(idOrName: string | number): Promise<any> {
  return fetchJSON(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
}
