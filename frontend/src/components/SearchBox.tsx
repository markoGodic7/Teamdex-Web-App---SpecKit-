import React, { useEffect, useState, KeyboardEvent } from 'react';
import { listPokemonNames } from '../lib/api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

export default function SearchBox({ onSelect }: { onSelect: (idOrName: string) => void }) {
  const [names, setNames] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let mounted = true;
    listPokemonNames().then((res) => {
      if (!mounted) return;
      setNames(res.map((r: any) => r.name));
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!debounced) return setSuggestions([]);
    const s = names.filter((n) => n.toLowerCase().includes(debounced.toLowerCase())).slice(0, 8);
    setSuggestions(s);
    setActive(0);
  }, [debounced, names]);

  function choose(name: string) {
    setQuery('');
    setSuggestions([]);
    onSelect(name);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(suggestions[active]);
    }
  }

  return (
    <div className="mb-4">
      <label className="sr-only">Search Pokémon</label>
      <input
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
        placeholder="Search by name or id..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKey}
        aria-autocomplete="list"
      />
      {suggestions.length > 0 && (
        <ul className="bg-white border mt-1 rounded shadow max-h-56 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={s}
              className={`px-3 py-2 cursor-pointer ${i === active ? 'bg-slate-100' : ''}`}
              onClick={() => choose(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
