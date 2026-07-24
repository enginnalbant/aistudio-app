import React, { useState } from 'react';
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
  ChevronRight,
  ChevronLeft,
  Save,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

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
  const [books, setBooks] = useLocalStorage<BookItem[]>('apex_books', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newBook, setNewBook] = useState<Partial<BookItem>>({
    title: '', author: '', category: '', tags: [], coverUrl: '', description: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTag = () => {
    if (tagInput.trim() && !newBook.tags?.includes(tagInput.trim())) {
      setNewBook(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewBook(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  const saveBook = async () => {
    if (!newBook.title) return;
    try {
      const entry = {
        id: crypto.randomUUID(),
        ...newBook,
        createdAt: new Date().toISOString()
      } as BookItem;
      setBooks(prev => [entry, ...prev]);
      setNewBook({ title: '', author: '', category: '', tags: [], coverUrl: '', description: '' });
      setShowWizard(false);
      setWizardStep(1);
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  const deleteBook = async (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    if (selectedBook?.id === id) setSelectedBook(null);
  };

  const simulateDriveSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // In a real app, this would fetch from Drive API and save to local list
      alert('Google Drive senkronizasyonu tamamlandı (Simülasyon)');
    }, 2000);
  };

  const fetchMetadataMock = async () => {
    if (!selectedBook || !user) return;
    // Simulate fetching metadata (cover, description)
    setIsSyncing(true);
    setTimeout(() => {
      const mockDescription = "Bu kitap internetten çekilmiş otomatik bir açıklama metnine sahiptir. Yazarın eşsiz anlatımıyla dikkat çeken eser, okuyucuları derin düşüncelere sevk ediyor.";
      const mockCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop";

      setBooks(prev => prev.map(b => b.id === selectedBook.id ? { ...b, description: mockDescription, coverUrl: mockCover } : b));
      setSelectedBook(prev => prev ? { ...prev, description: mockDescription, coverUrl: mockCover } : null);
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-text-primary p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-3xl font-display font-black text-pure-white flex items-center gap-3">
          <Book className="text-focus-neon" /> E-Kitaplığım
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowWizard(true)} className="bg-focus-neon text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-focus-neon/90 transition-all text-sm">
            <Upload size={16} /> Kitap Yükle
          </button>
          <button onClick={simulateDriveSync} disabled={isSyncing} className="bg-white/10 text-pure-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-all text-sm disabled:opacity-50">
            {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Cloud size={16} />}
            Drive'dan Eşle
          </button>
        </div>
      </div>

      {/* Upload Wizard Modal */}
      {showWizard && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-black border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 max-w-lg w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Yeni Kitap Ekle (Adım {wizardStep}/3)</h3>
              <button onClick={() => setShowWizard(false)} className="text-text-secondary hover:text-pure-white"><X size={20}/></button>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-text-secondary hover:border-focus-neon/50 hover:bg-white/5 transition-all cursor-pointer">
                  <Upload size={32} className="mb-2" />
                  <p className="font-bold">Cihazdan dosya seçin</p>
                  <p className="text-xs">PDF, EPUB, MOBI (Max 50MB)</p>
                </div>
                <p className="text-center text-xs text-text-secondary">veya manuel olarak bilgileri girin</p>
                <input placeholder="Kitap Adı" value={newBook.title} onChange={e => setNewBook(prev => ({...prev, title: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-pure-white" />
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <input placeholder="Yazar Adı" value={newBook.author} onChange={e => setNewBook(prev => ({...prev, author: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-pure-white" />
                <input placeholder="Kategori (Örn: Bilim Kurgu, Tarih)" value={newBook.category} onChange={e => setNewBook(prev => ({...prev, category: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-pure-white" />

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      placeholder="Etiket ekle..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                      className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-pure-white"
                    />
                    <button onClick={handleAddTag} className="bg-white/10 px-4 rounded-xl text-text-secondary hover:text-pure-white"><Plus size={20} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newBook.tags?.map(tag => (
                      <span key={tag} className="bg-focus-neon/10 text-focus-neon px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                        {tag} <button onClick={() => handleRemoveTag(tag)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                 <input placeholder="Kapak Görseli URL (Opsiyonel)" value={newBook.coverUrl} onChange={e => setNewBook(prev => ({...prev, coverUrl: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-pure-white" />
                 <textarea placeholder="Kitap Açıklaması (Opsiyonel)" rows={4} value={newBook.description} onChange={e => setNewBook(prev => ({...prev, description: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-pure-white resize-none" />
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button disabled={wizardStep === 1} onClick={() => setWizardStep(prev => prev - 1)} className="px-4 py-2 bg-white/10 rounded-lg flex items-center gap-2 disabled:opacity-30"><ChevronLeft size={16} /> Geri</button>
              {wizardStep < 3 ? (
                <button disabled={wizardStep === 1 && !newBook.title} onClick={() => setWizardStep(prev => prev + 1)} className="px-4 py-2 bg-focus-main text-pure-white rounded-lg flex items-center gap-2 disabled:opacity-50">İleri <ChevronRight size={16} /></button>
              ) : (
                <button onClick={saveBook} className="px-4 py-2 bg-emerald-600 text-pure-white rounded-lg flex items-center gap-2"><Save size={16} /> Kaydet</button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden min-h-0">

        {/* Left: List */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              placeholder="Kitaplarda veya etiketlerde ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-pure-white outline-none focus:border-focus-neon"
            />
          </div>
          <div className="space-y-2">
            {filteredBooks.map(book => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedBook?.id === book.id ? 'bg-focus-neon/10 border border-focus-neon/20' : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'}`}
              >
                <div className="w-10 h-14 bg-white/5 rounded flex items-center justify-center shrink-0 overflow-hidden">
                  {book.coverUrl ? <img src={book.coverUrl} alt="cover" className="w-full h-full object-cover" /> : <Book size={16} className="text-text-secondary" />}
                </div>
                <div className='flex flex-col items-start truncate'>
                  <span className="font-bold text-sm text-pure-white truncate w-full text-left">{book.title}</span>
                  <span className="text-xs text-text-secondary truncate w-full text-left">{book.author || 'Bilinmeyen Yazar'}</span>
                </div>
              </button>
            ))}
            {filteredBooks.length === 0 && (
              <div className="text-center text-text-secondary text-sm p-4">Sonuç bulunamadı.</div>
            )}
          </div>
        </div>

        {/* Center: Details */}
        <div className="xl:col-span-6 bento-card p-6 overflow-y-auto custom-scrollbar relative">
          {selectedBook ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-48 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-2xl">
                   {selectedBook.coverUrl ? (
                     <img src={selectedBook.coverUrl} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                   ) : (
                     <Book size={40} className="text-text-secondary/50" />
                   )}
                </div>
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-3xl font-bold text-pure-white leading-tight">{selectedBook.title}</h3>
                    <p className="text-lg text-text-secondary font-medium">{selectedBook.author || 'Bilinmeyen Yazar'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedBook.category && (
                      <span className="bg-focus-neon/10 text-focus-neon px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{selectedBook.category}</span>
                    )}
                    {selectedBook.tags?.map(tag => (
                      <span key={tag} className="bg-white/5 text-text-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Tag size={10} className="opacity-50"/> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-black/30 border border-white/5 p-6 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-pure-white flex items-center gap-2">
                  <FileText size={16} className="text-focus-neon" /> Hakkında
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {selectedBook.description || 'Bu kitap için henüz bir açıklama girilmemiş. Sağ taraftaki araçlardan internetten bilgileri güncellemeyi deneyebilirsiniz.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <Book size={32} className="opacity-50" />
              </div>
              <p>Görüntülemek için bir kitap seçin</p>
            </div>
          )}
        </div>

        {/* Right: Tools */}
        <div className="xl:col-span-3 bento-card p-6 space-y-6">
          <h4 className="text-sm font-bold text-pure-white">Araçlar</h4>

          {selectedBook ? (
            <div className="space-y-3">
              <button onClick={fetchMetadataMock} disabled={isSyncing} className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl text-left transition-all flex items-center gap-3 disabled:opacity-50">
                {isSyncing ? <RefreshCw size={16} className="animate-spin text-focus-neon" /> : <Sparkles size={16} className="text-focus-neon" />}
                <div>
                  <span className="font-bold text-sm block text-pure-white">Bilgileri Güncelle</span>
                  <span className="text-xs text-text-secondary">İnternetten metadata çek</span>
                </div>
              </button>
              
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl text-left transition-all flex items-center gap-3">
                <Folder size={16} className="text-emerald-500" />
                <div>
                  <span className="font-bold text-sm block text-pure-white">Klasöre Taşı</span>
                  <span className="text-xs text-text-secondary">Kategoriyi değiştir</span>
                </div>
              </button>

              <button onClick={() => deleteBook(selectedBook.id)} className="w-full bg-rose-500/10 hover:bg-rose-500/20 p-4 rounded-xl text-left text-rose-500 transition-all flex items-center gap-3 mt-8">
                <Trash2 size={16} />
                <div>
                  <span className="font-bold text-sm block">Kitabı Sil</span>
                  <span className="text-xs">Bu işlem geri alınamaz</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="text-sm text-text-secondary bg-white/5 p-4 rounded-xl">
              Düzenleme seçeneklerini görmek için listeden bir kitap seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
