import type { TCGProvider } from './types';
import type { TCGCard, SearchFilters, SearchResults } from '../types/card';
import { searchScryfallCards } from '../services/scryfallApi';

export const mtgProvider: TCGProvider = {
  id: 'mtg',
  name: 'Magic: The Gathering',
  shortName: 'MTG',
  brandColor: '#f59e0b',
  attribution: 'Powered by Scryfall',
  attributionUrl: 'https://scryfall.com/',
  popularSearches: [
    'Black Lotus',
    'Sol Ring',
    'Lightning Bolt',
    'Counterspell',
    'Nicol Bolas',
    'Jace, the Mind Sculptor',
    'Ragavan, Nimble Pilferer',
    'Atraxa',
    'Urza',
  ],

  async searchCards(filters: SearchFilters): Promise<SearchResults> {
    return searchScryfallCards(filters);
  },

  getCardImageUrl(card: TCGCard): string {
    return card.imageUrl;
  },
};
