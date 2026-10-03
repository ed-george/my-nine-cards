import React from 'react';
import { Plus, RefreshCw, Trash2, Move } from 'lucide-react';
import type { GridSlot, CustomizationSettings } from '../types/pokemon';
import { getCardImageUrl } from '../services/tcgdexApi';

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
  const imageUrl = card ? getCardImageUrl(card, 'high', 'webp') : '';

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
          {/* Card Image */}
          <img
            src={imageUrl}
            alt={card.name}
            className="card-image"
            loading="lazy"
            crossOrigin="anonymous"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallbackUrl = getCardImageUrl(card, 'high', 'jpg');
              if (target.src !== fallbackUrl) {
                target.src = fallbackUrl;
              }
            }}
          />

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
          {settings.showCardNames && (
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
