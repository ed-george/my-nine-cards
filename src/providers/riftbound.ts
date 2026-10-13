import type { TCGProvider } from './types';
import type { TCGCard, SearchFilters, SearchResults } from '../types/card';
import {
  searchRiftcodexCards,
  getRiftboundCardById,
  mapRiftboundCardToTCGCard,
} from '../services/riftcodexApi';

export const riftboundProvider: TCGProvider = {
  id: 'riftbound',
  name: 'Riftbound',
  shortName: 'RB',
  brandColor: '#ef7d00',
  attribution: 'Powered by Riftcodex',
  attributionUrl: 'https://riftcodex.com/',
  popularSearches: [
    'Rune',
    'Ahri',
    'Yasuo',
    'Jinx',
    'Viktor',
    'Teemo',
    'Darius',
    'Valley of Idols',
  ],

  async searchCards(filters: SearchFilters): Promise<SearchResults> {
    return searchRiftcodexCards(filters);
  },

  async getCardById(id: string): Promise<TCGCard | null> {
    return getRiftboundCardById(id);
  },

  getCardImageUrl(card: TCGCard): string {
    return card.imageUrl;
  },
};

export { mapRiftboundCardToTCGCard };
