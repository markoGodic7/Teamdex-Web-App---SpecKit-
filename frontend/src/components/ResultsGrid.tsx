import React, { useEffect, useState } from 'react';
import { listPokemonNames } from '../lib/api';
import PokemonCard from './PokemonCard';

type GridEntry = { name: string; sprite?: string | null };

export default function ResultsGrid({ onOpen }: { onOpen: (idOrName: string) => void }) {
  const [entries, setEntries] = useState<GridEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listPokemonNames().then((res) => {
      if (!mounted) return;
      // derive ID from the URL (ends with /pokemon/{id}/)
      const items = res.map((r: any) => {
        const match = /\/pokemon\/(\d+)\/?$/.exec(r.url);
        const id = match ? match[1] : null;
        const sprite = id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` : null;
        return { name: r.name, sprite } as GridEntry;
      }).slice(0, 40);
      setEntries(items);
      setLoading(false);
    }).catch(() => { setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Prefetch a small number of sprite images to warm the cache and improve perceived performance
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    const toPrefetch = entries.slice(0, 12);
    toPrefetch.forEach((e) => {
      if (e.sprite) {
        const img = new Image();
        img.src = e.sprite;
        imgs.push(img);
      }
    });
    return () => {
      imgs.forEach((i) => { i.src = ''; });
    };
  }, [entries]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded p-3 flex items-center gap-3 animate-pulse">
            <div className="w-16 h-16 bg-slate-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
            <div className="w-20 h-8 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {entries.map((e) => (
        <PokemonCard key={e.name} name={e.name} sprite={e.sprite} onOpen={onOpen} />
      ))}
    </div>
  );
}
