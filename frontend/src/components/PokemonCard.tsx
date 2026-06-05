import React, { KeyboardEvent } from 'react';

const FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23e2e8f0" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10">No Image</text></svg>';

export default function PokemonCard({ id, name, sprite, onOpen }: { id?: number; name: string; sprite?: string | null; onOpen: (idOrName: string) => void }) {
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(id ?? name);
    }
  }

  return (
    <div className="card-single border rounded p-3 flex items-center gap-3" tabIndex={0} role="button" aria-label={`Open details for ${name}`} onKeyDown={onKey}>
      <img
        src={sprite || FALLBACK_SVG}
        alt={name}
        className="w-16 h-16 object-contain"
        onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = FALLBACK_SVG; }}
      />
      <div className="flex-1">
        <div className="font-medium">{name}</div>
      </div>
      <button className="ml-2 px-3 py-1 border rounded" onClick={() => onOpen(id ?? name)}>Details</button>
    </div>
  );
}
