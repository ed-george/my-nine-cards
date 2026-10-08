import type { TCGCard, TCGProviderId, SearchFilters, SearchResults } from '../types/card';

export interface TCGProviderInfo {
  id: TCGProviderId;
  name: string;
  shortName: string;
  brandColor: string;
  attribution: string;
  attributionUrl: string;
  popularSearches: string[];
}

export interface TCGProvider extends TCGProviderInfo {
  searchCards: (filters: SearchFilters) => Promise<SearchResults>;
  getCardById?: (id: string) => Promise<TCGCard | null>;
  getCardImageUrl?: (card: TCGCard, quality?: 'high' | 'low') => string;
}
