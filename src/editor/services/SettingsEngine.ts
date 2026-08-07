import { EditorSettings } from '../types/editor.types';

const SETTINGS_STORAGE_KEY = 'apexos_editor_settings_v1';

export class SettingsEngine {
  private settings: EditorSettings = {
    defaultMode: 'page',
    theme: 'system',
    autoSave: true,
    autoSaveIntervalMs: 5000,
    enableAI: true,
    spellcheck: true,
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    lineHeight: 1.6
  };

  constructor() {
    this.loadSettings();
  }

  get currentSettings(): EditorSettings {
    return { ...this.settings };
  }

  private loadSettings(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        this.settings = { ...this.settings, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed to load editor settings:', e);
    }
  }

  updateSettings(partial: Partial<EditorSettings>): void {
    this.settings = { ...this.settings, ...partial };
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.warn('Failed to save editor settings:', e);
      }
    }
  }
}
