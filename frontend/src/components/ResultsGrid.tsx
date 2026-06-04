import React, { useEffect, useState, KeyboardEvent } from 'react';
import { listPokemonNames, getPokemon } from '../lib/api';
import PokemonCard from './PokemonCard';
import { useQueryClient } from '@tanstack/react-query';

type GridEntry = { id: number | null; name: string; sprite?: string | null };

export default function ResultsGrid({ onOpen }: { onOpen: (idOrName: string) => void }) {
  const [entries, setEntries] = useState<GridEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listPokemonNames().then((res) => {
      if (!mounted) return;
      const items = res.map((r: any) => {
        const match = /\/pokemon\/(\d+)\/?$/.exec(r.url);
        const id = match ? Number(match[1]) : null;
        const sprite = id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` : null;
        return { id, name: r.name, sprite } as GridEntry;
      });
      setEntries(items);
      setLoading(false);
    }).catch(() => { setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Prefetch sprites for the first items of the current page
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    const start = (page - 1) * pageSize;
    const toPrefetch = entries.slice(start, start + Math.min(12, pageSize));
    toPrefetch.forEach((e) => {
      if (e.sprite) {
        const img = new Image();
        img.src = e.sprite;
        imgs.push(img);
      }
    });
    return () => { imgs.forEach((i) => { i.src = ''; }); };
  }, [entries, page]);

  // Prefetch detailed responses for visible items (cache-first behavior)
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const visible = entries.slice(start, start + pageSize);
    visible.slice(0, 3).forEach((e) => {
      if (e.id != null) {
        queryClient.prefetchQuery(['pokemon', e.id], () => getPokemon(e.id));
      }
    });
  }, [entries, page, queryClient]);

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

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageEntries = entries.slice(start, start + pageSize);

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }
  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function onPagerKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') prevPage();
    else if (e.key === 'ArrowRight') nextPage();
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pageEntries.map((e) => (
          <div key={e.name} onMouseEnter={() => { if (e.id != null) queryClient.prefetchQuery(['pokemon', e.id], () => getPokemon(e.id)); }}>
            <PokemonCard id={e.id ?? undefined} name={e.name} sprite={e.sprite} onOpen={onOpen} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between" role="navigation" aria-label="Pagination">
        <button className="px-3 py-2 border rounded" onClick={prevPage} aria-label="Previous page">Previous</button>
        <div className="text-sm" tabIndex={0} onKeyDown={onPagerKey} aria-live="polite" aria-atomic="true">Page {page} of {totalPages}</div>
        <button className="px-3 py-2 border rounded" onClick={nextPage} aria-label="Next page">Next</button>
      </div>
    </div>
  );
}
