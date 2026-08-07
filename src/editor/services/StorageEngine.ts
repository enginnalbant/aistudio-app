import { EditorDocumentData } from '../types/editor.types';

const LOCAL_STORAGE_DOCS_KEY = 'apexos_editor_documents_v1';

export class StorageEngine {
  private memoryCache: Map<string, EditorDocumentData> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
      if (raw) {
        const list: EditorDocumentData[] = JSON.parse(raw);
        list.forEach((doc) => this.memoryCache.set(doc.id, doc));
      }
    } catch (e) {
      console.warn('Failed to load documents from localStorage:', e);
    }
  }

  private syncToLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const docsArray = Array.from(this.memoryCache.values());
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(docsArray));
    } catch (e) {
      console.warn('Failed to save documents to localStorage:', e);
    }
  }

  async getDocument(id: string): Promise<EditorDocumentData | null> {
    return this.memoryCache.get(id) || null;
  }

  async getAllDocuments(): Promise<EditorDocumentData[]> {
    if (this.memoryCache.size === 0) {
      const defaultDoc: EditorDocumentData = {
        id: 'doc-welcome',
        title: 'Welcome to BlockSuite Canvas & Docs',
        content: '# Welcome to BlockSuite Editor\n\nBlockSuite is a modern collaborative block-based document and edgeless canvas engine.\n\n- Click "Page Mode" for standard document layout\n- Click "Edgeless Mode" for spatial whiteboarding canvas\n- Use AI tools to expand, summarize, or refine your thoughts.',
        mode: 'page',
        createdAt: Date.now(),
        lastModified: Date.now(),
        tags: ['guide', 'blocksuite', 'getting-started']
      };
      this.memoryCache.set(defaultDoc.id, defaultDoc);
      this.syncToLocalStorage();
    }
    return Array.from(this.memoryCache.values()).sort((a, b) => b.lastModified - a.lastModified);
  }

  async saveDocument(doc: EditorDocumentData): Promise<void> {
    const existing = this.memoryCache.get(doc.id);
    const updatedDoc: EditorDocumentData = {
      ...existing,
      ...doc,
      lastModified: Date.now(),
      createdAt: existing?.createdAt || Date.now()
    };

    this.memoryCache.set(doc.id, updatedDoc);
    this.syncToLocalStorage();
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = this.memoryCache.delete(id);
    if (deleted) {
      this.syncToLocalStorage();
    }
    return deleted;
  }
}
