import type { TCGCard, SearchFilters, SearchResults } from '../types/card';
import { sanitizeSearchQuery } from './tcgdexApi';

const SCRYFALL_BASE_URL = 'https://api.scryfall.com';

const scryfallCache = new Map<string, SearchResults>();

export async function searchScryfallCards(filters: SearchFilters): Promise<SearchResults> {
  const page = Math.max(1, filters.page || 1);
  const itemsPerPage = Math.max(12, Math.min(60, filters.itemsPerPage || 24));
  const cleanQuery = sanitizeSearchQuery(filters.query);

  if (!cleanQuery) {
    return { cards: [], page: 1, itemsPerPage, hasMore: false, totalCount: 0 };
  }

  const cacheKey = `mtg_${cleanQuery}_${page}`;
  if (scryfallCache.has(cacheKey)) {
    return scryfallCache.get(cacheKey)!;
  }

  try {
    const url = `${SCRYFALL_BASE_URL}/cards/search?q=${encodeURIComponent(cleanQuery)}+lang:any&include_variations=true&page=${page}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return { cards: [], page, itemsPerPage, hasMore: false, totalCount: 0 };
      }
      throw new Error(`Scryfall API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawCards: any[] = data.data || [];

    const cards: TCGCard[] = rawCards
      .filter((c) => Boolean(c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.normal))
      .map((c) => {
        const imageUris = c.image_uris || c.card_faces?.[0]?.image_uris || {};
        const highResImage = imageUris.large || imageUris.png || imageUris.normal || '';
        const lowResImage = imageUris.normal || imageUris.small || highResImage;

        return {
          id: `mtg:${c.id}`,
          tcgId: 'mtg',
          rawId: c.id,
          name: c.name,
          imageUrl: highResImage,
          fallbackImageUrl: lowResImage,
          setName: c.set_name,
          rarity: c.rarity ? c.rarity.charAt(0).toUpperCase() + c.rarity.slice(1) : undefined,
          types: c.type_line ? c.type_line.split('—')[0].trim().split(' ') : [],
          details: {
            manaCost: c.mana_cost,
            typeLine: c.type_line,
            artist: c.artist,
          },
        };
      });

    const result: SearchResults = {
      cards,
      page,
      itemsPerPage,
      hasMore: data.has_more || false,
      totalCount: data.total_cards || cards.length,
    };

    scryfallCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Failed to search MTG cards from Scryfall:', error);
    return { cards: [], page: 1, itemsPerPage, hasMore: false, totalCount: 0 };
  }
}
