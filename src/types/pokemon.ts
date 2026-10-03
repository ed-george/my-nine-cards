export interface CardSetSummary {
  id: string;
  name: string;
  logo?: string;
  cardCount?: {
    official?: number;
    total?: number;
  };
}

export interface PokemonCard {
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

export interface GridSlot {
  index: number;
  card: PokemonCard | null;
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
  cardGap: number; // e.g., 12, 16, 20, 24
  borderRadius: number; // e.g., 8, 12, 16
}

export interface SearchFilters {
  query: string;
  type?: string;
  rarity?: string;
  setId?: string;
  page?: number;
  itemsPerPage?: number;
}

export interface SearchResults {
  cards: PokemonCard[];
  page: number;
  itemsPerPage: number;
  hasMore: boolean;
  totalCount: number;
}
