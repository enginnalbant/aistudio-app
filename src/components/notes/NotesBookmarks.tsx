import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  Star, 
  Trash2, 
  Plus, 
  Search, 
  Sparkles, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Loader2, 
  Download, 
  Folder, 
  Heart, 
  Filter, 
  ArrowUpDown, 
  FolderPlus, 
  Edit2, 
  Archive, 
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Play,
  RefreshCw,
  Clock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { 
  db, 
  handleFirestoreError, 
  OperationType,
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch,
  increment
} from '../../lib/firebase';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  favorite: boolean;
  rating: number; // 1-5
  createdAt: string;
  updatedAt: string;
  notes: string;
  aiSummary: string;
  aiTags: string[];
  clicks: number;
  status: 'unread' | 'reading' | 'archived';
}

const CATEGORIES = [
  'Yazılım & Geliştirme',
  'Tasarım & Kreatif',
  'Sosyal Medya',
  'Eğitim & Öğrenim',
  'Haber & Blog',
  'Yapay Zeka & Araçlar',
  'Eğlence & Kültür',
  'Alışveriş & Ürünler',
  'Finans & İş',
  'Kişisel'
];

export function NotesBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically compute all unique categories (default + user-saved ones)
  const allCategories = useMemo(() => {
    const set = new Set(CATEGORIES);
    bookmarks.forEach(b => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [bookmarks]);

  // Form States (New Bookmark)
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Yazılım & Geliştirme');
  const [tagsInput, setTagsInput] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [analysisMode, setAnalysisMode] = useState<'ai' | 'local'>('ai');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  // Multiple Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedBookmarks, setParsedBookmarks] = useState<{ title: string; url: string; notes?: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [importCategory, setImportCategory] = useState('Kişisel');

  const parseBookmarkFile = (text: string, isJson: boolean) => {
    if (isJson) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            title: item.title || item.name || 'Yer İmi',
            url: item.url || item.href || '',
            notes: item.notes || item.description || ''
          })).filter(item => item.url);
        } else if (parsed && typeof parsed === 'object') {
          const found: { title: string; url: string }[] = [];
          const traverse = (node: any) => {
            if (node.type === 'url' && node.url) {
              found.push({ title: node.name || node.title || 'Yer İmi', url: node.url });
            }
            if (node.children && Array.isArray(node.children)) {
              node.children.forEach(traverse);
            }
            if (typeof node === 'object') {
              for (const key in node) {
                if (typeof node[key] === 'object') {
                  traverse(node[key]);
                }
              }
            }
          };
          traverse(parsed);
          return found;
        }
      } catch (e) {
        console.error('JSON parsing failed:', e);
      }
      return [];
    } else {
      const list: { title: string; url: string }[] = [];
      const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const url = match[1];
        let title = match[2].replace(/<[^>]*>/g, '').trim();
        if (!title) {
          try {
            title = new URL(url).hostname;
          } catch {
            title = 'Yer İmi';
          }
        }
        list.push({ title, url });
      }
      return list;
    }
  };

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const isJson = file.name.endsWith('.json') || file.type === 'application/json';
      const results = parseBookmarkFile(content, isJson);
      if (results.length > 0) {
        setParsedBookmarks(results);
        alert(`Dosyadan ${results.length} adet yer imi başarıyla yüklendi!`);
      } else {
        alert('Dosyada geçerli bir yer imi (HTML veya JSON formatında) bulunamadı.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Editing State
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editStatus, setEditStatus] = useState<'unread' | 'reading' | 'archived'>('unread');

  // Filter & Search & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating' | 'clicks' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Expanded AI Summary State (List of expanded bookmark ids)
  const [expandedAiIds, setExpandedAiIds] = useState<string[]>([]);

  // Clipboard copies
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Wizard states and types
  interface WizardItem {
    id: string;
    title: string;
    url: string;
    originalCategory: string;
    recommendedCategory: string;
    recommendedTitle: string;
    recommendedTags: string[];
    aiSummary: string;
    status: 'pending' | 'analyzing' | 'completed' | 'failed';
    selected: boolean;
  }

  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [wizardItems, setWizardItems] = useState<WizardItem[]>([]);
  const [isWizardRunning, setIsWizardRunning] = useState(false);
  const [wizardFilterCategory, setWizardFilterCategory] = useState<string>('all');
  const [wizardConcurrency, setWizardConcurrency] = useState(8);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const handleLoadWizardItems = () => {
    let targets = [...bookmarks];
    if (wizardFilterCategory !== 'all') {
      targets = targets.filter(b => b.category === wizardFilterCategory);
    }
    
    const items: WizardItem[] = targets.map(b => ({
      id: b.id,
      title: b.title,
      url: b.url,
      originalCategory: b.category,
      recommendedCategory: b.category,
      recommendedTitle: b.title,
      recommendedTags: b.tags,
      aiSummary: b.aiSummary || '',
      status: 'pending',
      selected: true
    }));
    setWizardItems(items);
    setElapsedSeconds(0);
  };

  const handleStartAiWizardAnalysis = async () => {
    if (isWizardRunning) return;
    setIsWizardRunning(true);
    setElapsedSeconds(0);

    const updatedItems = [...wizardItems];
    const itemsToProcess = updatedItems.filter(item => item.selected && item.status !== 'completed');
    
    if (itemsToProcess.length === 0) {
      alert('Analiz edilecek sırada bekleyen veya seçili yer imi bulunamadı!');
      setIsWizardRunning(false);
      return;
    }

    const setItemStatus = (id: string, updates: Partial<WizardItem>) => {
      setWizardItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    // Start timer
    const startTime = Date.now();
    const timerId = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startTime) / 1000));
    }, 1000);

    const queue = [...itemsToProcess];
    
    const processItem = async (item: WizardItem) => {
      setItemStatus(item.id, { status: 'analyzing' });
      try {
        const response = await fetch('/api/analyze-bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: item.url, title: item.title, mode: analysisMode })
        });
        
        if (!response.ok) {
          throw new Error('API failed');
        }
        
        const data = await response.json();
        setItemStatus(item.id, {
          status: 'completed',
          recommendedCategory: data.category || 'Kişisel',
          recommendedTitle: data.title || item.title,
          recommendedTags: data.tags || [],
          aiSummary: data.aiSummary || data.description || ''
        });
      } catch (err) {
        console.error(`Wizard error for URL ${item.url}:`, err);
        setItemStatus(item.id, { status: 'failed' });
      }
    };

    const workers = Array(Math.min(wizardConcurrency, queue.length)).fill(null).map(async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          await processItem(item);
        }
      }
    });

    await Promise.all(workers);
    clearInterval(timerId);
    setIsWizardRunning(false);
  };

  const handleSaveWizardResults = async () => {
    if (!user || wizardItems.length === 0) return;
    
    const completedAndSelected = wizardItems.filter(item => item.status === 'completed' && item.selected);
    if (completedAndSelected.length === 0) {
      alert('Kaydedilecek analiz edilmiş ve seçili yer imi bulunmamaktadır!');
      return;
    }

    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      completedAndSelected.forEach((item) => {
        const docRef = doc(db, 'users', user.uid, 'bookmarks', item.id);
        batch.update(docRef, {
          category: item.recommendedCategory,
          title: item.recommendedTitle,
          tags: item.recommendedTags,
          aiSummary: item.aiSummary,
          updatedAt: new Date().toISOString()
         });
      });
      await batch.commit();
      setIsAiWizardOpen(false);
      setWizardItems([]);
      alert(`${completedAndSelected.length} adet yer imi yapay zeka analizine göre başarıyla güncellendi!`);
    } catch (err) {
      console.error('Error saving wizard results:', err);
      alert('Veriler kaydedilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time Firestore sync
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      setIsLoading(false);
      return;
    }

    const path = `users/${user.uid}/bookmarks`;
    const q = query(collection(db, 'users', user.uid, 'bookmarks'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const list: BookmarkItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || '',
          url: data.url || '',
          description: data.description || '',
          category: data.category || 'Kişisel',
          tags: Array.isArray(data.tags) ? data.tags : [],
          favorite: !!data.favorite,
          rating: Number(data.rating) || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          notes: data.notes || '',
          aiSummary: data.aiSummary || '',
          aiTags: Array.isArray(data.aiTags) ? data.aiTags : [],
          clicks: Number(data.clicks) || 0,
          status: (data.status as any) || 'unread'
        });
      });
      setBookmarks(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsub();
  }, [user]);

  // Extract Domain for Favicon
  const getDomain = (urlStr: string) => {
    try {
      let temp = urlStr.trim();
      if (!temp.startsWith('http://') && !temp.startsWith('https://')) {
        temp = 'https://' + temp;
      }
      const parsed = new URL(temp);
      return parsed.hostname;
    } catch (e) {
      return '';
    }
  };

  // Run AI/Local Analyzer to pre-fill/save
  const handleAiAnalyze = async () => {
    if (!url.trim()) {
      alert('Analiz için geçerli bir URL girmelisiniz!');
      return;
    }
    setIsAiAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim(), notes: notes.trim(), mode: analysisMode })
      });

      if (!response.ok) {
        throw new Error('Analiz sunucusu yanıt vermedi.');
      }

      const data = await response.json();
      
      // Auto populate form
      setTitle(data.title || '');
      setCategory(data.category || 'Yazılım & Geliştirme');
      setNotes(prev => prev ? `${prev}\n\nAnaliz Notu: ${data.description}` : data.description);
      if (data.tags && data.tags.length > 0) {
        setTagsInput(data.tags.join(', '));
      }
      
      const methodLabel = data.method === 'ai' ? 'Yapay zeka' : 'Dinamik yerel algoritmalar';
      alert(`${methodLabel} siteyi başarıyla analiz etti! Kategoriyi, başlığı ve etiketleri otomatik güncelledik.`);
    } catch (err: any) {
      console.error(err);
      alert('Analiz başarısız oldu. Manuel girmeye devam edebilirsiniz.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Add Single Bookmark
  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Attempt AI automated fetch in the background if title is blank and not analyzed
    let finalTitle = title.trim() || getDomain(targetUrl) || 'Yeni Yer İmi';
    let finalDescription = '';
    let finalAiSummary = '';
    let finalAiTags: string[] = [];

    setIsAiAnalyzing(true);

    try {
      // If title was blank or user requested auto analysis, hit the analyzer
      const response = await fetch('/api/analyze-bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, title: title.trim(), notes: notes.trim(), mode: analysisMode })
      });

      if (response.ok) {
        const data = await response.json();
        finalTitle = data.title || finalTitle;
        finalDescription = data.description || '';
        finalAiSummary = data.aiSummary || '';
        finalAiTags = data.tags || [];
      }
    } catch (err) {
      console.warn("Background analysis skipped or failed:", err);
    } finally {
      setIsAiAnalyzing(false);
    }

    try {
      const processedTags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const timestamp = new Date().toISOString();

      const newBookmark = {
        title: finalTitle,
        url: targetUrl,
        description: finalDescription,
        category,
        tags: Array.from(new Set([...processedTags, ...finalAiTags])),
        favorite,
        rating: Number(rating) || 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        notes: notes.trim(),
        aiSummary: finalAiSummary,
        aiTags: finalAiTags,
        clicks: 0,
        status: 'unread'
      };

      await addDoc(collection(db, 'users', user.uid, 'bookmarks'), newBookmark);
      
      // Reset Form
      setUrl('');
      setTitle('');
      setNotes('');
      setCategory('Yazılım & Geliştirme');
      setTagsInput('');
      setFavorite(false);
      setRating(0);
      setIsAddingBookmark(false);
    } catch (err) {
      console.error('Bookmark ekleme hatası:', err);
    }
  };

  // Import Bulk URLs
  const handleBulkImport = async () => {
    if (!user) return;
    
    let itemsToImport: { title: string; url: string; notes?: string }[] = [];

    if (parsedBookmarks.length > 0) {
      itemsToImport = parsedBookmarks;
    } else if (importText.trim()) {
      const lines = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      itemsToImport = lines.map(line => {
        let cleanUrl = line;
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        return {
          title: getDomain(cleanUrl) || 'İçe Aktarılan Bağlantı',
          url: cleanUrl
        };
      });
    }

    if (itemsToImport.length === 0) {
      alert('İçe aktarılacak bağlantı bulunamadı!');
      return;
    }

    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const chunkSize = 400; // safe chunk size for firestore batch
      
      for (let i = 0; i < itemsToImport.length; i += chunkSize) {
        const chunk = itemsToImport.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        
        chunk.forEach((item) => {
          let cleanUrl = item.url.trim();
          if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
          }
          
          const docRef = doc(collection(db, 'users', user.uid, 'bookmarks'));
          batch.set(docRef, {
            title: item.title || getDomain(cleanUrl) || 'Yer İmi',
            url: cleanUrl,
            description: item.notes || 'Dosyadan toplu içe aktarım ile eklendi.',
            category: importCategory,
            tags: ['dosya-aktarim'],
            favorite: false,
            rating: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
            notes: item.notes || '',
            aiSummary: '',
            aiTags: [],
            clicks: 0,
            status: 'unread'
          });
        });
        
        await batch.commit();
      }

      setImportText('');
      setParsedBookmarks([]);
      setIsImporting(false);
      alert(`${itemsToImport.length} adet yer imi başarıyla "${importCategory}" koleksiyonuna aktarıldı!`);
    } catch (err) {
      console.error('Toplu aktarım hatası:', err);
      alert('Yer imleri içe aktarılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (b: BookmarkItem) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'bookmarks', b.id), {
        favorite: !b.favorite,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Rate Bookmark
  const handleSetRating = async (b: BookmarkItem, r: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'bookmarks', b.id), {
        rating: r,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Register click / visit link
  const handleVisitLink = async (b: BookmarkItem) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'bookmarks', b.id), {
        clicks: increment(1),
        status: b.status === 'unread' ? 'reading' : b.status
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Bookmark
  const handleDeleteBookmark = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Bu yer imini silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Save Edits
  const handleSaveEdit = async () => {
    if (!user || !editingBookmark) return;
    try {
      const processedTags = editTags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      await updateDoc(doc(db, 'users', user.uid, 'bookmarks', editingBookmark.id), {
        title: editTitle.trim() || editingBookmark.title,
        category: editCategory,
        notes: editNotes.trim(),
        tags: processedTags,
        status: editStatus,
        updatedAt: new Date().toISOString()
      });
      setEditingBookmark(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (b: BookmarkItem) => {
    setEditingBookmark(b);
    setEditTitle(b.title);
    setEditCategory(b.category);
    setEditNotes(b.notes);
    setEditTags(b.tags.join(', '));
    setEditStatus(b.status);
  };

  // Copy Link to Clipboard
  const handleCopyLink = (b: BookmarkItem) => {
    navigator.clipboard.writeText(b.url);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Bulk Selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (!user || selectedIds.length === 0) return;
    if (!window.confirm(`${selectedIds.length} adet yer imini silmek istediğinize emin misiniz?`)) return;

    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        batch.delete(doc(db, 'users', user.uid, 'bookmarks', id));
      });
      await batch.commit();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkMoveCategory = async (targetCat: string) => {
    if (!user || selectedIds.length === 0) return;
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        batch.update(doc(db, 'users', user.uid, 'bookmarks', id), {
          category: targetCat,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      setSelectedIds([]);
      alert(`Seçilen yer imleri "${targetCat}" kategorisine taşındı.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Export Bookmark Collection as JSON file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apexos_bookmarks_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter & Sort Logic
  const filteredAndSortedBookmarks = useMemo(() => {
    let list = [...bookmarks];

    // Category Filter
    if (activeCategoryFilter !== 'all') {
      list = list.filter(b => b.category === activeCategoryFilter);
    }

    // Favorite Filter
    if (filterFavoriteOnly) {
      list = list.filter(b => b.favorite);
    }

    // Status Filter
    if (filterStatus !== 'all') {
      list = list.filter(b => b.status === filterStatus);
    }

    // Search Query (title, url, notes, description, tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.url.toLowerCase().includes(q) || 
        b.notes.toLowerCase().includes(q) || 
        b.description.toLowerCase().includes(q) || 
        b.tags.some(tag => tag.toLowerCase().includes(q)) ||
        b.aiSummary.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let result = 0;
      if (sortBy === 'rating') {
        result = b.rating - a.rating;
      } else if (sortBy === 'clicks') {
        result = b.clicks - a.clicks;
      } else if (sortBy === 'title') {
        result = a.title.localeCompare(b.title);
      } else {
        result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return sortOrder === 'asc' ? -result : result;
    });

    return list;
  }, [bookmarks, activeCategoryFilter, filterFavoriteOnly, filterStatus, searchQuery, sortBy, sortOrder]);

  // Toggle expanded AI summary
  const toggleExpandedAi = (id: string) => {
    setExpandedAiIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Stats Counters
  const stats = useMemo(() => {
    const total = bookmarks.length;
    const favorites = bookmarks.filter(b => b.favorite).length;
    const archived = bookmarks.filter(b => b.status === 'archived').length;
    const unread = bookmarks.filter(b => b.status === 'unread').length;
    const totalClicks = bookmarks.reduce((sum, b) => sum + (b.clicks || 0), 0);

    // Distribution by category
    const catMap: Record<string, number> = {};
    bookmarks.forEach(b => {
      catMap[b.category] = (catMap[b.category] || 0) + 1;
    });

    return { total, favorites, archived, unread, totalClicks, catMap };
  }, [bookmarks]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-text-primary">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 px-2 pt-2 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-black text-text-primary mb-1 flex items-center gap-3">
            <Bookmark className="text-focus-neon animate-pulse shrink-0" size={28} />
            Akıllı Yer İmleri & Arşiv
          </h1>
          <p className="text-text-secondary text-xs">
            Bağlantılarınızı kategorize edin, yapay zeka ile otomatik özetler çıkartın, etiketler ekleyin ve önemli dökümanlarınızı arşivleyin.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => { setIsAiWizardOpen(true); handleLoadWizardItems(); }}
            className="px-3.5 py-2 bg-grow-phosphor/10 hover:bg-grow-phosphor/20 border border-grow-phosphor/20 hover:border-grow-phosphor/40 text-grow-phosphor rounded-xl text-xs flex items-center gap-2 font-bold transition-all"
          >
            <Sparkles size={13} className="animate-pulse text-grow-phosphor" />
            AI Sınıflandırma Sihirbazı
          </button>

          <button
            onClick={() => setIsImporting(!isImporting)}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs flex items-center gap-2 border border-white/5 font-semibold transition-all"
          >
            <Download size={13} className="rotate-180" />
            Toplu İçe Aktar
          </button>
          
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs flex items-center gap-2 border border-white/5 font-semibold transition-all"
          >
            <Download size={13} />
            Dışa Aktar (JSON)
          </button>

          <button
            onClick={() => setIsAddingBookmark(!isAddingBookmark)}
            className="os-btn os-btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <Plus size={14} />
            {isAddingBookmark ? 'Kapat' : 'Yer İmi Ekle'}
          </button>
        </div>
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4 shrink-0">
        <div className="bento-card p-4 flex items-center gap-3.5 h-20">
          <div className="size-9 rounded-lg bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center text-focus-neon shrink-0">
            <Bookmark size={16} />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Tüm Bağlantılar</span>
            <span className="text-xl font-display font-black block leading-none mt-1">{stats.total}</span>
          </div>
        </div>

        <div className="bento-card p-4 flex items-center gap-3.5 h-20">
          <div className="size-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Heart size={16} className="fill-rose-400/20" />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Sık Kullanılanlar</span>
            <span className="text-xl font-display font-black block leading-none mt-1 text-rose-400">{stats.favorites}</span>
          </div>
        </div>

        <div className="bento-card p-4 flex items-center gap-3.5 h-20">
          <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle size={16} />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Okunmamış Yer İmleri</span>
            <span className="text-xl font-display font-black block leading-none mt-1 text-amber-400">{stats.unread}</span>
          </div>
        </div>

        <div className="bento-card p-4 flex items-center gap-3.5 h-20">
          <div className="size-9 rounded-lg bg-skel-metal/15 border border-skel-metal/20 flex items-center justify-center text-skel-metal shrink-0">
            <Archive size={16} />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Arşivlenmiş</span>
            <span className="text-xl font-display font-black block leading-none mt-1 text-skel-metal">{stats.archived}</span>
          </div>
        </div>

        <div className="bento-card p-4 flex items-center gap-3.5 h-20">
          <div className="size-9 rounded-lg bg-grow-phosphor/10 border border-grow-phosphor/20 flex items-center justify-center text-grow-phosphor shrink-0">
            <ExternalLink size={16} />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Toplam Tıklanma / Ziyaret</span>
            <span className="text-xl font-display font-black block leading-none mt-1 text-grow-phosphor">{stats.totalClicks}</span>
          </div>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6 overflow-hidden min-h-0">
        
        {/* LEFT BAR: Categories Selection list */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 shrink-0">
          <div className="bento-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold font-mono text-text-secondary uppercase flex items-center gap-1.5">
                <Folder size={12} />
                Koleksiyonlar
              </span>
              <span className="text-[10px] font-mono text-text-secondary bg-white/5 px-1.5 py-0.5 rounded-full">{allCategories.length}</span>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-semibold ${
                  activeCategoryFilter === 'all' 
                    ? 'bg-focus-neon/10 border border-focus-neon/20 text-focus-neon font-bold shadow-sm shadow-focus-neon/5' 
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bookmark size={13} />
                  Tüm Koleksiyonlar
                </span>
                <span className="font-mono text-[10px]">{bookmarks.length}</span>
              </button>

              {allCategories.map((cat) => {
                const count = stats.catMap[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-semibold ${
                      activeCategoryFilter === cat 
                        ? 'bg-focus-neon/10 border border-focus-neon/20 text-focus-neon font-bold shadow-sm shadow-focus-neon/5' 
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder size={13} className={activeCategoryFilter === cat ? 'text-focus-neon' : 'text-text-secondary/60'} />
                      {cat}
                    </span>
                    <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.2 rounded">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filters Card */}
          <div className="bento-card p-4 space-y-3">
            <span className="text-xs font-bold font-mono text-text-secondary uppercase block pb-1 border-b border-white/5">Durum & Favoriler</span>
            
            <div className="space-y-1.5">
              <button
                onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-semibold border ${
                  filterFavoriteOnly 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold' 
                    : 'text-text-secondary border-transparent hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Heart size={13} className={filterFavoriteOnly ? 'fill-rose-400' : ''} />
                  Sadece Favoriler
                </span>
                <span className="font-mono text-[10px]">{stats.favorites}</span>
              </button>

              <div className="h-px bg-white/5 my-1" />

              <button
                onClick={() => setFilterStatus(filterStatus === 'unread' ? 'all' : 'unread')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-semibold border ${
                  filterStatus === 'unread'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold'
                    : 'text-text-secondary border-transparent hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                <span>📖 Okunmamış / Yeni</span>
                <span className="font-mono text-[10px]">{stats.unread}</span>
              </button>

              <button
                onClick={() => setFilterStatus(filterStatus === 'reading' ? 'all' : 'reading')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-semibold border ${
                  filterStatus === 'reading'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 font-bold'
                    : 'text-text-secondary border-transparent hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                <span>👀 İncelenenler</span>
                <span className="font-mono text-[10px]">{bookmarks.filter(b => b.status === 'reading').length}</span>
              </button>

              <button
                onClick={() => setFilterStatus(filterStatus === 'archived' ? 'all' : 'archived')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-semibold border ${
                  filterStatus === 'archived'
                    ? 'bg-skel-metal/20 border-skel-metal/30 text-skel-metal font-bold'
                    : 'text-text-secondary border-transparent hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                <span>📦 Arşivlenmiş Bağlantılar</span>
                <span className="font-mono text-[10px]">{stats.archived}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bookmarks List & Add Form overlay */}
        <div className="xl:col-span-9 flex flex-col gap-4 overflow-hidden min-h-0">
          
          {/* Add Bookmark form block */}
          <AnimatePresence>
            {isAddingBookmark && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddBookmark}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-sm relative shrink-0 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold font-mono text-text-secondary uppercase flex items-center gap-2">
                    <Plus size={13} className="text-focus-neon" />
                    Yeni Yer İmi Kaydet
                  </h3>
                  <button type="button" onClick={() => setIsAddingBookmark(false)} className="text-text-secondary hover:text-text-primary p-1">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-text-secondary uppercase">Bağlantı Adresi (URL) *</label>
                      
                      {/* Analysis Method Toggle */}
                      <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-lg p-0.5 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setAnalysisMode('ai')}
                          className={`px-2 py-0.5 rounded-md transition-all ${analysisMode === 'ai' ? 'bg-grow-phosphor/20 text-grow-phosphor font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                          Yapay Zeka (AI)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalysisMode('local')}
                          className={`px-2 py-0.5 rounded-md transition-all ${analysisMode === 'local' ? 'bg-focus-neon/20 text-focus-neon font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                          Dinamik Yerel
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Örn: https://github.com/trending"
                        className="flex-1 bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                      />
                      <button
                        type="button"
                        onClick={handleAiAnalyze}
                        disabled={isAiAnalyzing || !url}
                        className={`px-3 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${analysisMode === 'ai' ? 'bg-grow-phosphor/10 hover:bg-grow-phosphor/20 border-grow-phosphor/20 hover:border-grow-phosphor/40 text-grow-phosphor' : 'bg-focus-neon/10 hover:bg-focus-neon/20 border-focus-neon/20 hover:border-focus-neon/40 text-focus-neon'}`}
                        title={analysisMode === 'ai' ? "Link bilgilerini ve özetini yapay zeka ile otomatik doldur" : "Link bilgilerini ve kategorisini internet sitesinden anlık çekerek doldur (API anahtarı gerekmez)"}
                      >
                        {isAiAnalyzing ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : analysisMode === 'ai' ? (
                          <Sparkles size={13} />
                        ) : (
                          <Globe size={13} />
                        )}
                        {analysisMode === 'ai' ? 'AI Analiz' : 'Yerel Analiz'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Koleksiyon</label>
                    <input
                      type="text"
                      list="categories-datalist"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Kategori yazın veya seçin"
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Başlık (Opsiyonel - Boş bırakılırsa otomatik doldurulur)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: GitHub Trending Repositories"
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Etiketler (Virgülle ayırın)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="github, open-source, kodlama"
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">Kişisel Notlarınız</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Bu site hakkında ileride işinize yarayacak notlarınızı ekleyebilirsiniz..."
                    rows={2}
                    className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={favorite}
                        onChange={(e) => setFavorite(e.target.checked)}
                        className="rounded border-white/20 bg-black/20 text-focus-neon focus:ring-0 focus:ring-offset-0 size-4"
                      />
                      Sık Kullanılanlara Ekle
                    </label>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-text-secondary mr-1">Önem Derecesi:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star 
                            size={14} 
                            className={`${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingBookmark(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-text-secondary transition-all"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={isAiAnalyzing}
                      className="os-btn os-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                      {isAiAnalyzing && <Loader2 size={13} className="animate-spin" />}
                      Bağlantıyı Kaydet
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Import Panel overlay */}
          <AnimatePresence>
            {isImporting && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 shrink-0"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold font-mono text-text-secondary uppercase flex items-center gap-1.5">
                    <Download size={13} className="rotate-180 text-focus-neon" />
                    Yer İmi ve Dosya İçe Aktarma Sihirbazı
                  </h3>
                  <button type="button" onClick={() => { setIsImporting(false); setParsedBookmarks([]); setImportText(''); }} className="text-text-secondary hover:text-text-primary">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload / Drag & Drop area */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-text-secondary uppercase block">
                      Yöntem 1: Yer İmi Dosyası Yükleyin (.html, .json)
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] ${
                        dragActive 
                          ? 'border-focus-neon bg-focus-neon/5' 
                          : parsedBookmarks.length > 0 
                            ? 'border-grow-phosphor bg-grow-phosphor/5' 
                            : 'border-white/10 bg-black/10 hover:bg-black/20'
                      }`}
                      onClick={() => document.getElementById('bookmark-file-input')?.click()}
                    >
                      <input
                        id="bookmark-file-input"
                        type="file"
                        accept=".html,.htm,.json"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileProcess(e.target.files[0]);
                          }
                        }}
                      />
                      {parsedBookmarks.length > 0 ? (
                        <>
                          <div className="size-10 rounded-full bg-grow-phosphor/10 flex items-center justify-center text-grow-phosphor mb-2">
                            <Check size={18} />
                          </div>
                          <span className="text-xs text-text-primary font-bold">
                            {parsedBookmarks.length} Bağlantı Yüklendi!
                          </span>
                          <span className="text-[10px] text-text-secondary mt-1">
                            Başka bir dosya seçmek için tıklayın
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary mb-2">
                            <FileText size={18} />
                          </div>
                          <span className="text-xs text-text-primary font-semibold">
                            Tarayıcı yer imi HTML veya JSON dosyasını sürükleyin
                          </span>
                          <span className="text-[10px] text-text-secondary mt-1">
                            veya cihazınızdan seçmek için tıklayın
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Manual Paste area */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-text-secondary uppercase block">
                      Yöntem 2: URL Listesi Yapıştırın (Her satıra bir adet)
                    </label>
                    <textarea
                      rows={6}
                      disabled={parsedBookmarks.length > 0}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="https://google.com&#10;https://github.com&#10;https://wikipedia.org"
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl p-3 text-xs text-text-primary font-mono leading-relaxed resize-none transition-colors h-[140px] disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Shared config line: target category select */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-secondary">Hedef Koleksiyon:</span>
                    <input
                      type="text"
                      list="categories-datalist"
                      value={importCategory}
                      onChange={(e) => setImportCategory(e.target.value)}
                      placeholder="Koleksiyon yazın veya seçin"
                      className="bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-focus-neon/40 h-8 w-48"
                    />
                  </div>

                  {parsedBookmarks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setParsedBookmarks([])}
                      className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold animate-pulse"
                    >
                      <Trash2 size={12} />
                      Yüklenen Listeyi Temizle
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => { setIsImporting(false); setParsedBookmarks([]); setImportText(''); }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-text-secondary transition-all"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={parsedBookmarks.length === 0 && !importText.trim()}
                    className="px-5 py-2 bg-focus-neon hover:bg-focus-neon/80 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Bağlantıları Aktar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Dialog modal */}
          <AnimatePresence>
            {editingBookmark && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-neutral-900 border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                      <Edit2 size={14} className="text-focus-neon" />
                      Yer İmini Güncelle
                    </h3>
                    <button onClick={() => setEditingBookmark(null)} className="text-text-secondary hover:text-text-primary">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-secondary uppercase">Başlık</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-text-secondary uppercase">Koleksiyon</label>
                        <input
                          type="text"
                          list="categories-datalist"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder="Kategori yazın veya seçin"
                          className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-text-secondary uppercase">Durum</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                        >
                          <option value="unread">Okunmamış / Yeni</option>
                          <option value="reading">İnceleniyor</option>
                          <option value="archived">Arşivlendi</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-secondary uppercase">Etiketler (Virgülle ayırın)</label>
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-secondary uppercase">Kişisel Notlar</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setEditingBookmark(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-text-secondary transition-all"
                    >
                      Kapat
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-focus-neon hover:bg-focus-neon/80 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Güncellemeleri Kaydet
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* AI Categorization Wizard Modal */}
          <AnimatePresence>
            {isAiWizardOpen && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-neutral-900 border border-white/10 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-white/10 flex items-start justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-grow-phosphor/15 flex items-center justify-center text-grow-phosphor border border-grow-phosphor/20">
                        <Sparkles size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-sm md:text-base text-text-primary flex items-center gap-2">
                          Yapay Zeka Akıllı Sınıflandırma Sihirbazı
                        </h2>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          Yer imlerinizi yapay zeka ile otomatik analiz edin ve en doğru kategoriyi belirleyin. Manuel düzenleme yapabilirsiniz.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsAiWizardOpen(false); setWizardItems([]); }}
                      className="text-text-secondary hover:text-text-primary p-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      disabled={isWizardRunning}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Controller Bar */}
                  <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-text-secondary">Analiz Kaynağı:</label>
                        <select
                          value={wizardFilterCategory}
                          onChange={(e) => setWizardFilterCategory(e.target.value)}
                          className="bg-neutral-950 border border-white/10 text-xs text-text-primary rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-focus-neon/40 h-9"
                          disabled={isWizardRunning}
                        >
                          <option value="all">Tüm Kategoriler ({bookmarks.length})</option>
                          {allCategories.map(c => (
                            <option key={c} value={c}>
                              {c} ({bookmarks.filter(b => b.category === c).length})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleLoadWizardItems}
                        className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-text-primary rounded-lg transition-all h-9"
                        disabled={isWizardRunning}
                      >
                        Yer İmlerini Yükle
                      </button>

                      <div className="h-6 w-px bg-white/10 hidden sm:block" />

                      {/* Analysis Mode Toggle in Wizard */}
                      <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-lg p-1 h-9 text-[11px] font-mono">
                        <span className="text-[10px] text-text-secondary uppercase px-1.5">Yöntem:</span>
                        <button
                          type="button"
                          onClick={() => setAnalysisMode('ai')}
                          className={`px-2.5 py-1 rounded-md transition-all ${analysisMode === 'ai' ? 'bg-grow-phosphor/20 text-grow-phosphor font-bold text-xs' : 'text-text-secondary hover:text-text-primary text-xs'}`}
                          disabled={isWizardRunning}
                        >
                          Yapay Zeka (AI)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalysisMode('local')}
                          className={`px-2.5 py-1 rounded-md transition-all ${analysisMode === 'local' ? 'bg-focus-neon/20 text-focus-neon font-bold text-xs' : 'text-text-secondary hover:text-text-primary text-xs'}`}
                          disabled={isWizardRunning}
                        >
                          Dinamik Yerel
                        </button>
                      </div>

                      {/* Concurrency speed selector control */}
                      <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 h-9">
                        <span className="text-[10px] font-mono text-text-secondary uppercase">Analiz Hızı:</span>
                        <select
                          value={wizardConcurrency}
                          onChange={(e) => setWizardConcurrency(Number(e.target.value))}
                          className="bg-transparent border-none text-xs text-grow-phosphor font-bold focus:outline-none cursor-pointer"
                          disabled={isWizardRunning}
                        >
                          <option value={2} className="bg-neutral-900">2x (Normal)</option>
                          <option value={4} className="bg-neutral-900">4x (Hızlı)</option>
                          <option value={8} className="bg-neutral-900">8x (Çok Hızlı)</option>
                          <option value={12} className="bg-neutral-900">12x (Süper Hızlı)</option>
                          <option value={16} className="bg-neutral-900">16x (Ekstrem)</option>
                        </select>
                      </div>
                    </div>

                    {wizardItems.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const allSel = wizardItems.every(wi => wi.selected);
                            setWizardItems(prev => prev.map(wi => ({ ...wi, selected: !allSel })));
                          }}
                          className="text-xs font-semibold text-text-secondary hover:text-text-primary"
                          disabled={isWizardRunning}
                        >
                          {wizardItems.every(wi => wi.selected) ? 'Tüm Seçimleri Kaldır' : 'Tümünü Seç'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Wizard Content / List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 min-h-0 bg-neutral-950/40">
                    {wizardItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                        <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-secondary mb-3">
                          <HelpCircle size={22} />
                        </div>
                        <h4 className="text-xs font-bold text-text-primary">Sihirbaza Henüz Veri Yüklenmedi</h4>
                        <p className="text-[11px] text-text-secondary max-w-sm mt-1">
                          Yukarıdaki filtre kutusundan analiz etmek istediğiniz koleksiyonu seçip "Yer İmlerini Yükle" butonuna basın.
                        </p>
                      </div>
                    ) : (
                      wizardItems.map((item) => {
                        const isSelected = item.selected;
                        return (
                          <div
                            key={item.id}
                            className={`border rounded-xl p-4 transition-all duration-300 relative ${
                              isSelected 
                                ? 'bg-white/[0.02] border-white/10' 
                                : 'bg-black/20 border-white/5 opacity-55'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Selection checkbox */}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isWizardRunning) return;
                                  setWizardItems(prev => prev.map(wi => wi.id === item.id ? { ...wi, selected: !wi.selected } : wi));
                                }}
                                disabled={isWizardRunning}
                                className="mt-1 bg-neutral-800 border-white/20 rounded cursor-pointer text-focus-neon focus:ring-0"
                              />

                              {/* URL & Main info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap justify-between">
                                  <div className="flex items-center gap-2 max-w-md truncate">
                                    <span className="text-xs font-bold text-text-primary truncate">
                                      {item.title || 'Başlıksız Yer İmi'}
                                    </span>
                                    <span className="text-[9px] font-mono bg-white/5 border border-white/5 text-text-secondary px-1.5 py-0.5 rounded">
                                      {item.originalCategory}
                                    </span>
                                  </div>

                                  {/* Status display */}
                                  <div>
                                    {item.status === 'pending' && (
                                      <span className="text-[9px] font-mono bg-white/5 border border-white/5 text-text-secondary px-2 py-0.5 rounded-full uppercase font-bold">
                                        Sırada Bekliyor
                                      </span>
                                    )}
                                    {item.status === 'analyzing' && (
                                      <span className="text-[9px] font-mono bg-focus-neon/15 border border-focus-neon/30 text-focus-neon px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
                                        <Loader2 size={10} className="animate-spin" />
                                        Analiz Ediliyor
                                      </span>
                                    )}
                                    {item.status === 'completed' && (
                                      <span className="text-[9px] font-mono bg-grow-phosphor/15 border border-grow-phosphor/30 text-grow-phosphor px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
                                        <Check size={10} className="stroke-[3]" />
                                        Analiz Tamamlandı
                                      </span>
                                    )}
                                    {item.status === 'failed' && (
                                      <span className="text-[9px] font-mono bg-crit-vivid/15 border border-crit-vivid/30 text-crit-vivid px-2 py-0.5 rounded-full uppercase font-bold">
                                        Başarısız Oldu
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className="text-[10px] font-mono text-text-secondary/60 hover:text-focus-neon block mt-0.5 max-w-lg truncate">
                                  {item.url}
                                </span>

                                {/* AI Recommendation override details */}
                                {item.status === 'completed' && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3"
                                  >
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-mono text-text-secondary uppercase block">
                                        Yapay Zeka Önerilen Başlık (Müdahale Edin)
                                      </label>
                                      <input
                                        type="text"
                                        value={item.recommendedTitle}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setWizardItems(prev => prev.map(wi => wi.id === item.id ? { ...wi, recommendedTitle: val } : wi));
                                        }}
                                        className="w-full bg-black/40 border border-white/10 focus:border-focus-neon/40 outline-none rounded-lg px-2.5 py-1 text-xs text-text-primary transition-colors h-8"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[9px] font-mono text-text-secondary uppercase block">
                                        Kategori Ataması (Yeni Kategori Yazabilirsiniz)
                                      </label>
                                      <input
                                        type="text"
                                        list="categories-datalist"
                                        value={item.recommendedCategory}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setWizardItems(prev => prev.map(wi => wi.id === item.id ? { ...wi, recommendedCategory: val } : wi));
                                        }}
                                        placeholder="Kategori adı yazın veya seçin"
                                        className="w-full bg-black/40 border border-white/10 focus:border-focus-neon/40 outline-none rounded-lg px-2.5 py-1 text-xs text-text-primary transition-colors h-8"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[9px] font-mono text-text-secondary uppercase block">
                                        Etiketler (Virgülle ayırın veya silmek için tıklayın)
                                      </label>
                                      <input
                                        type="text"
                                        value={item.recommendedTags.join(', ')}
                                        onChange={(e) => {
                                          const val = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                          setWizardItems(prev => prev.map(wi => wi.id === item.id ? { ...wi, recommendedTags: val } : wi));
                                        }}
                                        className="w-full bg-black/40 border border-white/10 focus:border-focus-neon/40 outline-none rounded-lg px-2.5 py-1 text-xs text-text-primary transition-colors h-8"
                                      />
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {item.recommendedTags.map((tag, tagIdx) => (
                                          <button
                                            key={tagIdx}
                                            type="button"
                                            onClick={() => {
                                              const newTags = item.recommendedTags.filter((_, idx) => idx !== tagIdx);
                                              setWizardItems(prev => prev.map(wi => wi.id === item.id ? { ...wi, recommendedTags: newTags } : wi));
                                            }}
                                            className="text-[9px] bg-white/5 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 px-1.5 py-0.5 rounded flex items-center gap-1 transition-all"
                                            title="Silmek için tıklayın"
                                          >
                                            #{tag}
                                            <span className="font-bold text-[10px]">×</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="md:col-span-3 bg-white/[0.01] border border-white/5 rounded-lg p-2.5 mt-1 flex flex-col gap-1">
                                      <span className="text-[9px] font-mono text-grow-phosphor uppercase font-bold">Yapay Zeka Site Özeti:</span>
                                      <p className="text-[11px] text-text-secondary italic leading-relaxed">
                                        {item.aiSummary || 'Web sitesi hakkında özet çıkartılamadı.'}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Progress & Bottom actions */}
                  <div className="p-5 border-t border-white/10 bg-black/20 shrink-0 space-y-4">
                    {wizardItems.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-text-secondary flex items-center gap-1.5 flex-wrap">
                            <RefreshCw size={11} className={isWizardRunning ? "animate-spin text-grow-phosphor" : ""} />
                            Süreç İlerlemesi: {wizardItems.filter(wi => wi.status === 'completed' && wi.selected).length} / {wizardItems.filter(wi => wi.selected).length}  analiz edildi
                            <span className="text-white/20">•</span>
                            <span className="flex items-center gap-1 text-text-secondary">
                              <Clock size={11} />
                              Süre: <strong className="text-text-primary">{elapsedSeconds}s</strong>
                            </span>
                            {isWizardRunning && (
                              <>
                                <span className="text-white/20">•</span>
                                <span className="text-grow-phosphor font-semibold animate-pulse">
                                  Kalan Tahmini: {(() => {
                                    const completedCount = wizardItems.filter(wi => wi.status === 'completed' && wi.selected).length;
                                    const totalCount = wizardItems.filter(wi => wi.selected).length;
                                    const pendingCount = totalCount - completedCount;
                                    if (completedCount > 0) {
                                      const avg = elapsedSeconds / completedCount;
                                      return `${Math.round(pendingCount * avg)}s`;
                                    }
                                    return 'Hesaplanıyor...';
                                  })()}
                                </span>
                              </>
                            )}
                          </span>
                          <span className="text-text-primary font-bold">
                            {Math.round((wizardItems.filter(wi => wi.status === 'completed' && wi.selected).length / (wizardItems.filter(wi => wi.selected).length || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-grow-phosphor transition-all duration-300 rounded-full"
                            style={{ 
                              width: `${(wizardItems.filter(wi => wi.status === 'completed' && wi.selected).length / (wizardItems.filter(wi => wi.selected).length || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] text-text-secondary/60">
                        {wizardItems.length > 0 && (
                          <span>
                            Analiz tamamlandıktan sonra, istediğiniz yer imlerini seçip veritabanına uygulayabilirsiniz.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setIsAiWizardOpen(false); setWizardItems([]); }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-text-secondary transition-all"
                          disabled={isWizardRunning}
                        >
                          Kapat
                        </button>

                        {wizardItems.length > 0 && (
                          <button
                            onClick={handleStartAiWizardAnalysis}
                            disabled={isWizardRunning || wizardItems.filter(wi => wi.selected && wi.status !== 'completed').length === 0}
                            className="px-4 py-2 bg-grow-phosphor hover:bg-grow-phosphor/80 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isWizardRunning ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                Analiz Sürüyor ({wizardItems.filter(wi => wi.status === 'analyzing').length} aktif)
                              </>
                            ) : (
                              <>
                                <Play size={12} className="fill-white" />
                                Yapay Zeka Analizini Başlat
                              </>
                            )}
                          </button>
                        )}

                        {wizardItems.some(wi => wi.status === 'completed' && wi.selected) && (
                          <button
                            onClick={handleSaveWizardResults}
                            disabled={isWizardRunning}
                            className="px-5 py-2 bg-focus-neon hover:bg-focus-neon/80 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-focus-neon/10"
                          >
                            Değişiklikleri Veritabanına Kaydet
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Filtering, Search & Sort Panel */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
            {/* Search */}
            <div className="relative w-full md:max-w-xs bg-black/20 rounded-xl border border-white/5 h-10 flex items-center px-3 gap-2">
              <Search size={14} className="text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Başlık, url veya etiket ara..."
                className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-secondary/40 font-semibold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-text-secondary hover:text-text-primary">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sorters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-text-secondary mr-1 hidden lg:inline">Sıralama:</span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/20 border border-white/5 outline-none rounded-xl px-3 py-2 text-xs text-text-secondary font-bold h-10"
              >
                <option value="createdAt" className="bg-neutral-900">Ekleme Tarihi</option>
                <option value="rating" className="bg-neutral-900">Önem Derecesi</option>
                <option value="clicks" className="bg-neutral-900">Ziyaret Sayısı</option>
                <option value="title" className="bg-neutral-900">İsim Sırası</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 bg-black/20 border border-white/5 hover:bg-white/[0.04] rounded-xl text-xs text-text-secondary font-bold h-10 flex items-center justify-center transition-all"
              >
                {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-focus-neon/10 border border-focus-neon/20 px-4 py-2.5 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between shrink-0"
            >
              <span className="text-xs text-focus-neon font-bold">
                {selectedIds.length} Bağlantı Seçildi
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                {/* Mass move to category */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkMoveCategory(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-black/40 border border-white/10 text-text-secondary text-[11px] rounded-lg px-2.5 py-1.5 font-semibold outline-none"
                >
                  <option value="">Seçilenleri Koleksiyona Taşı...</option>
                  {allCategories.map(c => (
                    <option key={c} value={c} className="bg-neutral-900">{c}</option>
                  ))}
                </select>

                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-crit-vivid/20 hover:bg-crit-vivid text-crit-vivid hover:text-white border border-crit-vivid/20 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  <Trash2 size={11} />
                  Seçilenleri Sil
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-text-secondary text-[11px] font-bold rounded-lg transition-all"
                >
                  Vazgeç
                </button>
              </div>
            </motion.div>
          )}

          {/* MAIN BOOKMARKS STREAM CARDS */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5 pb-8 min-h-0">
            {isLoading ? (
              <div className="h-48 w-full flex items-center justify-center">
                <Loader2 size={24} className="text-focus-neon animate-spin" />
              </div>
            ) : filteredAndSortedBookmarks.length === 0 ? (
              <div className="h-64 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-secondary mb-4">
                  <Bookmark size={22} />
                </div>
                <h3 className="font-display font-bold text-sm text-text-primary">Eşleşen Yer İmi Bulunmuyor</h3>
                <p className="text-text-secondary text-xs mt-1 max-w-xs">
                  Bu koleksiyonda veya aramaya uygun yer imi bulunmuyor. Yeni bir bağlantı ekleyebilir ya da filtreleri temizleyebilirsiniz.
                </p>
                {(searchQuery || activeCategoryFilter !== 'all' || filterFavoriteOnly || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategoryFilter('all');
                      setFilterFavoriteOnly(false);
                      setFilterStatus('all');
                    }}
                    className="mt-4 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-text-primary rounded-lg transition-colors border border-white/5"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredAndSortedBookmarks.map((b) => {
                  const selected = selectedIds.includes(b.id);
                  const isExpanded = expandedAiIds.includes(b.id);
                  const domain = getDomain(b.url);

                  return (
                    <motion.div
                      key={b.id}
                      layoutId={`bookmark-card-${b.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`group border rounded-2xl p-4 transition-all duration-300 relative bg-white/[0.02] hover:bg-white/[0.04] ${
                        selected 
                          ? 'border-focus-neon/30 bg-focus-neon/[0.02]' 
                          : b.status === 'archived' 
                            ? 'border-white/5 opacity-60 hover:opacity-100'
                            : 'border-white/5'
                      }`}
                    >
                      {/* Left border indicator of collection/rating level */}
                      <div className={`absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full ${
                        b.rating >= 4 ? 'bg-amber-400' :
                        b.favorite ? 'bg-rose-500' : 'bg-focus-neon/30'
                      }`} />

                      <div className="flex items-start gap-3.5 pl-2">
                        {/* Custom Checkbox for Bulk Actions */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(b.id)}
                          className={`size-4.5 rounded border flex items-center justify-center shrink-0 transition-all mt-1 opacity-20 group-hover:opacity-100 ${
                            selected 
                              ? 'bg-focus-neon border-focus-neon text-white opacity-100' 
                              : 'border-white/30 hover:border-white'
                          }`}
                        >
                          {selected && <Check size={11} className="stroke-[3]" />}
                        </button>

                        {/* Domain Favicon resolver */}
                        <div className="size-10 rounded-xl bg-black/35 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm">
                          {domain ? (
                            <img 
                              src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`} 
                              alt="Favicon"
                              referrerPolicy="no-referrer"
                              className="size-5.5 object-contain"
                              onError={(e) => {
                                // Fallback icon on fail
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Bookmark size={15} className="text-text-secondary" />
                          )}
                        </div>

                        {/* Content text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-display font-bold leading-snug text-text-primary group-hover:text-focus-neon transition-colors truncate max-w-md">
                              {b.title || domain || 'Başlıksız Bağlantı'}
                            </h4>

                            {/* Category Label */}
                            <span className="text-[9px] font-mono bg-white/5 border border-white/5 text-text-secondary px-1.5 py-0.5 rounded uppercase">
                              {b.category}
                            </span>

                            {/* Status Indicators */}
                            {b.status === 'unread' && (
                              <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded uppercase">
                                Yeni
                              </span>
                            )}
                            {b.status === 'reading' && (
                              <span className="text-[9px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">
                                İnceleniyor
                              </span>
                            )}
                            {b.status === 'archived' && (
                              <span className="text-[9px] font-mono bg-neutral-800 border border-white/5 text-skel-metal px-1.5 py-0.5 rounded uppercase">
                                Arşivlendi
                              </span>
                            )}
                          </div>

                          {/* URL clickable anchor */}
                          <a
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleVisitLink(b)}
                            className="text-[10px] font-mono text-text-secondary hover:text-focus-neon flex items-center gap-1 mt-0.5 max-w-sm truncate break-all transition-colors w-max"
                          >
                            <ExternalLink size={10} />
                            {b.url}
                          </a>

                          {/* Description & User notes */}
                          {b.description && (
                            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
                              {b.description}
                            </p>
                          )}

                          {b.notes && (
                            <div className="mt-2 bg-white/[0.01] border border-white/5 rounded-lg p-2 flex items-start gap-1.5">
                              <FileText size={11} className="text-text-secondary mt-0.5 shrink-0" />
                              <p className="text-[11px] text-text-secondary italic leading-normal">
                                {b.notes}
                              </p>
                            </div>
                          )}

                          {/* Custom tags list */}
                          {b.tags && b.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {b.tags.map((tag, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setSearchQuery(tag)}
                                  className="text-[9px] font-semibold text-text-secondary/70 hover:text-focus-neon bg-white/[0.02] hover:bg-focus-neon/10 border border-white/5 hover:border-focus-neon/20 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 transition-all cursor-pointer"
                                  title={`"${tag}" etiketini filtrele`}
                                >
                                  <Tag size={8} />
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* AI Summary Section Toggle button */}
                          {b.aiSummary && (
                            <div className="mt-2.5">
                              <button
                                onClick={() => toggleExpandedAi(b.id)}
                                className="text-[10px] font-mono font-bold text-grow-phosphor flex items-center gap-1 bg-grow-phosphor/10 hover:bg-grow-phosphor/20 px-2 py-0.5 rounded transition-all border border-grow-phosphor/20"
                              >
                                <Sparkles size={10} />
                                {isExpanded ? 'Yapay Zeka Analizini Kapat' : 'Yapay Zeka Analizini Göster'}
                                {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                              </button>

                              {/* Collapsible details block */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-grow-phosphor/[0.02] border border-grow-phosphor/10 rounded-xl p-3 mt-2 text-xs text-text-primary leading-relaxed space-y-2 overflow-hidden"
                                  >
                                    <div className="flex items-center gap-1.5 font-bold text-grow-phosphor text-[10px] font-mono uppercase">
                                      <Sparkles size={11} />
                                      AI Detaylı Analiz & Özet
                                    </div>
                                    <div className="whitespace-pre-line text-text-secondary leading-relaxed">
                                      {b.aiSummary}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Footer action tools */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-2.5 border-t border-white/5">
                            {/* Click / visits counter */}
                            <span className="text-[10px] font-mono text-text-secondary" title="Sitenin ziyaret edilme sayısı">
                              🔥 {b.clicks || 0} tıklanma
                            </span>

                            {/* Star rating picker */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleSetRating(b, star)}
                                  className="p-0.5"
                                  title={`Değerlendir: ${star} Yıldız`}
                                >
                                  <Star 
                                    size={11} 
                                    className={`${star <= b.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} 
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Timestamp */}
                            <span className="text-[10px] font-mono text-text-secondary/50 ml-auto">
                              Eklendi: {new Date(b.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>

                        </div>

                        {/* Top corner actions */}
                        <div className="flex items-center gap-1">
                          {/* Favorite button toggle */}
                          <button
                            onClick={() => handleToggleFavorite(b)}
                            className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                              b.favorite ? 'text-rose-500' : 'text-text-secondary hover:text-rose-400'
                            }`}
                            title={b.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                          >
                            <Heart size={14} className={b.favorite ? 'fill-rose-500' : ''} />
                          </button>

                          {/* Copy URL */}
                          <button
                            onClick={() => handleCopyLink(b)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors relative"
                            title="Bağlantıyı Kopyala"
                          >
                            {copiedId === b.id ? (
                              <Check size={14} className="text-grow-phosphor" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteBookmark(b.id)}
                            className="p-1.5 rounded-lg hover:bg-crit-vivid/10 text-text-secondary hover:text-crit-vivid transition-colors"
                            title="Görevi Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

        </div>

      </div>

      {/* Dynamic categories datalist helper */}
      <datalist id="categories-datalist">
        {allCategories.map(c => (
          <option key={c} value={c} />
        ))}
      </datalist>

    </div>
  );
}
