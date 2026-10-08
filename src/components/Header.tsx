import React from 'react';
import { Download, RotateCcw, SlidersHorizontal, Plus, Info } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: (slotIndex?: number) => void;
  onOpenExport: () => void;
  onToggleCustomizer: () => void;
  onResetGrid: () => void;
  onOpenAbout: () => void;
  customizerOpen: boolean;
  filledCardCount: number;
}

// Custom Playing/Trading Card Icon Component
const PlayingCardIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Outer Vertical Card Body */}
    <rect x="4" y="2" width="16" height="20" rx="2.5" />
    {/* Inner Card Artwork Frame */}
    <rect x="6.5" y="4.5" width="11" height="9" rx="1.2" strokeWidth="1.2" />
    {/* Center Emblem/Pokeball */}
    <circle cx="12" cy="9" r="2.2" strokeWidth="1.2" />
    {/* Bottom Title & Stat Lines */}
    <line x1="7.5" y1="16" x2="14.5" y2="16" strokeWidth="1.4" />
    <line x1="7.5" y1="18.5" x2="11.5" y2="18.5" strokeWidth="1.4" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenExport,
  onToggleCustomizer,
  onResetGrid,
  onOpenAbout,
  customizerOpen,
  filledCardCount,
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        {/* Brand Logo & Name */}
        <div className="brand-logo">
          <div className="logo-icon-wrapper">
            <PlayingCardIcon size={20} className="logo-icon" />
          </div>
          <div>
            <div className="title-info-row">
              <h1 className="brand-title">
                MY 9 <span className="brand-highlight">CARDS</span>
              </h1>
              <button
                className="info-icon-btn"
                onClick={onOpenAbout}
                title="About My 9 Cards & Creator Info"
              >
                <Info size={16} />
              </button>
            </div>
            <p className="brand-tagline">Trading Card Showcase Builder</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Card Count Indicator */}
          <div className="card-counter">
            <span className="count-number">{filledCardCount}/9</span>
            <span className="count-label">Cards</span>
          </div>

          {/* Quick Add Card button */}
          <button
            className="action-btn secondary-btn"
            onClick={() => onOpenSearch()}
            title="Search and add a Pokémon card"
          >
            <Plus size={16} />
            <span className="btn-text">Add Card</span>
          </button>

          {/* Customizer Toggle */}
          <button
            className={`action-btn ${customizerOpen ? 'active' : ''}`}
            onClick={onToggleCustomizer}
            title="Customize Title, Theme & Effects"
          >
            <SlidersHorizontal size={16} />
            <span className="btn-text">Customize</span>
          </button>

          {/* Reset Grid */}
          <button
            className="action-btn icon-only-btn"
            onClick={onResetGrid}
            title="Clear all cards"
          >
            <RotateCcw size={16} />
          </button>

          {/* Primary Export Image Button */}
          <button
            className="action-btn primary-btn"
            onClick={onOpenExport}
            disabled={filledCardCount < 9}
            title={filledCardCount < 9 ? 'Fill all 9 slots to export image' : 'Export showcase image'}
          >
            <Download size={16} />
            <span className="btn-text">Export Image</span>
          </button>
        </div>
      </div>
    </header>
  );
};
