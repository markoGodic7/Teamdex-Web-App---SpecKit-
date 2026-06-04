import React from 'react';
import { useTeam } from '../hooks/useTeam';

import { useEffect, useRef, useState } from 'react';

// TeamPanel includes an aria-live region to announce additions/removals for screen reader users.
// It also listens for `team:announce` CustomEvents dispatched by other components to show messages.

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
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
  const prevRef = useRef<number[]>([]);
  const initializedRef = useRef(false);
  const [liveMessage, setLiveMessage] = useState<string>('');

  useEffect(() => {
    // Listen for external announcements (e.g., errors) dispatched by other components
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && typeof detail.message === 'string') setLiveMessage(detail.message);
    };
    window.addEventListener('team:announce', handler as EventListener);
    return () => window.removeEventListener('team:announce', handler as EventListener);
  }, []);

  useEffect(() => {
    const currIds = members.map((m) => m.id);
    if (!initializedRef.current) {
      prevRef.current = currIds;
      initializedRef.current = true;
      return;
    }
    const prevIds = prevRef.current;
    // detect additions
    const added = currIds.filter((id) => id != null && !prevIds.includes(id));
    const removed = prevIds.filter((id) => id != null && !currIds.includes(id));
    if (added.length > 0) {
      const addedNames = members.filter((m) => added.includes(m.id)).map((m) => m.name).join(', ');
      setLiveMessage(`Added to team: ${addedNames}`);
    } else if (removed.length > 0) {
      setLiveMessage(`Removed from team`);
    }
    prevRef.current = currIds;
  }, [members]);

  const FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23e2e8f0" width="48" height="48"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="8">No Image</text></svg>';

  // Compute dynamic max for team stat bars (highest stat among all totals, min 1 to avoid divide by zero)
  const maxTeamStat = Math.max(
    totals.hp,
    totals.attack,
    totals.defense,
    totals.specialAttack,
    totals.specialDefense,
    totals.speed,
    1
  );

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

        {/* aria-live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {liveMessage}
        </div>

      <div className="mt-4">
        <h3 className="font-medium">Totals</h3>
        <StatBar label="HP" value={totals.hp} max={maxTeamStat} />
        <StatBar label="Attack" value={totals.attack} max={maxTeamStat} />
        <StatBar label="Defense" value={totals.defense} max={maxTeamStat} />
        <StatBar label="Sp. Attack" value={totals.specialAttack} max={maxTeamStat} />
        <StatBar label="Sp. Defense" value={totals.specialDefense} max={maxTeamStat} />
        <StatBar label="Speed" value={totals.speed} max={maxTeamStat} />
      </div>
    </div>
  );
}