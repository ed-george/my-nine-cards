import type { CustomizationSettings, GridSlot } from '../types/pokemon';

const STORAGE_KEY_SLOTS = 'my9cards_slots_v1';
const STORAGE_KEY_SETTINGS = 'my9cards_settings_v1';

/**
 * Saves slots and settings to localStorage
 */
export function saveToLocalStorage(slots: GridSlot[], settings: CustomizationSettings) {
  try {
    const serializedSlots = slots.map((s) => ({
      index: s.index,
      cardId: s.card?.id || null,
      cardData: s.card || null,
    }));
    localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(serializedSlots));
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Loads slots and settings from localStorage
 */
export function loadFromLocalStorage(
  defaultSettings: CustomizationSettings
): { slots: GridSlot[]; settings: CustomizationSettings } | null {
  try {
    const rawSlots = localStorage.getItem(STORAGE_KEY_SLOTS);
    const rawSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

    if (!rawSlots) return null;

    const parsedSlots = JSON.parse(rawSlots);
    const slots: GridSlot[] = parsedSlots.map((item: any) => ({
      index: item.index,
      card: item.cardData || null,
    }));

    const settings: CustomizationSettings = rawSettings
      ? { ...defaultSettings, ...JSON.parse(rawSettings) }
      : defaultSettings;

    return { slots, settings };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}
