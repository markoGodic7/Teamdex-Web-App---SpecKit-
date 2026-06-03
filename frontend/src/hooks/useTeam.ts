import { useCallback, useEffect, useMemo, useState } from 'react';

export type StatTotals = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type TeamMember = {
  id: number;
  name: string;
  sprites?: any;
  types?: Array<{ slot: number; type: { name: string } }>;
  stats?: Array<{ stat: { name: string }; base_stat: number }>;
};

const STORAGE_KEY = 'teamdex.team';
const MAX_TEAM = 6;

function computeTotals(members: TeamMember[]): StatTotals {
  const initial: StatTotals = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  for (const m of members) {
    if (!m.stats) continue;
    for (const s of m.stats) {
      const name = s.stat.name;
      const v = s.base_stat || 0;
      switch (name) {
        case 'hp':
          initial.hp += v;
          break;
        case 'attack':
          initial.attack += v;
          break;
        case 'defense':
          initial.defense += v;
          break;
        case 'special-attack':
          initial.specialAttack += v;
          break;
        case 'special-defense':
          initial.specialDefense += v;
          break;
        case 'speed':
          initial.speed += v;
          break;
      }
    }
  }
  return initial;
}

function loadFromStorage(): TeamMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TeamMember[]) : [];
  } catch (e) {
    console.warn('loadFromStorage failed', e);
    return [];
  }
}

function saveToStorage(members: TeamMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.warn('saveToStorage failed', e);
  }
}

// Module-level store so multiple hook consumers stay in sync
let storeMembers: TeamMember[] = loadFromStorage();
const listeners = new Set<(members: TeamMember[]) => void>();

function notifyStore() {
  try {
    saveToStorage(storeMembers);
  } catch (e) {
    // ignore
  }
  listeners.forEach((fn) => {
    try { fn(storeMembers); } catch (e) { /* ignore listener errors */ }
  });
}

function storeAdd(member: TeamMember) {
  if (storeMembers.find((m) => m.id === member.id)) {
    return { success: false, reason: 'duplicate' } as const;
  }
  if (storeMembers.length >= MAX_TEAM) {
    return { success: false, reason: 'full' } as const;
  }
  storeMembers = [...storeMembers, member];
  notifyStore();
  return { success: true } as const;
}

function storeRemove(id: number) {
  storeMembers = storeMembers.filter((m) => m.id !== id);
  notifyStore();
}

function storeClear() {
  storeMembers = [];
  notifyStore();
}

function storeContains(id: number) {
  return storeMembers.some((m) => m.id === id);
}

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>(storeMembers);

  useEffect(() => {
    const onChange = (m: TeamMember[]) => setMembers(m);
    listeners.add(onChange);
    // ensure initial sync
    setMembers(storeMembers);
    return () => { listeners.delete(onChange); };
  }, []);

  const totals = useMemo(() => computeTotals(members), [members]);

  const add = useCallback((member: TeamMember) => storeAdd(member), []);
  const remove = useCallback((id: number) => storeRemove(id), []);
  const clear = useCallback(() => storeClear(), []);
  const contains = useCallback((id: number) => storeContains(id), [members]);

  return { members, totals, add, remove, clear, contains };
}
