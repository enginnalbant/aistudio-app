export type EditorMode = 'page' | 'edgeless';
export type EditorTheme = 'light' | 'dark' | 'system';
export type EditorEngineStatus = 'uninitialized' | 'initializing' | 'ready' | 'saving' | 'error';

export interface EditorConfig {
  docId?: string;
  initialTitle?: string;
  mode?: EditorMode;
  theme?: EditorTheme;
  readonly?: boolean;
  autoSave?: boolean;
  autoSaveIntervalMs?: number;
  placeholder?: string;
}

export interface EditorDocumentData {
  id: string;
  title: string;
  content: string;
  mode: EditorMode;
  blocksData?: any;
  createdAt: number;
  lastModified: number;
  tags?: string[];
}

export interface AICommandPayload {
  prompt: string;
  commandType: 'summarize' | 'expand' | 'rewrite' | 'fix_grammar' | 'custom';
  contextText?: string;
}

export interface AICommandResult {
  success: boolean;
  resultText?: string;
  error?: string;
}

export interface EditorSettings {
  defaultMode: EditorMode;
  theme: EditorTheme;
  autoSave: boolean;
  autoSaveIntervalMs: number;
  enableAI: boolean;
  spellcheck: boolean;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

export interface IEditorEngine {
  readonly id: string;
  readonly mode: EditorMode;
  readonly theme: EditorTheme;
  readonly status: EditorEngineStatus;
  readonly readonly: boolean;

  initialize(container: HTMLElement, config: EditorConfig): Promise<void>;
  getContent(): Promise<string>;
  getBlocksData(): Promise<any>;
  setContent(content: string, format?: 'markdown' | 'text' | 'json'): Promise<void>;
  setMode(mode: EditorMode): void;
  setTheme(theme: EditorTheme): void;
  setReadonly(readonly: boolean): void;
  setTitle(title: string): void;
  getTitle(): string;
  exportData(format: 'json' | 'markdown' | 'html'): Promise<string>;
  importData(data: string, format: 'json' | 'markdown' | 'html'): Promise<void>;
  insertTextAtSelection(text: string): Promise<void>;
  getSelectedText(): Promise<string>;
  dispose(): void;
}
