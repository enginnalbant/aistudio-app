import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookText, 
  FolderPlus, 
  FilePlus, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  Loader2, 
  ArrowLeft, 
  Clock, 
  BookOpen,
  Maximize2,
  Minimize2,
  Save,
  Link2,
  Globe,
  ExternalLink,
  Bold,
  Italic,
  Heading,
  Code,
  List,
  Quote,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy
} from 'firebase/firestore';

interface Notebook {
  id: string;
  title: string;
  color: 'amber' | 'rose' | 'emerald' | 'blue' | 'violet';
  createdAt: string;
}

interface SubPage {
  id: string;
  notebookId: string;
  title: string;
  createdAt: string;
}

interface WebLink {
  title: string;
  url: string;
}

interface NotebookNote {
  id: string;
  pageId: string;
  notebookId: string;
  title: string;
  content: string;
  links?: WebLink[];
  createdAt: string;
  updatedAt: string;
}

const COLOR_MAP = {
  amber: {
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    accent: 'bg-amber-500',
    ring: 'focus-within:ring-amber-500/30'
  },
  rose: {
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    accent: 'bg-rose-500',
    ring: 'focus-within:ring-rose-500/30'
  },
  emerald: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    accent: 'bg-emerald-500',
    ring: 'focus-within:ring-emerald-500/30'
  },
  blue: {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    accent: 'bg-blue-500',
    ring: 'focus-within:ring-blue-500/30'
  },
  violet: {
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    accent: 'bg-violet-500',
    ring: 'focus-within:ring-violet-500/30'
  }
};

export function NotesNotebook() {
  const { user } = useAuth();

  // Firestore Collections State
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [pages, setPages] = useState<SubPage[]>([]);
  const [notes, setNotes] = useState<NotebookNote[]>([]);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);

  // Selection states
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Expand states for Defter tree
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());

  // Creation/Edit Dialog States
  const [isAddingNotebook, setIsAddingNotebook] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState<'amber' | 'rose' | 'emerald' | 'blue' | 'violet'>('amber');

  const [isAddingPage, setIsAddingPage] = useState<string | null>(null); // holds notebookId if adding
  const [newPageTitle, setNewPageTitle] = useState('');

  // Active Editor state
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  
  // Web Links state for current note
  const [noteLinks, setNoteLinks] = useState<WebLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Status Indicators
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Textarea ref for inserting formatting markdown tags
  const writingAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save timer reference
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Real-time synchronization
  useEffect(() => {
    if (!user) {
      setNotebooks([]);
      setPages([]);
      setNotes([]);
      setIsLoading(false);
      return;
    }

    const notebooksQuery = query(collection(db, 'users', user.uid, 'notebooks'), orderBy('createdAt', 'desc'));
    const pagesQuery = query(collection(db, 'users', user.uid, 'pages'), orderBy('createdAt', 'asc'));
    const notesQuery = query(collection(db, 'users', user.uid, 'notebook_notes'), orderBy('updatedAt', 'desc'));

    setIsLoading(true);

    const unsubNotebooks = onSnapshot(notebooksQuery, (snap) => {
      const list: Notebook[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || 'Başlıksız Defter',
          color: data.color || 'amber',
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      setNotebooks(list);
      // Auto-expand first notebook if selected notebook empty
      if (list.length > 0 && !selectedNotebookId) {
        setSelectedNotebookId(list[0].id);
        setExpandedNotebooks(new Set([list[0].id]));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notebooks'));

    const unsubPages = onSnapshot(pagesQuery, (snap) => {
      const list: SubPage[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          notebookId: data.notebookId || '',
          title: data.title || 'Başlıksız Sayfa',
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      setPages(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pages'));

    const unsubNotes = onSnapshot(notesQuery, (snap) => {
      const list: NotebookNote[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          pageId: data.pageId || '',
          notebookId: data.notebookId || '',
          title: data.title || '',
          content: data.content || '',
          links: Array.isArray(data.links) ? data.links : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });
      setNotes(list);
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notebook_notes'));

    return () => {
      unsubNotebooks();
      unsubPages();
      unsubNotes();
    };
  }, [user]);

  // Load selected Note into Editor states
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (activeNote) {
      setEditorTitle(activeNote.title);
      setEditorContent(activeNote.content);
      setNoteLinks(activeNote.links || []);
    } else {
      setEditorTitle('');
      setEditorContent('');
      setNoteLinks([]);
    }
  }, [selectedNoteId, activeNote]);

  // Selected Page notes list helper
  const activePageNotes = useMemo(() => {
    if (!selectedPageId) return [];
    return notes.filter(n => n.pageId === selectedPageId);
  }, [notes, selectedPageId]);

  // Filter page sub-items per notebook
  const getPagesForNotebook = (notebookId: string) => {
    return pages.filter(p => p.notebookId === notebookId);
  };

  // Toggle Notebook Expand
  const toggleNotebookExpand = (id: string) => {
    setExpandedNotebooks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedNotebookId(id);
  };

  // Add Notebook Action
  const handleAddNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newNotebookTitle.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'notebooks'), {
        title: newNotebookTitle.trim(),
        color: newNotebookColor,
        createdAt: new Date().toISOString()
      });

      setSelectedNotebookId(docRef.id);
      setExpandedNotebooks(prev => new Set(prev).add(docRef.id));
      setNewNotebookTitle('');
      setIsAddingNotebook(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Add SubPage Action
  const handleAddPage = async (notebookId: string) => {
    if (!user || !newPageTitle.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'pages'), {
        notebookId,
        title: newPageTitle.trim(),
        createdAt: new Date().toISOString()
      });

      setSelectedPageId(docRef.id);
      setNewPageTitle('');
      setIsAddingPage(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Empty Note Action inside Selected Page
  const handleCreateNote = async () => {
    if (!user || !selectedPageId || !selectedNotebookId) return;

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'notebook_notes'), {
        notebookId: selectedNotebookId,
        pageId: selectedPageId,
        title: 'Başlıksız Not',
        content: '',
        links: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setSelectedNoteId(docRef.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-Save or Manual Save Note Change handler
  const saveNoteChanges = async (titleVal: string, contentVal: string, linksVal?: WebLink[]) => {
    if (!user || !selectedNoteId || !activeNote) return;
    setIsSaving(true);
    try {
      const linksToSave = linksVal !== undefined ? linksVal : noteLinks;
      await updateDoc(doc(db, 'users', user.uid, 'notebook_notes', selectedNoteId), {
        title: titleVal,
        content: contentVal,
        links: linksToSave,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle keyup / change in editor
  const handleEditorChange = (field: 'title' | 'content', val: string) => {
    let nextTitle = editorTitle;
    let nextContent = editorContent;

    if (field === 'title') {
      setEditorTitle(val);
      nextTitle = val;
    } else {
      setEditorContent(val);
      nextContent = val;
    }

    // Debounce Save to Firestore
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(() => {
      saveNoteChanges(nextTitle, nextContent);
    }, 1200); // Save after 1.2s of inactivity
  };

  // Force Save Immediately
  const forceSaveNote = () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    saveNoteChanges(editorTitle, editorContent);
  };

  // Clean-up timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  // Rich Formatting Tool logic
  const insertFormat = (formatType: 'bold' | 'italic' | 'heading' | 'code' | 'bullet' | 'todo' | 'link' | 'quote') => {
    if (!writingAreaRef.current) return;
    const textarea = writingAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let formatted = '';
    let cursorOffset = 0;

    switch (formatType) {
      case 'bold':
        formatted = `**${selected || 'kalın'}**`;
        cursorOffset = selected ? formatted.length : 2;
        break;
      case 'italic':
        formatted = `*${selected || 'italik'}*`;
        cursorOffset = selected ? formatted.length : 1;
        break;
      case 'heading':
        formatted = `\n### ${selected || 'Alt Başlık'}\n`;
        cursorOffset = formatted.length;
        break;
      case 'code':
        formatted = `\`\`\`\n${selected || 'kod bloğu'}\n\`\`\``;
        cursorOffset = formatted.length;
        break;
      case 'bullet':
        formatted = `\n- ${selected || 'Madde'}`;
        cursorOffset = formatted.length;
        break;
      case 'todo':
        formatted = `\n- [ ] ${selected || 'Görev'}`;
        cursorOffset = formatted.length;
        break;
      case 'quote':
        formatted = `\n> ${selected || 'Alıntı'}`;
        cursorOffset = formatted.length;
        break;
      case 'link':
        formatted = `[${selected || 'Bağlantı Başlığı'}](https://site.com)`;
        cursorOffset = selected ? formatted.length : 1;
        break;
    }

    const newContent = text.substring(0, start) + formatted + text.substring(end);
    setEditorContent(newContent);
    
    // Trigger auto-save debouncer
    handleEditorChange('content', newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 50);
  };

  // Web Links List Manager methods
  const handleAddWebLink = () => {
    if (!newLinkUrl.trim()) return;
    const title = newLinkTitle.trim() || 'Kaynak Referansı';
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const updated = [...noteLinks, { title, url }];
    setNoteLinks(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');

    // Save immediately to Firestore
    saveNoteChanges(editorTitle, editorContent, updated);
  };

  const handleDeleteWebLink = (index: number) => {
    const updated = noteLinks.filter((_, idx) => idx !== index);
    setNoteLinks(updated);
    saveNoteChanges(editorTitle, editorContent, updated);
  };

  // AI Assistant action trigger (Polish, Summarize, Expand, Extracted tasks)
  const handleAiAssistantAction = async (action: 'polish' | 'summarize' | 'expand' | 'extract-todos' | 'extract-links' | 'tone-professional' | 'tone-casual') => {
    if (!editorContent.trim()) {
      setAiFeedback('Lütfen asistanı çağırmadan önce not içeriğine bir şeyler yazın.');
      setTimeout(() => setAiFeedback(null), 3000);
      return;
    }

    setIsAiProcessing(true);
    setAiFeedback('Yapay zeka asistanı işlem yapıyor...');

    try {
      const res = await fetch('/api/notes/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: editorContent })
      });

      if (!res.ok) throw new Error('API assistant query failed');
      const data = await res.json();

      if (action === 'extract-todos') {
        try {
          const parsedTodos = JSON.parse(data.result);
          if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
            // Append as todo checklist markdown elements to text
            const todoMarkdown = '\n\n### Yapılacak İşler Listesi (AI):\n' + parsedTodos.map(t => `- [ ] ${t}`).join('\n');
            const newContent = editorContent + todoMarkdown;
            setEditorContent(newContent);
            saveNoteChanges(editorTitle, newContent);
            setAiFeedback('Yapılacaklar saptandı ve notun sonuna eklendi!');
          } else {
            setAiFeedback('Metinde herhangi bir görev/yapılacak iş bulunamadı.');
          }
        } catch {
          // Standard text append fallback
          const newContent = editorContent + `\n\n### Yapılacaklar:\n${data.result}`;
          setEditorContent(newContent);
          saveNoteChanges(editorTitle, newContent);
          setAiFeedback('İşlem tamamlandı!');
        }
      } else if (action === 'extract-links') {
        try {
          // Clean possible JSON markers
          let cleanJson = data.result.trim();
          if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
          if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
          cleanJson = cleanJson.trim();

          const parsedLinks = JSON.parse(cleanJson);
          if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
            const addedLinks = parsedLinks.map(l => ({ title: l.title || 'Web Kaynağı', url: l.url || '' }));
            const nextLinks = [...noteLinks, ...addedLinks];
            setNoteLinks(nextLinks);
            saveNoteChanges(editorTitle, editorContent, nextLinks);
            setAiFeedback(`${addedLinks.length} adet web linki başarıyla ayıklandı ve panele eklendi!`);
          } else {
            setAiFeedback('Metinde web bağlantısı bulunamadı.');
          }
        } catch (jsonErr) {
          console.warn(jsonErr);
          setAiFeedback('Bağlantı ayıklama işlemi başarısız oldu.');
        }
      } else {
        // Standard text replacement (polish, summarize, expand, tones)
        if (data.result) {
          setEditorContent(data.result);
          saveNoteChanges(editorTitle, data.result);
          setAiFeedback('Metin başarıyla güncellendi!');
        }
      }
    } catch (err) {
      console.error(err);
      setAiFeedback('Yapay zeka yanıt veremedi. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => setAiFeedback(null), 3000);
    }
  };

  // Delete handlers
  const handleDeleteNotebook = async (notebookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm('Bu defteri ve altındaki tüm sayfaları silmek istediğinize emin misiniz?')) return;

    try {
      // 1. Delete Notebook
      await deleteDoc(doc(db, 'users', user.uid, 'notebooks', notebookId));
      
      // 2. Cascade delete pages & notes in background (Firebase does not have cascades, delete from client)
      pages.filter(p => p.notebookId === notebookId).forEach(async (p) => {
        await deleteDoc(doc(db, 'users', user.uid, 'pages', p.id));
      });
      notes.filter(n => n.notebookId === notebookId).forEach(async (n) => {
        await deleteDoc(doc(db, 'users', user.uid, 'notebook_notes', n.id));
      });

      if (selectedNotebookId === notebookId) {
        setSelectedNotebookId(null);
        setSelectedPageId(null);
        setSelectedNoteId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm('Bu alt sayfayı ve içindeki tüm notları silmek istediğinize emin misiniz?')) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'pages', pageId));
      notes.filter(n => n.pageId === pageId).forEach(async (n) => {
        await deleteDoc(doc(db, 'users', user.uid, 'notebook_notes', n.id));
      });

      if (selectedPageId === pageId) {
        setSelectedPageId(null);
        setSelectedNoteId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notebook_notes', noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Counters
  const wordCount = useMemo(() => {
    return editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
  }, [editorContent]);

  const charCount = editorContent.length;

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200)); // ~200 words per minute average
  }, [wordCount]);

  // Get active notebook style
  const activeNotebookColor = useMemo(() => {
    if (!selectedNotebookId) return COLOR_MAP.amber;
    const activeNb = notebooks.find(n => n.id === selectedNotebookId);
    return activeNb ? COLOR_MAP[activeNb.color] : COLOR_MAP.amber;
  }, [notebooks, selectedNotebookId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-text-primary">
      
      {/* Top Main Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 px-2 pt-2 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-black text-text-primary mb-1 flex items-center gap-3">
            <BookText className="text-amber-500 shrink-0" size={28} />
            Not Defteri
          </h1>
          <p className="text-text-secondary text-xs">
            Düşüncelerinizi defterler, hiyerarşik alt sayfalar, akıllı asistan araçları ve zengin web bağlantı yönetim sistemleri ile organize edin.
          </p>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 pt-6 overflow-hidden min-h-0">
        
        {/* PANEL 1 & 2 combined: Notebooks Tree Navigation */}
        <div className={`w-full lg:w-80 shrink-0 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col p-4 overflow-y-auto ${isFullscreen ? 'hidden' : 'block'}`}>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary/70">Kitaplığım</span>
            
            <button
              onClick={() => setIsAddingNotebook(true)}
              className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-1"
            >
              <FolderPlus size={12} />
              Yeni Defter
            </button>
          </div>

          {/* New Notebook Inline Form */}
          <AnimatePresence>
            {isAddingNotebook && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddNotebook}
                className="bg-black/40 border border-white/10 rounded-xl p-3 mb-4 space-y-3 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-text-secondary uppercase">Defter Özellikleri</span>
                  <button type="button" onClick={() => setIsAddingNotebook(false)} className="text-text-secondary hover:text-text-primary">
                    <X size={12} />
                  </button>
                </div>
                
                <input
                  type="text"
                  required
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  placeholder="Defter ismi..."
                  className="w-full bg-black/40 border border-white/5 focus:border-amber-500/30 outline-none rounded-lg px-2.5 py-1.5 text-xs text-text-primary transition-colors"
                />

                <div className="flex gap-2 justify-between items-center">
                  <div className="flex gap-1.5">
                    {(['amber', 'rose', 'emerald', 'blue', 'violet'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewNotebookColor(c)}
                        className={`w-3.5 h-3.5 rounded-full ${COLOR_MAP[c].accent} border transition-all ${
                          newNotebookColor === c ? 'scale-110 border-white' : 'opacity-40 border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded"
                  >
                    Oluştur
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Real-time Notebook lists */}
          <div className="space-y-2">
            {isLoading && notebooks.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-text-secondary/40 gap-2">
                <Loader2 size={12} className="animate-spin text-amber-500" />
                <span className="text-[10px] font-mono uppercase">Veriler yükleniyor...</span>
              </div>
            ) : notebooks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                <BookOpen className="mx-auto text-text-secondary/20 mb-2" size={24} />
                <p className="text-[10px] text-text-secondary/50 font-mono uppercase">Defter Bulunmuyor</p>
              </div>
            ) : (
              notebooks.map((nb) => {
                const style = COLOR_MAP[nb.color];
                const isExpanded = expandedNotebooks.has(nb.id);
                const isSelected = selectedNotebookId === nb.id;
                const notebookPages = getPagesForNotebook(nb.id);

                return (
                  <div key={nb.id} className="space-y-1">
                    {/* Notebook Folder Row */}
                    <div
                      onClick={() => toggleNotebookExpand(nb.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected 
                          ? `${style.bg} ${style.border} text-text-primary` 
                          : 'bg-transparent border-transparent hover:bg-white/[0.02] text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-text-secondary" />
                        ) : (
                          <ChevronRight size={14} className="text-text-secondary" />
                        )}
                        <BookText size={15} className={style.text} />
                        <span className="text-xs font-bold truncate">{nb.title}</span>
                      </div>

                      {/* Notebook action options */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingPage(nb.id);
                            setExpandedNotebooks(prev => new Set(prev).add(nb.id));
                          }}
                          className="p-1 hover:bg-white/5 text-text-secondary hover:text-amber-400 rounded transition-colors"
                          title="Sayfa Ekle"
                        >
                          <FilePlus size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNotebook(nb.id, e)}
                          className="p-1 hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 rounded transition-colors"
                          title="Defteri Sil"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Page Add Row */}
                    <AnimatePresence>
                      {isAddingPage === nb.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-8 pr-2 py-1.5"
                        >
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="text"
                              required
                              autoFocus
                              value={newPageTitle}
                              onChange={(e) => setNewPageTitle(e.target.value)}
                              placeholder="Sayfa ismi..."
                              className="flex-1 bg-black/40 border border-white/5 focus:border-amber-500/30 outline-none rounded-lg px-2.5 py-1 text-[11px] text-text-primary"
                            />
                            <button
                              onClick={() => handleAddPage(nb.id)}
                              className="p-1.5 bg-emerald-500 text-black rounded hover:bg-emerald-400 transition-colors"
                            >
                              <Check size={11} />
                            </button>
                            <button
                              onClick={() => setIsAddingPage(null)}
                              className="p-1.5 bg-white/[0.05] rounded text-text-secondary hover:text-text-primary"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Sub-Pages List tree */}
                    {isExpanded && (
                      <div className="pl-6 space-y-1.5 border-l border-white/5 ml-4 pb-1">
                        {notebookPages.length === 0 ? (
                          <p className="text-[10px] text-text-secondary/30 italic pl-3.5 py-1">Bu defter henüz boş.</p>
                        ) : (
                          notebookPages.map((page) => {
                            const isPageSelected = selectedPageId === page.id;
                            return (
                              <div
                                key={page.id}
                                onClick={() => {
                                  setSelectedPageId(page.id);
                                  setSelectedNotebookId(nb.id);
                                  // Auto select first note in page if any
                                  const pageNotes = notes.filter(n => n.pageId === page.id);
                                  if (pageNotes.length > 0) {
                                    setSelectedNoteId(pageNotes[0].id);
                                  } else {
                                    setSelectedNoteId(null);
                                  }
                                }}
                                className={`group/page flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                  isPageSelected
                                    ? 'bg-white/[0.04] text-text-primary font-semibold'
                                    : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.01]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText size={13} className="text-text-secondary/60" />
                                  <span className="text-[11px] truncate">{page.title}</span>
                                </div>
                                
                                <button
                                  onClick={(e) => handleDeletePage(page.id, e)}
                                  className="p-1 opacity-0 group-hover/page:opacity-100 hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 rounded transition-all shrink-0"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 3: Selected Sub-Page's Notes lists */}
        {selectedPageId ? (
          <div className={`w-full lg:w-72 shrink-0 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col p-4 overflow-hidden ${isFullscreen ? 'hidden' : 'block'}`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary/70">
                Notlar ({activePageNotes.length})
              </span>
              <button
                onClick={handleCreateNote}
                className="p-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-mono font-bold uppercase px-2 py-1 flex items-center gap-1 transition-all"
              >
                <Plus size={11} />
                Yeni Not
              </button>
            </div>

            {/* List Notes of Page */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {activePageNotes.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-black/20">
                  <FileText className="mx-auto text-text-secondary/20 mb-2" size={24} />
                  <p className="text-[10px] text-text-secondary/40 font-mono uppercase">Sayfa Boş</p>
                  <button
                    onClick={handleCreateNote}
                    className="text-[10px] text-amber-400 hover:underline font-bold mt-2"
                  >
                    İlk Notu Ekle
                  </button>
                </div>
              ) : (
                activePageNotes.map((note) => {
                  const isNoteSelected = selectedNoteId === note.id;
                  const snippet = note.content ? note.content.substring(0, 75) + (note.content.length > 75 ? '...' : '') : 'Boş not içeriği...';
                  
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`group/note flex flex-col p-3 rounded-xl cursor-pointer border transition-all relative ${
                        isNoteSelected
                          ? `${activeNotebookColor.bg} ${activeNotebookColor.border} text-text-primary shadow-md`
                          : 'bg-black/10 border-white/[0.02] hover:bg-black/20 hover:border-white/5 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold truncate flex-1">{note.title || 'Başlıksız Not'}</h4>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 opacity-0 group-hover/note:opacity-100 hover:bg-rose-500/15 text-text-secondary hover:text-rose-400 rounded transition-all shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-text-secondary/60 mt-1 line-clamp-2 leading-relaxed">
                        {snippet}
                      </p>

                      <div className="flex items-center gap-1 text-[9px] font-mono text-text-secondary/30 mt-3.5">
                        <Clock size={9} />
                        <span>{new Date(note.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className={`w-full lg:w-72 shrink-0 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col p-4 items-center justify-center text-center ${isFullscreen ? 'hidden' : 'block'}`}>
            <BookOpen size={28} className="text-text-secondary/20 mb-2" />
            <span className="text-[10px] font-mono uppercase text-text-secondary/40">Sayfa Seçilmedi</span>
          </div>
        )}

        {/* PANEL 4: Main immersive Editor Workspace Canvas */}
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden relative shadow-inner">
          {activeNote ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Editor Header Tools */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 p-4 shrink-0 bg-black/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${activeNotebookColor.accent} animate-pulse`} />
                  <span className="text-[10px] font-mono font-bold text-text-secondary/80 uppercase">
                    {isSaving ? 'Bulut Senkronizasyonu Aktif...' : 'Tüm Değişiklikler Kaydedildi'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={forceSaveNote}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Şimdi Kaydet"
                  >
                    <Save size={14} />
                    Kaydet
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary hover:text-text-primary transition-all hidden lg:flex items-center gap-1 text-xs"
                    title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekrana Al'}
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {isFullscreen ? 'Küçült' : 'Tam Ekran'}
                  </button>
                </div>
              </div>

              {/* WRITING AND INTERACTIVE ASST TOOLS BAR */}
              <div className="border-b border-white/5 px-6 py-2.5 bg-black/20 flex flex-wrap gap-4 items-center justify-between">
                
                {/* TOOL 1: Formatting toolbar (Insert Markdown tags at cursor) */}
                <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-lg">
                  <button
                    onClick={() => insertFormat('bold')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="Kalın"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    onClick={() => insertFormat('italic')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="İtalik"
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    onClick={() => insertFormat('heading')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="Alt Başlık"
                  >
                    <Heading size={13} />
                  </button>
                  <button
                    onClick={() => insertFormat('code')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="Kod Bloğu"
                  >
                    <Code size={13} />
                  </button>
                  <button
                    onClick={() => insertFormat('bullet')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="Madde Listesi"
                  >
                    <List size={13} />
                  </button>
                  <button
                    onClick={() => insertFormat('todo')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="Yapılacak Kutusu"
                  >
                    <CheckSquare size={13} />
                  </button>
                  <button
                    onClick={() => insertFormat('quote')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="Alıntı Ekle"
                  >
                    <Quote size={13} />
                  </button>
                  <button
                    onClick={() => insertFormat('link')}
                    className="p-1.5 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                    title="Web Bağlantısı Ekle"
                  >
                    <Link2 size={13} />
                  </button>
                </div>

                {/* TOOL 2: Intelligent AI Wizard Toolbar dropdowns */}
                <div className="flex items-center gap-1.5">
                  {isAiProcessing && (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 animate-pulse mr-2">
                      <Loader2 size={11} className="animate-spin" />
                      Gemini Çalışıyor
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1 bg-amber-500/5 border border-amber-500/15 p-1 rounded-lg">
                    <button
                      onClick={() => handleAiAssistantAction('polish')}
                      disabled={isAiProcessing || !editorContent.trim()}
                      className="px-2 py-1 text-[10px] font-sans font-bold text-amber-400 hover:bg-amber-500/10 rounded transition-colors disabled:opacity-40"
                      title="İmla hatalarını ve akıcılığı zeki bir şekilde düzeltir."
                    >
                      <Sparkles size={11} className="inline mr-1" />
                      Düzelt
                    </button>
                    <button
                      onClick={() => handleAiAssistantAction('summarize')}
                      disabled={isAiProcessing || !editorContent.trim()}
                      className="px-2 py-1 text-[10px] font-sans font-bold text-amber-400 hover:bg-amber-500/10 rounded transition-colors disabled:opacity-40"
                      title="Notun maddeler halinde profesyonel bir özetini çıkarır."
                    >
                      Özet Çıkar
                    </button>
                    <button
                      onClick={() => handleAiAssistantAction('expand')}
                      disabled={isAiProcessing || !editorContent.trim()}
                      className="px-2 py-1 text-[10px] font-sans font-bold text-amber-400 hover:bg-amber-500/10 rounded transition-colors disabled:opacity-40"
                      title="Yazılan taslak fikirleri derinleştirip ek maddeler ekler."
                    >
                      Genişlet
                    </button>
                    <button
                      onClick={() => handleAiAssistantAction('extract-todos')}
                      disabled={isAiProcessing || !editorContent.trim()}
                      className="px-2 py-1 text-[10px] font-sans font-bold text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-40"
                      title="Yazılardaki görevleri saptayıp checklist haline getirir."
                    >
                      Yapılacakları Bul
                    </button>
                    <button
                      onClick={() => handleAiAssistantAction('extract-links')}
                      disabled={isAiProcessing || !editorContent.trim()}
                      className="px-2 py-1 text-[10px] font-sans font-bold text-sky-400 hover:bg-sky-500/10 rounded transition-colors disabled:opacity-40"
                      title="Metinde geçen web linklerini saptar ve linkler tablosuna ekler."
                    >
                      Linkleri Çıkar
                    </button>
                  </div>
                </div>

              </div>

              {/* Editor Writing Areas */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                
                {/* Main Writing Sheets */}
                <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full border-r border-white/5">
                  {aiFeedback && (
                    <div className="text-[11px] font-mono bg-black/40 border border-amber-500/20 text-amber-400 p-2.5 rounded-xl text-center animate-pulse shrink-0">
                      {aiFeedback}
                    </div>
                  )}

                  {/* Note Title Input */}
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => handleEditorChange('title', e.target.value)}
                    placeholder="Başlıksız Not"
                    className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl font-display font-black tracking-tight text-text-primary placeholder:text-text-secondary/20 shrink-0"
                  />

                  {/* Content Editor Panel */}
                  <textarea
                    ref={writingAreaRef}
                    value={editorContent}
                    onChange={(e) => handleEditorChange('content', e.target.value)}
                    placeholder="Fikirlerinizi, kararlarınızı veya projelerinizi yazmaya başlayın. Yukarıdaki biçimlendirme araçlarını kullanabilir, ya da asistanı çağırıp metni saniyeler içinde zenginleştirebilirsiniz..."
                    className="w-full flex-1 bg-transparent border-none outline-none text-sm leading-relaxed text-text-primary/90 placeholder:text-text-secondary/20 resize-none font-sans min-h-[300px]"
                  />
                </div>

                {/* Right sidebar: Detailed Attached Web Links Manager */}
                <div className="w-full lg:w-72 shrink-0 bg-black/20 border-t lg:border-t-0 lg:border-l border-white/5 p-4 flex flex-col overflow-y-auto">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5 mb-3">
                    <Globe size={14} className="text-sky-400" />
                    <span className="text-[10px] font-mono font-bold text-text-secondary uppercase">Web Referansları ({noteLinks.length})</span>
                  </div>

                  {/* Manual add referans link */}
                  <div className="space-y-2 mb-4 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                    <input
                      type="text"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      placeholder="Başlık (örn: API Dokümantasyonu)"
                      className="w-full bg-black/40 border border-white/5 focus:border-sky-500/30 outline-none rounded-lg px-2.5 py-1.5 text-xs text-text-primary transition-all placeholder:text-text-secondary/30"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-black/40 border border-white/5 focus:border-sky-500/30 outline-none rounded-lg px-2.5 py-1 text-xs text-text-primary transition-all placeholder:text-text-secondary/30"
                      />
                      <button
                        onClick={handleAddWebLink}
                        disabled={!newLinkUrl.trim()}
                        className="px-2.5 bg-sky-500 text-black hover:bg-sky-400 rounded-lg text-xs font-bold transition-colors disabled:opacity-45"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>

                  {/* Links previews list */}
                  <div className="flex-1 space-y-2 max-h-60 lg:max-h-none overflow-y-auto">
                    {noteLinks.length === 0 ? (
                      <div className="text-center py-8 text-text-secondary/30 border border-dashed border-white/5 rounded-xl">
                        <Link2 className="mx-auto text-text-secondary/15 mb-1.5" size={18} />
                        <p className="text-[10px] font-mono uppercase">Bağlantı Yok</p>
                        <p className="text-[9px] text-text-secondary/40 max-w-[150px] mx-auto mt-1 leading-normal">Yukarıdan ekleyebilir veya Yapay Zeka ile yazınızdan süzebilirsiniz.</p>
                      </div>
                    ) : (
                      noteLinks.map((link, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col p-3 rounded-xl bg-black/35 border border-white/5 hover:border-sky-500/20 transition-all relative group/lnk"
                        >
                          <button
                            onClick={() => handleDeleteWebLink(idx)}
                            className="absolute top-2.5 right-2.5 opacity-0 group-hover/lnk:opacity-100 p-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-black rounded transition-all"
                            title="Bağlantıyı Kaldır"
                          >
                            <X size={10} />
                          </button>
                          
                          <div className="flex items-start gap-2 pr-4">
                            <Globe size={13} className="text-sky-400 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-[11px] font-bold text-text-primary truncate">{link.title}</h5>
                              <p className="text-[9px] font-mono text-text-secondary/40 truncate mt-0.5">{link.url}</p>
                            </div>
                          </div>

                          <div className="flex justify-end mt-2.5 border-t border-white/5 pt-2">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-mono font-bold text-sky-400 hover:underline flex items-center gap-1 transition-all"
                            >
                              Görüntüle
                              <ExternalLink size={8} />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Editor Footer Metrics */}
              <div className="border-t border-white/5 p-3 px-6 bg-black/15 shrink-0 flex flex-wrap justify-between items-center text-[10px] font-mono text-text-secondary/50">
                <div className="flex items-center gap-4">
                  <span>{wordCount} Kelime</span>
                  <span>{charCount} Karakter</span>
                  <span>{readingTime} Dk Okuma</span>
                </div>
                <div>
                  <span>Zeki Editör v2.0</span>
                </div>
              </div>

            </div>
          ) : (
            /* EMPTY STATE EDITOR SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-secondary/30">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl w-16 h-16 mx-auto" />
                <BookOpen size={42} className="text-text-secondary/20 relative z-10" />
              </div>
              <h3 className="text-xs font-bold uppercase font-mono tracking-widest mt-4 text-text-secondary/50">
                Lütfen Bir Not Seçin veya Yeni Bir Not Oluşturun
              </h3>
              <p className="text-[11px] text-text-secondary/30 max-w-xs mt-2 leading-relaxed">
                Soldaki kitaplık ağacından bir Defter ve bir Alt Sayfa seçerek notlarınızı yazmaya başlayabilir veya yeni bir not açabilirsiniz.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default NotesNotebook;
