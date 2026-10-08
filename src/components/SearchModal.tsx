import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, Sparkles, AlertCircle, CheckCircle2, Layers, ImageOff } from 'lucide-react';
import type { TCGCard, SearchFilters, TCGProviderId } from '../types/card';
import { tcgRegistry } from '../providers';
import { sanitizeSearchQuery } from '../services/tcgdexApi';

interface SearchModalProps {
  isOpen: boolean;
  targetSlotIndex: number | null;
  onClose: () => void;
  onSelectCard: (card: TCGCard, targetSlot?: number) => void;
}

const ITEMS_PER_PAGE = 24;

const SearchResultImage: React.FC<{ card: TCGCard }> = ({ card }) => {
  const [imgError, setImgError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const handleImageError = () => {
    if (!triedFallback && card.fallbackImageUrl && card.fallbackImageUrl !== card.imageUrl) {
      setTriedFallback(true);
    } else {
      setImgError(true);
    }
  };

  if (imgError) {
    return (
      <div className="result-img-fallback">
        <ImageOff size={22} className="fallback-icon" />
        <span className="fallback-mini-title">{card.name}</span>
      </div>
    );
  }

  return (
    <img
      src={triedFallback && card.fallbackImageUrl ? card.fallbackImageUrl : card.imageUrl}
      alt={card.name}
      loading="lazy"
      onError={handleImageError}
    />
  );
};

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  targetSlotIndex,
  onClose,
  onSelectCard,
}) => {
  const providers = tcgRegistry.getAll();
  const [selectedTcgId, setSelectedTcgId] = useState<TCGProviderId>('pokemon');
  const activeProvider = tcgRegistry.get(selectedTcgId);

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<TCGCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      executeSearch(query, selectedTcgId, 1, false);
    }
  }, [isOpen]);

  // Debounced search trigger on query or TCG provider change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setPage(1);
      executeSearch(query, selectedTcgId, 1, false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, selectedTcgId, isOpen]);

  // Execute search using the active TCG provider
  const executeSearch = async (
    searchTerm: string,
    tcgId: TCGProviderId,
    targetPage: number,
    isAppend: boolean
  ) => {
    const cleanSearchTerm = sanitizeSearchQuery(searchTerm);

    if (!cleanSearchTerm) {
      setResults([]);
      setTotalCount(0);
      setHasMore(false);
      return;
    }

    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }

    setError(null);

    const filters: SearchFilters = {
      query: cleanSearchTerm,
      tcgId,
      page: targetPage,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    try {
      const searchRes = await tcgRegistry.searchCards(filters);

      if (isAppend) {
        setResults((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newUnique = searchRes.cards.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newUnique];
        });
      } else {
        setResults(searchRes.cards);
      }

      setTotalCount(searchRes.totalCount);
      setHasMore(searchRes.hasMore);
      setPage(targetPage);
    } catch (err) {
      setError(`Failed to fetch cards from ${activeProvider.name}. Please try again.`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Function to load the next page on infinite scroll
  const loadNextPage = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    executeSearch(query, selectedTcgId, nextPage, true);
  }, [loading, loadingMore, hasMore, page, query, selectedTcgId]);

  // IntersectionObserver sentinel for auto infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadNextPage();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    const targetNode = sentinelRef.current;
    observer.observe(targetNode);

    return () => {
      observer.unobserve(targetNode);
      observer.disconnect();
    };
  }, [isOpen, loadNextPage]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              Select Trading Card
              {targetSlotIndex !== null && (
                <span className="target-slot-badge">For Slot #{targetSlotIndex + 1}</span>
              )}
            </h3>
            <p className="modal-subtitle">
              {loading ? (
                `Searching ${activeProvider.name} database...`
              ) : totalCount > 0 ? (
                <>Found <strong>{totalCount}</strong> {activeProvider.shortName} cards matching "{query}"</>
              ) : (
                `Search cards across supported Trading Card Games`
              )}
            </p>
          </div>

          <button className="modal-close-btn" onClick={onClose} title="Close search">
            <X size={20} />
          </button>
        </div>

        {/* TCG Provider Selector Tabs */}
        <div className="tcg-provider-bar">
          <Layers size={15} className="filter-label-icon" />
          <div className="tcg-tabs-scroll">
            {providers.map((p) => (
              <button
                key={p.id}
                className={`tcg-tab ${selectedTcgId === p.id ? 'active' : ''}`}
                style={{
                  '--provider-color': p.brandColor,
                } as React.CSSProperties}
                onClick={() => {
                  setSelectedTcgId(p.id);
                  setQuery(p.popularSearches[0] || '');
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Controls */}
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={`Search ${activeProvider.shortName} card name...`}
            value={query}
            onChange={(e) => setQuery(sanitizeSearchQuery(e.target.value))}
          />
          {query && (
            <button className="clear-search-btn" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="quick-search-section">
          <span className="section-label">Popular Searches:</span>
          <div className="quick-chips-list">
            {activeProvider.popularSearches.map((term) => (
              <button
                key={term}
                className={`quick-chip ${query.toLowerCase() === term.toLowerCase() ? 'active' : ''}`}
                onClick={() => setQuery(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Content Scroll Area */}
        <div className="modal-body-results" ref={scrollContainerRef}>
          {loading ? (
            /* Skeleton Shimmer Grid Loading State */
            <div className="cards-results-grid">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="card-skeleton-item">
                  <div className="skeleton-img-placeholder shimmer-effect" />
                  <div className="skeleton-line shimmer-effect" />
                  <div className="skeleton-line-sub shimmer-effect" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-results-state">
              <Sparkles size={32} />
              <p>No cards found matching "{query}"</p>
              <span className="hint-text">Try searching for a different card name</span>
            </div>
          ) : (
            <>
              {/* Loaded Cards Grid */}
              <div className="cards-results-grid">
                {results.map((card, idx) => {
                  return (
                    <button
                      key={`${card.id}_${idx}`}
                      className="card-result-item"
                      onClick={() => {
                        onSelectCard(card, targetSlotIndex !== null ? targetSlotIndex : undefined);
                        onClose();
                      }}
                    >
                      <div className="result-img-wrapper">
                        <SearchResultImage card={card} />
                        {/* TCG Badge */}
                        <span className="result-tcg-badge" data-tcg={card.tcgId}>
                          {card.tcgId === 'pokemon' ? 'PKMN' : card.tcgId === 'mtg' ? 'MTG' : card.tcgId}
                        </span>
                      </div>
                      <div className="result-card-info">
                        <span className="result-card-name">{card.name}</span>
                        {card.setName && (
                          <span className="result-card-set">
                            {card.setName}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Scroll Sentinel for Auto Infinite Scroll */}
              <div ref={sentinelRef} className="scroll-sentinel">
                {loadingMore && (
                  <div className="bottom-loading-wrapper">
                    <div className="cards-results-grid skeleton-bottom-grid">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card-skeleton-item mini">
                          <div className="skeleton-img-placeholder shimmer-effect" />
                        </div>
                      ))}
                    </div>
                    <div className="loading-more-pill">
                      <Loader2 className="spinner-icon" size={16} />
                      <span>Loading cards ({results.length} of {totalCount})...</span>
                    </div>
                  </div>
                )}

                {!hasMore && results.length > 0 && (
                  <div className="end-of-results-badge">
                    <CheckCircle2 size={16} />
                    <span>Loaded {results.length} cards</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
