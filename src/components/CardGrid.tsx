import React from 'react';
import type { GridSlot, CustomizationSettings } from '../types/card';
import { CardSlot } from './CardSlot';
import { getThemeById } from '../data/themes';
import { tcgRegistry } from '../providers';

interface CardGridProps {
  slots: GridSlot[];
  settings: CustomizationSettings;
  onSelectSlot: (index: number) => void;
  onRemoveCard: (index: number) => void;
  onSwapSlots: (fromIndex: number, toIndex: number) => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
}

export const CardGrid: React.FC<CardGridProps> = ({
  slots,
  settings,
  onSelectSlot,
  onRemoveCard,
  onSwapSlots,
  exportRef,
}) => {
  const theme = getThemeById(settings.themeId);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onSwapSlots(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
  };

  // Determine dynamic provider attributions for the current grid
  const activeProviders = Array.from(
    new Set(
      slots
        .map((s) => s.card?.tcgId || 'pokemon')
        .filter(Boolean)
    )
  ).map((id) => tcgRegistry.get(id));

  const providerAttributionText =
    activeProviders.length > 0
      ? activeProviders.map((p) => p.attribution.replace(/^Powered by /i, '')).join(' & ')
      : 'TCGdex';

  return (
    <div className="showcase-outer-container">
      {/* Exportable Container ID/Ref */}
      <div
        id="showcase-grid-export"
        ref={exportRef}
        className="showcase-card-grid-wrapper"
        style={{
          background: theme.bgGradient,
          color: theme.textColor,
          '--card-bg': theme.cardBg,
          '--card-border': theme.cardBorder,
          '--accent-color': theme.accentColor,
          '--subtext-color': theme.subtextColor,
          '--badge-bg': theme.badgeBg,
        } as React.CSSProperties}
      >
        {/* Showcase Header Banner */}
        <div className="showcase-header">
          <h2 className="showcase-title">{settings.title}</h2>
          {settings.subtitle && (
            <p className="showcase-subtitle">{settings.subtitle}</p>
          )}
        </div>

        {/* 3x3 Cards Grid */}
        <div
          className="grid-3x3"
          style={{
            gap: `${settings.cardGap}px`,
          }}
        >
          {slots.map((slot) => (
            <CardSlot
              key={slot.index}
              slot={slot}
              settings={settings}
              onSelectSlot={onSelectSlot}
              onRemoveCard={onRemoveCard}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedIndex === slot.index}
            />
          ))}
        </div>

        {/* Showcase Footer Watermark */}
        <div className="showcase-footer">
          <span className="watermark-brand">MY 9 CARDS</span>
          <span className="watermark-dot">•</span>
          <span className="watermark-handle">@ptcgenius</span>
          <span className="watermark-dot">•</span>
          <span className="watermark-tcg">Powered by {providerAttributionText}</span>
        </div>
      </div>
    </div>
  );
};
