import React, { useState, useRef } from 'react';
import {
  Info,
  Globe,
  ExternalLink,
  Sparkles,
  CheckSquare,
  Plus,
  Folder,
  Trash2,
  Upload,
  FileCode,
  Check,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { RSSFeed, OPMLImportItem } from './types';
import { ensureString } from './utils';

interface SourceManagerProps {
  processedFeeds: RSSFeed[];
  categories: string[];
  newFeedTitle: string;
  setNewFeedTitle: (title: string) => void;
  newFeedUrl: string;
  setNewFeedUrl: (url: string) => void;
  newFeedCategory: string;
  setNewFeedCategory: (cat: string) => void;
  handleAddFeed: (e: React.FormEvent) => void;
  handleToggleFeedStatus: (e: React.MouseEvent, feedId: string) => void;
  handleDeleteFeed: (e: React.MouseEvent, feedId: string) => void;
  handleImportOPML: (importedFeeds: OPMLImportItem[]) => Promise<void>;
}

export function SourceManager({
  processedFeeds,
  categories,
  newFeedTitle,
  setNewFeedTitle,
  newFeedUrl,
  setNewFeedUrl,
  newFeedCategory,
  setNewFeedCategory,
  handleAddFeed,
  handleToggleFeedStatus,
  handleDeleteFeed,
  handleImportOPML,
}: SourceManagerProps) {
  // Add Feed Integration Mode
  const [addMode, setAddMode] = useState<'single' | 'opml'>('single');

  // OPML Import States
  const [dragActive, setDragActive] = useState(false);
  const [parsedFeeds, setParsedFeeds] = useState<OPMLImportItem[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseOPMLFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseOPMLFile(e.target.files[0]);
    }
  };

  // Parsing Logic
  const parseOPMLFile = (file: File) => {
    setImportStatus('idle');
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xmlText = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Check parsing error
        const parserError = xmlDoc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
          setErrorMessage('OPML dosyası geçerli bir XML formatında değil.');
          return;
        }

        const outlines = xmlDoc.getElementsByTagName('outline');
        const feedsList: OPMLImportItem[] = [];

        for (let i = 0; i < outlines.length; i++) {
          const outline = outlines[i];
          const rawXmlUrl = outline.getAttribute('xmlUrl');
          if (rawXmlUrl) {
            const xmlUrl = ensureString(rawXmlUrl);
            const title = ensureString(outline.getAttribute('title') || outline.getAttribute('text') || xmlUrl);

            // Determine category based on the parent outline folder
            let category = 'Diğer';
            let parent = outline.parentElement;
            if (parent && parent.tagName === 'outline') {
              const parentText = parent.getAttribute('title') || parent.getAttribute('text');
              if (parentText && !parent.getAttribute('xmlUrl')) {
                category = ensureString(parentText);
              }
            }

            // Map standard categories if possible to maintain app harmony
            const normalizedCat = category.trim().toLowerCase();
            let finalCategory = 'Diğer';
            if (normalizedCat.includes('tech') || normalizedCat.includes('teknoloji') || normalizedCat.includes('yazılım')) {
              finalCategory = 'Teknoloji';
            } else if (normalizedCat.includes('science') || normalizedCat.includes('bilim') || normalizedCat.includes('uzay')) {
              finalCategory = 'Bilim';
            } else if (normalizedCat.includes('finans') || normalizedCat.includes('ekonomi') || normalizedCat.includes('finance')) {
              finalCategory = 'Finans';
            } else if (normalizedCat.includes('haber') || normalizedCat.includes('news') || normalizedCat.includes('gündem')) {
              finalCategory = 'Haber';
            } else if (normalizedCat.includes('tasarım') || normalizedCat.includes('ürün') || normalizedCat.includes('design') || normalizedCat.includes('product')) {
              finalCategory = 'Tasarım & Ürün';
            } else if (normalizedCat.includes('kültür') || normalizedCat.includes('sanat') || normalizedCat.includes('culture') || normalizedCat.includes('art')) {
              finalCategory = 'Kültür & Sanat';
            } else if (category && category !== 'Diğer') {
              // Capitalize first letter of category if custom
              finalCategory = category.charAt(0).toUpperCase() + category.slice(1);
            }

            feedsList.push({
              title: title,
              url: xmlUrl,
              category: finalCategory,
            });
          }
        }

        if (feedsList.length === 0) {
          setErrorMessage('Yüklenebilecek geçerli bir RSS akışı bulunamadı.');
        } else {
          setParsedFeeds(feedsList);
          setSelectedUrls(new Set(feedsList.map((f) => f.url)));
        }
      } catch (err) {
        setErrorMessage('Dosya okunurken veya ayrıştırılırken hata oluştu.');
      }
    };
    reader.readAsText(file);
  };

  // OPML Checklist Actions
  const toggleSelectAll = () => {
    if (selectedUrls.size === parsedFeeds.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(parsedFeeds.map((f) => f.url)));
    }
  };

  const toggleSelectFeed = (url: string) => {
    const nextSet = new Set(selectedUrls);
    if (nextSet.has(url)) {
      nextSet.delete(url);
    } else {
      nextSet.add(url);
    }
    setSelectedUrls(nextSet);
  };

  const handleCategoryChangeForFeed = (index: number, cat: string) => {
    const nextFeeds = [...parsedFeeds];
    nextFeeds[index] = { ...nextFeeds[index], category: cat };
    setParsedFeeds(nextFeeds);
  };

  const triggerImport = async () => {
    const finalToImport = parsedFeeds.filter((f) => selectedUrls.has(f.url));
    if (finalToImport.length === 0) return;

    setImportStatus('loading');
    try {
      await handleImportOPML(finalToImport);
      setImportStatus('success');
      setTimeout(() => {
        setParsedFeeds([]);
        setSelectedUrls(new Set());
        setImportStatus('idle');
      }, 3000);
    } catch (err) {
      setImportStatus('error');
    }
  };

  return (
    <div className="flex flex-col space-y-6 overflow-y-auto custom-scrollbar h-full lg:pr-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch shrink-0">
        {/* Info Summary */}
        <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase font-mono">Özet İstatistikler</span>
            <h3 className="text-xl font-display font-bold text-text-primary mt-1 mb-3">Akış Kaynakları</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Bülteninizdeki tüm haber kaynaklarını buradan yönetebilir, dilediğiniz kategoriyi geçici olarak deaktif edebilir veya kendi özel akışlarınızı ekleyebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-text-secondary font-bold block">Toplam Kaynak</span>
              <span className="text-2xl font-display font-black text-rose-500 mt-1 block">
                {processedFeeds.length}
              </span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-text-secondary font-bold block">Aktif Akışlar</span>
              <span className="text-2xl font-display font-black text-emerald-500 mt-1 block">
                {processedFeeds.filter((f) => f.isActive !== false).length}
              </span>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1.5 font-mono">
              <Info size={12} />
              Kullanım Koşulları ve Hukuki Sınırlar
            </span>
            <h3 className="text-xl font-display font-bold text-text-primary mt-1 mb-2 font-sans">Adil RSS Kullanım Bildirgesi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
              <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                <Globe size={13} className="text-rose-400" />
                Doğrudan Yerel Çekim
              </h4>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Tüm akışlar doğrudan yayıncıların resmi XML uçlarından RSS/Atom protokolü ile çekilir. Sunucularımızda hiçbir makale verisi kopyalanmaz.
              </p>
            </div>

            <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
              <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                <ExternalLink size={13} className="text-amber-400" />
                Orijinal Kaynak Yönlendirmesi
              </h4>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Telif haklarına saygı gösterilir. Kullanıcılar her zaman yayıncının kendi orijinal web sitesine yönlendirilir.
              </p>
            </div>

            <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
              <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-400" />
                Özetleme ve Adil Kullanım
              </h4>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Yapay zeka TL;DR özetleri, adil kullanım (fair use) kapsamında anlık konsept kavrayışı sağlamak üzere tasarlanmıştır.
              </p>
            </div>

            <div className="space-y-1 bg-black/20 border border-white/5 p-3.5 rounded-2xl">
              <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                <CheckSquare size={13} className="text-emerald-400" />
                Kişisel Deneyim Odaklı
              </h4>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Bu bülten ticari bir yeniden dağıtım aracı değildir. Kapalı devre, kişisel okuma asistanı standartlarına göre dizayn edilmiştir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Card with Mode Tabs */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shrink-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase font-mono">Entegrasyon Paneli</span>
            <h3 className="text-lg font-display font-bold text-text-primary mt-0.5">Yeni RSS/Atom Akışları Ekle</h3>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => { setAddMode('single'); setErrorMessage(null); setParsedFeeds([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                addMode === 'single'
                  ? 'bg-rose-500/10 text-rose-400 font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Tekli Akış
            </button>
            <button
              onClick={() => { setAddMode('opml'); setErrorMessage(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                addMode === 'opml'
                  ? 'bg-rose-500/10 text-rose-400 font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              OPML İçe Aktar
            </button>
          </div>
        </div>

        {addMode === 'single' ? (
          <form onSubmit={handleAddFeed} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-xs">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-text-secondary font-bold">Akış Başlığı / Yayıncı</label>
              <input
                type="text"
                placeholder="Örn: Bilim Teknik"
                value={newFeedTitle}
                onChange={(e) => setNewFeedTitle(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-sans font-semibold"
              />
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label className="text-text-secondary font-bold">Resmi RSS URL Adresi</label>
              <input
                type="url"
                placeholder="https://yayinici.com/rss.xml"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-mono"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-text-secondary font-bold">Kategori Klasörü</label>
              <select
                value={newFeedCategory}
                onChange={(e) => setNewFeedCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-text-primary outline-none focus:border-rose-500/30 transition-all font-sans font-bold"
              >
                <option value="Teknoloji" className="bg-neutral-900 text-text-primary">Teknoloji</option>
                <option value="Bilim" className="bg-neutral-900 text-text-primary">Bilim</option>
                <option value="Finans" className="bg-neutral-900 text-text-primary">Finans</option>
                <option value="Haber" className="bg-neutral-900 text-text-primary">Haber</option>
                <option value="Tasarım & Ürün" className="bg-neutral-900 text-text-primary">Tasarım & Ürün</option>
                <option value="Kültür & Sanat" className="bg-neutral-900 text-text-primary">Kültür & Sanat</option>
                <option value="Diğer" className="bg-neutral-900 text-text-primary">Diğer</option>
              </select>
            </div>

            <button
              type="submit"
              className="md:col-span-2 bg-rose-600 hover:bg-rose-700 text-white font-bold h-[38px] rounded-xl transition-all shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Akışı Kaydet
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {parsedFeeds.length === 0 ? (
              // Dropzone Area
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                  dragActive
                    ? 'border-rose-500 bg-rose-500/5'
                    : 'border-white/10 hover:border-white/20 bg-black/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".opml,.xml"
                  className="hidden"
                />
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-3">
                  <Upload size={20} className="text-text-secondary" />
                </div>
                <p className="text-sm font-bold text-text-primary mb-1">OPML Dosyasını Sürükleyin veya Seçin</p>
                <p className="text-xs text-text-secondary max-w-sm leading-relaxed mb-4">
                  RSS okuyucunuzdan dışa aktardığınız .opml veya .xml abonelik dosyasını buraya yükleyerek toplu ekleme yapabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/5 transition-all"
                >
                  Dosya Seç
                </button>

                {errorMessage && (
                  <div className="mt-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3 py-2 rounded-xl">
                    <AlertCircle size={14} />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              // Preview & Customisation List
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-black/40 border border-white/5 p-4 rounded-2xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
                      <FileCode size={14} className="text-rose-400" />
                      Ayrıştırılan Kaynaklar Listesi
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      Bulunan {parsedFeeds.length} akış arasından eklemek istediklerinizi seçip kategorilerini güncelleyebilirsiniz.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={toggleSelectAll}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold rounded-lg transition-all"
                    >
                      {selectedUrls.size === parsedFeeds.length ? 'Tüm Seçimleri Kaldır' : 'Tümünü Seç'}
                    </button>
                    <button
                      onClick={() => { setParsedFeeds([]); setSelectedUrls(new Set()); }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 hover:text-rose-400 rounded-lg text-text-secondary transition-all"
                      title="Temizle"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Scroller for imported list */}
                <div className="max-h-60 overflow-y-auto border border-white/5 rounded-2xl divide-y divide-white/5 custom-scrollbar bg-black/10">
                  {parsedFeeds.map((feed, idx) => {
                    const isChecked = selectedUrls.has(feed.url);
                    return (
                      <div
                        key={idx}
                        className={`p-3 flex items-center gap-4 text-xs transition-colors ${
                          isChecked ? 'bg-white/[0.01]' : 'opacity-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSelectFeed(feed.url)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-rose-500 border-rose-500 text-white'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="font-bold text-text-primary truncate" title={feed.title}>
                            {feed.title}
                          </p>
                          <p className="font-mono text-[9px] text-text-secondary truncate" title={feed.url}>
                            {feed.url}
                          </p>
                        </div>

                        <div className="w-40 shrink-0">
                          <select
                            value={feed.category}
                            onChange={(e) => handleCategoryChangeForFeed(idx, e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-text-primary outline-none focus:border-rose-500/30 transition-all font-sans font-semibold"
                          >
                            <option value="Teknoloji">Teknoloji</option>
                            <option value="Bilim">Bilim</option>
                            <option value="Finans">Finans</option>
                            <option value="Haber">Haber</option>
                            <option value="Tasarım & Ürün">Tasarım & Ürün</option>
                            <option value="Kültür & Sanat">Kültür & Sanat</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <p className="text-[11px] text-text-secondary">
                    <span className="font-bold text-rose-400">{selectedUrls.size}</span> akış içe aktarılmaya hazır.
                  </p>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => { setParsedFeeds([]); setSelectedUrls(new Set()); }}
                      className="px-4 py-2 border border-white/5 hover:bg-white/5 text-text-secondary hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      İptal Et
                    </button>

                    <button
                      onClick={triggerImport}
                      disabled={selectedUrls.size === 0 || importStatus === 'loading'}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/10 flex items-center gap-1.5 transition-all"
                    >
                      {importStatus === 'loading' ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Aktarılıyor...
                        </>
                      ) : importStatus === 'success' ? (
                        <>
                          <Check size={13} />
                          Tamamlandı!
                        </>
                      ) : importStatus === 'error' ? (
                        <>
                          <AlertCircle size={13} />
                          Hata Oluştu!
                        </>
                      ) : (
                        <>
                          <Check size={13} strokeWidth={2.5} />
                          Seçilenleri İçe Aktar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feeds List */}
      <div className="space-y-6 pb-6">
        {categories.map((cat) => {
          const catFeeds = processedFeeds.filter((f) => f.category === cat);
          if (catFeeds.length === 0) return null;

          return (
            <div key={cat} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Folder size={16} className="text-rose-500/80" />
                <h4 className="text-sm font-display font-black text-text-primary uppercase tracking-wider">{cat} Klasörü</h4>
                <span className="text-[10px] font-mono bg-white/5 text-text-secondary px-2 py-0.5 rounded-full font-bold">
                  {catFeeds.length} Kaynak
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    className={`bg-white/[0.02] border rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 hover:bg-white/[0.04] ${
                      feed.isActive !== false ? 'border-white/5' : 'border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 min-w-0">
                        <h5 className="font-sans font-bold text-xs text-text-primary truncate" title={feed.title}>
                          {feed.title}
                        </h5>
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[9px] text-text-secondary/60 hover:text-rose-400 flex items-center gap-1 truncate"
                        >
                          <ExternalLink size={8} />
                          {feed.url}
                        </a>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {feed.isDefault ? (
                          <span className="text-[8px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full tracking-wider">
                            SİSTEM
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full tracking-wider">
                            KİŞİSEL
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          {feed.isActive !== false && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              feed.isActive !== false ? 'bg-emerald-500' : 'bg-neutral-600'
                            }`}
                          ></span>
                        </span>
                        <span className="text-[10px] text-text-secondary font-bold">
                          {feed.isActive !== false ? 'Aktif Akış' : 'Devredışı'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleToggleFeedStatus(e, feed.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            feed.isActive !== false ? 'bg-rose-500' : 'bg-neutral-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              feed.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {!feed.isDefault && (
                          <button
                            onClick={(e) => handleDeleteFeed(e, feed.id)}
                            className="text-text-secondary/60 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Kaynağı Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
