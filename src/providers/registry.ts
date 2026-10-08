import type { TCGProvider } from './types';
import type { TCGCard, TCGProviderId, SearchFilters, SearchResults } from '../types/card';
import { pokemonProvider, mapPokemonCardToTCGCard } from './pokemon';
import { mtgProvider } from './mtg';

class TCGProviderRegistry {
  private providers = new Map<TCGProviderId, TCGProvider>();
  private defaultProviderId: TCGProviderId = 'pokemon';

  constructor() {
    // Register default providers
    this.register(pokemonProvider);
    this.register(mtgProvider);
  }

  /**
   * Registers a new TCG provider
   */
  public register(provider: TCGProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Gets a registered provider by ID (defaults to 'pokemon' if not found)
   */
  public get(id?: TCGProviderId): TCGProvider {
    if (id && this.providers.has(id)) {
      return this.providers.get(id)!;
    }
    return this.providers.get(this.defaultProviderId)!;
  }

  /**
   * Gets all registered TCG providers
   */
  public getAll(): TCGProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Sets the default provider
   */
  public setDefault(id: TCGProviderId): void {
    if (this.providers.has(id)) {
      this.defaultProviderId = id;
    }
  }

  /**
   * Searches for cards using the specified provider or default
   */
  public async searchCards(filters: SearchFilters): Promise<SearchResults> {
    const provider = this.get(filters.tcgId);
    return provider.searchCards(filters);
  }

  /**
   * Normalizes any card object (including legacy PokemonCard format) into a unified TCGCard
   */
  public normalizeCard(rawCard: any): TCGCard | null {
    if (!rawCard) return null;

    if ('tcgId' in rawCard && rawCard.tcgId) {
      return rawCard as TCGCard;
    }

    // Assume legacy PokemonCard
    return mapPokemonCardToTCGCard(rawCard);
  }
}

export const tcgRegistry = new TCGProviderRegistry();
