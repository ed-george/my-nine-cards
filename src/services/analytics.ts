declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface CardAnalyticsData {
  id: string;
  tcgId?: string;
  name: string;
  setName?: string;
  set?: { name?: string };
  localId?: string;
}

/**
 * Tracks card selection events in Google Analytics (gtag.js)
 */
export function trackCardSelected(card: CardAnalyticsData, slotIndex: number): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const tcgType = card.tcgId || 'pokemon';
    const setName = card.setName || card.set?.name || 'Unknown Set';

    window.gtag('event', 'select_card', {
      card_id: card.id,
      card_name: card.name,
      card_set: setName,
      tcg_type: tcgType,
      slot_index: slotIndex + 1,
      event_category: 'Showcase Grid',
      event_label: `${card.name} (${tcgType})`,
    });
  }
}

/**
 * Tracks image export events in Google Analytics (gtag.js)
 */
export function trackExportImage(format: 'png' | 'jpeg' | 'clipboard'): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'export_image', {
      export_format: format,
      event_category: 'Export',
      event_label: `Export ${format.toUpperCase()}`,
    });
  }
}

/**
 * Tracks theme changes in Google Analytics (gtag.js)
 */
export function trackThemeChanged(themeId: string): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'change_theme', {
      theme_id: themeId,
      event_category: 'Customization',
      event_label: themeId,
    });
  }
}
