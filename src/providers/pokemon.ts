import type { TCGProvider } from './types';
import type { TCGCard, SearchFilters, SearchResults } from '../types/card';
import { searchCards as searchTcgdexCards, getCardImageUrl, getCardById } from '../services/tcgdexApi';

export function mapPokemonCardToTCGCard(raw: any): TCGCard {
  if ('tcgId' in raw && raw.tcgId === 'pokemon') {
    return raw as TCGCard;
  }

  const highUrl = getCardImageUrl(raw, 'high', 'webp');
  const jpgUrl = getCardImageUrl(raw, 'high', 'jpg');

  return {
    id: raw.id ? (raw.id.startsWith('pokemon:') ? raw.id : `pokemon:${raw.id}`) : `pokemon:${Math.random()}`,
    tcgId: 'pokemon',
    rawId: raw.id || '',
    name: raw.name || 'Unknown Card',
    imageUrl: highUrl,
    fallbackImageUrl: jpgUrl,
    setName: raw.set?.name,
    setLogo: raw.set?.logo,
    rarity: raw.rarity,
    types: raw.types,
    details: {
      hp: raw.hp,
      stage: raw.stage,
      category: raw.category,
      illustrator: raw.illustrator,
    },
  };
}

export const pokemonProvider: TCGProvider = {
  id: 'pokemon',
  name: 'Pokémon TCG',
  shortName: 'Pokémon',
  brandColor: '#ef4444',
  attribution: 'Powered by TCGdex',
  attributionUrl: 'https://tcgdex.dev/',
  popularSearches: [
    'Garbodor',
    'Gardevoir',
    'Rayquaza',
    'Lugia',
    'Lucario',
    'Mew',
    'Mewtwo',
    'Snorlax',
    'Zoroark',
  ],

  async searchCards(filters: SearchFilters): Promise<SearchResults> {
    const rawRes = await searchTcgdexCards(filters);
    return {
      cards: rawRes.rawCards.map((c) => mapPokemonCardToTCGCard(c)),
      page: rawRes.page,
      itemsPerPage: rawRes.itemsPerPage,
      hasMore: rawRes.hasMore,
      totalCount: rawRes.totalCount,
    };
  },

  async getCardById(id: string): Promise<TCGCard | null> {
    const cleanId = id.replace(/^pokemon:/, '');
    const raw = await getCardById(cleanId);
    return raw ? mapPokemonCardToTCGCard(raw) : null;
  },

  getCardImageUrl(card: TCGCard, quality: 'high' | 'low' = 'high'): string {
    return card.imageUrl || getCardImageUrl(card.rawId, quality, 'webp');
  },
};
