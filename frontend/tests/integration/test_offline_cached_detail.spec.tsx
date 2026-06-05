import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../../src/App'
import { expect, vi } from 'vitest'
import { describe, test, beforeEach, afterEach } from 'vitest';

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 1000 * 60 * 10, refetchOnWindowFocus: false } } });
});

const mockList = {
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
  ]
}

const mockDetail = {
  id: 1,
  name: 'bulbasaur',
  sprites: { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', other: { 'official-artwork': { front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' } } },
  types: [{ slot: 1, type: { name: 'grass' } }],
  stats: [
    { stat: { name: 'hp' }, base_stat: 45 },
    { stat: { name: 'attack' }, base_stat: 49 },
    { stat: { name: 'defense' }, base_stat: 49 },
    { stat: { name: 'special-attack' }, base_stat: 65 },
    { stat: { name: 'special-defense' }, base_stat: 65 },
    { stat: { name: 'speed' }, base_stat: 45 }
  ]
}

// Initial successful fetch, then simulate offline by stubbing failing responses
vi.stubGlobal('fetch', async (input: RequestInfo) => {
  const url = String(input)
  if (url.includes('/pokemon?')) {
    return new Response(JSON.stringify(mockList), { status: 200 })
  }
  if (url.endsWith('/pokemon/1') || url.endsWith('/pokemon/1/') || url.endsWith('/pokemon/bulbasaur') || url.endsWith('/pokemon/bulbasaur/')) {
    return new Response(JSON.stringify(mockDetail), { status: 200 })
  }
  return new Response('{}', { status: 404 })
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('Offline cached detail behavior', () => {
  test('shows cached detail when network goes offline', async () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )

    const input = screen.getByPlaceholderText(/Search by name/i)
    await userEvent.type(input, 'bulb')

    // Wait for bulbasaur card and open details to populate the React Query cache
    const bulbasaurImg = await screen.findByRole('img', { name: 'bulbasaur' });
    const card = bulbasaurImg.parentElement!;
    const detailsButton = within(card).getByRole('button', { name: 'Details' });
    await userEvent.click(detailsButton);
    await waitFor(() => expect(screen.getByText(/Base Stats/i)).toBeInTheDocument())

    // Now simulate offline: make fetch throw / fail
    vi.stubGlobal('fetch', async () => {
      return new Response('{}', { status: 503, statusText: 'Service Unavailable' })
    })

    // Close and re-open the detail drawer; cached data should still be rendered
    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    // Re-open the same card details
    await userEvent.click(detailsButton);

    // Expect cached content to appear even though network is failing
    await waitFor(() => expect(screen.getByText(/Base Stats/i)).toBeInTheDocument());
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: /bulbasaur/i })).toBeInTheDocument();

    // Scope HP value to its stat row to avoid matching the Speed value
    const hpLabel = screen.getByText('hp'); // the stat label
    const hpRow = hpLabel.closest('li')!;  // the <li> that contains HP label + value
    expect(within(hpRow).getByText('45')).toBeInTheDocument();
  })
})
