import type { TCGProvider } from './types';
import type { TCGCard, SearchFilters, SearchResults } from '../types/card';
import { searchRiftcodexCards } from '../services/riftcodexApi';

export const riftboundProvider: TCGProvider = {
  id: 'riftbound',
  name: 'Riftbound',
  shortName: 'RB',
  brandColor: '#ef7d00',
  attribution: 'Powered by Riftcodex',
  attributionUrl: 'https://riftcodex.com/',
  popularSearches: [

  ],

  async searchCards(filters: SearchFilters): Promise<SearchResults> {
    return searchRiftcodexCards(filters);
  },

  getCardImageUrl(card: TCGCard): string {
    return card.imageUrl;
  },
};
