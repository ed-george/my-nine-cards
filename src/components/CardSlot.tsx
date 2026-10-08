import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, Move, ImageOff } from 'lucide-react';
import type { GridSlot, CustomizationSettings } from '../types/card';
import { tcgRegistry } from '../providers';

interface CardSlotProps {
  slot: GridSlot;
  settings: CustomizationSettings;
  onSelectSlot: (index: number) => void;
  onRemoveCard: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging?: boolean;
}

export const CardSlot: React.FC<CardSlotProps> = ({
  slot,
  settings,
  onSelectSlot,
  onRemoveCard,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}) => {
  const { card, index } = slot;
  const [imgError, setImgError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  // Reset error tracking state when card changes
  useEffect(() => {
    setImgError(false);
    setTriedFallback(false);
  }, [card?.id]);

  const provider = card ? tcgRegistry.get(card.tcgId) : null;
  const imageUrl = card ? provider?.getCardImageUrl?.(card) || card.imageUrl : '';
  const fallbackUrl = card?.fallbackImageUrl || imageUrl;

  const handleImageError = () => {
    if (!triedFallback && fallbackUrl && fallbackUrl !== imageUrl) {
      setTriedFallback(true);
    } else {
      setImgError(true);
    }
  };

  return (
    <div
      className={`card-slot-wrapper ${card ? 'filled' : 'empty'} ${isDragging ? 'dragging' : ''}`}
      style={{
        borderRadius: `${settings.borderRadius}px`,
      }}
      draggable={Boolean(card)}
      onDragStart={(e) => card && onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      {card ? (
        <div className="card-container">
          {/* Card Image or Fallback Layout */}
          {imgError ? (
            <div className="card-fallback-layout">
              <div className="fallback-header">
                <span
                  className="fallback-provider-tag"
                  style={{ background: provider?.brandColor || '#0f172a' }}
                >
                  {provider?.shortName || 'TCG'}
                </span>
                {card.rarity && <span className="fallback-rarity">{card.rarity}</span>}
              </div>

              <div className="fallback-body">
                <div className="fallback-icon-wrapper">
                  <ImageOff size={28} className="fallback-icon" />
                </div>
                <h4 className="fallback-card-title">{card.name}</h4>
                {card.setName && <p className="fallback-set-title">{card.setName}</p>}
              </div>

              <div className="fallback-footer">
                <span className="fallback-id-badge">{card.rawId || card.id}</span>
              </div>
            </div>
          ) : (
            <img
              src={triedFallback ? fallbackUrl : imageUrl}
              alt={card.name}
              className="card-image"
              loading="lazy"
              onError={handleImageError}
            />
          )}

          {/* Hover Control Overlay (hidden from export canvas via no-export class) */}
          <div className="slot-actions-overlay no-export">
            <div className="drag-handle" title="Drag to reorder slot">
              <Move size={16} />
            </div>

            <div className="action-button-group">
              <button
                className="slot-action-btn replace-btn"
                onClick={() => onSelectSlot(index)}
                title="Replace Card"
              >
                <RefreshCw size={15} />
                <span>Replace</span>
              </button>

              <button
                className="slot-action-btn delete-btn"
                onClick={() => onRemoveCard(index)}
                title="Remove Card"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Optional Card Name Overlay */}
          {settings.showCardNames && !imgError && (
            <div className="card-name-footer">
              <span className="card-title-text">{card.name}</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty Slot State */
        <button
          className="empty-slot-btn"
          onClick={() => onSelectSlot(index)}
          title={`Add card to Slot #${index + 1}`}
        >
          <div className="empty-icon-circle">
            <Plus size={26} />
          </div>
          <span className="empty-slot-label">Add Card #{index + 1}</span>
        </button>
      )}
    </div>
  );
};
