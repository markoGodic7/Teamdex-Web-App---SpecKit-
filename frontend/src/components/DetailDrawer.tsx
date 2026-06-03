import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPokemon } from '../lib/api';
import { useTeam } from '../hooks/useTeam';

export default function DetailDrawer({ idOrName, onClose }: { idOrName: string | number | null; onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!idOrName) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [idOrName, onClose]);
  const { data, isLoading, error } = useQuery(['pokemon', idOrName], () => getPokemon(idOrName as any), {
    enabled: !!idOrName,
  });

  const team = useTeam();

  if (!idOrName) return null;

  return (
    <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1} className="fixed right-0 top-0 h-full w-full md:w-1/3 bg-white border-l p-4 shadow-lg z-50">
      <button onClick={onClose} className="mb-4">Close</button>
      {isLoading && (
        <div>
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-32 h-32 bg-slate-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
      )}
      {error && <div role="alert">Error loading Pokémon</div>}
      {data && (
        <div>
          <div className="flex items-center gap-4">
            <img
              src={data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><rect fill="%23e2e8f0" width="150" height="150"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14">No Image</text></svg>'}
              alt={data.name}
              className="w-32 h-32 object-contain"
              onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><rect fill="%23e2e8f0" width="150" height="150"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14">No Image</text></svg>'; }}
            />
            <div>
              <h2 className="text-xl font-semibold">{data.name} (#{data.id})</h2>
              <div className="mt-2">{data.types.map((t: any) => <span key={t.slot} className="inline-block mr-2 px-2 py-1 bg-slate-100 rounded">{t.type.name}</span>)}</div>
            </div>
          </div>
          <h3 className="mt-4 font-medium">Base Stats</h3>
          <ul>
            {data.stats.map((s: any) => (
              <li key={s.stat.name} className="flex justify-between py-1">
                <span className="capitalize">{s.stat.name.replace('-', ' ')}</span>
                <span>{s.base_stat}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            {team.contains(data.id) ? (
              <button className="px-3 py-2 border rounded" onClick={() => team.remove(data.id)}>Remove from Team</button>
            ) : (
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => {
                const res = team.add({ id: data.id, name: data.name, sprites: data.sprites, types: data.types, stats: data.stats });
                if (!res.success) {
                  if (res.reason === 'duplicate') alert('Already in team');
                  else if (res.reason === 'full') alert('Team is full (6)');
                }
              }}>Add to Team</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
