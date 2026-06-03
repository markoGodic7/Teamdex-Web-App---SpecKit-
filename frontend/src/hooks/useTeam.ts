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
    return JSON.parse(raw) as TeamMember[];
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

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(members);
  }, [members]);

  const totals = useMemo(() => computeTotals(members), [members]);

  const add = useCallback((member: TeamMember) => {
    if (members.find((m) => m.id === member.id)) {
      return { success: false, reason: 'duplicate' } as const;
    }
    if (members.length >= MAX_TEAM) {
      return { success: false, reason: 'full' } as const;
    }
    setMembers((prev) => [...prev, member]);
    return { success: true } as const;
  }, [members]);

  const remove = useCallback((id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clear = useCallback(() => setMembers([]), []);

  const contains = useCallback((id: number) => members.some((m) => m.id === id), [members]);

  return { members, totals, add, remove, clear, contains };
}
