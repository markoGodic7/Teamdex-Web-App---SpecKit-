import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../../src/App'
import { vi } from 'vitest'
import { describe, it, expect, beforeAll, afterEach } from 'vitest';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const mockList = {
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' }
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

// Mock fetch
vi.stubGlobal('fetch', async (input: RequestInfo) => {
  const url = String(input)
  if (url.includes('/pokemon?')) {
    return new Response(JSON.stringify(mockList), { status: 200 })
  }
  if (url.endsWith('/pokemon/1') || url.endsWith('/pokemon/1/')) {
    return new Response(JSON.stringify(mockDetail), { status: 200 })
  }
  return new Response('{}', { status: 404 })
})

describe('Search -> Detail -> Add to Team flow', () => {
  test('searches, opens detail, adds to team and persists', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )

    const input = screen.getByPlaceholderText(/Search by name/i)
    await userEvent.type(input, 'bulb')

    // Wait for the bulbasaur card’s image
    const bulbasaurImg = await screen.findByRole('img', { name: 'bulbasaur' });

    // The card container is the image’s direct parent <div>
    const card = bulbasaurImg.parentElement!;

    // Get the "Details" button inside that card
    const detailsButton = within(card).getByRole('button', { name: 'Details' });

    await userEvent.click(detailsButton);
    // detail drawer should open
    await waitFor(() => expect(screen.getByText(/Base Stats/i)).toBeInTheDocument())

    // click Add to Team
    const addButton = screen.getByText(/Add to Team/i)
    await userEvent.click(addButton)

    // Team panel should show bulbasaur
    await waitFor(() => expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument())

    // Check totals reflect HP
    await waitFor(() => expect(screen.getByText('HP')).toBeInTheDocument())
    expect(screen.getByText('45')).toBeInTheDocument()

    // Simulate reload by re-rendering component (localStorage should persist)
    // Clear DOM and render again
    queryClient.clear()
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )

    // Team member should persist
    await waitFor(() => expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument())
  })
})
