import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../src/App';
import { vi, describe, it, expect, afterEach } from 'vitest';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockList = {
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
  ],
};

const mockDetail1 = {
  id: 1,
  name: 'bulbasaur',
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    other: { 'official-artwork': { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' } },
  },
  types: [{ slot: 1, type: { name: 'grass' } }],
  stats: [
    { stat: { name: 'hp' }, base_stat: 45 },
    { stat: { name: 'attack' }, base_stat: 49 },
    { stat: { name: 'defense' }, base_stat: 49 },
    { stat: { name: 'special-attack' }, base_stat: 65 },
    { stat: { name: 'special-defense' }, base_stat: 65 },
    { stat: { name: 'speed' }, base_stat: 45 },
  ],
};

const mockDetail2 = {
  id: 2,
  name: 'ivysaur',
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
    other: { 'official-artwork': { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png' } },
  },
  types: [{ slot: 1, type: { name: 'grass' } }],
  stats: [
    { stat: { name: 'hp' }, base_stat: 60 },
    { stat: { name: 'attack' }, base_stat: 62 },
    { stat: { name: 'defense' }, base_stat: 63 },
    { stat: { name: 'special-attack' }, base_stat: 80 },
    { stat: { name: 'special-defense' }, base_stat: 80 },
    { stat: { name: 'speed' }, base_stat: 60 },
  ],
};

vi.stubGlobal('fetch', async (input: RequestInfo) => {
  const url = String(input)
  if (url.includes('/pokemon?')) {
    return new Response(JSON.stringify(mockList), { status: 200 })
  }
  if (
    url.endsWith('/pokemon/1') ||
    url.endsWith('/pokemon/1/') ||
    url.endsWith('/pokemon/bulbasaur') ||
    url.endsWith('/pokemon/bulbasaur/')
  ) {
    return new Response(JSON.stringify(mockDetail1), { status: 200 })
  }
  if (
    url.endsWith('/pokemon/2') ||
    url.endsWith('/pokemon/2/') ||
    url.endsWith('/pokemon/ivysaur') ||
    url.endsWith('/pokemon/ivysaur/')
  ) {
    return new Response(JSON.stringify(mockDetail2), { status: 200 })
  }
  return new Response('{}', { status: 404 })
})

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('Team management flow', () => {
  test('add two pokemon, remove one, totals update and persist', async () => {
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/Search by name/i);

    // --- Add bulbasaur ---
    await userEvent.type(input, 'bulb');
    const listbox = await screen.findByRole('listbox');
    const bulbasaurOption = within(listbox).getByRole('option', { name: 'bulbasaur' });
    await userEvent.click(bulbasaurOption);
    await waitFor(() => expect(screen.getByText(/Base Stats/i)).toBeInTheDocument());
    await userEvent.click(screen.getByText(/Add to Team/i));

    // --- Add ivysaur (clear input first) ---
    await userEvent.clear(input);
    await userEvent.type(input, 'ivy');
    const listbox2 = await screen.findByRole('listbox');
    const ivysaurOption = within(listbox2).getByRole('option', { name: 'ivysaur' });
    await userEvent.click(ivysaurOption);
    await waitFor(() => expect(screen.getByText(/Base Stats/i)).toBeInTheDocument());
    await userEvent.click(screen.getByText(/Add to Team/i));

    // --- Scope all team checks to the team panel container ---
    const teamPanel = screen.getByRole('heading', { name: 'Team' }).closest('.border.rounded.p-4')!;
    expect(within(teamPanel).getByText('bulbasaur')).toBeInTheDocument();
    expect(within(teamPanel).getByText('ivysaur')).toBeInTheDocument();

    // Totals: HP sum (45 + 60 = 105)
    const hpRow = within(teamPanel).getByText('HP').closest('.py-1')!;
    expect(within(hpRow).getByText('105')).toBeInTheDocument();

    // --- Remove bulbasaur ---
    const bulbasaurTeamRow = within(teamPanel).getByText('bulbasaur').closest('.flex.items-center.gap-3')!;
    const removeButton = within(bulbasaurTeamRow).getByRole('button', { name: 'Remove' });
    await userEvent.click(removeButton);

    // --- Verify bulbasaur gone and ivysaur remains ---
    await waitFor(() => {
      expect(within(teamPanel).queryByText('bulbasaur')).not.toBeInTheDocument();
    });
    expect(within(teamPanel).getByText('ivysaur')).toBeInTheDocument();

    // Totals update: only ivysaur HP (60)
    const hpRowAfterRemove = within(teamPanel).getByText('HP').closest('.py-1')!;
    expect(within(hpRowAfterRemove).getByText('60')).toBeInTheDocument();

    // --- Persistence: unmount and re‑render with a fresh QueryClient ---
    unmount();
    const reloadedClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={reloadedClient}>
        <App />
      </QueryClientProvider>
    );

    const teamPanelReload = screen.getByRole('heading', { name: 'Team' }).closest('.border.rounded.p-4')!;
    await waitFor(() => {
      expect(within(teamPanelReload).getByText('ivysaur')).toBeInTheDocument();
    });
  });
});