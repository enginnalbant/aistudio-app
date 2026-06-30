import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { geminiService } from '../../services/geminiService';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  FilePlus, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Pin, 
  Copy, 
  Sparkles, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette, 
  Printer, 
  Download, 
  CheckSquare, 
  Search, 
  Tag, 
  X,
  RotateCw,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkle,
  Layers,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';

// Interfaces
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

interface FolderNote {
  id: string;
  folderId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPinned: boolean;
}

interface QuickNote {
  id: string;
  title: string;
  content: string;
  color: string; // 'zinc' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  isPinned: boolean;
  createdAt: string;
}

// Initial Data
const INITIAL_FOLDERS: Folder[] = [
  { id: 'f-1', name: '🎓 Akademik Çalışmalar', parentId: null },
  { id: 'f-1-1', name: '📝 Tezler', parentId: 'f-1' },
  { id: 'f-1-2', name: '📚 Araştırma Notları', parentId: 'f-1' },
  { id: 'f-2', name: '💼 İş & Kariyer', parentId: null },
  { id: 'f-2-1', name: '📊 Haftalık Raporlar', parentId: 'f-2' },
  { id: 'f-2-2', name: '🚀 Projeler', parentId: 'f-2' },
  { id: 'f-3', name: '🏠 Kişisel Gelişim', parentId: null },
];

const INITIAL_FOLDER_NOTES: FolderNote[] = [
  {
    id: 'n-1',
    folderId: 'f-1-2',
    title: 'Yapay Zeka ve Dil Modelleri',
    content: '<h1>Yapay Zeka ve Dil Modelleri</h1><p>Bu araştırma notu, modern dil modellerinin gelişimini ve transformatör mimarilerini incelemektedir.</p><h2>Temel Başarılar</h2><ul><li>Gelişmiş transformatör katmanları ve dikkat mekanizması.</li><li>Bağlamsal çıkarım ve anlamsal anlama yeteneği.</li></ul><p><em>Not: Bu alandaki gelişmeleri takip etmek kritik öneme sahip.</em></p>',
    createdAt: '30.06.2026 10:15',
    updatedAt: '30.06.2026 11:30',
    tags: ['yapay-zeka', 'araştirma', 'nlp'],
    isPinned: true
  },
  {
    id: 'n-2',
    folderId: 'f-2-1',
    title: 'Haziran 2026 Durum Raporu',
    content: '<h1>Haziran 2026 Durum Raporu</h1><p>Bu raporda, Haziran ayı içerisindeki proje ilerlemeleri ve finansal performans özetlenmiştir.</p><ul><li>Bütçe hedeflerine %95 oranında ulaşıldı.</li><li>Yeni depo takip sistemi modülü yayına alındı.</li><li>Ekip içi koordinasyon toplantıları haftalık olarak düzenlendi.</li></ul>',
    createdAt: '28.06.2026 16:00',
    updatedAt: '28.06.2026 16:45',
    tags: ['rapor', 'iş', 'durum-özeti'],
    isPinned: false
  },
  {
    id: 'n-3',
    folderId: 'f-3',
    title: 'Günlük Meditasyon ve Odaklanma',
    content: '<h1>Günlük Meditasyon Notları</h1><p>Sabahları 15 dakika meditasyon yaparak güne başlamak odaklanma seviyemi ciddi oranda artırıyor.</p><blockquote>"Zihin, kendi haline bırakıldığında rüzgarlı bir okyanus gibidir; sakinleştiğinde ise gerçeği yansıtan berrak bir ayna."</blockquote>',
    createdAt: '29.06.2026 08:30',
    updatedAt: '29.06.2026 08:30',
    tags: ['kişisel-gelişim', 'farkindalik'],
    isPinned: false
  }
];

const INITIAL_QUICK_NOTES: QuickNote[] = [
  {
    id: 'q-1',
    title: 'Haftalık Alışveriş',
    content: 'Süt, tam buğday ekmeği, süzme peynir, filtre kahve, organic yumurta, taze naneli yeşil çay, temizlik bezi.',
    color: 'emerald',
    isPinned: true,
    createdAt: '30.06.2026 09:00'
  },
  {
    id: 'q-2',
    title: 'Yazılım Fikri',
    content: 'Kullanıcıların harcama alışkanlıklarını sesli komutlarla analiz edip anında bütçe öneren akıllı bir asistan tasarla.',
    color: 'purple',
    isPinned: false,
    createdAt: '30.06.2026 11:12'
  },
  {
    id: 'q-3',
    title: 'Şifre Hatırlatıcı',
    content: 'Yeni lokal test sunucusu ssh erişim şifresi: dev_root_apex_192! (Kimseyle paylaşma, lokalde kalsın).',
    color: 'rose',
    isPinned: false,
    createdAt: '29.06.2026 18:40'
  }
];

const COLOR_MAP: Record<string, string> = {
  zinc: 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-zinc-200/40 dark:shadow-zinc-950/40',
  blue: 'bg-blue-50 dark:bg-[#1e293b] border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-[#223047] text-blue-900 dark:text-blue-100 shadow-blue-200/20 dark:shadow-blue-950/20',
  emerald: 'bg-emerald-50/80 dark:bg-[#14532d]/40 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100/80 dark:hover:bg-[#14532d]/60 text-emerald-900 dark:text-emerald-100 shadow-emerald-200/20 dark:shadow-emerald-950/20',
  amber: 'bg-amber-50/80 dark:bg-[#78350f]/30 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-[#78350f]/50 text-amber-900 dark:text-amber-100 shadow-amber-200/20 dark:shadow-amber-950/20',
  rose: 'bg-rose-50/80 dark:bg-[#881337]/30 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100/80 dark:hover:bg-[#881337]/50 text-rose-900 dark:text-rose-100 shadow-rose-200/20 dark:shadow-rose-950/20',
  purple: 'bg-purple-50/80 dark:bg-[#581c87]/30 border-purple-200 dark:border-purple-500/30 hover:bg-purple-100/80 dark:hover:bg-[#581c87]/50 text-purple-900 dark:text-purple-100 shadow-purple-200/20 dark:shadow-purple-950/20',
};

const TEXT_COLOR_LIST = [
  { name: 'Varsayılan', color: '#ffffff' },
  { name: 'Mavi', color: '#3b82f6' },
  { name: 'Yeşil', color: '#10b981' },
  { name: 'Sarı', color: '#f59e0b' },
  { name: 'Kırmızı', color: '#ef4444' },
  { name: 'Mor', color: '#8b5cf6' },
  { name: 'Pembe', color: '#ec4899' },
  { name: 'Turkuaz', color: '#14b8a6' },
];

export const NotebookNotes = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'folders' | 'quick'>('folders');

  // Local Storage States
  const [folders, setFolders] = useLocalStorage<Folder[]>('notebook_folders_list', INITIAL_FOLDERS);
  const [folderNotes, setFolderNotes] = useLocalStorage<FolderNote[]>('notebook_folder_notes_list', INITIAL_FOLDER_NOTES);
  const [quickNotes, setQuickNotes] = useLocalStorage<QuickNote[]>('notebook_quick_notes_list', INITIAL_QUICK_NOTES);

  // Expanded Folders Set (for tree view)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set(['f-1', 'f-2']));

  // Selected State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('f-1-2');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>('n-1');

  // Quick Notes color filter
  const [selectedQuickColorFilter, setSelectedQuickColorFilter] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Quick Note Add Form State
  const [newQuickTitle, setNewQuickTitle] = useState('');
  const [newQuickContent, setNewQuickContent] = useState('');
  const [newQuickColor, setNewQuickColor] = useState('zinc');
  const [isQuickPinned, setIsQuickPinned] = useState(false);

  // Editor states & modes
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiCustomInstruction, setAiCustomInstruction] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [currentTagInput, setCurrentTagInput] = useState('');

  // Right Drawer: Quick Notes drawer within editor
  const [isQuickNotesDrawerOpen, setIsQuickNotesDrawerOpen] = useState(false);

  // Conversion of quick note to rich folder note
  const [convertingNote, setConvertingNote] = useState<QuickNote | null>(null);
  const [conversionFolderId, setConversionFolderId] = useState<string>('');
  const [conversionTitle, setConversionTitle] = useState('');

  // Folder management UI states
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderEditName, setFolderEditName] = useState('');
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  // Find active selected note
  const activeNote = useMemo(() => {
    return folderNotes.find(n => n.id === selectedNoteId) || null;
  }, [folderNotes, selectedNoteId]);

  // Folder Breadcrumb path generator
  const folderBreadcrumb = useMemo(() => {
    if (!activeNote) return [];
    const path: Folder[] = [];
    let currentFolder = folders.find(f => f.id === activeNote.folderId);
    while (currentFolder) {
      path.unshift(currentFolder);
      if (currentFolder.parentId) {
        currentFolder = folders.find(f => f.id === currentFolder?.parentId);
      } else {
        break;
      }
    }
    return path;
  }, [activeNote, folders]);

  // Synchronize editor content on note change
  useEffect(() => {
    if (activeNote && editorRef.current) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
  }, [selectedNoteId]);

  // Handle saving of active note from editor
  const saveNoteContent = (newContent: string) => {
    if (!selectedNoteId) return;
    setFolderNotes(prev => prev.map(note => {
      if (note.id === selectedNoteId) {
        return {
          ...note,
          content: newContent,
          updatedAt: new Date().toLocaleString('tr-TR')
        };
      }
      return note;
    }));
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      saveNoteContent(content);
    }
  };

  // WYSIWYG commands
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleEditorInput();
    }
  };

  // Toggle Pinned status for folder note
  const togglePinFolderNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFolderNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  // Delete folder note
  const handleDeleteFolderNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
      setFolderNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    }
  };

  // Create folder note
  const handleCreateFolderNote = (folderId: string) => {
    const newNote: FolderNote = {
      id: 'n-' + Math.random().toString(36).substring(2, 9),
      folderId,
      title: 'Yeni Başlıksız Not',
      content: '<h1>Yeni Başlıksız Not</h1><p>Gelişmiş metin düzenleyicimiz ile notlarınızı buraya almaya başlayın. Üstteki zengin araç çubuğunu veya yapay zeka editörünü kullanabilirsiniz.</p>',
      createdAt: new Date().toLocaleString('tr-TR'),
      updatedAt: new Date().toLocaleString('tr-TR'),
      tags: [],
      isPinned: false
    };
    setFolderNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  // Rename Note Title
  const handleRenameNoteTitle = (newTitle: string) => {
    if (!selectedNoteId) return;
    setFolderNotes(prev => prev.map(n => n.id === selectedNoteId ? { ...n, title: newTitle, updatedAt: new Date().toLocaleString('tr-TR') } : n));
  };

  // Folder operations
  const handleToggleFolderExpand = (id: string) => {
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: 'f-' + Math.random().toString(36).substring(2, 9),
      name: newFolderName.trim(),
      parentId: newFolderParentId
    };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
    if (newFolderParentId) {
      setExpandedFolderIds(prev => {
        const next = new Set(prev);
        next.add(newFolderParentId);
        return next;
      });
    }
    setNewFolderName('');
    setIsAddFolderModalOpen(false);
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu klasörü sildiğinizde, alt klasörleri ve bu klasördeki tüm notlar da silinecektir. Devam etmek istiyor musunuz?')) {
      const getChildFolderIds = (id: string): string[] => {
        const directChildren = folders.filter(f => f.parentId === id);
        return [id, ...directChildren.flatMap(child => getChildFolderIds(child.id))];
      };

      const foldersToDelete = getChildFolderIds(folderId);

      setFolders(prev => prev.filter(f => !foldersToDelete.includes(f.id)));
      setFolderNotes(prev => prev.filter(n => !foldersToDelete.includes(n.folderId)));
      
      if (selectedFolderId && foldersToDelete.includes(selectedFolderId)) {
        setSelectedFolderId(null);
        setSelectedNoteId(null);
      }
    }
  };

  const handleStartRenameFolder = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setFolderEditName(folder.name);
  };

  const handleSaveRenameFolder = (id: string) => {
    if (!folderEditName.trim()) return;
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name: folderEditName.trim() } : f));
    setEditingFolderId(null);
  };

  // Quick Notes Operations
  const handleAddQuickNote = () => {
    if (!newQuickContent.trim()) return;
    const newNote: QuickNote = {
      id: 'q-' + Math.random().toString(36).substring(2, 9),
      title: newQuickTitle.trim() || 'Hızlı Not',
      content: newQuickContent.trim(),
      color: newQuickColor,
      isPinned: isQuickPinned,
      createdAt: new Date().toLocaleString('tr-TR')
    };
    setQuickNotes(prev => [newNote, ...prev]);
    setNewQuickTitle('');
    setNewQuickContent('');
    setNewQuickColor('zinc');
    setIsQuickPinned(false);
  };

  const handleDeleteQuickNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Bu hızlı notu silmek istediğinize emin misiniz?')) {
      setQuickNotes(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleTogglePinQuickNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQuickNotes(prev => prev.map(q => q.id === id ? { ...q, isPinned: !q.isPinned } : q));
  };

  const handleUpdateQuickNoteContent = (id: string, content: string) => {
    setQuickNotes(prev => prev.map(q => q.id === id ? { ...q, content } : q));
  };

  // Import quick note text inside active rich editor
  const handleInsertQuickNoteToEditor = (note: QuickNote) => {
    if (!activeNote || !editorRef.current) {
      alert("Lütfen önce sağda düzenlemek üzere defterlerinizden bir not seçin!");
      return;
    }
    
    const blockQuoteHtml = `
      <blockquote class="border-l-4 border-${note.color === 'emerald' ? 'emerald' : note.color === 'rose' ? 'rose' : note.color === 'blue' ? 'blue' : note.color === 'amber' ? 'amber' : note.color === 'purple' ? 'purple' : 'zinc'}-500 bg-white/5 p-3 rounded-r-2xl my-3 text-zinc-300">
        <strong class="text-white text-xs font-mono">${note.title}:</strong><br/>
        <span class="text-xs">${note.content}</span>
      </blockquote>
      <p></p>
    `;
    
    const originalContent = editorRef.current.innerHTML;
    const nextContent = originalContent + blockQuoteHtml;
    editorRef.current.innerHTML = nextContent;
    saveNoteContent(nextContent);
  };

  // Convert Quick Note to Rich Folder Note
  const handleStartConversion = (note: QuickNote, e: React.MouseEvent) => {
    e.stopPropagation();
    setConvertingNote(note);
    setConversionTitle(note.title);
    if (folders.length > 0) {
      setConversionFolderId(folders[0].id);
    }
  };

  const handleConfirmConversion = () => {
    if (!convertingNote || !conversionFolderId) return;

    const newNote: FolderNote = {
      id: 'n-' + Math.random().toString(36).substring(2, 9),
      folderId: conversionFolderId,
      title: conversionTitle.trim() || convertingNote.title,
      content: `<h1>${conversionTitle.trim() || convertingNote.title}</h1><p>${convertingNote.content}</p><p><em>Not: Bu içerik hızlı notlardan buraya aktarıldı. (${new Date().toLocaleString('tr-TR')})</em></p>`,
      createdAt: new Date().toLocaleString('tr-TR'),
      updatedAt: new Date().toLocaleString('tr-TR'),
      tags: ['hizli-not-aktarim'],
      isPinned: false
    };

    setFolderNotes(prev => [newNote, ...prev]);
    setQuickNotes(prev => prev.filter(q => q.id !== convertingNote.id));
    
    // Automatically switch and highlight
    setSelectedFolderId(conversionFolderId);
    setSelectedNoteId(newNote.id);
    setActiveTab('folders');
    setConvertingNote(null);
  };

  // Tag Operations
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTagInput.trim() && activeNote) {
      e.preventDefault();
      const cleanedTag = currentTagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!activeNote.tags.includes(cleanedTag)) {
        setFolderNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, tags: [...n.tags, cleanedTag] } : n));
      }
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (!activeNote) return;
    setFolderNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, tags: n.tags.filter(t => t !== tag) } : n));
  };

  // AI assistant direct action triggers (smart helpers)
  const handleSmartAiAction = (actionKey: string) => {
    let prompt = "";
    switch (actionKey) {
      case 'summarize':
        prompt = "Bu not içeriğinin kısa, anlaşılır ve maddeler halinde bir özetini (TL;DR) çıkar. Sonunda önemli çıkarımları yaz.";
        break;
      case 'expand':
        prompt = "Bu notu detaylandır. İçeriğe derinlik kat, profesyonel örnekler ve mantıklı alt başlıklar ekleyerek genişlet.";
        break;
      case 'grammar':
        prompt = "Bu metindeki tüm imla ve yazım hatalarını düzelt. Dilbilgisini akıcı hale getir ancak ana fikri kesinlikle değiştirme.";
        break;
      case 'professional':
        prompt = "Bu notu iş dünyasına uygun, kurumsal ve oldukça profesyonel bir üsluba dönüştür.";
        break;
      case 'translate_en':
        prompt = "Bu notu anlam kaybı yaşamadan profesyonelce İngilizce'ye çevir.";
        break;
      case 'suggest_tags':
        prompt = "Bu metni analiz et ve bu içeriğe en uygun 5 adet virgülle ayrılmış etiket öner. Sadece etiketleri öner, başka bir şey yazma.";
        break;
      case 'study_prep':
        prompt = "Bu nottaki bilgilerden yola çıkarak kendimi test etmem için 3 adet Soru-Cevap hazırlat.";
        break;
      default:
        prompt = actionKey;
    }
    setShowAiPanel(true);
    handleAiAssist(prompt);
  };

  // Gemini AI integration
  const handleAiAssist = async (task: string) => {
    if (!activeNote) return;
    setIsAiLoading(true);
    setAiResult('');
    
    const sourceText = editorRef.current ? editorRef.current.innerText : activeNote.content;

    try {
      const response = await geminiService.assistNote(task, sourceText);
      setAiResult(response);
    } catch (err) {
      setAiResult("Yapay zeka yanıt oluştururken bir sorunla karşılaştı.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiResult = (mode: 'replace' | 'append') => {
    if (!activeNote || !editorRef.current || !aiResult) return;

    let finalContent = "";
    const formattedResult = aiResult.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
    
    if (mode === 'replace') {
      finalContent = `<h1>${activeNote.title} (Yapay Zeka Destekli)</h1>` + formattedResult;
      editorRef.current.innerHTML = finalContent;
    } else {
      finalContent = activeNote.content + '<hr class="border-white/10 my-6" />' + '<h3>Yapay Zeka Önerisi / Ek Not</h3>' + formattedResult;
      editorRef.current.innerHTML = finalContent;
    }

    saveNoteContent(finalContent);
    setAiResult('');
    setShowAiPanel(false);
  };

  // Note Stats
  const noteStats = useMemo(() => {
    if (!activeNote) return { chars: 0, words: 0 };
    const text = editorRef.current ? editorRef.current.innerText : '';
    return {
      chars: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0
    };
  }, [activeNote, folderNotes]);

  // Export functions
  const handleDownloadNote = (format: 'txt' | 'md' | 'html') => {
    if (!activeNote) return;
    const filename = `${activeNote.title.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    let content = "";
    
    if (format === 'html') {
      content = activeNote.content;
    } else if (format === 'md') {
      content = activeNote.content
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<ul>/gi, '')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<br\s*\/?>/gi, '\n');
    } else {
      content = editorRef.current ? editorRef.current.innerText : activeNote.content.replace(/<[^>]*>/g, '');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    if (!activeNote || !editorRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeNote.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
            h1 { font-size: 2.2em; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { font-size: 1.6em; margin-top: 30px; }
            blockquote { border-left: 4px solid #3b82f6; padding-left: 15px; font-style: italic; color: #4b5563; }
          </style>
        </head>
        <body>
          ${editorRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyToClipboard = () => {
    if (!activeNote || !editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.innerText);
    alert('Not metni panoya kopyalandı.');
  };

  // Recursive Tree Render Component
  const renderFolderTree = (parentId: string | null = null, depth = 0) => {
    const currentFolders = folders.filter(f => f.parentId === parentId);
    
    if (currentFolders.length === 0) return null;

    return (
      <div className="space-y-1">
        {currentFolders.map(folder => {
          const isExpanded = expandedFolderIds.has(folder.id);
          const isSelected = selectedFolderId === folder.id;
          const hasChildren = folders.some(f => f.parentId === folder.id);
          const notesCount = folderNotes.filter(n => n.folderId === folder.id).length;

          return (
            <div key={folder.id} className="select-none">
              <div 
                onClick={() => setSelectedFolderId(folder.id)}
                className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white border border-transparent'
                }`}
                style={{ paddingLeft: `${Math.max(12, depth * 14)}px` }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFolderExpand(folder.id);
                    }}
                    className={`p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    } ${!hasChildren ? 'opacity-0 pointer-events-none w-4' : ''}`}
                  >
                    <ChevronRight size={10} />
                  </button>
                  <Folder size={12} className={isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-500'} />
                  {editingFolderId === folder.id ? (
                    <input 
                      autoFocus
                      value={folderEditName}
                      onChange={(e) => setFolderEditName(e.target.value)}
                      onBlur={() => handleSaveRenameFolder(folder.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameFolder(folder.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white dark:bg-black border border-blue-500/50 rounded px-1 text-[11px] text-zinc-900 dark:text-white focus:outline-none w-24"
                    />
                  ) : (
                    <span className="truncate">{folder.name}</span>
                  )}
                  {notesCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-bold">
                      {notesCount}
                    </span>
                  )}
                </div>

                {/* Actions on hover */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewFolderParentId(folder.id);
                      setIsAddFolderModalOpen(true);
                    }}
                    title="Alt Klasör Ekle"
                    className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-200"
                  >
                    <FolderPlus size={10} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateFolderNote(folder.id);
                    }}
                    title="Yeni Not Oluştur"
                    className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-200"
                  >
                    <FilePlus size={10} />
                  </button>
                  <button 
                    onClick={(e) => handleStartRenameFolder(folder, e)}
                    title="Yeniden Adlandır"
                    className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-200"
                  >
                    <Edit3 size={10} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    title="Sil"
                    className="p-1 rounded hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Nested Children */}
              {isExpanded && renderFolderTree(folder.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // Filter notes inside selected folder
  const currentFolderNotes = useMemo(() => {
    if (!selectedFolderId) return [];
    let notes = folderNotes.filter(n => n.folderId === selectedFolderId);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q)
      );
    }

    if (selectedTag) {
      notes = notes.filter(n => n.tags.includes(selectedTag));
    }

    // Sort: pinned first, then updated at descending
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [folderNotes, selectedFolderId, searchQuery, selectedTag]);

  // Filter Quick Notes
  const filteredQuickNotes = useMemo(() => {
    let notes = [...quickNotes];
    if (quickSearchQuery) {
      const q = quickSearchQuery.toLowerCase();
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q)
      );
    }
    
    // Quick Note Color Filter
    if (selectedQuickColorFilter) {
      notes = notes.filter(n => n.color === selectedQuickColorFilter);
    }

    // Pinned first, then creation descending
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.id.localeCompare(a.id);
    });
  }, [quickNotes, quickSearchQuery, selectedQuickColorFilter]);

  // All tags across folder notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    folderNotes.forEach(n => n.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [folderNotes]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 h-[calc(100vh-90px)] flex flex-col"
    >
      {/* Top Banner & Tab controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-mono tracking-widest mb-1">
            <BookOpen size={10} className="text-blue-500 dark:text-blue-400" />
            <span>Not Defteri & Editör</span>
            <span>/</span>
            <span className="text-zinc-800 dark:text-white font-bold">{activeTab === 'folders' ? 'Defterlerim' : 'Hızlı Yapışkan Notlarım'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            Workspace Notes 
            <span className="text-xs font-mono font-normal text-zinc-600 dark:text-zinc-500 lowercase bg-zinc-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-white/5">
              {folders.length} Defter • {folderNotes.length} Not • {quickNotes.length} Hızlı Not
            </span>
          </h1>
        </div>

        {/* Tab Switcher - Now more intuitive & integrated */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-white/5 shadow-md dark:shadow-2xl">
          <button 
            onClick={() => setActiveTab('folders')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              activeTab === 'folders' 
                ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Folder size={12} />
            📂 Defterler & Klasörler
          </button>
          <button 
            onClick={() => setActiveTab('quick')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              activeTab === 'quick' 
                ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <CheckSquare size={12} />
            ⚡ Hızlı Notlar & Fikir Tahtası
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
        {activeTab === 'folders' ? (
          <>
            {/* COLUMN 1: Folder Tree & Note list inside (takes 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden h-full">
              
              {/* Folder Navigation Tree Panel */}
              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex flex-col h-[48%] overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-200 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Layers size={12} className="text-blue-500 dark:text-blue-400" />
                    <span className="text-[10px] font-mono uppercase font-black text-blue-600 dark:text-blue-300 tracking-wider">
                      Klasör Ağacı
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setNewFolderParentId(null);
                      setIsAddFolderModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-[9px] font-mono font-bold text-blue-600 dark:text-blue-300 transition-all uppercase"
                  >
                    <FolderPlus size={10} />
                    Defter Ekle
                  </button>
                </div>

                {/* Recursive Folder Tree Area */}
                <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                  {folders.filter(f => f.parentId === null).length === 0 ? (
                    <div className="text-center py-6 text-zinc-600 text-[11px] font-mono">
                      Henüz hiç defter bulunmuyor.
                    </div>
                  ) : (
                    renderFolderTree(null, 0)
                  )}
                </div>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex flex-col h-[52%] overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-200 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-cyan-500 dark:text-cyan-400" />
                    <span className="text-[10px] font-mono uppercase font-black text-cyan-600 dark:text-cyan-300 tracking-wider truncate max-w-[170px]">
                      {selectedFolderId 
                        ? `${folders.find(f => f.id === selectedFolderId)?.name || 'Klasör'} Notları`
                        : 'Defter Seçin'
                      }
                    </span>
                  </div>
                  {selectedFolderId && (
                    <button 
                      onClick={() => handleCreateFolderNote(selectedFolderId)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-300 transition-all uppercase"
                    >
                      <Plus size={10} />
                      Not Ekle
                    </button>
                  )}
                </div>

                {selectedFolderId ? (
                  <div className="space-y-2 mb-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={10} />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Klasör içi arama..."
                        className="w-full bg-zinc-200/50 dark:bg-black/30 border border-zinc-300 dark:border-white/5 rounded-lg h-7 pl-7 pr-3 text-[10px] font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>
                    {/* Tags scroll list */}
                    {allTags.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[9px] font-mono custom-scrollbar">
                        <button 
                          onClick={() => setSelectedTag(null)}
                          className={`px-1.5 py-0.5 rounded-md border transition-all ${
                            !selectedTag 
                              ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-black border-zinc-800 dark:border-zinc-100 font-bold' 
                              : 'bg-zinc-200/50 dark:bg-white/5 border-zinc-300 dark:border-white/5 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          Tümü
                        </button>
                        {allTags.map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-1.5 py-0.5 rounded-md border transition-all truncate whitespace-nowrap ${
                              selectedTag === tag 
                                ? 'bg-cyan-500/15 dark:bg-cyan-500/20 border-cyan-500/30 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-bold' 
                                : 'bg-zinc-200/50 dark:bg-white/5 border-zinc-300 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* List Container */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {!selectedFolderId ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 font-mono text-[11px] p-4">
                      <Folder size={20} className="mb-2 text-zinc-400 dark:text-zinc-600 animate-pulse" />
                      Yukarıdaki klasör ağacından bir klasör seçerek notlarınızı listeleyin ve yönetin.
                    </div>
                  ) : currentFolderNotes.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 dark:text-zinc-600 text-[11px] font-mono">
                      {searchQuery || selectedTag ? 'Aramayla eşleşen not yok.' : 'Bu klasörde henüz bir not bulunmuyor.'}
                    </div>
                  ) : (
                    currentFolderNotes.map(note => {
                      const isActive = selectedNoteId === note.id;
                      return (
                        <div 
                          key={note.id}
                          onClick={() => setSelectedNoteId(note.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group ${
                            isActive 
                              ? 'bg-white dark:bg-zinc-900 border-cyan-500/30 dark:border-cyan-500/40 shadow-md dark:shadow-lg shadow-black/5 dark:shadow-black/40' 
                              : 'bg-transparent border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-100/50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <span className={`text-[11px] font-bold truncate max-w-[160px] ${isActive ? 'text-cyan-600 dark:text-cyan-300' : 'text-zinc-800 dark:text-white'}`}>
                              {note.title || 'Başlıksız Not'}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => togglePinFolderNote(note.id, e)}
                                className={`p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 ${note.isPinned ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-500'}`}
                              >
                                <Pin size={8} fill={note.isPinned ? 'currentColor' : 'none'} />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteFolderNote(note.id, e)}
                                className="p-0.5 rounded hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400"
                              >
                                <Trash2 size={8} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate mb-1">
                            {note.content.replace(/<[^>]*>/g, '').substring(0, 70) || 'Boş Not'}
                          </p>

                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 dark:text-zinc-600">
                            <span>Son Güncelleme: {note.updatedAt.split(' ')[0]}</span>
                            <div className="flex gap-1 overflow-hidden">
                              {note.tags.slice(0, 2).map(t => (
                                <span key={t} className="text-[8px] bg-zinc-200 dark:bg-white/5 px-1 py-0.2 rounded text-zinc-600 dark:text-zinc-400">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Elegant 3-Pane Rich Editor Pane (takes 8 cols) */}
            <div className="lg:col-span-8 bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 md:p-6 flex flex-col h-full overflow-hidden relative">
              {activeNote ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Folder Breadcrumbs & Path */}
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-white/5 pb-2 mb-3 text-[10px] font-mono">
                    <div className="flex items-center gap-1 text-zinc-500 truncate">
                      <BookOpen size={10} className="text-zinc-500" />
                      <span>Not Defteri</span>
                      {folderBreadcrumb.map((folder, idx) => (
                        <React.Fragment key={folder.id}>
                          <ChevronRight size={8} className="text-zinc-400 dark:text-zinc-700" />
                          <span className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer" onClick={() => setSelectedFolderId(folder.id)}>
                            {folder.name}
                          </span>
                        </React.Fragment>
                      ))}
                      <ChevronRight size={8} className="text-zinc-400 dark:text-zinc-700" />
                      <span className="text-blue-600 dark:text-blue-400 font-bold truncate max-w-[120px]">
                        {activeNote.title}
                      </span>
                    </div>

                    {/* Integrated Drawer / Sidebar Toggles inside Editor */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsQuickNotesDrawerOpen(!isQuickNotesDrawerOpen)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                          isQuickNotesDrawerOpen 
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 dark:border-purple-500/40 shadow-md' 
                            : 'bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                        title="Hızlı Notlar Çekmecesini Aç/Kapat"
                      >
                        <CheckSquare size={10} />
                        💡 Fikir Panosu ({quickNotes.length})
                      </button>
                    </div>
                  </div>

                  {/* Note Title Input with Pin Status */}
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <input 
                        value={activeNote.title}
                        onChange={(e) => handleRenameNoteTitle(e.target.value)}
                        placeholder="Notunuza bir başlık verin..."
                        className="w-full bg-transparent border-none p-0 text-lg md:text-xl font-display font-black text-zinc-900 dark:text-white focus:outline-none focus:ring-0 placeholder-zinc-400 dark:placeholder-zinc-700"
                      />
                    </div>

                    {/* Quick Document Actions */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => togglePinFolderNote(activeNote.id)}
                        className={`p-2 rounded-lg border transition-all ${
                          activeNote.isPinned 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400' 
                            : 'bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                        title={activeNote.isPinned ? "Sabitlendi" : "Sabitle"}
                      >
                        <Pin size={12} fill={activeNote.isPinned ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        onClick={handleCopyToClipboard}
                        className="p-2 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                        title="Metni Kopyala"
                      >
                        <Copy size={12} />
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="p-2 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                        title="Yazdır"
                      >
                        <Printer size={12} />
                      </button>
                      <div className="relative group">
                        <button className="p-2 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1" title="İndir / Dışa Aktar">
                          <Download size={12} />
                        </button>
                        <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl p-1.5 shadow-2xl z-50 w-36 text-[10px] font-mono">
                          <button onClick={() => handleDownloadNote('txt')} className="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-700 dark:text-zinc-300">Düz Metin (.txt)</button>
                          <button onClick={() => handleDownloadNote('md')} className="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-700 dark:text-zinc-300">Markdown (.md)</button>
                          <button onClick={() => handleDownloadNote('html')} className="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-700 dark:text-zinc-300">HTML Formatı (.html)</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ADVANCED RICH-TEXT FORMATTING BAR */}
                  <div className="bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-300 dark:border-white/5 p-1.5 rounded-xl mb-3 flex flex-wrap items-center justify-between gap-1.5">
                    
                    {/* Basic Styling Buttons */}
                    <div className="flex items-center gap-0.5 bg-zinc-300/40 dark:bg-black/40 p-0.5 rounded-lg">
                      <button onClick={() => execCommand('bold')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Kalın (Ctrl+B)">
                        <Bold size={11} />
                      </button>
                      <button onClick={() => execCommand('italic')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="İtalik (Ctrl+I)">
                        <Italic size={11} />
                      </button>
                      <button onClick={() => execCommand('underline')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Altı Çizili (Ctrl+U)">
                        <Underline size={11} />
                      </button>
                      <button onClick={() => execCommand('strikeThrough')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Üstü Çizili">
                        <Strikethrough size={11} />
                      </button>
                    </div>

                    {/* Headers & Text Formatting Blocks */}
                    <div className="flex items-center gap-0.5 bg-zinc-300/40 dark:bg-black/40 p-0.5 rounded-lg">
                      <button onClick={() => execCommand('formatBlock', '<h1>')} className="p-1 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all font-bold text-[9px] font-mono" title="Ana Başlık (H1)">
                        H1
                      </button>
                      <button onClick={() => execCommand('formatBlock', '<h2>')} className="p-1 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all font-bold text-[9px] font-mono" title="Alt Başlık (H2)">
                        H2
                      </button>
                      <button onClick={() => execCommand('formatBlock', '<h3>')} className="p-1 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all font-bold text-[9px] font-mono" title="Küçük Başlık (H3)">
                        H3
                      </button>
                      <button onClick={() => execCommand('formatBlock', '<p>')} className="p-1 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all font-bold text-[9px] font-mono" title="Paragraf">
                        P
                      </button>
                    </div>

                    {/* Lists, Quotes & Code */}
                    <div className="flex items-center gap-0.5 bg-zinc-300/40 dark:bg-black/40 p-0.5 rounded-lg">
                      <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Madde İşaretli Liste">
                        <List size={11} />
                      </button>
                      <button onClick={() => execCommand('insertOrderedList')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Numaralı Liste">
                        <ListOrdered size={11} />
                      </button>
                      <button onClick={() => execCommand('formatBlock', '<blockquote>')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Alıntı Ekle">
                        <Quote size={11} />
                      </button>
                      <button onClick={() => {
                        const selection = window.getSelection();
                        if (selection && selection.toString()) {
                          const range = selection.getRangeAt(0);
                          const code = document.createElement('code');
                          code.className = "bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 px-1 py-0.5 rounded font-mono text-[11px] text-purple-700 dark:text-yellow-300";
                          code.textContent = range.toString();
                          range.deleteContents();
                          range.insertNode(code);
                          handleEditorInput();
                        } else {
                          execCommand('insertHTML', '<code class="bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 px-1 py-0.5 rounded font-mono text-[11px] text-purple-700 dark:text-yellow-300">kod_parçası</code>');
                        }
                      }} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Kod Satırı Ekle">
                        <Code size={11} />
                      </button>
                    </div>

                    {/* Alignments */}
                    <div className="flex items-center gap-0.5 bg-zinc-300/40 dark:bg-black/40 p-0.5 rounded-lg">
                      <button onClick={() => execCommand('justifyLeft')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Sola Yasla">
                        <AlignLeft size={11} />
                      </button>
                      <button onClick={() => execCommand('justifyCenter')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Ortala">
                        <AlignCenter size={11} />
                      </button>
                      <button onClick={() => execCommand('justifyRight')} className="p-1.5 rounded hover:bg-zinc-300/60 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" title="Sağa Yasla">
                        <AlignRight size={11} />
                      </button>
                    </div>

                    {/* Interactive Text Color Select */}
                    <div className="flex items-center gap-1 bg-zinc-300/40 dark:bg-black/40 p-1 rounded-lg relative group/pal">
                      <Palette size={11} className="text-zinc-500" />
                      <div className="absolute top-full left-0 hidden group-hover/pal:grid grid-cols-4 gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg p-1.5 z-50 shadow-2xl">
                        {TEXT_COLOR_LIST.map(colorObj => (
                          <button 
                            key={colorObj.name}
                            onClick={() => execCommand('foreColor', colorObj.color)}
                            className="w-4 h-4 rounded-full border border-zinc-200 dark:border-white/10 transition-transform hover:scale-110"
                            style={{ backgroundColor: colorObj.color }}
                            title={colorObj.name}
                          />
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* MAIN EDITOR & DRAWERS CONTAINER SIDE-BY-SIDE */}
                  <div className="flex-1 flex gap-4 overflow-hidden relative">
                    
                    {/* Rich text editing canvas */}
                    <div className="flex-1 bg-white dark:bg-black/15 border border-zinc-300 dark:border-white/5 rounded-xl p-4 overflow-y-auto custom-scrollbar relative focus-within:border-cyan-500/20 transition-all">
                      <div 
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        className="outline-none min-h-full text-zinc-800 dark:text-zinc-200 text-[12px] md:text-sm font-sans leading-relaxed prose dark:prose-invert max-w-none prose-sm"
                        style={{ caretColor: '#06b6d4' }}
                      />
                    </div>

                    {/* COLLAPSIBLE drawer side: Inline Quick Notes reference Drawer */}
                    <AnimatePresence>
                      {isQuickNotesDrawerOpen && (
                        <motion.div 
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 260, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="border-l border-zinc-200 dark:border-white/5 pl-4 flex flex-col h-full overflow-hidden"
                        >
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200 dark:border-white/5">
                            <span className="text-[10px] font-mono uppercase font-black text-purple-600 dark:text-purple-400 tracking-wider">
                              Fikir Çekmecesi
                            </span>
                            <button 
                              onClick={() => setIsQuickNotesDrawerOpen(false)}
                              className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                            >
                              <X size={10} />
                            </button>
                          </div>
                          
                          <p className="text-[9px] text-zinc-500 font-mono mb-2 leading-tight">
                            Hızlı notlarınızı bu dökümana alıntı olarak eklemek için aşağıdaki kartların üzerine tıklayın.
                          </p>

                          {/* Quick Notes inside Drawer List */}
                          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {quickNotes.length === 0 ? (
                              <div className="text-center py-10 text-zinc-400 dark:text-zinc-600 font-mono text-[9px]">
                                Hiç hızlı not bulunamadı.
                              </div>
                            ) : (
                              quickNotes.map(note => (
                                <div 
                                  key={note.id}
                                  onClick={() => handleInsertQuickNoteToEditor(note)}
                                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${COLOR_MAP[note.color] || COLOR_MAP.zinc}`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1 border-b border-black/5 dark:border-white/5 pb-1">
                                    <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[120px]">
                                      {note.title}
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                      {note.isPinned && <Pin size={8} className="text-amber-500 dark:text-amber-400" />}
                                      <span className="text-[7px] text-zinc-500 dark:text-zinc-400 font-mono">ekle +</span>
                                    </div>
                                  </div>
                                  <p className="text-[9px] leading-relaxed line-clamp-3 text-zinc-800 dark:text-zinc-200">
                                    {note.content}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                  {/* SMARTER AI PANEL ACCORDION (Integrated, beautifully styled with instant prompt presets) */}
                  <div className="mt-3.5 border border-purple-500/20 bg-purple-500/5 dark:bg-purple-950/15 rounded-xl overflow-hidden p-3 space-y-2.5 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-600 dark:text-purple-400 animate-pulse" />
                        <span className="text-[10px] font-mono font-black uppercase text-purple-700 dark:text-purple-300 tracking-wider">
                          Yapay Zeka Destekli Editör Asistanı (Smarter Assistant)
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => setShowAiPanel(!showAiPanel)}
                        className="text-[9px] font-mono text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline"
                      >
                        {showAiPanel ? 'Kapat' : 'Gelişmiş AI Panelini Aç'}
                      </button>
                    </div>

                    {/* Smart Preset Action Presets */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                      <button 
                        onClick={() => handleSmartAiAction('summarize')}
                        className="px-1.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 transition-all"
                      >
                        📝 Özet Çıkar
                      </button>
                      <button 
                        onClick={() => handleSmartAiAction('expand')}
                        className="px-1.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 transition-all"
                      >
                        💡 Genişlet
                      </button>
                      <button 
                        onClick={() => handleSmartAiAction('grammar')}
                        className="px-1.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 transition-all"
                      >
                        ✍️ İmla Düzelt
                      </button>
                      <button 
                        onClick={() => handleSmartAiAction('professional')}
                        className="px-1.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 transition-all"
                      >
                        💼 Kurumsal Yap
                      </button>
                      <button 
                        onClick={() => handleSmartAiAction('translate_en')}
                        className="px-1.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 transition-all"
                      >
                        🌐 İngilizceye Çevir
                      </button>
                      <button 
                        onClick={() => handleSmartAiAction('suggest_tags')}
                        className="px-1.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 transition-all"
                      >
                        🏷️ Etiket Öner
                      </button>
                      <button 
                        onClick={() => handleSmartAiAction('study_prep')}
                        className="px-1.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 transition-all"
                      >
                        ❓ Soru-Cevap Çıkar
                      </button>
                    </div>

                    {/* Advanced prompt & live streaming container */}
                    <AnimatePresence>
                      {showAiPanel && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-purple-500/10 space-y-3"
                        >
                          <div className="flex gap-2 items-center">
                            <input 
                              value={aiCustomInstruction}
                              onChange={(e) => setAiCustomInstruction(e.target.value)}
                              placeholder="Yapay zekaya özel bir editör görevi yazın (örn: Bu metni şiirleştir, kod örnekleri ekle...)"
                              className="flex-1 bg-white dark:bg-black/50 border border-purple-500/20 rounded-lg px-3 h-8 text-[11px] font-mono text-zinc-800 dark:text-zinc-100 placeholder-purple-400 dark:placeholder-purple-900 focus:outline-none focus:border-purple-500/50"
                              onKeyDown={(e) => e.key === 'Enter' && handleAiAssist(aiCustomInstruction)}
                            />
                            <button 
                              onClick={() => handleAiAssist(aiCustomInstruction)}
                              disabled={!aiCustomInstruction.trim() || isAiLoading}
                              className="px-3 h-8 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-mono text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 transition-all"
                            >
                              Gönder
                            </button>
                          </div>

                          {/* AI Loading State */}
                          {isAiLoading && (
                            <div className="flex items-center gap-2 py-2 text-purple-700 dark:text-purple-300 italic text-[10px] font-mono">
                              <RotateCw size={11} className="animate-spin text-purple-500 dark:text-purple-400" />
                              Gemini 3.5 AI notu inceliyor ve en iyi sonucu hazırlıyor...
                            </div>
                          )}

                          {/* AI Result Container */}
                          {aiResult && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-zinc-200/50 dark:bg-black/40 border border-purple-500/20 p-3 rounded-lg space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-zinc-300 dark:border-white/5 pb-1 text-[9px] font-mono text-purple-700 dark:text-purple-400">
                                <span>🤖 Yapay Zeka Önerisi:</span>
                                <button onClick={() => setAiResult('')} className="hover:text-zinc-900 dark:hover:text-white">× temizle</button>
                              </div>
                              <div className="text-[11px] font-mono text-zinc-800 dark:text-zinc-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                {aiResult}
                              </div>
                              <div className="flex gap-2 justify-end pt-1">
                                <button 
                                  onClick={() => handleApplyAiResult('append')}
                                  className="px-3 py-1.5 bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-700 rounded text-[9px] font-mono text-purple-700 dark:text-purple-300 border border-purple-500/20"
                                >
                                  Notun Sonuna Ekle
                                </button>
                                <button 
                                  onClick={() => handleApplyAiResult('replace')}
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[9px] font-mono font-bold"
                                >
                                  Mevcut Notla Değiştir
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Note Footer Status bar */}
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-zinc-500">
                    {/* Tags manager */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Tag size={10} className="text-cyan-600 dark:text-cyan-400" />
                      {activeNote.tags.map(t => (
                        <span key={t} className="bg-zinc-200 dark:bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-white/5">
                          #{t}
                          <button onClick={() => handleRemoveTag(t)} className="text-zinc-400 hover:text-rose-500 font-bold text-[11px]">×</button>
                        </span>
                      ))}
                      <input 
                        value={currentTagInput}
                        onChange={(e) => setCurrentTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="+ etiket ekle..."
                        className="bg-transparent border-none text-[10px] text-zinc-600 dark:text-zinc-400 placeholder-zinc-400 dark:placeholder-zinc-700 focus:outline-none w-20"
                      />
                    </div>

                    {/* Word counts & stats */}
                    <div className="flex items-center gap-2">
                      <span>Karakter: <strong className="text-zinc-800 dark:text-zinc-300">{noteStats.chars}</strong></span>
                      <span>•</span>
                      <span>Sözcük: <strong className="text-zinc-800 dark:text-zinc-300">{noteStats.words}</strong></span>
                      <span>•</span>
                      <span className="text-[9px] text-green-600 dark:text-green-500 bg-green-500/10 px-1.5 py-0.2 rounded border border-green-500/20 font-bold uppercase">Kaydedildi</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* Empty Editor State (Polished) */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500 font-mono">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/5 flex items-center justify-center mb-3 shadow-md dark:shadow-2xl">
                    <BookOpen size={24} className="text-zinc-500 dark:text-zinc-400 animate-pulse" />
                  </div>
                  <h3 className="text-zinc-800 dark:text-white text-xs font-bold uppercase tracking-widest mb-1.5">Bir Çalışma Notu Seçin</h3>
                  <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                    İçerikleri görüntülemek, zengin araçlarla metin düzenlemek ve akıllı yapay zeka asistanını kullanmak için sol taraftaki defterlerin içerisinden bir not seçin veya yeni bir not açın.
                  </p>
                  
                  {/* Shortcut tip */}
                  <div className="mt-6 border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-black/10 px-4 py-2.5 rounded-xl text-[10px] leading-relaxed max-w-sm text-left">
                    <span className="text-blue-600 dark:text-blue-400 font-bold block mb-1">💡 Hızlı Tavsiye:</span>
                    Soldaki sistem klasörlerinden birini seçtikten sonra hemen yanında beliren "Yeni Not" butonuna tıklayarak ilk dökümanınızı oluşturabilirsiniz.
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* FULL QUICK NOTES GRAPHIC KANBAN BOARD VIEW */
          <div className="lg:col-span-12 flex flex-col gap-4 overflow-hidden h-full">
            
            {/* Quick Sticky Note Creation & Filtering Deck */}
            <div className="bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckSquare size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-[10px] font-mono font-black uppercase text-purple-700 dark:text-purple-300 tracking-wider">
                    Yeni Yapışkan Fikir veya Not Ekle
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Hızlıca fikirlerinizi karalayın, renklendirin ve sonradan zengin defter notlarına dönüştürün!
                </span>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-purple-600 dark:text-purple-400 font-bold">Fikir Başlığı</label>
                  <input 
                    value={newQuickTitle}
                    onChange={(e) => setNewQuickTitle(e.target.value)}
                    placeholder="örn: Yeni Mobil Uygulama Fikri"
                    className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/5 rounded-xl h-10 px-3 text-xs font-mono text-zinc-800 dark:text-white focus:outline-none focus:border-purple-500/40"
                  />
                </div>
                <div className="md:col-span-5 space-y-1">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-purple-600 dark:text-purple-400 font-bold">Hızlı Not İçeriği</label>
                  <input 
                    value={newQuickContent}
                    onChange={(e) => setNewQuickContent(e.target.value)}
                    placeholder="Yapılacak bir iş, geçici şifre, telefon numarası veya taslak fikir..."
                    className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/5 rounded-xl h-10 px-3 text-xs font-mono text-zinc-800 dark:text-white focus:outline-none focus:border-purple-500/40"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuickNote()}
                  />
                </div>

                {/* Color, Pin & Action deck */}
                <div className="md:col-span-4 flex items-center justify-between gap-3 bg-zinc-200/50 dark:bg-black/25 p-1 rounded-xl border border-zinc-300 dark:border-white/5 h-10">
                  <div className="flex items-center gap-1.5 pl-2">
                    {/* Color Dot triggers */}
                    {Object.keys(COLOR_MAP).map(col => (
                      <button 
                        key={col}
                        onClick={() => setNewQuickColor(col)}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform relative hover:scale-125 ${
                          col === 'zinc' ? 'bg-zinc-700' :
                          col === 'blue' ? 'bg-blue-600' :
                          col === 'emerald' ? 'bg-emerald-600' :
                          col === 'amber' ? 'bg-amber-600' :
                          col === 'rose' ? 'bg-rose-600' : 'bg-purple-600'
                        } ${newQuickColor === col ? 'ring-2 ring-zinc-500 dark:ring-white/50' : ''}`}
                        title={col}
                      />
                    ))}
                  </div>

                  {/* Pin action */}
                  <button 
                    onClick={() => setIsQuickPinned(!isQuickPinned)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isQuickPinned 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400' 
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                    }`}
                    title="Başa Sabitle"
                  >
                    <Pin size={11} fill={isQuickPinned ? 'currentColor' : 'none'} />
                  </button>

                  <button 
                    onClick={handleAddQuickNote}
                    disabled={!newQuickContent.trim()}
                    className="px-4 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-mono font-bold text-[10px] uppercase tracking-wider transition-all"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Sticky notes grid deck */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-100/60 dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/5 rounded-xl p-3">
                
                {/* Board Statistics & Instant Color Palette Filter */}
                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 flex-wrap">
                  <span>Mevcut Yapışkan Notlar: <strong className="text-zinc-800 dark:text-white">{filteredQuickNotes.length}</strong></span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span>Renk Filtresi:</span>
                    <button 
                      onClick={() => setSelectedQuickColorFilter(null)}
                      className={`px-1.5 py-0.5 rounded text-[8px] uppercase border font-bold ${
                        !selectedQuickColorFilter 
                          ? 'bg-zinc-800 dark:bg-white/10 text-white border-zinc-850 dark:border-white/10' 
                          : 'bg-zinc-200/50 dark:bg-black/40 text-zinc-500 dark:text-zinc-550 border-zinc-300 dark:border-white/5 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      tümü
                    </button>
                    {Object.keys(COLOR_MAP).map(col => {
                      const count = quickNotes.filter(q => q.color === col).length;
                      if (count === 0) return null;
                      return (
                        <button 
                          key={col}
                          onClick={() => setSelectedQuickColorFilter(selectedQuickColorFilter === col ? null : col)}
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold text-white transition-all ${
                            col === 'zinc' ? 'bg-zinc-700' :
                            col === 'blue' ? 'bg-blue-600' :
                            col === 'emerald' ? 'bg-emerald-600' :
                            col === 'amber' ? 'bg-amber-600' :
                            col === 'rose' ? 'bg-rose-600' : 'bg-purple-600'
                          } ${selectedQuickColorFilter === col ? 'ring-2 ring-zinc-800 dark:ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                          title={`${col} (${count})`}
                        >
                          {count}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant board search */}
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={10} />
                  <input 
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    placeholder="Tahtada hızlı not ara..."
                    className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/5 rounded-lg h-7 pl-7 pr-3 text-[10px] font-mono text-zinc-800 dark:text-white focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>

              {/* Scrollable grid area for authentic post-it notes */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {filteredQuickNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 dark:text-zinc-600 font-mono">
                    <LayoutGrid size={24} className="mb-2 text-zinc-400 dark:text-zinc-700 animate-pulse" />
                    <p className="text-xs">Hiç yapışkan hızlı not bulunamadı veya renk filtresiyle eşleşmiyor.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                    {filteredQuickNotes.map(note => (
                      <motion.div 
                        key={note.id}
                        layout
                        whileHover={{ scale: 1.015, rotate: -0.5 }}
                        className={`p-4 rounded-xl border relative flex flex-col justify-between min-h-[160px] group transition-shadow ${COLOR_MAP[note.color] || COLOR_MAP.zinc} shadow-lg`}
                      >
                        <div>
                          {/* Card Header & Controls */}
                          <div className="flex items-start justify-between gap-1.5 mb-2.5 pb-1.5 border-b border-black/5 dark:border-white/5">
                            <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[150px]">
                              {note.title}
                            </span>
                            
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* convert to rich doc button */}
                              <button 
                                onClick={(e) => handleStartConversion(note, e)}
                                title="Not Defterine Aktar (Rich Note)"
                                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                              >
                                <ExternalLink size={10} />
                              </button>
                              <button 
                                onClick={(e) => handleTogglePinQuickNote(note.id, e)}
                                className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${note.isPinned ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-500'}`}
                                title={note.isPinned ? "Sabitlendi" : "Sabitle"}
                              >
                                <Pin size={10} fill={note.isPinned ? 'currentColor' : 'none'} />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteQuickNote(note.id, e)}
                                className="p-1 rounded-md hover:bg-rose-500/20 text-zinc-600 hover:text-rose-500"
                                title="Sil"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>

                          {/* Editable note contents */}
                          <textarea 
                            value={note.content}
                            onChange={(e) => handleUpdateQuickNoteContent(note.id, e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-[11px] leading-relaxed font-mono focus:outline-none resize-none focus:ring-0 min-h-[75px] custom-scrollbar text-inherit"
                          />
                        </div>

                        {/* Card Footer Details */}
                        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-2 text-[8px] font-mono text-zinc-500 dark:text-zinc-400">
                          <span>⏱️ {note.createdAt}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleInsertQuickNoteToEditor(note)}
                              className="text-[8px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 font-bold uppercase transition-all text-inherit"
                              title="Sağdaki Editöre Alıntı Olarak Ekle"
                            >
                              aktar +
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(note.content);
                                alert('İçerik panoya kopyalandı.');
                              }}
                              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
                              title="Kopyala"
                            >
                              <Copy size={9} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* POPUP: ADD FOLDER / NOTEBOOK MODAL */}
      <AnimatePresence>
        {isAddFolderModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddFolderModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-2xl space-y-4"
            >
              <h2 className="text-xs font-display font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <FolderPlus size={14} className="text-blue-500 dark:text-blue-400" />
                {newFolderParentId ? 'Alt Klasör / Defter Ekle' : 'Yeni Not Defteri Ekle'}
              </h2>
              
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">Klasör Adı</label>
                <input 
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="örn: 🚀 Yapay Zeka Projesi"
                  className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl h-10 px-3 text-xs font-mono text-zinc-850 dark:text-white focus:outline-none focus:border-blue-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>

              {newFolderParentId && (
                <div className="text-[9px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-black/25 p-2 rounded-lg border border-zinc-200 dark:border-white/5">
                  Üst Klasör: <strong>{folders.find(f => f.id === newFolderParentId)?.name}</strong>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button 
                  onClick={() => setIsAddFolderModalOpen(false)}
                  className="px-3.5 py-1.5 text-[9px] font-mono text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white uppercase"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl text-white text-[9px] font-mono font-bold uppercase transition-all"
                >
                  Oluştur
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP: CONVERT QUICK NOTE TO RICH NOTE MODAL */}
      <AnimatePresence>
        {convertingNote && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConvertingNote(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-2xl space-y-4"
            >
              <h2 className="text-xs font-display font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <ExternalLink size={14} />
                Zengin Defter Notuna Dönüştür
              </h2>

              <p className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-100 dark:bg-black/25 p-3 rounded-lg border border-zinc-200 dark:border-white/5">
                "{convertingNote.title}" hızlı notu, seçeceğiniz klasör altında zengin içerikli, gelişmiş düzenleme yetenekli bir defter notuna dönüştürülecektir. Yapışkan not silinecektir.
              </p>
              
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-450 font-bold">Not Başlığı</label>
                <input 
                  value={conversionTitle}
                  onChange={(e) => setConversionTitle(e.target.value)}
                  placeholder="Başlık girin..."
                  className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl h-10 px-3 text-xs font-mono text-zinc-850 dark:text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-450 font-bold">Hedef Defter / Klasör Seçin</label>
                <select 
                  value={conversionFolderId}
                  onChange={(e) => setConversionFolderId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-xl h-10 px-3 text-xs font-mono text-zinc-850 dark:text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-mono">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button 
                  onClick={() => setConvertingNote(null)}
                  className="px-3.5 py-1.5 text-[9px] font-mono text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white uppercase"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleConfirmConversion}
                  disabled={!conversionFolderId || !folders.some(f => f.id === conversionFolderId)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 rounded-xl text-white text-[9px] font-mono font-bold uppercase transition-all"
                >
                  Dönüştür ve Aktar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
