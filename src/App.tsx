import React, { useState, useEffect, useRef } from 'react';
import type { GridSlot, CustomizationSettings, PokemonCard } from './types/pokemon';
import { Header } from './components/Header';
import { CardGrid } from './components/CardGrid';
import { SearchModal } from './components/SearchModal';
import { CustomizerPanel } from './components/CustomizerPanel';
import { ExportModal } from './components/ExportModal';
import { AboutModal } from './components/AboutModal';
import { saveToLocalStorage, loadFromLocalStorage } from './services/urlState';
import { trackCardSelected } from './services/analytics';
import './index.css';

const DEFAULT_SETTINGS: CustomizationSettings = {
  title: 'My 9 Cards',
  subtitle: 'The cards that made me',
  themeId: 'base-set-holo',
  showCardNames: false,
  cardGap: 8,
  borderRadius: 8,
};

export const App: React.FC = () => {
  // 9 Grid slots
  const [slots, setSlots] = useState<GridSlot[]>(() =>
    Array.from({ length: 9 }, (_, i) => ({ index: i, card: null }))
  );

  // Customization Settings
  const [settings, setSettings] = useState<CustomizationSettings>(DEFAULT_SETTINGS);

  // Modals & Panels State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const exportRef = useRef<HTMLDivElement | null>(null);

  // Load state on mount from localStorage
  useEffect(() => {
    const localState = loadFromLocalStorage(DEFAULT_SETTINGS);
    if (localState) {
      setSlots(localState.slots);
      setSettings(localState.settings);
    }
    setIsInitializing(false);
  }, []);

  // Sync to localStorage whenever slots or settings change
  useEffect(() => {
    if (!isInitializing) {
      saveToLocalStorage(slots, settings);
    }
  }, [slots, settings, isInitializing]);

  // Open search modal for a target slot or next empty slot
  const handleOpenSearch = (slotIndex?: number) => {
    if (typeof slotIndex === 'number') {
      setTargetSlotIndex(slotIndex);
    } else {
      const firstEmpty = slots.find((s) => s.card === null);
      setTargetSlotIndex(firstEmpty ? firstEmpty.index : 0);
    }
    setSearchModalOpen(true);
  };

  // Assign card to slot
  const handleSelectCard = (card: PokemonCard, slotIndex?: number) => {
    const targetIdx = typeof slotIndex === 'number'
      ? slotIndex
      : slots.findIndex((s) => s.card === null);

    const actualIdx = targetIdx >= 0 ? targetIdx : 0;

    // Track card selection event in Google Analytics
    trackCardSelected(card, actualIdx);

    setSlots((prev) =>
      prev.map((s) => (s.index === actualIdx ? { ...s, card } : s))
    );
  };

  // Remove card from slot
  const handleRemoveCard = (index: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.index === index ? { ...s, card: null } : s))
    );
  };

  // Swap cards between two slots
  const handleSwapSlots = (fromIndex: number, toIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      const fromCard = next[fromIndex].card;
      const toCard = next[toIndex].card;
      next[fromIndex] = { ...next[fromIndex], card: toCard };
      next[toIndex] = { ...next[toIndex], card: fromCard };
      return next;
    });
  };

  // Reset grid
  const handleResetGrid = () => {
    if (window.confirm('Are you sure you want to clear all 9 cards from your grid?')) {
      setSlots(Array.from({ length: 9 }, (_, i) => ({ index: i, card: null })));
    }
  };

  const handleUpdateSettings = (updated: Partial<CustomizationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  const filledCardCount = slots.filter((s) => s.card !== null).length;

  return (
    <div className="app-main-layout">
      {/* Navigation Header */}
      <Header
        onOpenSearch={handleOpenSearch}
        onOpenExport={() => setExportModalOpen(true)}
        onToggleCustomizer={() => setCustomizerOpen((prev) => !prev)}
        onResetGrid={handleResetGrid}
        onOpenAbout={() => setAboutModalOpen(true)}
        customizerOpen={customizerOpen}
        filledCardCount={filledCardCount}
      />

      {/* Main View Area */}
      <main className="main-content-viewport">
        <div className="layout-split">
          {/* Card Showcase View */}
          <div className="showcase-center-stage">
            <CardGrid
              slots={slots}
              settings={settings}
              onSelectSlot={handleOpenSearch}
              onRemoveCard={handleRemoveCard}
              onSwapSlots={handleSwapSlots}
              exportRef={exportRef}
            />
          </div>

          {/* Side Customizer Drawer */}
          <CustomizerPanel
            isOpen={customizerOpen}
            settings={settings}
            onChangeSettings={handleUpdateSettings}
            onClose={() => setCustomizerOpen(false)}
          />
        </div>
      </main>

      {/* Modals */}
      <SearchModal
        isOpen={searchModalOpen}
        targetSlotIndex={targetSlotIndex}
        onClose={() => setSearchModalOpen(false)}
        onSelectCard={handleSelectCard}
      />

      <ExportModal
        isOpen={exportModalOpen}
        exportRef={exportRef}
        title={settings.title}
        onClose={() => setExportModalOpen(false)}
      />

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
};

export default App;
