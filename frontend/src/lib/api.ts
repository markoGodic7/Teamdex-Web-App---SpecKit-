export async function fetchJSON(url: string, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export type NameIndexEntry = { name: string; url: string };

export async function listPokemonNames(): Promise<NameIndexEntry[]> {
  const data = await fetchJSON('https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0');
  return data.results as NameIndexEntry[];
}

export type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default?: string;
    other?: {
      'official-artwork'?: {
        front_default?: string;
      };
    };
  };
  types: Array<{ slot: number; type: { name: string } }>;
  stats: Array<{ stat: { name: string }; base_stat: number }>;
};


export async function getPokemon(idOrName: string | number): Promise<Pokemon>  {
  return fetchJSON(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
}
