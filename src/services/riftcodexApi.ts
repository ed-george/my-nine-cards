import type { TCGCard, SearchFilters, SearchResults } from '../types/card';
import { sanitizeSearchQuery } from './tcgdexApi';

const RIFTCODEX_BASE_URL = 'https://api.riftcodex.com';

const riftcodexCache = new Map<string, SearchResults>();

export interface RiftcodexCard {
  id: string;
  name: string;
  riftbound_id: string;
  tcgplayer_id?: string | null;
  collector_number: number;
  attributes?: {
    energy?: number | null;
    might?: number | null;
    power?: number | null;
  };
  classification?: {
    type?: string;
    supertype?: string | null;
    rarity?: string;
    domain?: string[];
  };
  set?: {
    set_id?: string;
    label?: string;
  };
  media?: {
    image_url?: string;
    artist?: string;
    accessibility_text?: string;
  };
  orientation?: 'portrait' | 'landscape' | string;
}

export interface RiftcodexResponse {
  items: RiftcodexCard[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export function mapRiftboundCardToTCGCard(raw: RiftcodexCard): TCGCard {
  const cardId = raw.riftbound_id || raw.id;
  return {
    id: `riftbound:${cardId}`,
    tcgId: 'riftbound',
    rawId: cardId,
    name: raw.name,
    imageUrl: raw.media?.image_url || '',
    fallbackImageUrl: raw.media?.image_url || '',
    setName: raw.set?.label,
    rarity: raw.classification?.rarity
      ? raw.classification.rarity.charAt(0).toUpperCase() + raw.classification.rarity.slice(1)
      : undefined,
    orientation: raw.orientation === 'landscape' ? 'landscape' : 'portrait',
  };
}

export async function searchRiftcodexCards(filters: SearchFilters): Promise<SearchResults> {
  const page = Math.max(1, filters.page || 1);
  const itemsPerPage = Math.max(12, Math.min(60, filters.itemsPerPage || 24));
  const cleanQuery = sanitizeSearchQuery(filters.query);

  if (!cleanQuery) {
    return { cards: [], page: 1, itemsPerPage, hasMore: false, totalCount: 0 };
  }

  const cacheKey = `rb_${cleanQuery}_${page}_${itemsPerPage}`;
  if (riftcodexCache.has(cacheKey)) {
    return riftcodexCache.get(cacheKey)!;
  }

  try {
    const url = `${RIFTCODEX_BASE_URL}/cards/name?fuzzy=${encodeURIComponent(cleanQuery)}&dir=1&size=${itemsPerPage}&page=${page}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return { cards: [], page, itemsPerPage, hasMore: false, totalCount: 0 };
      }
      throw new Error(`Riftcodex API Error: ${response.statusText}`);
    }

    const data: RiftcodexResponse = await response.json();
    const rawCards: RiftcodexCard[] = data.items || [];

    const cards: TCGCard[] = rawCards
      .filter((c) => Boolean(c.media?.image_url))
      .map(mapRiftboundCardToTCGCard);

    const hasMore = data.page && data.pages ? data.page < data.pages : cards.length === itemsPerPage;

    const result: SearchResults = {
      cards,
      page,
      itemsPerPage,
      hasMore,
      totalCount: data.total ?? cards.length,
    };

    riftcodexCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed to search Riftbound cards from Riftcodex:', error);
    return { cards: [], page: 1, itemsPerPage, hasMore: false, totalCount: 0 };
  }
}

export async function getRiftboundCardById(id: string): Promise<TCGCard | null> {
  const cleanId = id.replace(/^riftbound:/, '');
  try {
    const url = `${RIFTCODEX_BASE_URL}/cards/riftbound/${encodeURIComponent(cleanId)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const cards: RiftcodexCard[] = await response.json();
    if (Array.isArray(cards) && cards.length > 0) {
      return mapRiftboundCardToTCGCard(cards[0]);
    }
    return null;
  } catch (error) {
    console.error('Failed to get Riftbound card by id:', error);
    return null;
  }
}