import { EditorTheme } from '../types/editor.types';
import { EditorEventEmitter } from '../events/EditorEventEmitter';

export class ThemeEngine {
  private currentTheme: EditorTheme = 'system';
  private mediaQuery: MediaQueryList | null = null;
  private events: EditorEventEmitter;

  constructor(events: EditorEventEmitter) {
    this.events = events;
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    }
  }

  get theme(): EditorTheme {
    return this.currentTheme;
  }

  get isDarkMode(): boolean {
    if (this.currentTheme === 'dark') return true;
    if (this.currentTheme === 'light') return false;
    return this.mediaQuery ? this.mediaQuery.matches : false;
  }

  setTheme(theme: EditorTheme): void {
    this.currentTheme = theme;
    this.applyThemeToDocument();
    this.events.emit('theme:change', { theme });
  }

  private handleSystemThemeChange = () => {
    if (this.currentTheme === 'system') {
      this.applyThemeToDocument();
      this.events.emit('theme:change', { theme: 'system' });
    }
  };

  private applyThemeToDocument(): void {
    if (typeof document === 'undefined') return;
    const isDark = this.isDarkMode;
    if (isDark) {
      document.documentElement.classList.add('editor-dark');
    } else {
      document.documentElement.classList.remove('editor-dark');
    }
  }

  dispose(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
  }
}
