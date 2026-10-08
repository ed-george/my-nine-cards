export type TCGProviderId = 'pokemon' | 'mtg' | 'yugioh' | 'lorcana' | string;

export interface CardSetSummary {
  id: string;
  name: string;
  logo?: string;
  cardCount?: {
    official?: number;
    total?: number;
  };
}

/**
 * Unified Card Interface representing a trading card from any TCG
 */
export interface TCGCard {
  id: string;
  tcgId: TCGProviderId;
  rawId: string;
  name: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  setName?: string;
  setLogo?: string;
  rarity?: string;
  types?: string[];
  details?: {
    hp?: number | string;
    stage?: string;
    manaCost?: string;
    typeLine?: string;
    artist?: string;
    [key: string]: any;
  };
}

export interface GridSlot {
  index: number;
  card: TCGCard | null;
}

export type ThemeId =
  | 'base-set-holo'
  | 'secret-rare'
  | 'delta-metal'
  | 'fire-gx'
  | 'water-vmax'
  | 'tag-team-gold'
  | 'psychic-ex'
  | 'tera-crystal';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  previewBg: string;
  bgGradient: string;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  badgeBg: string;
}

export interface CustomizationSettings {
  title: string;
  subtitle: string;
  themeId: ThemeId;
  showCardNames: boolean;
  cardGap: number;
  borderRadius: number;
  activeProviderId?: TCGProviderId;
}

export interface SearchFilters {
  query: string;
  tcgId?: TCGProviderId;
  type?: string;
  rarity?: string;
  setId?: string;
  page?: number;
  itemsPerPage?: number;
}

export interface SearchResults {
  cards: TCGCard[];
  page: number;
  itemsPerPage: number;
  hasMore: boolean;
  totalCount: number;
}
