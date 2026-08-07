import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  FileText, 
  Layout, 
  Sparkles, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Wand2, 
  ChevronRight, 
  FileCode 
} from 'lucide-react';
import { EditorService } from '../../editor/services/EditorService';
import { BlockSuiteAdapter } from '../../editor/adapters/BlockSuiteAdapter';
import { StorageEngine } from '../../editor/services/StorageEngine';
import { ThemeEngine } from '../../editor/services/ThemeEngine';
import { AIEngine } from '../../editor/services/AIEngine';
import { SettingsEngine } from '../../editor/services/SettingsEngine';
import { EditorEventEmitter } from '../../editor/events/EditorEventEmitter';
import { EditorDocumentData, EditorMode, EditorTheme } from '../../editor/types/editor.types';

export const BlockSuiteEditorContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorServiceRef = useRef<EditorService | null>(null);

  const [docTitle, setDocTitle] = useState('Welcome to BlockSuite Canvas & Docs');
  const [mode, setMode] = useState<EditorMode>('page');
  const [theme, setTheme] = useState<EditorTheme>('system');
  const [statusText, setStatusText] = useState<string>('Ready');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [documents, setDocuments] = useState<EditorDocumentData[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('doc-welcome');
  
  // UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultText, setAiResultText] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Initialize Editor Service using DI
  useEffect(() => {
    const events = new EditorEventEmitter();
    const adapter = new BlockSuiteAdapter(events);
    const storage = new StorageEngine();
    const themeEngine = new ThemeEngine(events);
    const aiEngine = new AIEngine();
    const settingsEngine = new SettingsEngine();

    const service = new EditorService(adapter, storage, themeEngine, aiEngine, settingsEngine, events);
    editorServiceRef.current = service;

    // Listen to events
    const unsubStatus = events.on('status:change', (payload) => {
      setStatusText(payload.message || payload.status);
    });

    const unsubContent = events.on('content:change', () => {
      setIsSaved(false);
      setTimeout(() => setIsSaved(true), 1200);
    });

    const unsubMode = events.on('mode:change', (payload) => {
      setMode(payload.mode);
    });

    const unsubTheme = events.on('theme:change', (payload) => {
      setTheme(payload.theme);
    });

    // Mount editor once container is ready
    if (containerRef.current) {
      service.mountEditor(containerRef.current, { docId: 'doc-welcome' }).then(() => {
        refreshDocList();
      }).catch(console.error);
    }

    return () => {
      unsubStatus();
      unsubContent();
      unsubMode();
      unsubTheme();
      service.dispose();
      editorServiceRef.current = null;
    };
  }, []);

  const refreshDocList = useCallback(async () => {
    if (editorServiceRef.current) {
      const docs = await editorServiceRef.current.getDocumentList();
      setDocuments(docs);
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setDocTitle(newTitle);
    if (editorServiceRef.current) {
      editorServiceRef.current.currentEngine.setTitle(newTitle);
      editorServiceRef.current.persistCurrentDoc();
      refreshDocList();
    }
  };

  const handleModeSwitch = (newMode: EditorMode) => {
    if (editorServiceRef.current) {
      editorServiceRef.current.setEditorMode(newMode);
      setMode(newMode);
    }
  };

  const handleThemeSwitch = (newTheme: EditorTheme) => {
    if (editorServiceRef.current) {
      editorServiceRef.current.setEditorTheme(newTheme);
      setTheme(newTheme);
    }
  };

  const handleSelectDocument = async (docId: string) => {
    if (editorServiceRef.current && containerRef.current) {
      setActiveDocId(docId);
      await editorServiceRef.current.loadDocument(docId, containerRef.current);
      setDocTitle(editorServiceRef.current.currentEngine.getTitle() || 'Untitled');
      setMode(editorServiceRef.current.activeMode);
      refreshDocList();
    }
  };

  const handleCreateNewDoc = async () => {
    if (editorServiceRef.current && containerRef.current) {
      const newDoc = await editorServiceRef.current.createNewDocument(containerRef.current, 'New Workspace Note');
      setActiveDocId(newDoc.id);
      setDocTitle(newDoc.title);
      refreshDocList();
    }
  };

  const handleDeleteDoc = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (documents.length <= 1) {
      alert('Cannot delete the last document.');
      return;
    }
    if (editorServiceRef.current) {
      await editorServiceRef.current.deleteDocument(docId);
      const remaining = await editorServiceRef.current.getDocumentList();
      setDocuments(remaining);
      if (activeDocId === docId && remaining.length > 0 && containerRef.current) {
        handleSelectDocument(remaining[0].id);
      }
    }
  };

  const handleRunAI = async (commandType: 'summarize' | 'expand' | 'rewrite' | 'fix_grammar' | 'custom') => {
    if (!editorServiceRef.current) return;
    setAiLoading(true);
    setAiResultText('');
    
    const context = await editorServiceRef.current.currentEngine.getSelectedText();

    const result = await editorServiceRef.current.runAICommand({
      prompt: aiPrompt || `Action: ${commandType}`,
      commandType,
      contextText: context
    });

    setAiLoading(false);
    if (result.success && result.resultText) {
      setAiResultText(result.resultText);
    }
  };

  const handleExport = async (format: 'markdown' | 'json' | 'html') => {
    if (!editorServiceRef.current) return;
    const data = await editorServiceRef.current.exportActiveDocument(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '_')}_export.${format === 'markdown' ? 'md' : format}`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const handleImportSubmit = async () => {
    if (!editorServiceRef.current || !importText) return;
    await editorServiceRef.current.importToActiveDocument(importText, 'markdown');
    setImportText('');
    setIsImportOpen(false);
  };

  return (
    <div className="flex flex-col h-full min-h-[650px] w-full bg-skel-charcoal/30 border border-skel-metal/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header / Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-skel-charcoal/80 border-b border-skel-metal/20 shrink-0">
        <div className="flex items-center gap-2 min-w-[200px] flex-1">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg bg-skel-metal/10 hover:bg-skel-metal/20 text-skel-cloud transition-colors"
            title="Toggle Documents Sidebar"
          >
            <Layers size={18} />
          </button>

          <input 
            type="text" 
            value={docTitle}
            onChange={handleTitleChange}
            placeholder="Document Title..."
            className="bg-transparent text-pure-white font-semibold text-base sm:text-lg focus:outline-none border-b border-transparent focus:border-focus-neon/50 px-1 py-0.5 w-full max-w-xs transition-colors"
          />

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-focus-neon/10 text-focus-neon border border-focus-neon/20">
            {isSaved ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <RefreshCw size={12} className="animate-spin text-amber-400" />
                <span>Saving...</span>
              </>
            )}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Page vs Edgeless Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-skel-metal/15 border border-skel-metal/20">
            <button
              onClick={() => handleModeSwitch('page')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'page' 
                  ? 'bg-focus-main text-pure-white shadow-md' 
                  : 'text-skel-cloud hover:text-pure-white'
              }`}
            >
              <FileText size={14} />
              <span>Page Mode</span>
            </button>
            <button
              onClick={() => handleModeSwitch('edgeless')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                mode === 'edgeless' 
                  ? 'bg-focus-main text-pure-white shadow-md' 
                  : 'text-skel-cloud hover:text-pure-white'
              }`}
            >
              <Layout size={14} />
              <span>Edgeless Mode</span>
            </button>
          </div>

          {/* AI Copilot Toggle */}
          <button
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isAIPanelOpen 
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                : 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
            }`}
          >
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Export / Import Dropdown Controls */}
          <div className="relative flex items-center gap-1">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="p-2 rounded-xl bg-skel-metal/10 hover:bg-skel-metal/20 text-skel-cloud transition-colors"
              title="Export Document"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setIsImportOpen(!isImportOpen)}
              className="p-2 rounded-xl bg-skel-metal/10 hover:bg-skel-metal/20 text-skel-cloud transition-colors"
              title="Import Content"
            >
              <Upload size={16} />
            </button>

            {/* Export Menu */}
            {isExportOpen && (
              <div className="absolute right-0 top-10 w-44 bg-skel-charcoal border border-skel-metal/30 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-skel-cloud/60 px-2 py-1">Export As</span>
                <button 
                  onClick={() => handleExport('markdown')} 
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-skel-metal/20 text-skel-cloud hover:text-pure-white text-left"
                >
                  <FileText size={14} /> Markdown (.md)
                </button>
                <button 
                  onClick={() => handleExport('json')} 
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-skel-metal/20 text-skel-cloud hover:text-pure-white text-left"
                >
                  <FileCode size={14} /> Block Suite JSON (.json)
                </button>
                <button 
                  onClick={() => handleExport('html')} 
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-skel-metal/20 text-skel-cloud hover:text-pure-white text-left"
                >
                  <Layout size={14} /> HTML Document (.html)
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => handleThemeSwitch(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-skel-metal/10 hover:bg-skel-metal/20 text-skel-cloud transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Moon size={16} className="text-amber-300" /> : <Sun size={16} className="text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative min-h-[500px]">
        {/* Document List Sidebar */}
        {isSidebarOpen && (
          <div className="w-64 bg-skel-charcoal/90 border-r border-skel-metal/20 flex flex-col shrink-0 transition-all z-20">
            <div className="p-3 border-b border-skel-metal/20 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-skel-cloud/70 tracking-wider">Documents</span>
              <button
                onClick={handleCreateNewDoc}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-focus-main text-pure-white text-xs font-medium hover:bg-focus-main/90 transition-all"
              >
                <Plus size={14} /> New
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                    doc.id === activeDocId
                      ? 'bg-focus-main/20 text-focus-neon border border-focus-neon/30'
                      : 'text-skel-cloud/80 hover:bg-skel-metal/10 hover:text-pure-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText size={14} className="shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteDoc(e, doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity"
                    title="Delete document"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Assistant Drawer Panel */}
        {isAIPanelOpen && (
          <div className="w-80 bg-skel-charcoal/95 border-r border-purple-500/20 p-4 flex flex-col gap-3 shrink-0 z-30 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                <Wand2 size={16} />
                <span>BlockSuite AI Copilot</span>
              </div>
              <button 
                onClick={() => setIsAIPanelOpen(false)}
                className="text-skel-cloud hover:text-pure-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-skel-cloud/70">
              Select text in the editor or type a instruction below to transform your document notes.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRunAI('summarize')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium text-left flex items-center gap-1.5 transition-all"
              >
                <Sparkles size={12} /> Summarize
              </button>
              <button
                onClick={() => handleRunAI('expand')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium text-left flex items-center gap-1.5 transition-all"
              >
                <ChevronRight size={12} /> Expand
              </button>
              <button
                onClick={() => handleRunAI('fix_grammar')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium text-left flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 size={12} /> Fix Grammar
              </button>
              <button
                onClick={() => handleRunAI('rewrite')}
                disabled={aiLoading}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium text-left flex items-center gap-1.5 transition-all"
              >
                <RefreshCw size={12} /> Rewrite
              </button>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs text-skel-cloud/80 font-medium">Custom AI Prompt:</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Turn this note into a 3-step actionable strategy..."
                className="w-full h-20 p-2.5 rounded-xl bg-skel-metal/15 border border-skel-metal/30 text-pure-white text-xs focus:outline-none focus:border-purple-500/50 resize-none"
              />
              <button
                onClick={() => handleRunAI('custom')}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full py-2 rounded-xl bg-purple-600 text-pure-white text-xs font-semibold hover:bg-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                <span>Generate Content</span>
              </button>
            </div>

            {aiResultText && (
              <div className="mt-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                <span className="font-bold block mb-1 text-purple-300">Generated Result:</span>
                <p className="whitespace-pre-wrap leading-relaxed">{aiResultText}</p>
              </div>
            )}
          </div>
        )}

        {/* Import Modal Overlay */}
        {isImportOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-skel-charcoal border border-skel-metal/30 rounded-2xl max-w-lg w-full p-5 flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-skel-metal/20 pb-3">
                <h3 className="text-pure-white font-bold text-sm flex items-center gap-2">
                  <Upload size={16} className="text-focus-neon" /> Import Document Text
                </h3>
                <button onClick={() => setIsImportOpen(false)} className="text-skel-cloud hover:text-pure-white text-xs">✕</button>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste Markdown or text to import into current document..."
                className="w-full h-40 p-3 rounded-xl bg-skel-metal/10 border border-skel-metal/30 text-pure-white text-xs focus:outline-none focus:border-focus-neon resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 rounded-xl bg-skel-metal/10 text-skel-cloud text-xs hover:bg-skel-metal/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={!importText.trim()}
                  className="px-4 py-2 rounded-xl bg-focus-main text-pure-white text-xs font-semibold hover:bg-focus-main/90 transition-all disabled:opacity-50"
                >
                  Import Content
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BlockSuite Host DOM Canvas Container */}
        <div className="flex-1 h-full w-full relative bg-skel-charcoal/20 overflow-auto">
          <div 
            ref={containerRef} 
            className="w-full h-full min-h-[500px] flex flex-col focus:outline-none" 
            style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
          />
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-1.5 bg-skel-charcoal/90 border-t border-skel-metal/20 text-[11px] text-skel-cloud/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span>Engine: <strong className="text-pure-white">BlockSuite 0.19.5</strong></span>
          <span>Mode: <strong className="text-focus-neon capitalize">{mode}</strong></span>
          <span>Status: <strong className="text-pure-white">{statusText}</strong></span>
        </div>
        <div>
          <span>Decoupled Adapter Architecture</span>
        </div>
      </div>
    </div>
  );
};
