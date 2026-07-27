import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Heart,
  Sparkles,
  Plus,
  Search,
  Filter,
  Trash2,
  FolderHeart,
  Grid,
  List,
  CheckCircle2,
  Clock,
  FolderPlus,
  Eye,
  Settings,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  X,
  FileArchive
} from "lucide-react";
import { Manga, MangaCollection, ReaderSettings } from "./mangaTypes";
import { MangaStorageService } from "./mangaStorageService";
import { MangaUploadWizard } from "./MangaUploadWizard";

interface MangaDashboardProps {
  onSelectManga: (manga: Manga) => void;
}

export const MangaDashboard: React.FC<MangaDashboardProps> = ({ onSelectManga }) => {
  // Storage State
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [collections, setCollections] = useState<MangaCollection[]>([]);

  // Selection / Navigation State
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("col-all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("Tümü");
  const [sortBy, setSortBy] = useState<"added" | "title" | "rating" | "pages">("added");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Wizards & Modals State
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState<boolean>(false);
  const [selectedMangaDetail, setSelectedMangaDetail] = useState<Manga | null>(null);
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState<boolean>(false);

  // New Collection Form State
  const [newColName, setNewColName] = useState<string>("");
  const [newColIcon, setNewColIcon] = useState<string>("📚");
  const [newColColor, setNewColColor] = useState<string>("indigo");

  // Load state from localStorage on init
  useEffect(() => {
    loadMangaEcosystem();
  }, []);

  const loadMangaEcosystem = () => {
    setMangas(MangaStorageService.getMangas());
    setCollections(MangaStorageService.getCollections());
  };

  // Extract unique genres across all imported mangas
  const availableGenres = ["Tümü", ...Array.from(new Set(mangas.flatMap(m => m.genres || [])))];

  // Favorite toggle function
  const handleToggleFavorite = (mangaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = mangas.map(m => {
      if (m.id === mangaId) {
        const nextFav = !m.favorite;
        // Update Favorites system collection too
        let updatedCols = collections.map(col => {
          if (col.id === "col-favorites") {
            const nextIds = nextFav
              ? [...col.mangaIds, mangaId]
              : col.mangaIds.filter(id => id !== mangaId);
            return { ...col, mangaIds: nextIds };
          }
          return col;
        });
        MangaStorageService.saveCollections(updatedCols);
        setCollections(updatedCols);
        return { ...m, favorite: nextFav };
      }
      return m;
    });
    MangaStorageService.saveMangas(updated);
    setMangas(updated);

    // Haptic response
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  // Create customized collection
  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const newCol: MangaCollection = {
      id: `col-${Date.now()}`,
      name: newColName,
      isSystem: false,
      mangaIds: [],
      icon: newColIcon,
      color: newColColor
    };

    const updated = [...collections, newCol];
    MangaStorageService.saveCollections(updated);
    setCollections(updated);

    // Reset Form
    setNewColName("");
    setNewColIcon("📚");
    setNewColColor("indigo");
    setIsNewCollectionOpen(false);
  };

  // Delete custom collection
  const handleDeleteCollection = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = collections.filter(c => c.id !== colId);
    MangaStorageService.saveCollections(updated);
    setCollections(updated);
    if (selectedCollectionId === colId) {
      setSelectedCollectionId("col-all");
    }
  };

  // Assign Manga to dynamic Collection
  const handleAssignMangaToCollection = (mangaId: string, colId: string) => {
    const updated = collections.map(col => {
      if (col.id === colId) {
        const exists = col.mangaIds.includes(mangaId);
        const nextIds = exists
          ? col.mangaIds.filter(id => id !== mangaId)
          : [...col.mangaIds, mangaId];
        return { ...col, mangaIds: nextIds };
      }
      return col;
    });
    MangaStorageService.saveCollections(updated);
    setCollections(updated);
  };

  // Delete manga completely
  const handleDeleteManga = (mangaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bu mangayı ve tüm okuma geçmişini silmek istediğinize emin misiniz?")) {
      const updated = mangas.filter(m => m.id !== mangaId);
      MangaStorageService.saveMangas(updated);
      setMangas(updated);

      // Clean up collection references
      const updatedCols = collections.map(col => ({
        ...col,
        mangaIds: col.mangaIds.filter(id => id !== mangaId)
      }));
      MangaStorageService.saveCollections(updatedCols);
      setCollections(updatedCols);

      if (selectedMangaDetail?.id === mangaId) {
        setSelectedMangaDetail(null);
      }
    }
  };

  // Filter and Sort Mangas
  const getFilteredMangas = () => {
    let result = [...mangas];

    // Filter by Active Sidebar Category
    if (selectedCollectionId !== "col-all") {
      const activeCol = collections.find(c => c.id === selectedCollectionId);
      if (activeCol) {
        result = result.filter(m => activeCol.mangaIds.includes(m.id));
      } else {
        // Handle special pseudo filters if any
        if (selectedCollectionId === "col-favorites") {
          result = result.filter(m => m.favorite);
        }
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.author.toLowerCase().includes(query) ||
        m.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Filter by Genre
    if (selectedGenre !== "Tümü") {
      result = result.filter(m => m.genres && m.genres.includes(selectedGenre));
    }

    // Sort items
    result.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === "pages") {
        return (b.totalPages || 0) - (a.totalPages || 0);
      } else {
        // added date fallback
        return b.addedAt.localeCompare(a.addedAt);
      }
    });

    return result;
  };

  const filteredMangas = getFilteredMangas();

  return (
    <div className="w-full h-full flex flex-col bg-bg-card/20 rounded-3xl overflow-hidden border border-border">

      {/* Top Search & Filter Bar */}
      <div className="p-4 md:p-6 border-b border-border bg-black/10 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-400">
            <BookOpen className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Manga Kütüphanesi</h2>
            <p className="text-xs text-text-secondary">Arşivlerinizi akıllıca yönetin ve kaldığınız yerden okuyun</p>
          </div>
        </div>

        {/* Action Button & View Switches */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex bg-black/20 rounded-xl p-1 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-violet-600 text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list" ? "bg-violet-600 text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsUploadWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Manga İçe Aktar
          </button>
        </div>
      </div>

      {/* Main Panel Content Area (Sidebar + Grid) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Left Drawer / Sidebar */}
        <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-border bg-black/5 flex flex-col h-auto md:h-full">
          {/* Main system collections */}
          <div className="p-4 space-y-1.5 overflow-y-auto max-h-[220px] md:max-h-none md:flex-1">
            <p className="text-[10px] font-extrabold tracking-widest text-text-secondary uppercase px-2 mb-2">
              Koleksiyonlar
            </p>

            <button
              onClick={() => setSelectedCollectionId("col-all")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCollectionId === "col-all"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <span className="flex items-center gap-2">📂 Tüm Mangalar</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-md font-mono">{mangas.length}</span>
            </button>

            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  selectedCollectionId === col.id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{col.icon || "📚"}</span>
                  <span className="truncate">{col.name}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-md font-mono">{col.mangaIds.length}</span>
                  {!col.isSystem && (
                    <button
                      onClick={(e) => handleDeleteCollection(col.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </button>
            ))}

            <button
              onClick={() => setIsNewCollectionOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-xs text-text-secondary hover:text-text-primary hover:border-violet-500/50 transition-all mt-4"
            >
              <FolderPlus className="w-4 h-4 text-violet-400" /> Koleksiyon Oluştur
            </button>
          </div>
        </div>

        {/* Right Dynamic Contents List */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Active Filter and Search Strip */}
          <div className="p-4 bg-black/10 border-b border-border flex flex-col sm:flex-row gap-3 items-center">

            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Başlık, yazar veya etiket ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none transition-all placeholder:text-text-secondary/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none transition-all"
              >
                {availableGenres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none transition-all"
              >
                <option value="added">Son Eklenenler</option>
                <option value="title">A-Z Sıralama</option>
                <option value="rating">Değerlendirme</option>
                <option value="pages">Sayfa Sayısı</option>
              </select>
            </div>

          </div>

          {/* Mangas Render Loop */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {filteredMangas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="p-5 rounded-full bg-violet-500/10 text-violet-400">
                  <FileArchive className="w-10 h-10 animate-bounce" />
                </div>
                <div className="max-w-sm">
                  <h4 className="text-base font-bold text-text-primary">Eşleşen Manga Bulunamadı</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Farklı kelimeler aramayı deneyebilir veya cihazınızdan ilk manganızı içe aktarabilirsiniz.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadWizardOpen(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all"
                >
                  Manga Ekle
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                : "space-y-3"
              }>
                {filteredMangas.map((manga) => (
                  <motion.div
                    key={manga.id}
                    layoutId={`manga-card-${manga.id}`}
                    onClick={() => setSelectedMangaDetail(manga)}
                    className={`group relative cursor-pointer overflow-hidden transition-all duration-300 ${
                      viewMode === "grid"
                        ? "flex flex-col rounded-2xl bg-bg-card border border-border hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-xl shadow-black/10"
                        : "flex items-center gap-4 p-3 rounded-2xl bg-bg-card border border-border hover:border-violet-500/40"
                    }`}
                  >
                    {/* Cover Wrap */}
                    <div className={viewMode === "grid"
                      ? "relative aspect-[3/4] w-full overflow-hidden bg-black/20"
                      : "relative aspect-[3/4] w-16 rounded-xl overflow-hidden shrink-0"
                    }>
                      <img
                        src={manga.coverUrl}
                        alt={manga.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Interactive Float Heart button */}
                      {viewMode === "grid" && (
                        <button
                          onClick={(e) => handleToggleFavorite(manga.id, e)}
                          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all ${
                            manga.favorite
                              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                              : "bg-black/40 text-white/80 hover:text-white hover:bg-black/60"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${manga.favorite ? "fill-current" : ""}`} />
                        </button>
                      )}

                      {/* Reading Status Badge */}
                      <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-bold text-white shadow-sm ${
                        manga.status === "Tamamlandı" ? "bg-emerald-600" :
                        manga.status === "Okunuyor" ? "bg-violet-600 animate-pulse" :
                        "bg-amber-600"
                      }`}>
                        {manga.status}
                      </span>
                    </div>

                    {/* Meta Description Wrap */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-text-primary group-hover:text-violet-400 transition-colors truncate">
                          {manga.title}
                        </h4>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">{manga.author}</p>
                      </div>

                      {/* Display page counts or progress bar if in reading */}
                      <div className="mt-2.5">
                        <div className="flex justify-between items-center text-[9px] text-text-secondary font-semibold font-mono">
                          <span>Sayfa</span>
                          <span>{manga.totalPages || 1}</span>
                        </div>
                        {/* Interactive customized rating star block */}
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2.5 h-2.5 rounded-full ${
                                i < (manga.rating || 5) ? "bg-amber-500" : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* List Mode Favorite & Trash */}
                    {viewMode === "list" && (
                      <div className="flex items-center gap-2 pr-3">
                        <button
                          onClick={(e) => handleToggleFavorite(manga.id, e)}
                          className={`p-2.5 rounded-xl ${
                            manga.favorite ? "text-rose-400 bg-rose-500/10" : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${manga.favorite ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteManga(manga.id, e)}
                          className="p-2.5 rounded-xl text-text-secondary hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL 1: Create Custom Collection */}
      <AnimatePresence>
        {isNewCollectionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden shadow-2xl rounded-3xl bg-bg-card border border-border"
            >
              <form onSubmit={handleCreateCollection} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-violet-400" /> Yeni Koleksiyon
                  </h4>
                  <button type="button" onClick={() => setIsNewCollectionOpen(false)} className="text-text-secondary">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">İsim</label>
                  <input
                    type="text"
                    required
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="Örn: Shonen Serilerim"
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Emoji İkon</label>
                    <select
                      value={newColIcon}
                      onChange={(e) => setNewColIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none"
                    >
                      <option value="📚">📚 Kitaplar</option>
                      <option value="🔥">🔥 Aksiyon</option>
                      <option value="🌸">🌸 Romantik</option>
                      <option value="🌌">🌌 Cyberpunk</option>
                      <option value="⚔️">⚔️ Savaş</option>
                      <option value="🧠">🧠 Gizem</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Renk</label>
                    <select
                      value={newColColor}
                      onChange={(e) => setNewColColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none"
                    >
                      <option value="indigo">Çivit Mavisi</option>
                      <option value="rose">Gül Pembesi</option>
                      <option value="emerald">Zümrüt Yeşili</option>
                      <option value="amber">Kehribar</option>
                      <option value="violet">Menekşe</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Koleksiyonu Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Manga Details & Chapter Selector */}
      <AnimatePresence>
        {selectedMangaDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              layoutId={`manga-card-${selectedMangaDetail.id}`}
              className="w-full max-w-xl overflow-hidden shadow-2xl rounded-3xl bg-bg-card border border-border max-h-[85vh] flex flex-col"
            >
              <div className="relative p-6 border-b border-border bg-black/10 flex gap-4 md:gap-6">
                <button
                  onClick={() => setSelectedMangaDetail(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-white/80 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-24 md:w-28 aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-md shrink-0">
                  <img src={selectedMangaDetail.coverUrl} alt={selectedMangaDetail.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <span className="px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold">
                    Cilt Arşivi
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-text-primary mt-1 truncate">{selectedMangaDetail.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Yazar: {selectedMangaDetail.author}</p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedMangaDetail.genres.map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-text-secondary">
                        {g}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4 items-center mt-3 font-mono text-[10px] text-text-secondary">
                    <span>Cilt Boyutu: {selectedMangaDetail.fileSize || "Bilinmiyor"}</span>
                    <span>Sayfa Sayısı: {selectedMangaDetail.totalPages || 0}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">Hikaye Özeti</h4>
                  <p className="text-xs text-text-primary leading-relaxed">{selectedMangaDetail.synopsis}</p>
                </div>

                {/* Tags */}
                {selectedMangaDetail.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">Etiketler</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMangaDetail.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-lg bg-violet-500/5 text-violet-400/90 text-[10px] font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collection Management inside details */}
                <div className="p-3.5 rounded-2xl bg-black/20 border border-border">
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-violet-400" /> Koleksiyon Düzenle
                  </h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">Bu mangayı dilediğiniz koleksiyonlara ekleyin.</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {collections.map(col => {
                      const isAssigned = col.mangaIds.includes(selectedMangaDetail.id);
                      return (
                        <button
                          key={col.id}
                          onClick={() => handleAssignMangaToCollection(selectedMangaDetail.id, col.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isAssigned
                              ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                              : "bg-white/5 text-text-secondary border border-transparent hover:bg-white/10"
                          }`}
                        >
                          {col.icon} {col.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 border-t border-border bg-black/10 flex justify-between items-center">
                <button
                  onClick={(e) => handleDeleteManga(selectedMangaDetail.id, e)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Arşivden Sil
                </button>
                <button
                  onClick={() => {
                    onSelectManga(selectedMangaDetail);
                    setSelectedMangaDetail(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/20 flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" /> Okumaya Başla
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Render Import Wizard */}
      {isUploadWizardOpen && (
        <MangaUploadWizard
          onSuccess={(newManga) => {
            loadMangaEcosystem();
            setIsUploadWizardOpen(false);
            setSelectedMangaDetail(newManga); // open detail inspect directly
          }}
          onCancel={() => setIsUploadWizardOpen(false)}
        />
      )}

    </div>
  );
};
