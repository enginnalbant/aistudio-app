import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  FileArchive,
  Sparkles,
  BookOpen,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FolderOpen,
  X,
  Globe,
  Database
} from "lucide-react";
import JSZip from "jszip";
import { Manga, MangaChapter, ReaderSettings } from "./mangaTypes";
import { MangaStorageService } from "./mangaStorageService";

interface MangaUploadWizardProps {
  onSuccess: (manga: Manga) => void;
  onCancel: () => void;
}

export const MangaUploadWizard: React.FC<MangaUploadWizardProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<"local" | "gdrive">("local");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Metadata Form State (AI populated or manual edit)
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [genres, setGenres] = useState<string[]>(["Manga"]);
  const [newGenre, setNewGenre] = useState<string>("");
  const [synopsis, setSynopsis] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [pubYear, setPubYear] = useState<number>(2026);
  const [isAiExtracting, setIsAiExtracting] = useState<boolean>(false);

  // Local reader setting override logic inside wizard
  const [readingMode, setReadingMode] = useState<ReaderSettings["readingMode"]>("RTL");

  // File drag & drop state
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const validExtensions = [".zip", ".cbz", ".pdf"];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError("Desteklenmeyen dosya biçimi! Lütfen .zip, .cbz veya .pdf formatında bir dosya yükleyin.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    const cleanTitle = selectedFile.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]/g, " ")
      .trim();
    setTitle(cleanTitle);
    setStep(2);
  };

  // Google Drive Simulation with complete Offline Cache trigger
  const handleGoogleDriveSelect = (mangaName: string, size: string) => {
    const dummyFile = new File(["dummyContent"], `${mangaName}.cbz`, { type: "application/x-cbz" });
    setFile(dummyFile);
    setTitle(mangaName);
    setError(null);
    setStep(2);
  };

  // Process selected archive or document client-side
  const processDocument = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessingStatus("Dosya analiz ediliyor...");
    setError(null);

    try {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".zip") || fileName.endsWith(".cbz")) {
        setProcessingStatus("Zip/Cbz arşivi açılıyor ve sayfalar sıralanıyor...");
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);

        const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
        const imageFiles = Object.keys(loadedZip.files).filter(path => {
          const lowerPath = path.toLowerCase();
          return imageExtensions.some(ext => lowerPath.endsWith(ext)) && !lowerPath.includes("__macosx");
        });

        if (imageFiles.length === 0) {
          throw new Error("Arşiv içerisinde hiç geçerli resim dosyası (.png, .jpg, .webp) bulunamadı.");
        }

        imageFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        setPagesCount(imageFiles.length);

        setProcessingStatus("İlk sayfa kapak görseli olarak ayıklanıyor...");
        const firstImagePath = imageFiles[0];
        const firstImageFile = loadedZip.files[firstImagePath];
        const imageBlob = await firstImageFile.async("blob");
        const reader = new FileReader();

        reader.onloadend = () => {
          setCoverUrl(reader.result as string);
          setIsProcessing(false);
          setStep(3);
          triggerAiMetadataExtraction(file.name);
        };
        reader.readAsDataURL(imageBlob);

      } else if (fileName.endsWith(".pdf")) {
        setProcessingStatus("PDF belgesi taranıyor...");
        const estPages = Math.max(12, Math.floor(file.size / (1024 * 300)));
        setPagesCount(estPages);

        setProcessingStatus("Kapak şablonu oluşturuluyor...");
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 600;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 0, 600);
          grad.addColorStop(0, "#1e1b4b");
          grad.addColorStop(0.5, "#311042");
          grad.addColorStop(1, "#030712");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 400, 600);

          ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 400; i += 20) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
          }
          for (let i = 0; i < 600; i += 20) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(400, i); ctx.stroke();
          }

          ctx.fillStyle = "#a78bfa";
          ctx.fillRect(40, 60, 8, 80);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 24px system-ui, sans-serif";
          ctx.fillText("MANGA READER", 60, 90);

          ctx.fillStyle = "#9ca3af";
          ctx.font = "14px system-ui, sans-serif";
          ctx.fillText("APEX OS LIBRARY", 60, 115);

          ctx.fillStyle = "#f3f4f6";
          ctx.font = "bold 20px system-ui, sans-serif";
          const words = title.split(" ");
          let line = "";
          let y = 300;
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            if (testLine.length > 20 && n > 0) {
              ctx.fillText(line, 40, y);
              line = words[n] + " ";
              y += 28;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 40, y);

          ctx.fillStyle = "rgba(139, 92, 246, 0.2)";
          ctx.fillRect(40, 500, 120, 32);
          ctx.strokeStyle = "#a78bfa";
          ctx.strokeRect(40, 500, 120, 32);
          ctx.fillStyle = "#c084fc";
          ctx.font = "bold 12px system-ui, sans-serif";
          ctx.fillText("PDF DOKÜMANI", 55, 520);
        }

        setCoverUrl(canvas.toDataURL("image/jpeg"));
        setIsProcessing(false);
        setStep(3);
        triggerAiMetadataExtraction(file.name);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Dosya işleme sırasında beklenmeyen bir hata meydana geldi.");
      setIsProcessing(false);
    }
  };

  // Automated Google Gemini AI extraction with Anilist/MAL Search DB query simulation
  const triggerAiMetadataExtraction = async (fileName: string) => {
    setIsAiExtracting(true);
    try {
      const response = await fetch("/api/books/extract-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: fileName, author: "" })
      });

      if (response.ok) {
        const metadata = await response.json();
        setTitle(metadata.title || title);
        setAuthor(metadata.author || "Bilinmiyor");
        setArtist(metadata.author || "Bilinmiyor");
        setGenres(metadata.category ? [metadata.category] : ["Manga"]);
        setSynopsis(metadata.description || "Kişisel kütüphanenize yüklenen manga serisi.");
        setTags(metadata.tags || []);
        setPubYear(metadata.year || 2026);
        if (metadata.totalPages) {
          setPagesCount(metadata.totalPages);
        }
      } else {
        fallbackExtraction(fileName);
      }
    } catch (e) {
      fallbackExtraction(fileName);
    } finally {
      setIsAiExtracting(false);
    }
  };

  const fallbackExtraction = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    setAuthor("Yapay Zeka");
    setArtist("Yapay Zeka");
    setGenres(["Manga"]);
    setSynopsis("Dosya adından otomatik olarak oluşturuldu. APEX OS manga arşivi.");
    setPubYear(2025);

    const inferredTags = ["manga", "okuma"];
    if (lowerName.includes("action") || lowerName.includes("savaş")) inferredTags.push("aksiyon");
    if (lowerName.includes("adventure") || lowerName.includes("macera")) inferredTags.push("macera");
    setTags(inferredTags);
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddGenre = () => {
    const trimmed = newGenre.trim();
    if (trimmed && !genres.includes(trimmed)) {
      setGenres([...genres, trimmed]);
      setNewGenre("");
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setGenres(genres.filter(g => g !== genreToRemove));
  };

  // Save changes and complete the wizard
  const handleFinalSave = () => {
    if (!title.trim()) {
      setError("Manga başlığı boş bırakılamaz!");
      return;
    }

    const sizeStr = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "Bilinmiyor";

    const newManga: Manga = {
      id: `manga-${Date.now()}`,
      title,
      author: author || "Bilinmeyen Çizer",
      artist: artist || author || "Bilinmeyen Çizer",
      synopsis: synopsis || "İçerik açıklaması bulunmuyor.",
      coverUrl: coverUrl || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400",
      genres: genres.length > 0 ? genres : ["Genel"],
      tags,
      year: pubYear || new Date().getFullYear(),
      rating: 5,
      favorite: false,
      addedAt: new Date().toLocaleDateString("tr-TR"),
      source: source === "local" ? "local" : "drive",
      fileName: file ? file.name : "unknown_archive.cbz",
      fileSize: sizeStr,
      totalPages: pagesCount || 1,
      totalChapters: 1,
      status: "Okunuyor",
      readProgress: 0,
      lastReadPage: 1,
      isCachedOffline: true // auto-save local download to mock IndexDB caching
    };

    const currentMangas = MangaStorageService.getMangas();
    MangaStorageService.saveMangas([...currentMangas, newManga]);

    const initialChapter: MangaChapter = {
      id: `chapter-${newManga.id}-1`,
      mangaId: newManga.id,
      title: "Bölüm 1: Giriş",
      chapterNumber: 1,
      pageUrls: Array.from({ length: pagesCount || 1 }, (_, i) => `page-${i + 1}`),
      isRead: false,
      lastReadPage: 1
    };
    const currentChapters = MangaStorageService.getChapters();
    MangaStorageService.saveChapters([...currentChapters, initialChapter]);

    const currentSettings = MangaStorageService.getReaderSettings();
    MangaStorageService.saveReaderSettings({
      ...currentSettings,
      readingMode
    });

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([100, 50, 100]);
    }

    onSuccess(newManga);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden shadow-2xl rounded-3xl bg-bg-card border border-border backdrop-blur-xl max-h-[90vh] flex flex-col"
      >
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary font-display">Akıllı Manga Sihirbazı</h3>
              <p className="text-xs text-text-secondary">Yapay zeka destekli arşiv tarama ve içe aktarma</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 transition-colors rounded-xl text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-4 bg-black/10 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <React.Fragment key={num}>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  step === num
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : step > num
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-text-secondary border border-transparent"
                }`}>
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-12 h-[2px] rounded-full transition-all ${
                    step > num ? "bg-emerald-500/50" : "bg-white/5"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400">
            {step === 1 ? "Kaynak Seçimi" : step === 2 ? "Dosya Analizi" : "Meta Veri Düzenleme"}
          </span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-rose-400">Hata Oluştu</h4>
              <p className="text-xs text-rose-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">

            {/* Step 1: Resource Source Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4 p-1 bg-black/20 rounded-2xl border border-border">
                  <button
                    onClick={() => setSource("local")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all text-sm ${
                      source === "local"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Upload className="w-4 h-4" /> Cihazdan Yükle
                  </button>
                  <button
                    onClick={() => setSource("gdrive")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all text-sm ${
                      source === "gdrive"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/10"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" /> Google Drive
                  </button>
                </div>

                {source === "local" ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                      isDragActive
                        ? "border-violet-500 bg-violet-500/10 scale-[0.99]"
                        : "border-border hover:border-violet-500/50 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept=".zip,.cbz,.pdf"
                      className="hidden"
                    />

                    <div className="p-4 rounded-2xl bg-white/5 border border-border mb-4 text-violet-400">
                      <FileArchive className="w-8 h-8" />
                    </div>

                    <h4 className="text-base font-bold text-text-primary">Dosyanızı Sürükleyin veya Seçin</h4>
                    <p className="text-xs text-text-secondary max-w-sm mt-2">
                      Sürükleyip bırakarak veya tıklayarak .zip, .cbz veya .pdf formatındaki manga arşivlerinizi yükleyebilirsiniz.
                    </p>
                    <div className="mt-4 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/20 text-xs text-text-secondary border border-border">
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                      Maksimum 150MB dosya boyutu
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-2">
                      <Database className="w-4 h-4" /> Google Drive Akıllı Çevrimdışı Önbellek Aktif
                    </div>
                    <p className="text-xs text-text-secondary">Google Drive kütüphanenizden taranan son arşivler:</p>
                    <div className="grid gap-3">
                      {[
                        { name: "One Piece - Chapter 1044", size: "34 MB" },
                        { name: "Solo Leveling - Vol 01", size: "82 MB" },
                        { name: "Jujutsu Kaisen - Ch 201", size: "29 MB" }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleGoogleDriveSelect(item.name, item.size)}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                              <FileArchive className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                              <p className="text-xs text-text-secondary">{item.size}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-text-secondary" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Processing File & Client-side Extraction */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-violet-400">
                    <BookOpen className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <h4 className="text-base font-bold text-text-primary">Arşiv Paketi Ayıklanıyor</h4>
                  <p className="text-xs text-text-secondary">
                    {processingStatus || "Dosya yapısı analiz edilerek kütüphaneye hazırlanıyor..."}
                  </p>
                </div>

                {file && (
                  <div className="px-4 py-2.5 rounded-xl bg-black/20 border border-border text-xs text-text-secondary font-mono max-w-xs truncate">
                    {file.name}
                  </div>
                )}

                <button
                  onClick={processDocument}
                  className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" /> Ayıklamayı Başlat
                </button>
              </motion.div>
            )}

            {/* Step 3: AI Categorisation & Form Editing */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {isAiExtracting && (
                  <div className="p-3.5 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
                      <span className="text-xs text-violet-300 font-medium flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> AniList & MyAnimeList veritabanlarından akıllı metaveriler aranıyor...
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Cover Preview & Settings */}
                  <div className="md:col-span-4 flex flex-col items-center gap-4">
                    <div className="relative aspect-[3/4] w-full max-w-[160px] rounded-2xl overflow-hidden border border-border shadow-xl bg-black/40">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary p-4">
                          <FileText className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-medium">Kapak Hazırlanıyor</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-black/20 border border-border text-text-secondary font-mono">
                        {pagesCount} Sayfa Tespit Edildi
                      </span>
                    </div>

                    {/* Reading Mode */}
                    <div className="w-full space-y-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono">OKUMA YÖNÜ</label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-border">
                        {(["RTL", "LTR", "WEBTOON"] as ReaderSettings["readingMode"][]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setReadingMode(mode)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                              readingMode === mode
                                ? "bg-violet-600 text-white"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {mode === "RTL" ? "Sağ-Sol" : mode === "LTR" ? "Sol-Sağ" : "Dikey"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Metadata Fields */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase">Manga Adı</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Seri adı girin"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-border text-sm text-text-primary focus:border-violet-500 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Author & Artist */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase">Yazar / Çizer</label>
                        <input
                          type="text"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="Eiichiro Oda"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-border text-sm text-text-primary focus:border-violet-500 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase">Yayın Yılı</label>
                        <input
                          type="number"
                          value={pubYear}
                          onChange={(e) => setPubYear(Number(e.target.value))}
                          placeholder="2026"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-border text-sm text-text-primary focus:border-violet-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase">Türler</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {genres.map((genre) => (
                          <span
                            key={genre}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
                          >
                            {genre}
                            <button
                              type="button"
                              onClick={() => handleRemoveGenre(genre)}
                              className="hover:text-rose-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddGenre()}
                          placeholder="Tür ekle... (Örn: Aksiyon)"
                          className="flex-1 px-4 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddGenre}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>

                    {/* Synopsis */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase">Tanıtım & Özet</label>
                      <textarea
                        value={synopsis}
                        onChange={(e) => setSynopsis(e.target.value)}
                        rows={3}
                        placeholder="Manga konusu ve serinin hikayesi..."
                        className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-border text-sm text-text-primary focus:border-violet-500 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Interactive Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase">Etiketler</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-semibold"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-rose-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                          placeholder="Etiket ekle..."
                          className="flex-1 px-4 py-2 rounded-xl bg-black/20 border border-border text-xs text-text-primary focus:border-violet-500 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-black/10 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-white/5 text-text-primary text-sm font-semibold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Geri
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-transparent hover:bg-white/5 text-text-secondary text-sm font-semibold transition-all"
            >
              İptal
            </button>
            {step === 3 && (
              <button
                onClick={handleFinalSave}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Kütüphaneye Ekle
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
};
