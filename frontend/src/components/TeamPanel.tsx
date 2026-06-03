import React from 'react';
import { useTeam } from '../hooks/useTeam';

function StatBar({ label, value, max = 600 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="py-1">
      <div className="flex justify-between text-sm"><span>{label}</span><span>{value}</span></div>
      <div className="w-full bg-slate-100 h-2 rounded mt-1">
        <div className="bg-blue-500 h-2 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TeamPanel() {
  const { members, totals, remove } = useTeam();

  const FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23e2e8f0" width="48" height="48"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="8">No Image</text></svg>';

  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-2">Team</h2>
      {members.length === 0 ? (
        <div className="text-sm text-slate-500">Your team is empty. Search or browse to add Pokémon.</div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <img
                src={m.sprites?.other?.['official-artwork']?.front_default || m.sprites?.front_default || FALLBACK_SVG}
                alt={m.name}
                className="w-12 h-12 object-contain"
                onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = FALLBACK_SVG; }}
              />
              <div className="flex-1">
                <div className="font-medium">{m.name}</div>
              </div>
              <button className="px-2 py-1 border rounded" onClick={() => remove(m.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-medium">Totals</h3>
        <StatBar label="HP" value={totals.hp} />
        <StatBar label="Attack" value={totals.attack} />
        <StatBar label="Defense" value={totals.defense} />
        <StatBar label="Sp. Attack" value={totals.specialAttack} />
        <StatBar label="Sp. Defense" value={totals.specialDefense} />
        <StatBar label="Speed" value={totals.speed} />
      </div>
    </div>
  );
}
