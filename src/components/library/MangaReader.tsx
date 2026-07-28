import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Layers,
  Eye,
  Sliders,
  Compass,
  HelpCircle,
  Menu,
  Sun,
  BookOpen,
  Volume2,
  X,
  Bookmark,
  BookmarkCheck,
  FileText,
  Smartphone
} from "lucide-react";
import { Manga, ReaderSettings, MangaBookmark } from "./mangaTypes";
import { MangaStorageService } from "./mangaStorageService";

interface MangaReaderProps {
  manga: Manga;
  onBack: () => void;
}

export const MangaReader: React.FC<MangaReaderProps> = ({ manga, onBack }) => {
  // Current Navigation State
  const [currentPage, setCurrentPage] = useState<number>(manga.lastReadPage || 1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showChapters, setShowChapters] = useState<boolean>(false);

  // Guided panel indices inside page
  const [activePanelIdx, setActivePanelIdx] = useState<number>(-1);

  // Bookmarks State
  const [localBookmarks, setLocalBookmarks] = useState<MangaBookmark[]>([]);
  const [newBookmarkNote, setNewBookmarkNote] = useState<string>("");
  const [isBookmarking, setIsBookmarking] = useState<boolean>(false);

  // Settings State loaded from storage
  const [settings, setSettings] = useState<ReaderSettings>(MangaStorageService.getReaderSettings());

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load Bookmarks on init
  useEffect(() => {
    loadMangaBookmarks();
  }, []);

  const loadMangaBookmarks = () => {
    const all = MangaStorageService.getBookmarks();
    setLocalBookmarks(all.filter(b => b.mangaId === manga.id));
  };

  // Update localStorage when settings change
  useEffect(() => {
    MangaStorageService.saveReaderSettings(settings);
  }, [settings]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        settings.readingMode === "RTL" ? prevPage() : nextPage();
      } else if (e.key === "ArrowLeft") {
        settings.readingMode === "RTL" ? nextPage() : prevPage();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, settings.readingMode]);

  // Page Turn Operations
  const nextPage = () => {
    // If Guided Panel mode is active, navigate panels first before turning pages
    if (settings.guidedPanelMode && activePanelIdx < 2) {
      setActivePanelIdx(prev => prev + 1);
      triggerPageEffect();
      return;
    }

    setActivePanelIdx(-1); // reset panels
    if (currentPage < (manga.totalPages || 12)) {
      const step = settings.doublePage ? 2 : 1;
      setCurrentPage(prev => Math.min((manga.totalPages || 12), prev + step));
      MangaStorageService.incrementPagesRead(step);
      triggerPageEffect();
    } else {
      MangaStorageService.updateMangaProgress(manga.id, currentPage, "Tamamlandı");
    }
  };

  const prevPage = () => {
    if (settings.guidedPanelMode && activePanelIdx > 0) {
      setActivePanelIdx(prev => prev - 1);
      triggerPageEffect();
      return;
    }

    setActivePanelIdx(-1);
    if (currentPage > 1) {
      const step = settings.doublePage ? 2 : 1;
      setCurrentPage(prev => Math.max(1, prev - step));
      triggerPageEffect();
    }
  };

  const triggerPageEffect = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    MangaStorageService.addBookmark(manga.id, currentPage, newBookmarkNote);
    setNewBookmarkNote("");
    setIsBookmarking(false);
    loadMangaBookmarks();
  };

  // Update progress in storage on page change
  useEffect(() => {
    MangaStorageService.updateMangaProgress(manga.id, currentPage, "Okunuyor");
  }, [currentPage, manga.id]);

  // Draw Cinematic Client-side Manga panels on canvas dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set resolution dynamically according to spread / double page mode
    canvas.width = settings.doublePage ? 1800 : 1000;
    canvas.height = 1400;

    let bg = "#ffffff";
    let textCol = "#0d0d0d";
    let panelBg = "#f3f4f6";

    if (settings.filterMode === "NIGHT") {
      bg = "#111827";
      textCol = "#e5e7eb";
      panelBg = "#1f2937";
    } else if (settings.filterMode === "SEPIA") {
      bg = "#fbf0d9";
      textCol = "#433422";
      panelBg = "#ecdcb9";
    } else if (settings.filterMode === "BLUE_LIGHT") {
      bg = "#fef9c3";
      textCol = "#1f2937";
      panelBg = "#fef08a";
    }

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, 1400);

    // Dynamic Panel Guided calculations variables
    const isFocused = (idx: number) => {
      if (!settings.guidedPanelMode || activePanelIdx === -1) return true;
      return activePanelIdx === idx;
    };

    const drawPageContents = (page: number, offsetLeft: number, widthAlloc: number) => {
      // Frame Border
      ctx.strokeStyle = textCol;
      ctx.lineWidth = 14;
      ctx.strokeRect(offsetLeft + 30, 30, widthAlloc - 60, 1340);

      // Header info (Page / Manga title)
      ctx.fillStyle = textCol;
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${manga.title.toUpperCase()}  -  SAYFA ${page}`, offsetLeft + 60, 65);
      ctx.fillText(`OKUMA YÖNÜ: ${settings.readingMode === "RTL" ? "SAG -> SOL" : "SOL -> SAG"}`, offsetLeft + widthAlloc - 280, 65);

      // Render stylized comic frames
      ctx.strokeStyle = textCol;
      ctx.lineWidth = 6;

      if (page % 3 === 1) {
        // Layout Style A: One top giant panel, two small bottom panels

        // Panel 1
        ctx.save();
        if (!isFocused(0)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50, 100, widthAlloc - 100, 500);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53, 103, widthAlloc - 106, 494);
        drawCinematicShadows(offsetLeft + 53, 103, widthAlloc - 106, 494, 1);
        drawSpeechBubble("BENİ BULAMAYACAKLARINI SANIYORLARDI... FAKAT TOKYO 2099 ASLA UYUMAZ.", offsetLeft + 180, 240, 130, 20);
        ctx.restore();

        // Panel 2
        ctx.save();
        if (!isFocused(1)) ctx.globalAlpha = 0.15;
        const colWidth = (widthAlloc - 130) / 2;
        ctx.strokeRect(offsetLeft + 50, 630, colWidth, 700);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53, 633, colWidth - 6, 694);
        drawCinematicShadows(offsetLeft + 53, 633, colWidth - 6, 694, 2);
        ctx.restore();

        // Panel 3
        ctx.save();
        if (!isFocused(2)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50 + colWidth + 30, 630, colWidth, 700);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53 + colWidth + 30, 633, colWidth - 6, 694);
        drawCinematicShadows(offsetLeft + 53 + colWidth + 30, 633, colWidth - 6, 694, 3);
        drawSpeechBubble("İZLERİ TAKİP ET! SİNYAL BURADAN GELİYOR!", offsetLeft + widthAlloc - 280, 800, 120, 40);
        ctx.restore();

      } else if (page % 3 === 2) {
        // Layout Style B: Three vertical grid columns (epic webtoon feeling)
        const colWidth = (widthAlloc - 160) / 3;

        // Panel 1
        ctx.save();
        if (!isFocused(0)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50, 100, colWidth, 1230);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53, 103, colWidth - 6, 1224);
        drawCinematicShadows(offsetLeft + 53, 103, colWidth - 6, 1224, 4);
        drawSpeechBubble("KRİSTAL... GÜCÜNÜ KAYBEDİYOR.", offsetLeft + 80, 300, 110, 5);
        ctx.restore();

        // Panel 2
        ctx.save();
        if (!isFocused(1)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50 + colWidth + 30, 100, colWidth, 1230);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53 + colWidth + 30, 103, colWidth - 6, 1224);
        drawCinematicShadows(offsetLeft + 53 + colWidth + 30, 103, colWidth - 6, 1224, 5);
        drawSpeechBubble("RÜZGARI TERBİYE ET, ARİA!", offsetLeft + colWidth + 100, 700, 110, 5);
        ctx.restore();

        // Panel 3
        ctx.save();
        if (!isFocused(2)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50 + (colWidth * 2) + 60, 100, colWidth, 1230);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53 + (colWidth * 2) + 60, 103, colWidth - 6, 1224);
        drawCinematicShadows(offsetLeft + 53 + (colWidth * 2) + 60, 103, colWidth - 6, 1224, 6);
        ctx.restore();

      } else {
        // Layout Style C: Four grid squares
        const colWidth = (widthAlloc - 130) / 2;

        // Panel 1
        ctx.save();
        if (!isFocused(0)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50, 100, colWidth, 590);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53, 103, colWidth - 6, 584);
        drawCinematicShadows(offsetLeft + 53, 103, colWidth - 6, 584, 7);
        drawSpeechBubble("KAFENİN KOKUSU SOKAĞI KAPLIYOR...", offsetLeft + 120, 260, 120, 10);
        ctx.restore();

        // Panel 2
        ctx.save();
        if (!isFocused(1)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50 + colWidth + 30, 100, colWidth, 590);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53 + colWidth + 30, 103, colWidth - 6, 584);
        drawCinematicShadows(offsetLeft + 53 + colWidth + 30, 103, colWidth - 6, 584, 8);
        ctx.restore();

        // Panel 3
        ctx.save();
        if (!isFocused(2)) ctx.globalAlpha = 0.15;
        ctx.strokeRect(offsetLeft + 50, 720, colWidth, 610);
        ctx.fillStyle = panelBg;
        ctx.fillRect(offsetLeft + 53, 723, colWidth - 6, 604);
        drawCinematicShadows(offsetLeft + 53, 723, colWidth - 6, 604, 9);
        drawSpeechBubble("BELKİ DE HAYAT, KÜÇÜK ANLARIN TOPLAMIDIR.", offsetLeft + 120, 950, 130, 20);
        ctx.restore();
      }
    };

    const drawCinematicShadows = (x: number, y: number, w: number, h: number, seed: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      ctx.strokeStyle = settings.filterMode === "NIGHT" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
      ctx.lineWidth = 3;
      const spacing = 15;
      for (let i = -w; i < w + h; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + h, y + h);
        ctx.stroke();
      }

      ctx.fillStyle = settings.filterMode === "NIGHT" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
      ctx.beginPath();
      if (seed % 3 === 0) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.strokeStyle = settings.filterMode === "NIGHT" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1.5;
        for (let angle = 0; angle < 360; angle += 12) {
          const rad = (angle * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rad) * 40, cy + Math.sin(rad) * 40);
          ctx.lineTo(cx + Math.cos(rad) * 400, cy + Math.sin(rad) * 400);
          ctx.stroke();
        }
      } else if (seed % 3 === 1) {
        ctx.fillRect(x + 20, y + h - 180, 80, 180);
        ctx.fillRect(x + 120, y + h - 260, 100, 260);
        ctx.fillRect(x + 240, y + h - 140, 70, 140);
      } else {
        ctx.moveTo(x, y + h - 100);
        ctx.bezierCurveTo(x + w / 4, y + h - 220, x + (3 * w) / 4, y + h - 40, x + w, y + h - 150);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const drawSpeechBubble = (text: string, x: number, y: number, w: number, padding: number) => {
      ctx.fillStyle = bg;
      ctx.strokeStyle = textCol;
      ctx.lineWidth = 3;

      const h = 75;
      const radius = 25;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);

      ctx.lineTo(x + w / 2 + 10, y + h);
      ctx.lineTo(x + w / 2, y + h + 15);
      ctx.lineTo(x + w / 2 - 10, y + h);

      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textCol;
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";

      const words = text.split(" ");
      let line = "";
      let lineY = y + 25;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        if (testLine.length > 20 && n > 0) {
          ctx.fillText(line, x + w / 2, lineY);
          line = words[n] + " ";
          lineY += 15;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x + w / 2, lineY);
      ctx.textAlign = "start";
    };

    // Render logic
    if (settings.doublePage) {
      // Draw Page 1 on left side, Page 2 on right side
      drawPageContents(currentPage, 0, 900);
      const nextPageNum = Math.min((manga.totalPages || 12), currentPage + 1);
      drawPageContents(nextPageNum, 900, 900);
    } else {
      drawPageContents(currentPage, 0, 1000);
    }

  }, [currentPage, settings.filterMode, settings.readingMode, settings.doublePage, settings.guidedPanelMode, activePanelIdx, manga]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col select-none overflow-hidden bg-zinc-950 text-white ${
        isFullscreen ? "p-0" : "p-0 md:p-1"
      }`}
    >

      {/* Immersive Header Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-sm font-bold truncate max-w-xs">{manga.title}</h3>
            <p className="text-[10px] text-text-secondary">Bölüm 1 - Sayfa {currentPage}/{manga.totalPages || 12}</p>
          </div>
        </div>

        {/* Quick settings & Fullscreen action buttons */}
        <div className="flex items-center gap-2">
          {/* Add Bookmark button */}
          <button
            onClick={() => setIsBookmarking(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white cursor-pointer"
            title="Yer İmi Ekle"
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowChapters(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white cursor-pointer"
            title="Bölümler"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white cursor-pointer"
            title="Okuyucu Ayarları"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main viewport area supporting multi-directional reading styles */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative bg-[#121214]">

        {/* Dynamic Zoom Wrapper with applied visual filter variables */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: `brightness(${settings.brightness}) contrast(${settings.contrast})`
          }}
          className="max-w-full max-h-full flex items-center justify-center"
        >
          {settings.readingMode === "WEBTOON" ? (
            <div className="flex flex-col gap-4 max-w-[650px] w-full py-20">
              {Array.from({ length: 4 }).map((_, i) => {
                const pageNum = Math.min((manga.totalPages || 12), currentPage + i);
                return (
                  <div key={i} className="rounded-2xl overflow-hidden border border-border/20 shadow-2xl bg-zinc-900 aspect-[3/4] w-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 font-mono">
                    <BookOpen className="w-10 h-10 mb-4 text-violet-500 animate-pulse" />
                    <span>Dikey Webtoon Sayfası {pageNum}</span>
                    <span className="text-[10px] mt-2 text-zinc-600">Sonsuz Dikey Kaydırma Aktif</span>
                  </div>
                );
              })}
            </div>
          ) : (
            // Page flip layouts (RTL or LTR standard pages with 3D animation simulation)
            <motion.div
              key={currentPage}
              initial={settings.pageAnimation === "SLIDE" ? { x: 150, opacity: 0 } : settings.pageAnimation === "FADE" ? { opacity: 0 } : {}}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 flex items-center justify-center border border-white/5 max-h-[85vh] aspect-[3/4] w-auto"
            >
              <canvas
                ref={canvasRef}
                className="max-h-[82vh] w-auto object-contain select-none pointer-events-none"
              />
            </motion.div>
          )}
        </div>

        {/* Floating Quick Action Hotspots (Left & Right margins for effortless tap page-turning) */}
        {settings.readingMode !== "WEBTOON" && (
          <>
            <div
              onClick={settings.readingMode === "RTL" ? nextPage : prevPage}
              className="absolute left-0 top-20 bottom-20 w-1/4 cursor-w-resize z-20 hover:bg-white/[0.01] transition-all"
            />
            <div
              onClick={settings.readingMode === "RTL" ? prevPage : nextPage}
              className="absolute right-0 top-20 bottom-20 w-1/4 cursor-e-resize z-20 hover:bg-white/[0.01] transition-all"
            />
          </>
        )}

      </div>

      {/* Immersive Bottom Page Indicator & Navigation Scrubber slider */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center gap-3">
        <div className="flex items-center gap-4 w-full max-w-md bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">

          <button
            onClick={settings.readingMode === "RTL" ? nextPage : prevPage}
            disabled={settings.readingMode === "RTL" ? currentPage === (manga.totalPages || 12) : currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <input
            type="range"
            min={1}
            max={manga.totalPages || 12}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="flex-1 accent-violet-500 h-1 rounded-lg cursor-pointer bg-white/20"
          />

          <button
            onClick={settings.readingMode === "RTL" ? prevPage : nextPage}
            disabled={settings.readingMode === "RTL" ? currentPage === 1 : currentPage === (manga.totalPages || 12)}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <span className="text-xs font-mono text-white shrink-0">
            {currentPage}/{manga.totalPages || 12}
          </span>
        </div>
      </div>

      {/* MODAL: Add Bookmark with Notes */}
      <AnimatePresence>
        {isBookmarking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden shadow-2xl rounded-3xl bg-zinc-900 border border-white/10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2 text-violet-400">
                  <BookmarkCheck className="w-5 h-5" /> Yer İmi Kaydet
                </h4>
                <button onClick={() => setIsBookmarking(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-300">
                <p>Manga: <span className="font-bold text-white">{manga.title}</span></p>
                <p>Aktif Konum: <span className="font-bold text-white">Sayfa {currentPage}</span></p>
              </div>

              <form onSubmit={handleAddBookmark} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Açıklama / Kişisel Not</label>
                  <input
                    type="text"
                    value={newBookmarkNote}
                    onChange={(e) => setNewBookmarkNote(e.target.value)}
                    placeholder="Örn: Bu gizemli sahne çok önemli!"
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Yer İmini Ekle
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER 1: Interactive Settings Control Drawer */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="absolute inset-0" onClick={() => setShowSettings(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 bg-zinc-900 border-l border-white/10 h-full flex flex-col p-6 space-y-6 z-10"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-400" /> Okuyucu Ayarları
                </h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Reading Direction */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Okuma Modu</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                  {(["RTL", "LTR", "WEBTOON"] as ReaderSettings["readingMode"][]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSettings({ ...settings, readingMode: mode })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        settings.readingMode === mode
                          ? "bg-violet-600 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {mode === "RTL" ? "Sağ-Sol" : mode === "LTR" ? "Sol-Sağ" : "Webtoon"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Double Page Layout & Guided Panel Mode */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Panel ve Ekran Düzeni</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettings({ ...settings, doublePage: !settings.doublePage })}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      settings.doublePage
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" /> Çift Sayfa
                  </button>
                  <button
                    onClick={() => {
                      const next = !settings.guidedPanelMode;
                      setSettings({ ...settings, guidedPanelMode: next });
                      setActivePanelIdx(next ? 0 : -1);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      settings.guidedPanelMode
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> Akıllı Panel
                  </button>
                </div>
              </div>

              {/* Transitions animation select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Geçiş Animasyonu</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                  {(["CURL", "SLIDE", "FADE"] as ReaderSettings["pageAnimation"][]).map((anim) => (
                    <button
                      key={anim}
                      onClick={() => setSettings({ ...settings, pageAnimation: anim })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        settings.pageAnimation === anim
                          ? "bg-violet-600 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {anim === "CURL" ? "3D Kıvrılma" : anim === "SLIDE" ? "Kayma" : "Solma"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Strain Filter Modes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Göz Koruma Filtreleri</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { mode: "NONE", label: "Kapalı", col: "border-white/10 bg-white/5" },
                    { mode: "NIGHT", label: "Gece Modu", col: "border-zinc-800 bg-zinc-950 text-white" },
                    { mode: "SEPIA", label: "Sıcak Sepya", col: "border-amber-900 bg-amber-100 text-amber-950" },
                    { mode: "BLUE_LIGHT", label: "Mavi Filtre", col: "border-yellow-800 bg-yellow-50 text-yellow-950" }
                  ].map((item) => (
                    <button
                      key={item.mode}
                      onClick={() => setSettings({ ...settings, filterMode: item.mode as any })}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${item.col} ${
                        settings.filterMode === item.mode
                          ? "ring-2 ring-violet-500 scale-95"
                          : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brightness slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Ekran Parlaklığı</span>
                  <span>%{Math.round(settings.brightness * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  value={settings.brightness}
                  onChange={(e) => setSettings({ ...settings, brightness: Number(e.target.value) })}
                  className="w-full accent-violet-500 h-1 rounded-lg bg-white/20 cursor-pointer"
                />
              </div>

              {/* Contrast slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Kontrast Seviyesi</span>
                  <span>%{Math.round(settings.contrast * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.4}
                  step={0.05}
                  value={settings.contrast}
                  onChange={(e) => setSettings({ ...settings, contrast: Number(e.target.value) })}
                  className="w-full accent-violet-500 h-1 rounded-lg bg-white/20 cursor-pointer"
                />
              </div>

              {/* Zoom Controls */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sayfa Yakınlaştırma</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                  <button onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.2))} className="py-1 rounded-lg text-xs text-zinc-400 hover:text-white">-</button>
                  <button onClick={() => setZoomLevel(1)} className="py-1 rounded-lg text-xs text-white font-bold font-mono">x{zoomLevel.toFixed(1)}</button>
                  <button onClick={() => setZoomLevel(Math.min(1.8, zoomLevel + 0.2))} className="py-1 rounded-lg text-xs text-zinc-400 hover:text-white">+</button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER 2: Interactive Chapters List Drawer */}
      <AnimatePresence>
        {showChapters && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="absolute inset-0" onClick={() => setShowChapters(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 bg-zinc-900 border-l border-white/10 h-full flex flex-col p-6 space-y-6 z-10"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Menu className="w-4 h-4 text-violet-400" /> Bölümler & Sayfalar
                </h4>
                <button
                  onClick={() => setShowChapters(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mevcut Cilt Bölümleri</p>
                <div className="grid gap-2">
                  {[
                    { id: "c1", title: "Bölüm 1: İlk Karşılaşma", isRead: true },
                    { id: "c2", title: "Bölüm 2: Gölgelerin Ötesinde", isRead: false },
                    { id: "c3", title: "Bölüm 3: Son Direniş", isRead: false }
                  ].map((chap, i) => (
                    <div
                      key={chap.id}
                      onClick={() => {
                        setCurrentPage(1);
                        setShowChapters(false);
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                        i === 0
                          ? "bg-violet-600/10 border-violet-500/30 text-violet-300"
                          : "bg-white/5 border-transparent text-zinc-400 hover:text-white hover:border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-violet-400" />
                        <span>{chap.title}</span>
                      </div>
                      {chap.isRead && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">OKUNDU</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
