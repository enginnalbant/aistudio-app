import { 
  IEditorEngine, 
  EditorConfig, 
  EditorMode, 
  EditorTheme, 
  EditorDocumentData,
  AICommandPayload,
  AICommandResult
} from '../types/editor.types';
import { EditorEventEmitter } from '../events/EditorEventEmitter';
import { StorageEngine } from './StorageEngine';
import { ThemeEngine } from './ThemeEngine';
import { AIEngine } from './AIEngine';
import { SettingsEngine } from './SettingsEngine';

export class EditorService {
  private engine: IEditorEngine;
  private storage: StorageEngine;
  private theme: ThemeEngine;
  private ai: AIEngine;
  private settings: SettingsEngine;
  public readonly events: EditorEventEmitter;

  private currentDocId: string | null = null;

  constructor(
    engine: IEditorEngine,
    storage?: StorageEngine,
    theme?: ThemeEngine,
    ai?: AIEngine,
    settings?: SettingsEngine,
    events?: EditorEventEmitter
  ) {
    this.events = events || new EditorEventEmitter();
    this.engine = engine;
    this.storage = storage || new StorageEngine();
    this.theme = theme || new ThemeEngine(this.events);
    this.ai = ai || new AIEngine();
    this.settings = settings || new SettingsEngine();

    this.events.on('storage:saved', () => {
      this.persistCurrentDoc();
    });

    this.events.on('content:change', () => {
      this.persistCurrentDoc();
    });
  }

  get currentEngine(): IEditorEngine {
    return this.engine;
  }

  get activeDocumentId(): string | null {
    return this.currentDocId;
  }

  get activeMode(): EditorMode {
    return this.engine.mode;
  }

  get activeTheme(): EditorTheme {
    return this.theme.theme;
  }

  async mountEditor(container: HTMLElement, config?: Partial<EditorConfig>): Promise<void> {
    const docId = config?.docId || this.currentDocId || 'doc-welcome';
    this.currentDocId = docId;

    const savedDoc = await this.storage.getDocument(docId);
    const initialTitle = savedDoc?.title || config?.initialTitle || 'Untitled Document';
    const initialMode = savedDoc?.mode || config?.mode || this.settings.currentSettings.defaultMode;

    const mergedConfig: EditorConfig = {
      docId,
      initialTitle,
      mode: initialMode,
      theme: this.theme.theme,
      autoSave: this.settings.currentSettings.autoSave,
      autoSaveIntervalMs: this.settings.currentSettings.autoSaveIntervalMs,
      ...config
    };

    await this.engine.initialize(container, mergedConfig);

    if (savedDoc?.content) {
      await this.engine.setContent(savedDoc.content, 'markdown');
    }
  }

  async loadDocument(docId: string, container: HTMLElement): Promise<void> {
    await this.persistCurrentDoc();
    this.currentDocId = docId;
    const docData = await this.storage.getDocument(docId);
    if (!docData) {
      throw new Error(`Document with ID "${docId}" not found.`);
    }

    await this.engine.initialize(container, {
      docId,
      initialTitle: docData.title,
      mode: docData.mode || 'page',
      theme: this.theme.theme
    });

    if (docData.content) {
      await this.engine.setContent(docData.content, 'markdown');
    }
  }

  async createNewDocument(container: HTMLElement, title = 'Untitled Note'): Promise<EditorDocumentData> {
    await this.persistCurrentDoc();
    const newDocId = `doc-${Date.now()}`;
    const newDoc: EditorDocumentData = {
      id: newDocId,
      title,
      content: `# ${title}\n\nStart writing your ideas...`,
      mode: 'page',
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    await this.storage.saveDocument(newDoc);
    await this.loadDocument(newDocId, container);
    return newDoc;
  }

  async persistCurrentDoc(): Promise<void> {
    if (!this.currentDocId) return;
    try {
      const content = await this.engine.getContent();
      const title = this.engine.getTitle();
      const mode = this.engine.mode;
      const blocksData = await this.engine.getBlocksData();

      await this.storage.saveDocument({
        id: this.currentDocId,
        title,
        content,
        mode,
        blocksData,
        lastModified: Date.now(),
        createdAt: Date.now()
      });
    } catch (err) {
      console.warn('Auto-save error:', err);
    }
  }

  setEditorMode(mode: EditorMode): void {
    this.engine.setMode(mode);
    this.persistCurrentDoc();
  }

  setEditorTheme(theme: EditorTheme): void {
    this.theme.setTheme(theme);
    this.engine.setTheme(theme);
  }

  async runAICommand(payload: AICommandPayload): Promise<AICommandResult> {
    this.events.emit('ai:request', payload);
    const result = await this.ai.executeCommand(payload);
    if (result.success && result.resultText) {
      await this.engine.insertTextAtSelection(result.resultText);
    }
    return result;
  }

  async exportActiveDocument(format: 'json' | 'markdown' | 'html'): Promise<string> {
    return await this.engine.exportData(format);
  }

  async importToActiveDocument(data: string, format: 'json' | 'markdown' | 'html'): Promise<void> {
    await this.engine.importData(data, format);
    await this.persistCurrentDoc();
  }

  async getDocumentList(): Promise<EditorDocumentData[]> {
    return await this.storage.getAllDocuments();
  }

  async deleteDocument(docId: string): Promise<boolean> {
    const success = await this.storage.deleteDocument(docId);
    if (success && this.currentDocId === docId) {
      this.currentDocId = null;
    }
    return success;
  }

  dispose(): void {
    this.engine.dispose();
    this.theme.dispose();
    this.events.removeAllListeners();
  }
}
