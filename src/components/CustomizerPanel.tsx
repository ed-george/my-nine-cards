import React from 'react';
import { X, Palette, LayoutGrid, Type, Check, Eye } from 'lucide-react';
import type { CustomizationSettings, ThemeId } from '../types/pokemon';
import { THEMES } from '../data/themes';
import { trackThemeChanged } from '../services/analytics';

interface CustomizerPanelProps {
  isOpen: boolean;
  settings: CustomizationSettings;
  onChangeSettings: (updated: Partial<CustomizationSettings>) => void;
  onClose: () => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({
  isOpen,
  settings,
  onChangeSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="customizer-panel-drawer">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <Palette className="icon" size={18} />
          <h3>Grid Customizer</h3>
        </div>
        <button className="close-panel-btn" onClick={onClose} title="Close drawer">
          <X size={18} />
        </button>
      </div>

      <div className="panel-scroll-content">
        {/* Section 1: Showcase Header & Title */}
        <div className="panel-section">
          <label className="section-heading">
            <Type size={16} />
            <span>Showcase Titles</span>
          </label>

          <div className="input-field-group">
            <span className="field-label">Main Title</span>
            <input
              type="text"
              className="panel-text-input"
              value={settings.title}
              maxLength={45}
              placeholder="e.g. My 9 Favourite Pokémon Cards"
              onChange={(e) => onChangeSettings({ title: e.target.value })}
            />
          </div>

          <div className="input-field-group">
            <span className="field-label">Creator Tag / Subtitle</span>
            <input
              type="text"
              className="panel-text-input"
              value={settings.subtitle}
              maxLength={40}
              placeholder="e.g. @yourhandle"
              onChange={(e) => onChangeSettings({ subtitle: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Aesthetic Themes */}
        <div className="panel-section">
          <label className="section-heading">
            <Palette size={16} />
            <span>Aesthetic Themes</span>
          </label>

          <div className="themes-grid">
            {THEMES.map((theme) => {
              const isActive = settings.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  className={`theme-card-option ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    trackThemeChanged(theme.id);
                    onChangeSettings({ themeId: theme.id as ThemeId });
                  }}
                >
                  <div
                    className="theme-color-preview"
                    style={{ background: theme.previewBg }}
                  >
                    {isActive && <Check size={16} className="active-check" />}
                  </div>
                  <span className="theme-name">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Card Labels */}
        <div className="panel-section">
          <label className="section-heading">
            <Eye size={16} />
            <span>Card Overlays</span>
          </label>

          <div className="toggle-option-row">
            <div>
              <span className="toggle-title">Show Card Names</span>
              <span className="toggle-description">Display card name banner at bottom of slot</span>
            </div>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={settings.showCardNames}
              onChange={(e) => onChangeSettings({ showCardNames: e.target.checked })}
            />
          </div>
        </div>

        {/* Section 4: Grid Spacing & Geometry */}
        <div className="panel-section">
          <label className="section-heading">
            <LayoutGrid size={16} />
            <span>Layout Geometry</span>
          </label>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Grid Gap Spacing</span>
              <span className="slider-value">{settings.cardGap}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="28"
              step="2"
              value={settings.cardGap}
              onChange={(e) => onChangeSettings({ cardGap: Number(e.target.value) })}
              className="panel-range-slider"
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Card Corner Radius</span>
              <span className="slider-value">{settings.borderRadius}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="22"
              step="2"
              value={settings.borderRadius}
              onChange={(e) => onChangeSettings({ borderRadius: Number(e.target.value) })}
              className="panel-range-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
