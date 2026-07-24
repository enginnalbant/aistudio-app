import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Plus, 
  Search, 
  Upload, 
  RefreshCw, 
  Cloud, 
  Trash2, 
  Tag, 
  Folder, 
  Sparkles,
  Database,
  ChevronRight,
  ChevronLeft,
  Save,
  FileText,
  X,
  MoreVertical,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from '../../lib/firebase';

interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  coverUrl: string;
  fileUrl: string;
  createdAt: string;
  description?: string;
}

export const NotesBooks = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [activeTab, setActiveTab] = useState('Tümü');
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [newBook, setNewBook] = useState<Partial<BookItem>>({
    title: '', author: '', category: '', tags: [], coverUrl: '', description: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'books'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookItem)));
    });
    return () => unsubscribe();
  }, [user]);

  const categories = ['Tümü', ...Array.from(new Set(books.map(b => b.category).filter(Boolean)))];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'Tümü' || b.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !newBook.tags?.includes(tagInput.trim())) {
      setNewBook(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewBook(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  const extractMetadata = async (method: 'google' | 'ai', explicitTitle?: string, explicitAuthor?: string) => {
    const targetTitle = explicitTitle || newBook.title;
    const targetAuthor = explicitAuthor || newBook.author;
    
    if (!targetTitle) return;
    setIsExtracting(true);
    try {
      if (method === 'google') {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(targetTitle)}&maxResults=1`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const info = data.items[0].volumeInfo;
          setNewBook(prev => ({
            ...prev,
            title: info.title || prev.title || targetTitle,
            author: info.authors ? info.authors.join(', ') : prev.author,
            category: info.categories ? info.categories[0] : prev.category,
            description: info.description || prev.description,
            coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || prev.coverUrl,
          }));
        }
      } else if (method === 'ai') {
        const res = await fetch('/api/books/extract-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: targetTitle, author: targetAuthor })
        });
        if (res.ok) {
          const data = await res.json();
          setNewBook(prev => ({
            ...prev,
            title: data.title || prev.title || targetTitle,
            author: data.author || prev.author,
            category: data.category || prev.category,
            description: data.description || prev.description,
            coverUrl: data.coverUrl || prev.coverUrl,
            tags: data.tags || prev.tags,
          }));
        }
      }
    } catch (err) {
      console.error("Metadata fetch error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const saveBook = async () => {
    if (!user) {
      alert("Kitap eklemek için lütfen giriş yapın veya misafir hesabıyla bağlanın.");
      return;
    }
    if (!newBook.title) return;
    try {
      const bookDataToSave = {
        title: newBook.title || '',
        author: newBook.author || '',
        category: newBook.category || '',
        tags: newBook.tags || [],
        coverUrl: newBook.coverUrl || '',
        description: newBook.description || '',
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'users', user.uid, 'books'), bookDataToSave);
      setNewBook({ title: '', author: '', category: '', tags: [], coverUrl: '', description: '' });
      setShowWizard(false);
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Kitap kaydedilirken bir hata oluştu.");
    }
  };

  const deleteBook = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'books', id));
    if (selectedBook?.id === id) setSelectedBook(null);
  };

  const simulateDriveSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // In a real app, this would fetch from Drive API and save to Firestore
      alert('Google Drive senkronizasyonu tamamlandı (Simülasyon)');
    }, 2000);
  };

  const fetchMetadataMock = async () => {
    if (!selectedBook || !user) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/books/extract-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedBook.title, author: selectedBook.author })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedData = {
          title: data.title || selectedBook.title,
          author: data.author || selectedBook.author,
          category: data.category || selectedBook.category,
          description: data.description || selectedBook.description,
          coverUrl: data.coverUrl || selectedBook.coverUrl,
          tags: data.tags || selectedBook.tags,
        };
        await updateDoc(doc(db, 'users', user.uid, 'books', selectedBook.id), updatedData);
        setSelectedBook(prev => prev ? { ...prev, ...updatedData } : null);
      } else {
        alert("Metadata güncellenirken bir sorun oluştu.");
      }
    } catch (err) {
      console.error("Update metadata error:", err);
      alert("Bağlantı hatası oluştu.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-text-primary p-6 md:p-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-display font-black text-pure-white flex items-center gap-3">
            <BookOpen className="text-focus-neon" /> Kütüphane
          </h2>
          <p className="text-text-secondary mt-1">E-kitaplarınızı ve belgelerinizi yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              placeholder="Kitap ara..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-pure-white outline-none focus:border-focus-neon transition-colors" 
            />
          </div>
          <button onClick={() => setShowWizard(true)} className="bg-pure-white text-black w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all text-sm shrink-0">
            <Plus size={18} /> <span className="hidden md:inline">Kitap Ekle</span>
          </button>
          <button onClick={simulateDriveSync} disabled={isSyncing} className="bg-white/10 text-pure-white w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all text-sm disabled:opacity-50 shrink-0">
            {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Cloud size={18} />} 
            <span className="hidden md:inline">Eşzamanla</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2 shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === cat 
                ? 'bg-focus-neon text-black' 
                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-pure-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredBooks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-4">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
              <Book size={40} className="opacity-50" />
            </div>
            <p className="text-lg">Kitap bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredBooks.map((book, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={book.id} 
                className="group cursor-pointer flex flex-col gap-3"
                onClick={() => setSelectedBook(book)}
              >
                <div className="aspect-[2/3] w-full bg-white/5 border border-white/10 rounded-lg overflow-hidden relative shadow-lg group-hover:shadow-focus-neon/20 group-hover:border-focus-neon/50 transition-all duration-300">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white/5 to-white/10">
                      <Book size={32} className="text-text-secondary mb-2" />
                      <span className="text-xs text-text-secondary font-medium text-center line-clamp-3">{book.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-focus-neon text-black text-xs font-bold px-3 py-1.5 rounded-full">Detaylar</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-pure-white line-clamp-1 group-hover:text-focus-neon transition-colors">{book.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-1">{book.author || 'Bilinmeyen Yazar'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Slide-over */}
      <AnimatePresence>
        {selectedBook && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-skel-matte border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h3 className="font-bold text-lg text-pure-white">Kitap Detayı</h3>
                <button onClick={() => setSelectedBook(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-pure-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10">
                    {selectedBook.coverUrl ? (
                      <img src={selectedBook.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Book size={48} className="text-text-secondary/50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-pure-white mb-1">{selectedBook.title}</h2>
                    <p className="text-lg text-text-secondary">{selectedBook.author || 'Bilinmeyen Yazar'}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedBook.category && (
                      <span className="bg-white/10 text-pure-white px-3 py-1 rounded-full text-xs font-bold">{selectedBook.category}</span>
                    )}
                    {selectedBook.tags?.map(tag => (
                      <span key={tag} className="bg-focus-neon/10 text-focus-neon px-3 py-1 rounded-full text-xs border border-focus-neon/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-pure-white uppercase tracking-wider text-text-secondary border-b border-white/10 pb-2">Hakkında</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {selectedBook.description || 'Bu kitap için henüz bir açıklama bulunmuyor. Metadata güncellemesi yaparak internetten bilgi çekebilirsiniz.'}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <button onClick={fetchMetadataMock} disabled={isSyncing} className="w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all flex items-center justify-between group disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      {isSyncing ? <RefreshCw size={18} className="animate-spin text-focus-neon" /> : <Sparkles size={18} className="text-focus-neon" />}
                      <span className="font-medium text-pure-white text-sm">Metadatayı Güncelle</span>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary group-hover:text-pure-white" />
                  </button>
                  
                  <button className="w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Folder size={18} className="text-emerald-500" />
                      <span className="font-medium text-pure-white text-sm">Koleksiyona Taşı</span>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary group-hover:text-pure-white" />
                  </button>

                  <button onClick={() => deleteBook(selectedBook.id)} className="w-full bg-rose-500/10 hover:bg-rose-500/20 p-3 rounded-xl transition-all flex items-center justify-between group mt-4">
                    <div className="flex items-center gap-3 text-rose-500">
                      <Trash2 size={18} />
                      <span className="font-medium text-sm">Kütüphaneden Sil</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upload Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-skel-matte border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col max-w-4xl w-full shadow-2xl max-h-[90vh]">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-pure-white flex items-center gap-2">
                    <Sparkles className="text-focus-neon" size={20} /> Akıllı Kitap Ekleme
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">Dosya yükleyin veya kitap adını yazıp otomatik doldurun.</p>
                </div>
                <button onClick={() => setShowWizard(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-text-secondary hover:text-pure-white transition-colors"><X size={16}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Core Info & Upload */}
                  <div className="space-y-6">
                    {/* Smart Engines */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-focus-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Database size={14} className="text-emerald-500" /> Otomatik Veri Motorları
                      </p>
                      <div className="flex gap-2 relative z-10">
                        <button 
                          onClick={() => extractMetadata('google')}
                          disabled={isExtracting || !newBook.title}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-pure-white text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                        >
                          {isExtracting ? <RefreshCw size={14} className="animate-spin" /> : <BookOpen size={14} />}
                          Google Kitaplar
                        </button>
                        <button 
                          onClick={() => extractMetadata('ai')}
                          disabled={isExtracting || !newBook.title}
                          className="flex-1 bg-focus-neon/20 hover:bg-focus-neon/30 text-focus-neon border border-focus-neon/30 text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-bold shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                        >
                          {isExtracting ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          AI ile Doldur
                        </button>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-2 text-center">Önce kitap adını girin veya dosya yükleyin.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Kitap Adı *</label>
                        <input placeholder="Örn: 1984" value={newBook.title} onChange={e => setNewBook(prev => ({...prev, title: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pure-white focus:border-focus-neon outline-none transition-colors" />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Yazar Adı</label>
                        <input placeholder="Örn: George Orwell" value={newBook.author} onChange={e => setNewBook(prev => ({...prev, author: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pure-white focus:border-focus-neon outline-none transition-colors" />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Kategori</label>
                        <input placeholder="Örn: Bilim Kurgu, Tarih" value={newBook.category} onChange={e => setNewBook(prev => ({...prev, category: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pure-white focus:border-focus-neon outline-none transition-colors" />
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Etiketler</label>
                        <div className="flex gap-2">
                          <input 
                            placeholder="Etiket yazıp Enter'a basın..." 
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                            className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pure-white focus:border-focus-neon outline-none transition-colors" 
                          />
                          <button onClick={handleAddTag} className="bg-white/10 px-4 rounded-xl text-pure-white hover:bg-white/20 transition-colors"><Plus size={20} /></button>
                        </div>
                        {newBook.tags && newBook.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {newBook.tags.map(tag => (
                              <span key={tag} className="bg-focus-neon/10 border border-focus-neon/20 text-focus-neon px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                                {tag} <button onClick={() => handleRemoveTag(tag)} className="hover:text-pure-white"><X size={12} /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Cover, Desc, Upload */}
                  <div className="space-y-6 flex flex-col">
                    <label htmlFor="book-upload" className={`border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-text-secondary hover:border-focus-neon/50 hover:bg-focus-neon/5 transition-all group shrink-0 ${isExtracting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <div className="w-12 h-12 bg-white/5 group-hover:bg-focus-neon/10 rounded-full flex items-center justify-center mb-3 transition-colors">
                        {isExtracting ? <RefreshCw size={24} className="animate-spin text-focus-neon" /> : <Upload size={24} className="group-hover:text-focus-neon" />}
                      </div>
                      <p className="font-bold text-pure-white mb-1 text-sm">{isExtracting ? 'AI Analiz Ediyor...' : 'Dosya Yükle (PDF, EPUB, MOBI)'}</p>
                      <p className="text-[10px] text-center">{isExtracting ? 'Dosya adından kitap bilgileri çıkarılıyor...' : 'Dosya seçtiğinizde kitap bilgileri AI ile otomatik doldurulur.'}</p>
                    </label>
                    <input 
                      id="book-upload" 
                      type="file" 
                      className="hidden" 
                      disabled={isExtracting}
                      accept=".pdf,.epub,.mobi" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const fileName = file.name.replace(/\.[^/.]+$/, "");
                          setNewBook(prev => ({...prev, title: fileName}));
                          // Automatically try to extract metadata with AI after setting the title
                          await extractMetadata('ai', fileName);
                        }
                      }} 
                    />

                    <div className="flex gap-4 flex-1 min-h-[200px]">
                      <div className="w-32 h-48 bg-black/40 border border-white/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative group">
                        {newBook.coverUrl ? (
                          <>
                            <img src={newBook.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => setNewBook(prev => ({...prev, coverUrl: ''}))} className="bg-rose-500/20 text-rose-500 p-2 rounded-full hover:bg-rose-500/40">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-text-secondary/50 flex flex-col items-center gap-2">
                            <Book size={32} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Kapak Yok</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4 flex flex-col">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Kapak URL</label>
                          <input placeholder="https://..." value={newBook.coverUrl} onChange={e => setNewBook(prev => ({...prev, coverUrl: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pure-white focus:border-focus-neon outline-none transition-colors" />
                        </div>
                        <div className="space-y-1 flex-1 flex flex-col">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1">Açıklama</label>
                          <textarea placeholder="Kitap hakkında..." value={newBook.description} onChange={e => setNewBook(prev => ({...prev, description: e.target.value}))} className="w-full flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pure-white focus:border-focus-neon outline-none transition-colors resize-none custom-scrollbar min-h-[100px]" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10 shrink-0">
                <button onClick={() => setShowWizard(false)} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">İptal</button>
                <button onClick={saveBook} disabled={!newBook.title} className="px-8 py-2.5 bg-focus-neon text-black hover:bg-focus-neon/90 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:shadow-none"><Save size={16} /> Kaydet</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


