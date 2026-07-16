import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, 
  Search, 
  Trash2, 
  Pin, 
  Check, 
  Plus, 
  Tag, 
  Sparkles, 
  Loader2, 
  X, 
  Square, 
  CheckSquare, 
  FileText,
  Bookmark,
  Link2,
  ExternalLink,
  Edit3,
  Heading,
  Bold,
  Italic,
  Code,
  List,
  Smile,
  Briefcase,
  Wand2,
  Settings,
  CornerDownRight,
  Globe,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface TodoItem {
  text: string;
  completed: boolean;
}

interface WebLink {
  title: string;
  url: string;
}

interface QuickNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: 'amber' | 'rose' | 'emerald' | 'blue' | 'violet';
  category: string;
  todoItems: TodoItem[];
  links: WebLink[];
  createdAt: string;
  isPinned?: boolean;
}

const COLOR_MAP = {
  amber: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/15',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    solid: 'bg-amber-500'
  },
  rose: {
    bg: 'bg-rose-500/10 hover:bg-rose-500/15',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    solid: 'bg-rose-500'
  },
  emerald: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    solid: 'bg-emerald-500'
  },
  blue: {
    bg: 'bg-blue-500/10 hover:bg-blue-500/15',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    solid: 'bg-blue-500'
  },
  violet: {
    bg: 'bg-violet-500/10 hover:bg-violet-500/15',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    solid: 'bg-violet-500'
  }
};

export function NotesQuick() {
  const { user } = useAuth();
  const [notes, setNotes] = useLocalStorage<QuickNote[]>('apex_quick_notes', []);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Genel');
  const [color, setColor] = useState<'amber' | 'rose' | 'emerald' | 'blue' | 'violet'>('amber');
  const [tagsInput, setTagsInput] = useState('');
  
  // Checklist State inside Creator
  const [todoInput, setTodoInput] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // Links State inside Creator
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [attachedLinks, setAttachedLinks] = useState<WebLink[]>([]);

  // Editing Note State
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editColor, setEditColor] = useState<'amber' | 'rose' | 'emerald' | 'blue' | 'violet'>('amber');
  const [editLinks, setEditLinks] = useState<WebLink[]>([]);
  const [editTodos, setEditTodos] = useState<TodoItem[]>([]);
  const [editTodoInput, setEditTodoInput] = useState('');
  const [editLinkTitle, setEditLinkTitle] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');

  // AI Wizard / Assistant States
  const [wizardMode, setWizardMode] = useState(false);
  const [wizardText, setWizardText] = useState('');
  const [isWizardLoading, setIsWizardLoading] = useState(false);
  const [wizardResult, setWizardResult] = useState<Partial<QuickNote> | null>(null);

  // Standard AI Assistants loading state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiFeedbackMessage, setAiFeedbackMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Textarea Ref for cursor selection formatting
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editContentTextareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => { setIsLoading(false); }, []);

  // Insert Rich Text Formatting
  const insertFormat = (formatType: 'bold' | 'italic' | 'heading' | 'code' | 'bullet' | 'todo' | 'link', isEdit = false) => {
    const ref = isEdit ? editContentTextareaRef : contentTextareaRef;
    if (!ref.current) return;

    const textarea = ref.current;
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
        formatted = `\n### ${selected || 'Başlık'}\n`;
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
        formatted = `\n- [ ] ${selected || 'Yapılacak iş'}`;
        cursorOffset = formatted.length;
        break;
      case 'link':
        formatted = `[${selected || 'Link Açıklaması'}](https://url.com)`;
        cursorOffset = selected ? formatted.length : 1;
        break;
    }

    const newContent = text.substring(0, start) + formatted + text.substring(end);
    if (isEdit) {
      setEditContent(newContent);
    } else {
      setContent(newContent);
    }

    // Set Focus back and position cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 50);
  };

  // Run AI Assistant Actions (Polish, Summarize, Tone changes)
  const handleAiAssistantAction = async (action: 'polish' | 'summarize' | 'expand' | 'tone-professional' | 'tone-casual', isEdit = false) => {
    const textToProcess = isEdit ? editContent : content;
    if (!textToProcess.trim()) {
      setAiFeedbackMessage('Lütfen önce not içeriğine bir şeyler yazın.');
      setTimeout(() => setAiFeedbackMessage(null), 3000);
      return;
    }

    setIsAiProcessing(true);
    setAiFeedbackMessage('Yapay zeka asistanı çalışıyor...');

    try {
      const res = await fetch('/api/notes/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: textToProcess })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      
      if (data.result) {
        if (isEdit) {
          setEditContent(data.result);
        } else {
          setContent(data.result);
        }
        setAiFeedbackMessage('İşlem başarıyla tamamlandı!');
      }
    } catch (err) {
      console.error(err);
      setAiFeedbackMessage('Asistan işlemi başarısız oldu.');
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => setAiFeedbackMessage(null), 3000);
    }
  };

  // Handle Standard Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() && !content.trim() && todos.length === 0 && attachedLinks.length === 0) return;

    try {
      const processedTags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const newNote = {
        title: title.trim() || 'Hızlı Not',
        content: content.trim(),
        tags: processedTags,
        color,
        category: category.trim() || 'Genel',
        todoItems: todos,
        links: attachedLinks,
        createdAt: new Date().toISOString(),
        isPinned: false
      };

      await addDoc(collection(db, 'users', user.uid, 'quick_notes'), newNote);
      
      // Reset Form
      setTitle('');
      setContent('');
      setCategory('Genel');
      setColor('amber');
      setTagsInput('');
      setTodos([]);
      setAttachedLinks([]);
      setLinkTitle('');
      setLinkUrl('');
    } catch (err) {
      console.error('Note add failed:', err);
    }
  };

  // Handle AI Wizard Analysis (Extracts title, summary, tags, categories, todos and links!)
  const handleAnalyzeWizard = async () => {
    if (!wizardText.trim()) return;
    setIsWizardLoading(true);
    setWizardResult(null);

    try {
      const res = await fetch('/api/notes/wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: wizardText })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      
      setWizardResult({
        title: data.title || 'Analiz Edilen Not',
        content: data.summary || wizardText,
        tags: data.tags || [],
        color: data.color || 'amber',
        category: data.category || 'Genel',
        todoItems: Array.isArray(data.todoItems) 
          ? data.todoItems.map((text: string) => ({ text, completed: false })) 
          : [],
        links: Array.isArray(data.extractedLinks) 
          ? data.extractedLinks.map((l: any) => ({ title: l.title || 'Web Kaynağı', url: l.url || '' }))
          : []
      });
    } catch (err) {
      console.error(err);
      setWizardResult({
        title: 'Hızlı Analiz',
        content: wizardText,
        tags: ['Fikir'],
        color: 'amber',
        category: 'Genel',
        todoItems: [],
        links: []
      });
    } finally {
      setIsWizardLoading(false);
    }
  };

  // Save AI Wizard Result
  const handleSaveWizardResult = async () => {
    if (!user || !wizardResult) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'quick_notes'), {
        title: wizardResult.title || 'Asistan Notu',
        content: wizardResult.content || '',
        tags: wizardResult.tags || [],
        color: wizardResult.color || 'amber',
        category: wizardResult.category || 'Genel',
        todoItems: wizardResult.todoItems || [],
        links: wizardResult.links || [],
        createdAt: new Date().toISOString(),
        isPinned: false
      });

      // Clear states
      setWizardText('');
      setWizardResult(null);
      setWizardMode(false);
    } catch (err) {
      console.error('Save wizard note failed:', err);
    }
  };

  // Handle Actionable functions for Notes
  const handleDeleteNote = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'quick_notes', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note: QuickNote) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'quick_notes', note.id), {
        isPinned: !note.isPinned
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTodo = async (note: QuickNote, index: number) => {
    if (!user) return;
    const updatedTodos = [...note.todoItems];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    
    try {
      await updateDoc(doc(db, 'users', user.uid, 'quick_notes', note.id), {
        todoItems: updatedTodos
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Create links dynamically in list
  const handleAddLinkItem = () => {
    if (!linkUrl.trim()) return;
    const title = linkTitle.trim() || 'Referans Bağlantısı';
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setAttachedLinks([...attachedLinks, { title, url }]);
    setLinkTitle('');
    setLinkUrl('');
  };

  // Edit Link Item List
  const handleAddEditLinkItem = () => {
    if (!editLinkUrl.trim()) return;
    const title = editLinkTitle.trim() || 'Referans Bağlantısı';
    let url = editLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setEditLinks([...editLinks, { title, url }]);
    setEditLinkTitle('');
    setEditLinkUrl('');
  };

  // Add Todo Item in Edit
  const handleAddEditTodoItem = () => {
    if (!editTodoInput.trim()) return;
    setEditTodos([...editTodos, { text: editTodoInput.trim(), completed: false }]);
    setEditTodoInput('');
  };

  // Inline checklist item helper inside creation
  const handleAddTodoItem = () => {
    if (!todoInput.trim()) return;
    setTodos([...todos, { text: todoInput.trim(), completed: false }]);
    setTodoInput('');
  };

  // Open Edit Note Mode
  const handleStartEdit = (note: QuickNote) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setEditTags(note.tags.join(', '));
    setEditColor(note.color);
    setEditLinks(note.links || []);
    setEditTodos(note.todoItems || []);
  };

  // Save Edit Note Changes to Firebase
  const handleSaveEdit = async () => {
    if (!user || !editingNote) return;
    try {
      const processedTags = editTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await updateDoc(doc(db, 'users', user.uid, 'quick_notes', editingNote.id), {
        title: editTitle.trim() || 'Hızlı Not',
        content: editContent.trim(),
        tags: processedTags,
        category: editCategory.trim() || 'Genel',
        color: editColor,
        links: editLinks,
        todoItems: editTodos,
        updatedAt: new Date().toISOString()
      });

      setEditingNote(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Get list of all unique tags for filter
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(t => set.add(t));
      }
    });
    return Array.from(set);
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let list = [...notes];
    
    // Text search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLocaleLowerCase('tr-TR');
      list = list.filter(n => 
        n.title.toLocaleLowerCase('tr-TR').includes(q) || 
        n.content.toLocaleLowerCase('tr-TR').includes(q) || 
        n.category.toLocaleLowerCase('tr-TR').includes(q)
      );
    }

    // Tag filter
    if (selectedTag) {
      list = list.filter(n => n.tags && n.tags.includes(selectedTag));
    }

    // Sort by Pin, then by date desc
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notes, searchQuery, selectedTag]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-text-primary">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 px-2 pt-2 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-black text-text-primary mb-1 flex items-center gap-3">
            <Zap className="text-amber-500 animate-pulse shrink-0" size={28} />
            Hızlı Notlar
          </h1>
          <p className="text-text-secondary text-xs">
            Aklınıza gelen fikirleri anında yakalayın, akıllı asistan ile saniyeler içinde yapılandırın ve web bağlantılarını yönetin.
          </p>
        </div>
        
        {/* Toggle Wizard and standard view buttons */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => setWizardMode(!wizardMode)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 border ${
              wizardMode 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary border-white/5'
            }`}
          >
            <Sparkles size={14} className={wizardMode ? 'animate-bounce' : ''} />
            {wizardMode ? 'Standart Moda Geç' : 'Akıllı Sihirbazı Aç'}
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 pt-6 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: Input Panels */}
        <div className="xl:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
          
          <AnimatePresence mode="wait">
            {wizardMode ? (
              /* SMART AI WIZARD PANEL */
              <motion.div
                key="ai-wizard"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-900/40 border border-amber-500/20 rounded-2xl p-5 space-y-4 backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <h3 className="text-sm font-bold tracking-tight text-amber-300 uppercase">Akıllı Sihirbaz</h3>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary/60 uppercase">Gemini-3.5 Destekli</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-text-secondary uppercase font-bold">Dağınık Düşünceleriniz ve Bağlantılar</label>
                  <textarea
                    value={wizardText}
                    onChange={(e) => setWizardText(e.target.value)}
                    placeholder="Örn: Hafta sonu araba bakımı yapılacak, motor yağı değişmeli, bujileri kontrol et ve filtreleri sipariş et. Bir de ofisteki projeyi pazartesiye yetiştirmem lazım. Şu linke de bak: https://example.com/bakim"
                    rows={5}
                    className="w-full bg-black/30 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl p-3 text-xs text-text-primary placeholder:text-text-secondary/40 leading-relaxed resize-none transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeWizard}
                    disabled={isWizardLoading || !wizardText.trim()}
                    className="flex-1 bg-amber-500 text-black hover:bg-amber-400 disabled:bg-amber-900/20 disabled:text-text-secondary/40 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                  >
                    {isWizardLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Analiz Ediliyor ve Bağlantılar Ayıklanıyor...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        Fikirleri & Bağlantıları Yapılandır
                      </>
                    )}
                  </button>
                  
                  {wizardText && (
                    <button
                      onClick={() => {
                        setWizardText('');
                        setWizardResult(null);
                      }}
                      className="px-3 bg-white/[0.03] hover:bg-white/[0.08] text-text-secondary border border-white/5 rounded-xl transition-all"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                {/* Wizard Results Visualizer */}
                {wizardResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 rounded-xl bg-black/40 p-4 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-amber-400 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded-full uppercase">
                          {wizardResult.category}
                        </span>
                        <h4 className="text-sm font-bold text-text-primary mt-1.5">{wizardResult.title}</h4>
                      </div>
                      
                      <div className="flex gap-1.5 bg-white/[0.02] p-1 border border-white/5 rounded-lg">
                        {(['amber', 'rose', 'emerald', 'blue', 'violet'] as const).map((c) => (
                          <button
                            key={c}
                            onClick={() => setWizardResult({ ...wizardResult, color: c })}
                            className={`w-3.5 h-3.5 rounded-full ${COLOR_MAP[c].solid} border transition-all ${
                              wizardResult.color === c ? 'scale-110 border-white ring-2 ring-amber-500/30' : 'opacity-40 border-transparent hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed bg-white/[0.01] p-2.5 rounded-lg border border-white/5 whitespace-pre-wrap">
                      {wizardResult.content}
                    </p>

                    {/* Checklists Suggested by AI */}
                    {wizardResult.todoItems && wizardResult.todoItems.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-text-secondary/70 uppercase">Oluşturulan Yapılacaklar</span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {wizardResult.todoItems.map((todo, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                              <CheckSquare size={13} className="text-amber-400 shrink-0" />
                              <span className="text-[11px] text-text-primary/90">{todo.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links Suggested by AI */}
                    {wizardResult.links && wizardResult.links.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-text-secondary/70 uppercase">Bulunan Bağlantılar</span>
                        <div className="space-y-1.5">
                          {wizardResult.links.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                              <Link2 size={13} className="text-sky-400 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-text-primary/90 truncate font-semibold">{link.title}</p>
                                <p className="text-[9px] text-text-secondary/50 truncate font-mono">{link.url}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Tags */}
                    {wizardResult.tags && wizardResult.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {wizardResult.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-white/[0.04] text-text-secondary px-2 py-1 rounded-md border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleSaveWizardResult}
                      className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                    >
                      <Check size={14} />
                      Notu Kitaplığıma Ekle
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* STANDARD ADD NOTE PANEL WITH RICH TOOLS */
              <motion.form
                key="standard-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleAddNote}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-sm relative"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-text-secondary" />
                    <h3 className="text-xs font-bold font-mono text-text-secondary uppercase">Gelişmiş Not Ekle</h3>
                  </div>
                  {isAiProcessing && (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
                      <Loader2 size={11} className="animate-spin" />
                      Yapay Zeka Çalışıyor
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Başlık</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Önemli Fikir vb."
                      className="w-full bg-black/20 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Kategori</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="İş, Plan, Yazılım..."
                      className="w-full bg-black/20 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors"
                    />
                  </div>
                </div>

                {/* RICH TEXT FORMATTING TOOLBAR */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">İçerik</label>
                    
                    {/* Rich text formatting action buttons */}
                    <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-lg shrink-0">
                      <button
                        type="button"
                        onClick={() => insertFormat('bold')}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                        title="Kalın"
                      >
                        <Bold size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('italic')}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                        title="İtalik"
                      >
                        <Italic size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('heading')}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                        title="Başlık Ekle"
                      >
                        <Heading size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('code')}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                        title="Kod Bloğu"
                      >
                        <Code size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('bullet')}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                        title="Madde Listesi"
                      >
                        <List size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('link')}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                        title="Markdown Linki Ekle"
                      >
                        <Link2 size={11} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={contentTextareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Not yazın veya yukarıdaki formatlama araçlarını kullanın..."
                    rows={4}
                    className="w-full bg-black/20 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none transition-colors"
                  />

                  {/* MINI AI ASSISTANT PANEL */}
                  <div className="flex flex-wrap gap-1.5 bg-amber-500/5 border border-amber-500/10 rounded-xl p-2.5">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 w-full mb-1">
                      <Sparkles size={11} />
                      Akıllı Asistan Araçları
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('polish')}
                      disabled={isAiProcessing || !content.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-sans font-semibold rounded-lg border border-white/5 transition-colors"
                    >
                      Düzelt & Zenginleştir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('summarize')}
                      disabled={isAiProcessing || !content.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-sans font-semibold rounded-lg border border-white/5 transition-colors"
                    >
                      Özet Çıkar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('expand')}
                      disabled={isAiProcessing || !content.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-sans font-semibold rounded-lg border border-white/5 transition-colors"
                    >
                      Fikri Derinleştir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('tone-professional')}
                      disabled={isAiProcessing || !content.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-sans font-semibold rounded-lg border border-white/5 transition-colors"
                    >
                      👔 Profesyonel Dil
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('tone-casual')}
                      disabled={isAiProcessing || !content.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-sans font-semibold rounded-lg border border-white/5 transition-colors"
                    >
                      😊 Samimi Dil
                    </button>
                  </div>
                </div>

                {/* DEDICATED LINKS INLINE CONTAINER */}
                <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-mono text-text-secondary uppercase flex items-center gap-1.5">
                    <Globe size={11} className="text-sky-400" />
                    Web Referans Linki Ekle
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Site Adı (örn: Google)"
                      className="bg-black/25 border border-white/5 focus:border-amber-500/30 outline-none rounded-lg px-2 py-1.5 text-xs text-text-primary"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-black/25 border border-white/5 focus:border-amber-500/30 outline-none rounded-lg px-2 py-1.5 text-xs text-text-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddLinkItem}
                        className="px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>

                  {attachedLinks.length > 0 && (
                    <div className="space-y-1 mt-2 max-h-24 overflow-y-auto">
                      {attachedLinks.map((lnk, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-sky-500/5 px-2 py-1.5 rounded border border-sky-500/10">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Globe size={11} className="text-sky-400 shrink-0" />
                            <span className="text-[11px] text-text-primary truncate font-bold">{lnk.title}</span>
                            <span className="text-[9px] text-text-secondary truncate max-w-[100px] font-mono">({lnk.url})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachedLinks(attachedLinks.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-400 p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-Checklist input (Todo) */}
                <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-mono text-text-secondary uppercase flex items-center gap-1">
                    <CheckSquare size={11} />
                    Yapılacak Listesi Maddesi Ekle
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={todoInput}
                      onChange={(e) => setTodoInput(e.target.value)}
                      placeholder="Örn: Raporu teslim et..."
                      className="flex-1 bg-black/25 border border-white/5 focus:border-amber-500/30 outline-none rounded-lg px-2.5 py-1.5 text-xs text-text-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddTodoItem}
                      className="px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold transition-all"
                    >
                      Ekle
                    </button>
                  </div>
                  
                  {todos.length > 0 && (
                    <div className="space-y-1 mt-2.5 max-h-32 overflow-y-auto">
                      {todos.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/[0.01] px-2.5 py-1.5 rounded border border-white/5">
                          <span className="text-[11px] text-text-secondary truncate">{t.text}</span>
                          <button
                            type="button"
                            onClick={() => setTodos(todos.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-400 p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Extra settings: Tag input & Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Etiketler (Virgülle Ayırın)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="tasarım, plan, bütçe"
                      className="w-full bg-black/20 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-text-secondary uppercase block">Not Rengi</label>
                    <div className="flex gap-2">
                      {(['amber', 'rose', 'emerald', 'blue', 'violet'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-5 h-5 rounded-full ${COLOR_MAP[c].solid} border-2 transition-all ${
                            color === c ? 'scale-110 border-white ring-2 ring-amber-500/20' : 'opacity-40 border-transparent hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {aiFeedbackMessage && (
                  <div className="text-[11px] font-mono bg-black/40 text-amber-400 border border-amber-500/15 p-2 rounded-lg text-center animate-pulse">
                    {aiFeedbackMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!title.trim() && !content.trim() && todos.length === 0 && attachedLinks.length === 0}
                  className="w-full bg-amber-500 text-black hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-text-secondary/30 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/5"
                >
                  <Plus size={14} />
                  Yeni Not Oluştur
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          
        </div>

        {/* RIGHT COLUMN: Notes Listing & Filters */}
        <div className="xl:col-span-7 flex flex-col gap-4 overflow-hidden h-full min-h-0">
          
          {/* SEARCH & FILTERS */}
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            
            {/* Search Input */}
            <div className="flex-1 bg-black/20 border border-white/5 h-10 rounded-xl flex items-center px-3 gap-2.5 focus-within:border-amber-500/30 transition-colors">
              <Search size={15} className="text-text-secondary" />
              <input
                type="text"
                placeholder="Notlarda, başlıklarda, bağlantılarda veya kategorilerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-display font-medium text-xs text-text-primary placeholder:text-text-secondary/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-text-secondary hover:text-text-primary">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Tags Selection List */}
            {allUniqueTags.length > 0 && (
              <div className="flex items-center gap-2 max-w-full md:max-w-xs overflow-x-auto shrink-0 pb-1 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all shrink-0 ${
                    !selectedTag 
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' 
                      : 'bg-white/[0.02] border border-white/5 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Tümü
                </button>
                {allUniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 flex items-center gap-1 ${
                      selectedTag === tag 
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' 
                        : 'bg-white/[0.02] border border-white/5 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Tag size={9} />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NOTES GRID CONTAINER */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary/50">
                <Loader2 className="animate-spin text-amber-500" size={32} />
                <span className="text-xs font-mono uppercase tracking-widest">Veritabanı senkronize ediliyor...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <Bookmark className="mx-auto text-text-secondary/20 mb-3" size={36} />
                <h3 className="text-sm font-bold text-text-secondary">Hiç Not Bulunamadı</h3>
                <p className="text-[11px] text-text-secondary/40 max-w-xs mx-auto mt-1 leading-relaxed">
                  {searchQuery || selectedTag ? 'Arama filtrenize uygun not bulunamadı.' : 'Aklınızdaki fikirleri soldaki panelleri kullanarak hemen kaydetmeye başlayın.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredNotes.map((note) => {
                    const style = COLOR_MAP[note.color];
                    return (
                      <motion.div
                        layout
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={`flex flex-col ${style.bg} border ${style.border} rounded-2xl p-5 relative overflow-hidden group/card shadow-lg`}
                      >
                        {/* Glow Gradient */}
                        <div className={`absolute top-0 right-0 w-24 h-24 ${style.solid}/5 rounded-full blur-2xl pointer-events-none`} />

                        {/* Note actions: pin/edit/delete */}
                        <div className="flex justify-between items-start gap-4">
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
                            {note.category}
                          </span>
                          
                          <div className="flex items-center gap-1 opacity-40 group-hover/card:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleTogglePin(note)}
                              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${note.isPinned ? 'text-amber-500' : 'text-text-secondary'}`}
                              title={note.isPinned ? 'Notu Sabitlemeyi Kaldır' : 'Notu Sabitle'}
                            >
                              <Pin size={12} className={note.isPinned ? 'fill-amber-500' : ''} />
                            </button>
                            <button
                              onClick={() => handleStartEdit(note)}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
                              title="Düzenle"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-text-secondary hover:text-rose-400 transition-colors"
                              title="Notu Sil"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Title and Content */}
                        <div className="mt-3.5 space-y-1 flex-1">
                          <h4 className="text-sm font-bold text-text-primary tracking-tight font-display">{note.title}</h4>
                          {note.content && (
                            <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap pt-1 font-sans">
                              {note.content}
                            </p>
                          )}
                        </div>

                        {/* Attached Links list renderer */}
                        {note.links && note.links.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-white/5 space-y-1.5">
                            <span className="text-[9px] font-mono uppercase text-text-secondary/60 block">Bağlantılı Kaynaklar</span>
                            <div className="grid grid-cols-1 gap-1.5">
                              {note.links.map((lnk, idx) => (
                                <a
                                  key={idx}
                                  href={lnk.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 rounded bg-black/35 hover:bg-sky-500/5 border border-white/5 hover:border-sky-500/20 text-[11px] transition-all group/lnk"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Globe size={11} className="text-sky-400 shrink-0 group-hover/lnk:animate-pulse" />
                                    <span className="text-text-primary font-bold truncate">{lnk.title}</span>
                                  </div>
                                  <ExternalLink size={10} className="text-text-secondary/60 group-hover/lnk:text-sky-400" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Checklists (if any) */}
                        {note.todoItems && note.todoItems.length > 0 && (
                          <div className="mt-4 border-t border-white/5 pt-3.5 space-y-2">
                            {note.todoItems.map((todo, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => handleToggleTodo(note, idx)}
                                className="flex items-center gap-2 cursor-pointer select-none group/item"
                              >
                                {todo.completed ? (
                                  <CheckSquare size={13} className={`${style.text} shrink-0`} />
                                ) : (
                                  <Square size={13} className="text-text-secondary/50 group-hover/item:text-text-primary shrink-0" />
                                )}
                                <span className={`text-[11px] leading-none ${todo.completed ? 'line-through text-text-secondary/40' : 'text-text-primary/90'}`}>
                                  {todo.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tags and Footer */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4 pt-3.5 border-t border-white/5">
                            {note.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] text-text-secondary bg-black/10 px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 text-[9px] font-mono text-text-secondary/40 flex justify-between items-center">
                          <span>{new Date(note.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DETAILED QUICK NOTE EDIT MODAL */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/25">
                <div className="flex items-center gap-2">
                  <Edit3 size={16} className="text-amber-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-text-secondary uppercase">Notu Düzenle</span>
                </div>
                <button
                  onClick={() => setEditingNote(null)}
                  className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Başlık</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-black/30 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Kategori</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-black/30 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">İçerik</label>
                    
                    {/* Rich text formatting helper */}
                    <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-lg shrink-0">
                      <button
                        type="button"
                        onClick={() => insertFormat('bold', true)}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                      >
                        <Bold size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('italic', true)}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                      >
                        <Italic size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('heading', true)}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                      >
                        <Heading size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('code', true)}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                      >
                        <Code size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('bullet', true)}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                      >
                        <List size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormat('link', true)}
                        className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-text-primary"
                      >
                        <Link2 size={11} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={editContentTextareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full bg-black/30 border border-white/5 focus:border-amber-500/40 outline-none rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none"
                  />

                  {/* AI assistants inside modal editing */}
                  <div className="flex flex-wrap gap-1 bg-amber-500/5 border border-amber-500/10 rounded-xl p-2.5">
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider w-full mb-1 flex items-center gap-1">
                      <Sparkles size={11} />
                      Yapay Zeka Yardımcıları
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('polish', true)}
                      disabled={isAiProcessing || !editContent.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-semibold rounded-lg border border-white/5"
                    >
                      Cümleleri Düzelt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('summarize', true)}
                      disabled={isAiProcessing || !editContent.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-semibold rounded-lg border border-white/5"
                    >
                      Özetle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiAssistantAction('expand', true)}
                      disabled={isAiProcessing || !editContent.trim()}
                      className="px-2 py-1 bg-black/30 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-40 text-[10px] font-semibold rounded-lg border border-white/5"
                    >
                      Genişlet
                    </button>
                  </div>
                </div>

                {/* EDIT FORM WEB LINKS */}
                <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-mono text-sky-400 uppercase flex items-center gap-1">
                    <Globe size={11} />
                    Bağlantı Ekle
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editLinkTitle}
                      onChange={(e) => setEditLinkTitle(e.target.value)}
                      placeholder="Başlık (örn: Doküman)"
                      className="bg-black/30 border border-white/5 outline-none rounded px-2 py-1 text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editLinkUrl}
                        onChange={(e) => setEditLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-black/30 border border-white/5 outline-none rounded px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddEditLinkItem}
                        className="px-2 bg-sky-500/15 text-sky-400 rounded text-xs font-bold"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>

                  {editLinks.length > 0 && (
                    <div className="space-y-1 mt-2 max-h-24 overflow-y-auto">
                      {editLinks.map((lnk, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-black/35 px-2 py-1 rounded">
                          <span className="text-[11px] truncate font-bold">{lnk.title} ({lnk.url})</span>
                          <button
                            type="button"
                            onClick={() => setEditLinks(editLinks.filter((_, i) => i !== idx))}
                            className="text-rose-500 p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* EDIT FORM TODO CHECKLISTS */}
                <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-mono text-text-secondary uppercase flex items-center gap-1">
                    <CheckSquare size={11} />
                    Yapılacaklar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTodoInput}
                      onChange={(e) => setEditTodoInput(e.target.value)}
                      placeholder="Yapılacak ekle..."
                      className="flex-1 bg-black/30 border border-white/5 outline-none rounded px-2 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddEditTodoItem}
                      className="px-2.5 bg-amber-500/15 text-amber-400 rounded text-xs font-bold"
                    >
                      Ekle
                    </button>
                  </div>

                  {editTodos.length > 0 && (
                    <div className="space-y-1 mt-2 max-h-28 overflow-y-auto">
                      {editTodos.map((todo, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-black/35 px-2 py-1 rounded">
                          <span className="text-[11px] truncate">{todo.text}</span>
                          <button
                            type="button"
                            onClick={() => setEditTodos(editTodos.filter((_, i) => i !== idx))}
                            className="text-rose-500 p-0.5"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* EDIT TAGS & COLOR */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Etiketler</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="etiketler, virgülle"
                      className="w-full bg-black/30 border border-white/5 outline-none rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Renk</label>
                    <div className="flex gap-2 pt-1.5">
                      {(['amber', 'rose', 'emerald', 'blue', 'violet'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={`w-5 h-5 rounded-full ${COLOR_MAP[c].solid} border transition-all ${
                            editColor === c ? 'scale-110 border-white' : 'opacity-40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/25 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.03] hover:bg-white/[0.08] text-text-secondary transition-all"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-lg"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default NotesQuick;
