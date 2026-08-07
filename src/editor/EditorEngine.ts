import { 
  IEditorEngine, 
  EditorConfig, 
  EditorMode, 
  EditorTheme, 
  EditorEngineStatus 
} from './types/editor.types';
import { EditorEventEmitter } from './events/EditorEventEmitter';

export abstract class EditorEngine implements IEditorEngine {
  abstract readonly id: string;
  
  protected _mode: EditorMode = 'page';
  protected _theme: EditorTheme = 'system';
  protected _status: EditorEngineStatus = 'uninitialized';
  protected _readonly = false;
  protected _title = 'Untitled Document';

  public events: EditorEventEmitter;

  constructor(events?: EditorEventEmitter) {
    this.events = events || new EditorEventEmitter();
  }

  get mode(): EditorMode {
    return this._mode;
  }

  get theme(): EditorTheme {
    return this._theme;
  }

  get status(): EditorEngineStatus {
    return this._status;
  }

  get readonly(): boolean {
    return this._readonly;
  }

  getTitle(): string {
    return this._title;
  }

  setTitle(title: string): void {
    this._title = title;
    this.events.emit('title:change', { title });
  }

  protected setStatus(status: EditorEngineStatus, message?: string): void {
    this._status = status;
    this.events.emit('status:change', { status, message });
  }

  abstract initialize(container: HTMLElement, config: EditorConfig): Promise<void>;
  abstract getContent(): Promise<string>;
  abstract getBlocksData(): Promise<any>;
  abstract setContent(content: string, format?: 'markdown' | 'text' | 'json'): Promise<void>;
  abstract setMode(mode: EditorMode): void;
  abstract setTheme(theme: EditorTheme): void;
  abstract setReadonly(readonly: boolean): void;
  abstract exportData(format: 'json' | 'markdown' | 'html'): Promise<string>;
  abstract importData(data: string, format: 'json' | 'markdown' | 'html'): Promise<void>;
  abstract insertTextAtSelection(text: string): Promise<void>;
  abstract getSelectedText(): Promise<string>;
  abstract dispose(): void;
}
