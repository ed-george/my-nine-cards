import type { CardSetSummary, SearchFilters } from '../types/card';

const BASE_URL = 'https://api.tcgdex.net/v2/en';

// Fallback card back image URL
export const CARD_BACK_IMAGE = 'https://assets.tcgdex.net/en/swsh/swsh1/1/high.webp';

export interface RawPokemonCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  set?: CardSetSummary;
  types?: string[];
  category?: string;
  illustrator?: string;
  hp?: number;
  dexId?: number[];
  stage?: string;
}

/**
 * Sanitizes user search input to prevent query injection or parameter tampering
 */
export function sanitizeSearchQuery(input: string): string {
  if (!input) return '';
  // 1. Strip out URL control characters, filter prefixes, and injection characters
  let clean = input.replace(/[?&#=:|\\/<>%"'`;{}()]/g, '');
  // 2. Collapse multiple spaces and trim
  clean = clean.replace(/\s+/g, ' ').trim();
  // 3. Limit max search length to 50 characters
  return clean.slice(0, 50);
}

/**
 * Gets formatted image URL for a TCGdex card asset
 */
export function getCardImageUrl(
  cardOrImage?: RawPokemonCard | string | null,
  quality: 'high' | 'low' = 'high',
  extension: 'webp' | 'png' | 'jpg' = 'webp'
): string {
  if (!cardOrImage) return '';
  const rawUrl = typeof cardOrImage === 'string' ? cardOrImage : cardOrImage.image;
  if (!rawUrl) return '';

  if (rawUrl.match(/\/(high|low)\.(webp|png|jpg)$/i)) {
    return rawUrl;
  }

  const cleanUrl = rawUrl.replace(/\/+$/, '');
  return `${cleanUrl}/${quality}.${extension}`;
}

// In-memory cache for API responses
const apiCache = new Map<string, RawPokemonCard[]>();

export interface RawSearchResults {
  rawCards: RawPokemonCard[];
  page: number;
  itemsPerPage: number;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Fetches all matching cards for a query from TCGdex and returns sanitized, image-verified cards.
 * Returns exact total count and sliced pages for 100% mathematical precision.
 */
export async function searchCards(filters: SearchFilters): Promise<RawSearchResults> {
  const page = Math.max(1, filters.page || 1);
  const itemsPerPage = Math.max(12, Math.min(60, filters.itemsPerPage || 24));
  
  // Sanitize user search input
  const cleanQuery = sanitizeSearchQuery(filters.query);

  const queryKey = JSON.stringify({
    q: cleanQuery,
    type: filters.type,
    rarity: filters.rarity,
    setId: filters.setId,
  });

  let allMatchingCards: RawPokemonCard[] = [];

  if (apiCache.has(queryKey)) {
    allMatchingCards = apiCache.get(queryKey)!;
  } else {
    try {
      let url = `${BASE_URL}/cards`;
      const params = new URLSearchParams();

      if (cleanQuery) {
        params.append('name', cleanQuery);
      }

      url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const rawCards: RawPokemonCard[] = await response.json();

      // Filter out cards without valid image URLs
      allMatchingCards = rawCards.filter((card) => Boolean(card.image));

      // Apply local filters for set, rarity, or type if selected
      if (filters.setId) {
        allMatchingCards = allMatchingCards.filter((card) => card.set?.id === filters.setId);
      }

      if (filters.rarity) {
        allMatchingCards = allMatchingCards.filter(
          (card) => card.rarity?.toLowerCase() === filters.rarity?.toLowerCase()
        );
      }

      apiCache.set(queryKey, allMatchingCards);
    } catch (error) {
      console.error('Failed to search TCGdex cards:', error);
      return { rawCards: [], page: 1, itemsPerPage, hasMore: false, totalCount: 0 };
    }
  }

  // Calculate exact pagination slices
  const totalCount = allMatchingCards.length;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const slicedCards = allMatchingCards.slice(startIndex, endIndex);
  const hasMore = endIndex < totalCount;

  return {
    rawCards: slicedCards,
    page,
    itemsPerPage,
    hasMore,
    totalCount,
  };
}

/**
 * Fetches card detail by ID
 */
export async function getCardById(cardId: string): Promise<RawPokemonCard | null> {
  const cleanId = sanitizeSearchQuery(cardId);
  if (!cleanId) return null;

  const cacheKey = `card_${cleanId}`;
  if (apiCache.has(cacheKey)) {
    return (apiCache.get(cacheKey) as any)[0] || null;
  }

  try {
    const response = await fetch(`${BASE_URL}/cards/${encodeURIComponent(cleanId)}`);
    if (!response.ok) return null;
    const data: RawPokemonCard = await response.json();
    apiCache.set(cacheKey, [data]);
    return data;
  } catch (error) {
    console.error(`Failed to fetch card ${cleanId}:`, error);
    return null;
  }
}

/**
 * Fetches all available Pokémon card sets
 */
export async function getCardSets(): Promise<CardSetSummary[]> {
  const cacheKey = 'sets_list';
  if (apiCache.has(cacheKey)) {
    return (apiCache.get(cacheKey) as any);
  }

  try {
    const response = await fetch(`${BASE_URL}/sets`);
    if (!response.ok) return [];
    const sets: CardSetSummary[] = await response.json();
    apiCache.set(cacheKey, sets as any);
    return sets;
  } catch (error) {
    console.error('Failed to fetch card sets:', error);
    return [];
  }
}
