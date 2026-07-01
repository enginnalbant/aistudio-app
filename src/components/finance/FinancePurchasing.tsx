import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  ShoppingCart,
  Link as LinkIcon,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  MoreVertical,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
  RefreshCw,
  Wallet,
  Globe,
  Code,
  Terminal,
  Check,
  Star,
  MessageSquare,
  BookOpen,
  Sparkles,
  Cpu,
  Layers,
  Trash2,
  Heart,
  Pencil
} from 'lucide-react';
import { scrapeProductDetails, ScrapedProduct } from '../../lib/purchaseScraper';

interface PurchaseItem {
  id: string;
  title: string;
  url: string;
  price: number;
  oldPrice?: number;
  description: string;
  category: string;
  status: 'Planlanıyor' | 'Para Biriktiriliyor' | 'Alınabilir' | 'Satın Alındı';
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Acil';
  savedAmount: number;
  imageUrl?: string;
  storeName?: string;
  // Extracted Scraper Metadata
  features?: string[];
  specs?: { key: string; value: string }[];
  rating?: number;
  reviewsCount?: number;
  reviews?: { author: string; rating: number; comment: string; date: string }[];
}

const MOCK_PURCHASES: PurchaseItem[] = [
  {
    id: "demo-1",
    title: "Apple iPhone 16 Pro 256GB Naturel Titanyum",
    url: "https://www.apple.com/tr/shop/buy-iphone/iphone-16-pro",
    price: 82999,
    oldPrice: 85999,
    description: "Sınıfının en iyisi kamera sistemi, olağanüstü güçlü A18 Pro çip, göz alıcı titanyum tasarım.",
    category: "Elektronik",
    status: "Para Biriktiriliyor",
    priority: "Yüksek",
    savedAmount: 35000,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60",
    storeName: "Apple Store",
    features: [
      "Havacılık ve uzay endüstrisi standartlarında titanyum kasa",
      "Kamerayı anında kontrol eden yenilikçi tuş",
      "Gelişmiş A18 Pro Çip ve yapay zeka özellikleri",
      "Profesyonel düzeyde 48 MP üçlü kamera sistemi",
      "Super Retina XDR ekran ile ProMotion teknolojisi"
    ],
    specs: [
      { key: "Ekran Boyutu", value: "6.3 inç" },
      { key: "Dahili Hafıza", value: "256 GB" },
      { key: "İşlemci", value: "Apple A18 Pro" },
      { key: "Kamera", value: "48 MP + 48 MP + 12 MP" },
      { key: "İşletim Sistemi", value: "iOS 18" }
    ],
    rating: 4.8,
    reviewsCount: 1420,
    reviews: [
      { author: "Kemal Y.", rating: 5, comment: "Kamerası tek kelimeyle kusursuz. Titanyum rengi çok asil duruyor.", date: "12.05.2026" },
      { author: "Selin G.", rating: 4, comment: "Harika bir cihaz ancak pil ömrü önceki nesilden çok farklı hissettirmedi.", date: "18.05.2026" },
      { author: "Arda Ö.", rating: 5, comment: "Mükemmel hız, inanılmaz malzeme kalitesi. Tavsiye ederim.", date: "22.05.2026" }
    ]
  },
  {
    id: "demo-2",
    title: "Kindle Paperwhite 16 GB (6.8 inç Ekran)",
    url: "https://www.amazon.com.tr/dp/B09TSI6AA3",
    price: 6250,
    oldPrice: 6250,
    description: "Göz yormayan e-mürekkep ekran, haftalarca süren pil ömrü ve tamamen su geçirmez gövde.",
    category: "Kitap / Hobi",
    status: "Alınabilir",
    priority: "Orta",
    savedAmount: 6250,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60",
    storeName: "Amazon TR",
    features: [
      "Yansımasız gerçek kağıt hissi veren 300 ppi e-ink ekran",
      "Sıcaklığı ayarlanabilir ekran ışığı (Sarı/Beyaz tonlar)",
      "IPX8 sertifikası ile havuzda veya banyoda güvenli okuma",
      "Tek bir şarj ile 10 haftaya kadar süren pil ömrü"
    ],
    specs: [
      { key: "Ekran Boyutu", value: "6.8 inç" },
      { key: "Dahili Bellek", value: "16 GB" },
      { key: "Su Geçirmezlik", value: "IPX8 (2 metreye kadar)" },
      { key: "Ağırlık", value: "205 gram" }
    ],
    rating: 4.7,
    reviewsCount: 890,
    reviews: [
      { author: "Deniz K.", rating: 5, comment: "Gözü hiç yormuyor, gerçekten kitap okuyor gibisiniz. Bataryası bitmek bilmiyor.", date: "02.06.2026" },
      { author: "Merve Ç.", rating: 5, comment: "E-kitap okuyucu alacaksanız tek adres kesinlikle Kindle Paperwhite.", date: "14.06.2026" }
    ]
  }
];

export const FinancePurchasing = () => {
  const [purchases, setPurchases] = useLocalStorage<PurchaseItem[]>('finance_purchases', MOCK_PURCHASES);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Hepsi');
  const [selectedPriority, setSelectedPriority] = useState<string>('Hepsi');
  
  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardTab, setWizardTab] = useState<'manual' | 'crawler'>('crawler');
  const [crawlMethod, setCrawlMethod] = useState<'url' | 'code'>('url');
  
  // Crawler Form State
  const [crawlUrl, setCrawlUrl] = useState('');
  const [pastedHtml, setPastedHtml] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([]);
  const [scrapedPreview, setScrapedPreview] = useState<ScrapedProduct | null>(null);
  const [previewTab, setPreviewTab] = useState<'general' | 'specs' | 'reviews' | 'features'>('general');

  // Manual Form State
  const [formData, setFormData] = useState<Partial<PurchaseItem>>({
    title: '',
    url: '',
    price: 0,
    description: '',
    category: 'Elektronik',
    status: 'Planlanıyor',
    priority: 'Orta',
    savedAmount: 0,
    storeName: '',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
  });

  // Details Modal States
  const [selectedProduct, setSelectedProduct] = useState<PurchaseItem | null>(null);
  const [detailsTab, setDetailsTab] = useState<'general' | 'specs' | 'reviews' | 'features'>('general');
  const [summaryModal, setSummaryModal] = useState<{title: string; value: string; type: string} | null>(null);
  const [quickBudgetProduct, setQuickBudgetProduct] = useState<PurchaseItem | null>(null);
  const [quickBudgetAmount, setQuickBudgetAmount] = useState<string>('');

  // Custom Dialog & Notification States
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; message: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Live updated product for details modal
  const activeProduct = useMemo(() => {
    if (!selectedProduct) return null;
    return purchases.find(p => p.id === selectedProduct.id) || selectedProduct;
  }, [selectedProduct, purchases]);

  // Dynamic Console Streaming Effect
  const streamLogs = (logsArray: string[], onComplete: () => void) => {
    setCrawlerLogs([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < logsArray.length) {
        setCrawlerLogs(prev => [...prev, logsArray[i]]);
        i++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 450);
  };

  // Run the Scraper Engine
  const handleRunCrawler = async () => {
    const targetUrl = crawlMethod === 'url' ? crawlUrl : '';
    const targetHtml = crawlMethod === 'code' ? pastedHtml : undefined;

    if (crawlMethod === 'url' && !crawlUrl) return;
    if (crawlMethod === 'code' && !pastedHtml) return;

    setIsCrawling(true);
    setScrapedPreview(null);
    setCrawlerLogs([`[SİSTEM] Tarama motoru başlatılıyor...`]);

    const result = await scrapeProductDetails(targetUrl, targetHtml);

    // Stream the logs into the UI console beautifully
    streamLogs(result.logs, () => {
      setIsCrawling(false);
      if (result.success && result.data) {
        setScrapedPreview(result.data);
        // Pre-fill manual form with extracted data as well
        setFormData({
          title: result.data.title,
          price: result.data.price,
          url: targetUrl || 'https://www.google.com',
          description: result.data.description,
          storeName: result.data.storeName,
          imageUrl: result.data.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
          category: formData.category || 'Elektronik',
          status: 'Planlanıyor',
          priority: formData.priority || 'Orta',
          savedAmount: 0,
          features: result.data.features,
          specs: result.data.specs,
          rating: result.data.rating,
          reviewsCount: result.data.reviewsCount,
          reviews: result.data.reviews
        });
      } else {
        setCrawlerLogs(prev => [...prev, `[HATA] Ayıklama tamamlanamadı: ${result.error || "Bilinmeyen Hata"}`]);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'savedAmount' ? Number(value) : value 
    }));
  };

  // Quick select suggest URLs to let user demo easily
  const handleQuickUrlFill = (url: string) => {
    setCrawlUrl(url);
  };

  // Calculations
  const activePurchases = useMemo(() => purchases.filter(p => p.status !== 'Satın Alındı'), [purchases]);
  const totalPlannedCost = activePurchases.reduce((acc, curr) => acc + curr.price, 0);
  const totalSaved = activePurchases.reduce((acc, curr) => acc + curr.savedAmount, 0);
  const totalBought = purchases.filter(p => p.status === 'Satın Alındı').reduce((acc, curr) => acc + curr.price, 0);
  const readyToBuyCount = activePurchases.filter(p => p.status === 'Alınabilir' || p.savedAmount >= p.price).length;
  const progressPercent = totalPlannedCost > 0 ? (totalSaved / totalPlannedCost) * 100 : 0;

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const matchSearch = (p.title || '').toLowerCase().includes((search || '').toLowerCase()) || 
                          (p.category || '').toLowerCase().includes((search || '').toLowerCase()) ||
                          (p.storeName && p.storeName.toLowerCase().includes((search || '').toLowerCase()));
      const matchCategory = selectedCategory === 'Hepsi' || p.category === selectedCategory;
      const matchPriority = selectedPriority === 'Hepsi' || p.priority === selectedPriority;
      return matchSearch && matchCategory && matchPriority;
    });
  }, [purchases, search, selectedCategory, selectedPriority]);

  const categories = ['Hepsi', 'Elektronik', 'Mobilya', 'Giyim', 'Ev Aletleri', 'Otomotiv', 'Kitap / Hobi', 'Diğer'];

  // Delete product
  const handleDeleteProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = purchases.find(p => p.id === id);
    setDeleteConfirm({
      id,
      title: 'Planı Sil',
      message: `"${item?.title || 'Bu ürünü'}" satınalma planından silmek istediğinize emin misiniz?`
    });
  };

  const executeDeleteProduct = () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setPurchases(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
    setDeleteConfirm(null);
    setToast({ message: 'Satınalma planı başarıyla silindi.', type: 'success' });
  };

  // Allocate budget to product
  const handleAllocateBudget = (id: string, amount: number) => {
    setPurchases(prev => prev.map(p => {
      if (p.id === id) {
        const newSaved = Math.max(0, Math.min(p.price, p.savedAmount + amount));
        let newStatus = p.status;
        if (newSaved >= p.price) {
          if (p.status === 'Planlanıyor' || p.status === 'Para Biriktiriliyor') {
            newStatus = 'Alınabilir';
          }
        } else if (newSaved > 0) {
          if (p.status === 'Planlanıyor' || p.status === 'Alınabilir') {
            newStatus = 'Para Biriktiriliyor';
          }
        } else {
          if (p.status === 'Para Biriktiriliyor' || p.status === 'Alınabilir') {
            newStatus = 'Planlanıyor';
          }
        }
        return {
          ...p,
          savedAmount: newSaved,
          status: newStatus
        };
      }
      return p;
    }));
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
            <ShoppingBag className="text-focus-neon" size={28} />
            Satınalma & İstek Listesi Planlayıcı
          </h1>
          <p className="text-text-secondary">Yapay Zeka web tarayıcısı ile ürünleri anında ekleyin, bütçe ve özellik takibini otomatikleştirin.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setSummaryModal({
            title: 'Toplam Planlanan', 
            value: `₺${totalPlannedCost.toLocaleString('tr-TR')}`, 
            type: 'total-planned'
          })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-focus-neon/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-focus-neon/10 rounded-lg text-focus-neon group-hover:scale-110 transition-transform">
              <ShoppingCart size={20} />
            </div>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Planlanan Maliyet</h3>
          <p className="text-2xl font-mono font-bold text-text-primary">
            ₺{totalPlannedCost.toLocaleString('tr-TR')}
          </p>
          <p className="text-[10px] text-text-secondary mt-2">
            Aktif {activePurchases.length} ürün için
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-ai-bright/10 rounded-lg text-ai-bright">
              <Wallet size={20} />
            </div>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Hazır Bütçe (Biriken)</h3>
          <p className="text-2xl font-mono font-bold text-text-primary">
            ₺{totalSaved.toLocaleString('tr-TR')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-ai-bright rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="text-[10px] text-text-secondary">%{(progressPercent || 0).toFixed(0)}</span>
          </div>
        </div>

        <div 
          onClick={() => setSummaryModal({
            title: 'Alınabilir Ürünler', 
            value: `${readyToBuyCount}`, 
            type: 'ready-buy'
          })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-nrg-sun/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-nrg-sun/10 rounded-lg text-nrg-sun group-hover:scale-110 transition-transform">
              <Target size={20} />
            </div>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Alınabilir Durumda</h3>
          <p className="text-2xl font-mono font-bold text-text-primary">
            {readyToBuyCount} <span className="text-sm text-text-secondary font-sans font-normal">adet</span>
          </p>
          <p className="text-[10px] text-text-secondary mt-2">
            Bütçesi tamamlanmış ürünler
          </p>
        </div>

        <div 
          onClick={() => setSummaryModal({
            title: 'Toplam Alışveriş', 
            value: `₺${totalBought.toLocaleString('tr-TR')}`, 
            type: 'total-bought'
          })}
          className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:border-purple-400/30 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Satın Alınanlar</h3>
          <p className="text-2xl font-mono font-bold text-text-primary">
            ₺{totalBought.toLocaleString('tr-TR')}
          </p>
          <p className="text-[10px] text-text-secondary mt-2">
            Geçmiş alışveriş toplamı
          </p>
        </div>
      </div>

      {/* Main List & Filters */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">Planlama Kartları</h2>
            <p className="text-xs text-text-secondary mt-1">Kartlara tıklayarak teknik detayları, puanlamaları ve taranan kullanıcı yorumlarını inceleyebilirsiniz.</p>
          </div>
          <button 
            onClick={() => {
              setScrapedPreview(null);
              setCrawlerLogs([]);
              setCrawlUrl('');
              setPastedHtml('');
              setFormData({
                title: '',
                url: '',
                price: 0,
                description: '',
                category: 'Elektronik',
                status: 'Planlanıyor',
                priority: 'Orta',
                savedAmount: 0,
                storeName: '',
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
              });
              setIsWizardOpen(true);
            }}
            className="flex items-center gap-2 bg-focus-neon text-black px-5 py-3 rounded-xl font-bold text-sm hover:bg-focus-neon/90 shadow-[0_0_15px_rgba(235,255,0,0.2)] hover:shadow-[0_0_20px_rgba(235,255,0,0.4)] transition-all"
          >
            <Plus size={18} />
            Yapay Zeka Sihirbazı ile Ekle
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text"
              placeholder="Ürün adı, mağaza veya kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-xl px-3 py-1.5">
              <span className="text-xs text-text-secondary font-bold">Kategori:</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-white border-none focus:outline-none cursor-pointer font-bold"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-xl px-3 py-1.5">
              <span className="text-xs text-text-secondary font-bold">Öncelik:</span>
              <select 
                value={selectedPriority} 
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-xs text-white border-none focus:outline-none cursor-pointer font-bold"
              >
                <option value="Hepsi">Tüm Seviyeler</option>
                <option value="Acil">Acil</option>
                <option value="Yüksek">Yüksek</option>
                <option value="Orta">Orta</option>
                <option value="Düşük">Düşük</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Grid Layout of Purchase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPurchases.map((item) => {
            const perc = item.price > 0 ? (item.savedAmount / item.price) * 100 : 0;
            const priceDiff = item.oldPrice ? item.price - item.oldPrice : 0;
            
            return (
              <div 
                key={item.id} 
                onClick={() => {
                  setSelectedProduct(item);
                  setDetailsTab('general');
                }}
                className="bg-black/30 border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all group relative flex flex-col h-full cursor-pointer hover:bg-white/[0.02] transform hover:-translate-y-0.5 shadow-lg"
              >
                {/* Trash delete & link buttons */}
                <div className="absolute top-4 right-4 flex gap-1 z-10" onClick={e => e.stopPropagation()}>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-1.5 bg-white/5 text-text-secondary hover:text-focus-neon rounded-lg transition-colors" 
                    title="Mağazaya Git"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button 
                    onClick={() => {
                      setFormData(item);
                      setWizardTab('manual');
                      setIsWizardOpen(true);
                    }}
                    className="p-1.5 bg-white/5 text-text-secondary hover:text-focus-neon hover:bg-focus-neon/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Planı Düzenle"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProduct(item.id, e)}
                    className="p-1.5 bg-white/5 text-text-secondary hover:text-crit-vivid hover:bg-crit-vivid/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Planı Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {/* Image & Header */}
                <div className="flex gap-4 items-start mb-4 pr-12">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-16 h-16 rounded-xl object-cover border border-white/10" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.status === 'Planlanıyor' ? 'bg-white/10 text-white' :
                        item.status === 'Para Biriktiriliyor' ? 'bg-ai-bright/10 text-ai-bright' :
                        item.status === 'Alınabilir' ? 'bg-nrg-sun/10 text-nrg-sun' :
                        'bg-focus-neon/10 text-focus-neon'
                      }`}>
                        {item.status}
                      </span>
                      {item.priority === 'Acil' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-crit-vivid/10 text-crit-vivid">
                          Acil
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-text-primary line-clamp-1 group-hover:text-focus-neon transition-colors">{item.title}</h3>
                    <p className="text-xs text-text-secondary truncate">{item.storeName ? `${item.storeName} • ` : ''}{item.category}</p>
                  </div>
                </div>
                
                <div className="flex-1 mb-4">
                  <p className="text-xs text-text-secondary line-clamp-2">{item.description}</p>
                  
                  {/* Features Quick Badge Preview */}
                  {item.features && item.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.features.slice(0, 2).map((feat, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-text-secondary truncate max-w-[120px]">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rating indicator */}
                  {item.rating && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <div className="flex items-center text-yellow-400">
                        <Star size={11} fill="currentColor" />
                        <span className="text-[11px] font-bold ml-0.5 text-white">{item.rating}</span>
                      </div>
                      <span className="text-[10px] text-text-secondary">({item.reviewsCount || 0} Değerlendirme)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-auto">
                  <div className="flex justify-between items-center bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">FİYAT</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-bold text-text-primary text-base">₺{item.price.toLocaleString('tr-TR')}</span>
                        {item.oldPrice && item.oldPrice !== item.price && (
                          <span className={`flex items-center text-[10px] font-bold ${priceDiff > 0 ? 'text-crit-vivid' : 'text-focus-neon'}`}>
                            {priceDiff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            %{(Math.abs(priceDiff) / item.oldPrice * 100).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.specs && item.specs.length > 0 && (
                      <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-text-secondary font-mono">
                        {item.specs.length} Teknik Özellik
                      </span>
                    )}
                  </div>

                  {item.status !== 'Satın Alındı' && (
                    <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-text-secondary">Bütçe (%{perc.toFixed(0)})</span>
                        <span className="font-mono font-bold text-white">₺{item.savedAmount.toLocaleString('tr-TR')} / ₺{item.price.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${perc >= 100 ? 'bg-nrg-sun shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-ai-bright'}`} 
                            style={{ width: `${Math.min(perc, 100)}%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => {
                            setQuickBudgetProduct(item);
                            setQuickBudgetAmount('');
                          }}
                          className="p-1 bg-white/5 text-text-secondary hover:text-focus-neon rounded-md transition-colors shrink-0 animate-pulse"
                          title="Hızlı Bütçe Ayır"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredPurchases.length === 0 && (
            <div className="col-span-full text-center py-12 text-text-secondary border border-dashed border-white/10 rounded-2xl bg-black/10">
              <p className="text-sm">Kriterlere uygun satınalma planı bulunamadı.</p>
              <p className="text-xs text-text-secondary mt-1">Yeni bir ürün planlamak için "Yapay Zeka Sihirbazı ile Ekle" butonuna basın.</p>
            </div>
          )}
        </div>
      </div>

      {/* COMPREHENSIVE AI EXTRACTION WIZARD MODAL */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-focus-neon/10 rounded-xl text-focus-neon">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-text-primary">Yeni Satınalma Planlama Sihirbazı</h2>
                    <p className="text-xs text-text-secondary">Akıllı sayfa kazıma ve HTML tahlil motoru entegreli</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-text-secondary hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Wizard Tabs: AI Scraper vs Manual Entry */}
              <div className="flex border-b border-white/5 bg-black/20">
                <button
                  onClick={() => setWizardTab('crawler')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                    wizardTab === 'crawler' 
                      ? 'border-focus-neon text-focus-neon bg-white/[0.02]' 
                      : 'border-transparent text-text-secondary hover:text-white'
                  }`}
                >
                  <Cpu size={14} /> Akıllı Web Kazıyıcı (Otomatik)
                </button>
                <button
                  onClick={() => setWizardTab('manual')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                    wizardTab === 'manual' 
                      ? 'border-focus-neon text-focus-neon bg-white/[0.02]' 
                      : 'border-transparent text-text-secondary hover:text-white'
                  }`}
                >
                  <Code size={14} /> Manuel / Detaylı Form
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-6">
                
                {/* 1. SCRAIPING TAB PANEL */}
                {wizardTab === 'crawler' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Crawler Settings & Input */}
                    <div className="lg:col-span-6 space-y-4">
                      {/* Sub tab of Crawler Method */}
                      <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                        <button
                          type="button"
                          onClick={() => setCrawlMethod('url')}
                          className={`flex-1 py-1.5 text-xs rounded-lg font-bold transition-all ${
                            crawlMethod === 'url' ? 'bg-focus-neon text-black' : 'text-text-secondary hover:text-white'
                          }`}
                        >
                          Mağaza URL Bağlantısı
                        </button>
                        <button
                          type="button"
                          onClick={() => setCrawlMethod('code')}
                          className={`flex-1 py-1.5 text-xs rounded-lg font-bold transition-all ${
                            crawlMethod === 'code' ? 'bg-focus-neon text-black' : 'text-text-secondary hover:text-white'
                          }`}
                        >
                          HTML Kodu Tarama (Öğeyi Denetle)
                        </button>
                      </div>

                      {crawlMethod === 'url' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-focus-neon/5 border border-focus-neon/10 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center">
                                <Globe size={20} className="text-focus-neon" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white tracking-tight">Bağlantı Motoru Durumu</p>
                                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                                  {isCrawling ? 'VERİ TRANSFERİ AKTİF' : 'BAĞLANTI BEKLENİYOR'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`size-2 rounded-full animate-pulse ${isCrawling ? 'bg-focus-neon' : 'bg-zinc-600'}`} />
                              <span className="text-[10px] font-mono text-zinc-400">v2.4 Engine</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-widest">Ürün Web Sayfası Linki</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                                <input 
                                  type="url" 
                                  placeholder="Trendyol, Amazon, Apple vb. ürün linkini yapıştırın"
                                  value={crawlUrl}
                                  onChange={(e) => setCrawlUrl(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono"
                                />
                              </div>
                              <button 
                                onClick={handleRunCrawler}
                                disabled={!crawlUrl || isCrawling}
                                className="px-6 py-2.5 bg-focus-neon text-black rounded-xl text-sm font-bold hover:bg-focus-neon/90 transition-all disabled:opacity-40 flex items-center gap-2 whitespace-nowrap font-display shadow-lg shadow-focus-neon/20 active:scale-95"
                              >
                                {isCrawling ? (
                                  <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                  <Sparkles size={16} />
                                )}
                                APEXOS Motoru ile Bağlan
                              </button>
                            </div>
                          </div>

                          {/* Quick URL Suggestions */}
                          <div>
                            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1.5">Hızlı Deneme Şablonları</p>
                            <div className="flex flex-wrap gap-1.5">
                              <button 
                                type="button"
                                onClick={() => handleQuickUrlFill("https://www.apple.com/tr/shop/buy-iphone/iphone-16-pro")}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-md text-[10px] transition-colors"
                              >
                                iPhone 16 Pro
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleQuickUrlFill("https://www.amazon.com.tr/Kindle-Paperwhite-Ayarlanabilir-Suya-Dayan%C4%B1kl%C4%B1/dp/B09TSI6AA3")}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-md text-[10px] transition-colors"
                              >
                                Kindle Paperwhite
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleQuickUrlFill("https://www.trendyol.com/xiaomi/robot-vacuum-x20-robot-supurge-p-792823023")}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-md text-[10px] transition-colors"
                              >
                                Xiaomi Robot Süpürge
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase">HTML Kaynak Kodu (Raw Source Code)</label>
                            <textarea 
                              rows={5}
                              placeholder="Tarayıcıda 'Öğeyi Denetle' yaparak kopyaladığınız ürün sayfasının HTML kodunu buraya yapıştırın. Kazıyıcı tüm detayları çıkaracaktır."
                              value={pastedHtml}
                              onChange={(e) => setPastedHtml(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 font-mono resize-none custom-scrollbar"
                            ></textarea>
                          </div>
                          <button 
                            onClick={handleRunCrawler}
                            disabled={!pastedHtml || isCrawling}
                            className="w-full py-3 bg-focus-neon text-black rounded-xl text-xs font-bold hover:bg-focus-neon/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 font-display shadow-lg shadow-focus-neon/20 active:scale-95"
                          >
                            {isCrawling ? <RefreshCw size={16} className="animate-spin" /> : <Code size={16} />}
                            APEXOS HTML Analiz Motorunu Başlat
                          </button>
                        </div>
                      )}

                      {/* Crawler Log Terminal */}
                      <div className="bg-black/80 rounded-xl border border-white/10 p-3 flex flex-col h-[200px]">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                          <span className="text-[10px] font-mono font-bold text-focus-neon flex items-center gap-1.5">
                            <Terminal size={11} /> SCRAPER_ENGINE_SHELL
                          </span>
                          <span className="text-[9px] font-mono text-text-secondary">ACTIVE_LOGS</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] text-zinc-400 space-y-1 select-text">
                          {crawlerLogs.map((log, idx) => (
                            <div key={idx} className={
                              (log || '').includes('[HATA]') ? 'text-crit-vivid font-bold' :
                              (log || '').includes('[SİSTEM]') ? 'text-focus-neon' :
                              (log || '').includes('[GEMINI_AI]') ? 'text-ai-bright font-bold' : 'text-zinc-400'
                            }>
                              {log}
                            </div>
                          ))}
                          {crawlerLogs.length === 0 && (
                            <div className="text-zinc-600 italic">Kazıma işlemini başlattığınızda terminal logları burada akacaktır.</div>
                          )}
                          {isCrawling && (
                            <div className="text-focus-neon animate-pulse">▋ Tarayıcı analiz ediyor...</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sifted Preview Area (Live Pre-rendering) */}
                    <div className="lg:col-span-6 border border-white/10 rounded-xl bg-black/20 p-4 flex flex-col justify-between min-h-[380px]">
                      {scrapedPreview ? (
                        <div className="flex flex-col h-full justify-between">
                          <div className="space-y-4">
                            {/* Product Header */}
                            <div className="flex gap-4 items-start pb-4 border-b border-white/5">
                              <img 
                                src={scrapedPreview.imageUrl} 
                                alt={scrapedPreview.title} 
                                className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <span className="bg-focus-neon/10 text-focus-neon text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider">
                                  {scrapedPreview.storeName}
                                </span>
                                <h3 className="text-sm font-bold text-text-primary mt-1 line-clamp-2">{scrapedPreview.title}</h3>
                                <div className="text-lg font-mono font-bold text-focus-neon mt-1">
                                  ₺{scrapedPreview.price.toLocaleString('tr-TR')}
                                </div>
                              </div>
                            </div>

                            {/* Mini tabs of preview data */}
                            <div className="flex gap-1 border-b border-white/5 pb-1">
                              {['general', 'specs', 'reviews', 'features'].map((tab) => (
                                <button
                                  key={tab}
                                  type="button"
                                  onClick={() => setPreviewTab(tab as any)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                                    previewTab === tab 
                                      ? 'bg-focus-neon/10 text-focus-neon border border-focus-neon/20' 
                                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  {tab === 'general' ? 'Genel' :
                                   tab === 'specs' ? 'Özellik Tablosu' :
                                   tab === 'reviews' ? 'Yorumlar' : 'Öne Çıkanlar'}
                                </button>
                              ))}
                            </div>

                            {/* Tab contents */}
                            <div className="text-xs text-text-secondary min-h-[160px] max-h-[220px] overflow-y-auto custom-scrollbar">
                              
                              {previewTab === 'general' && (
                                <div className="space-y-3">
                                  <p className="leading-relaxed italic">{scrapedPreview.description}</p>
                                  {scrapedPreview.rating && (
                                    <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                                      <div>
                                        <p className="text-[10px] text-text-secondary uppercase font-bold">Müşteri Memnuniyeti</p>
                                        <p className="text-white text-base font-bold flex items-center gap-1.5 mt-0.5">
                                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                          {scrapedPreview.rating} / 5
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] text-text-secondary uppercase font-bold">Yorum Sayısı</p>
                                        <p className="text-white text-sm font-mono mt-0.5">{scrapedPreview.reviewsCount?.toLocaleString('tr-TR')} Değerlendirme</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {previewTab === 'specs' && (
                                <div className="space-y-1.5">
                                  {scrapedPreview.specs && scrapedPreview.specs.length > 0 ? (
                                    scrapedPreview.specs.map((spec, idx) => (
                                      <div key={idx} className="flex justify-between items-center py-1 border-b border-white/5">
                                        <span className="text-text-secondary text-[11px] font-bold">{spec.key}</span>
                                        <span className="text-text-primary text-[11px] font-mono text-right truncate max-w-[180px]">{spec.value}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-zinc-500 italic py-4 text-center">Teknik özellik tablosu bulunamadı.</p>
                                  )}
                                </div>
                              )}

                              {previewTab === 'features' && (
                                <div className="space-y-2">
                                  {scrapedPreview.features && scrapedPreview.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                      <CheckCircle2 size={13} className="text-focus-neon mt-0.5 shrink-0" />
                                      <span className="text-[11px] text-white font-medium">{feat}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {previewTab === 'reviews' && (
                                <div className="space-y-3">
                                  {scrapedPreview.reviews && scrapedPreview.reviews.map((rev, idx) => (
                                    <div key={idx} className="bg-black/40 border border-white/5 p-2.5 rounded-lg space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-white font-bold">{rev.author}</span>
                                        <span className="text-[9px] text-text-secondary font-mono">{rev.date}</span>
                                      </div>
                                      <div className="flex text-yellow-400 gap-0.5 mb-1">
                                        {Array.from({ length: 5 }).map((_, s) => (
                                          <Star key={s} size={10} fill={s < rev.rating ? 'currentColor' : 'none'} className={s < rev.rating ? 'text-yellow-400' : 'text-zinc-600'} />
                                        ))}
                                      </div>
                                      <p className="text-[10px] text-zinc-300 leading-relaxed italic">"{rev.comment}"</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                            </div>
                          </div>

                          {/* Quick Save Apply button */}
                          <div className="pt-4 border-t border-white/5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setWizardTab('manual')}
                              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Detayları Düzenle (Forma Git)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (scrapedPreview.title) {
                                  setPurchases(prev => [{
                                    ...formData,
                                    id: Date.now().toString(),
                                    title: scrapedPreview.title,
                                    price: scrapedPreview.price,
                                    oldPrice: scrapedPreview.price,
                                    description: scrapedPreview.description,
                                    storeName: scrapedPreview.storeName,
                                    imageUrl: scrapedPreview.imageUrl,
                                    features: scrapedPreview.features,
                                    specs: scrapedPreview.specs,
                                    rating: scrapedPreview.rating,
                                    reviewsCount: scrapedPreview.reviewsCount,
                                    reviews: scrapedPreview.reviews,
                                    status: 'Planlanıyor',
                                    priority: formData.priority || 'Orta',
                                    category: formData.category || 'Elektronik',
                                    savedAmount: formData.savedAmount || 0,
                                    url: crawlUrl || 'https://www.google.com'
                                  } as PurchaseItem, ...prev]);
                                  setIsWizardOpen(false);
                                }
                              }}
                              className="flex-1 py-2.5 bg-focus-neon text-black rounded-xl text-xs font-bold hover:bg-focus-neon/90 transition-all font-display text-center shadow-[0_0_10px_rgba(235,255,0,0.15)]"
                            >
                              Süper Planı Direkt Kaydet
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-12 flex-1 space-y-3">
                          <Cpu className="text-zinc-600 animate-pulse" size={40} />
                          <div>
                            <p className="text-xs text-white font-bold">Kazıma Verisi Bulunmadı</p>
                            <p className="text-[10px] text-text-secondary max-w-xs mt-1">Yandaki URL bağlantısını veya HTML kaynak kodunu doldurup tarat tuşuna basarak anında ürün bilgilerini indirin.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 2. MANUAL DETAILED FORM TAB PANEL */}
                {wizardTab === 'manual' && (
                  <div className="space-y-4">
                    <div className="bg-focus-neon/5 border border-focus-neon/10 rounded-xl p-3.5 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-focus-neon" />
                        <span className="text-xs text-text-secondary font-medium">Kazıyıcıdan aktarılan verileri elle zenginleştirebilirsiniz.</span>
                      </div>
                      {scrapedPreview && (
                        <span className="text-[10px] bg-focus-neon/20 text-focus-neon px-2 py-0.5 rounded font-mono font-bold">AI_SYNCED</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Ürün Adı</label>
                        <input 
                          type="text" 
                          name="title"
                          placeholder="Örn: iPhone 16 Pro Max 256GB"
                          value={formData.title || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Fiyat (₺)</label>
                        <input 
                          type="number" 
                          name="price"
                          placeholder="0.00"
                          value={formData.price || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Biriken Bütçe (₺)</label>
                        <input 
                          type="number" 
                          name="savedAmount"
                          placeholder="0.00"
                          value={formData.savedAmount || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Kategori</label>
                        <select 
                          name="category"
                          value={formData.category || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors text-xs"
                        >
                          <option value="Elektronik">Elektronik</option>
                          <option value="Mobilya">Mobilya</option>
                          <option value="Giyim">Giyim</option>
                          <option value="Ev Aletleri">Ev Aletleri</option>
                          <option value="Otomotiv">Otomotiv</option>
                          <option value="Kitap / Hobi">Kitap / Hobi</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Öncelik Seviyesi</label>
                        <select 
                          name="priority"
                          value={formData.priority || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-focus-neon/50 transition-colors text-xs"
                        >
                          <option value="Düşük">Düşük</option>
                          <option value="Orta">Orta</option>
                          <option value="Yüksek">Yüksek</option>
                          <option value="Acil">Acil</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Mağaza / Satıcı</label>
                        <input 
                          type="text" 
                          name="storeName"
                          placeholder="Örn: Amazon TR"
                          value={formData.storeName || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Açıklama / Detay</label>
                        <textarea 
                          name="description"
                          rows={3}
                          placeholder="Ürün açıklaması veya ek detaylar..."
                          value={formData.description || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors resize-none text-xs"
                        ></textarea>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Ürün Görsel URL'si</label>
                        <input 
                          type="text" 
                          name="imageUrl"
                          placeholder="Resim URL adresi"
                          value={formData.imageUrl || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Mağaza Linki</label>
                        <input 
                          type="text" 
                          name="url"
                          placeholder="https://..."
                          value={formData.url || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Wizard Action Footer */}
              <div className="p-5 border-t border-white/10 bg-white/[0.01] flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  Kapat
                </button>
                <button 
                  onClick={() => {
                    if (formData.title && formData.price) {
                      setPurchases(prev => {
                        const exists = prev.some(p => p.id === formData.id);
                        if (exists) {
                          return prev.map(p => p.id === formData.id ? { ...p, ...formData } as PurchaseItem : p);
                        } else {
                          return [{ 
                            ...formData, 
                            id: Date.now().toString(),
                            savedAmount: formData.savedAmount || 0,
                            oldPrice: formData.price // initialize old price same as price
                          } as PurchaseItem, ...prev];
                        }
                      });
                      setIsWizardOpen(false);
                    } else {
                      setToast({ message: "Lütfen en azından Ürün Adı ve Fiyat alanlarını doldurun.", type: 'error' });
                    }
                  }}
                  className="px-6 py-2.5 bg-focus-neon text-black rounded-xl text-xs font-bold hover:bg-focus-neon/90 transition-colors"
                >
                  {formData.id ? 'Planı Güncelle' : 'Planı Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE PRODUCT DETAILED SHEET VIEW MODAL */}
      <AnimatePresence>
        {selectedProduct && activeProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-focus-neon/10 rounded-xl text-focus-neon">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-text-primary">Detaylı Ürün Raporu & Teknik Analiz</h2>
                    <p className="text-xs text-text-secondary">Otomatik taranan tüm veri katmanları</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-text-secondary hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-6">
                
                {/* Hero Product Info */}
                <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-white/5">
                  <img 
                    src={activeProduct.imageUrl} 
                    alt={activeProduct.title} 
                    className="w-full md:w-40 h-40 rounded-2xl object-cover border border-white/10 shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
                    }}
                  />
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-focus-neon/15 text-focus-neon border border-focus-neon/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {activeProduct.storeName || "Mağaza"}
                      </span>
                      <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {activeProduct.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white leading-snug">{activeProduct.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{activeProduct.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase font-bold">GÜNCEL FİYAT</p>
                        <p className="text-xl font-mono font-bold text-focus-neon mt-0.5">₺{activeProduct.price.toLocaleString('tr-TR')}</p>
                      </div>
                      {activeProduct.rating && (
                        <div>
                          <p className="text-[10px] text-text-secondary uppercase font-bold">KULLANICI PUANI</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex text-yellow-400">
                              <Star size={13} fill="currentColor" />
                            </div>
                            <span className="text-white text-sm font-bold">{activeProduct.rating} / 5</span>
                            <span className="text-text-secondary text-xs">({activeProduct.reviewsCount || 0} yorum)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub Tab Controls */}
                <div className="flex gap-1.5 border-b border-white/5 pb-1">
                  {['general', 'specs', 'features', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailsTab(tab as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                        detailsTab === tab 
                          ? 'bg-focus-neon text-black font-extrabold' 
                          : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab === 'general' ? 'Genel & Bütçe' :
                       tab === 'specs' ? 'Teknik Özellikler' :
                       tab === 'features' ? 'Öne Çıkanlar' : 'Müşteri Yorumları'}
                    </button>
                  ))}
                </div>

                {/* Tab content area */}
                <div className="min-h-[200px]">
                  {detailsTab === 'general' && (
                    <div className="space-y-6">
                      {/* Budget Tracker Progress */}
                      <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs uppercase font-bold text-text-secondary tracking-wider flex items-center gap-2">
                          <Wallet size={14} className="text-ai-bright" /> BÜTÇE BİRİKTİRME PLANI & SÜREÇ
                        </h4>
                        
                        <div className="flex justify-between items-baseline">
                          <span className="text-text-secondary text-xs">Toplam Biriken Miktar:</span>
                          <span className="text-lg font-mono font-bold text-white">
                            ₺{activeProduct.savedAmount.toLocaleString('tr-TR')} / ₺{activeProduct.price.toLocaleString('tr-TR')}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-[2px] border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                activeProduct.savedAmount >= activeProduct.price 
                                  ? 'bg-nrg-sun shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                                  : 'bg-ai-bright shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                              }`}
                              style={{ width: `${Math.min((activeProduct.savedAmount / activeProduct.price) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-text-secondary">
                            <span>Yolun Başı</span>
                            <span className="font-bold text-white">%{( (activeProduct.savedAmount / activeProduct.price) * 100 ).toFixed(0)} Tamamlandı</span>
                            <span>Hedefe Ulaşıldı</span>
                          </div>
                        </div>

                        {/* Budget Status Advice */}
                        <div className="pt-2 flex items-center gap-3">
                          {activeProduct.savedAmount >= activeProduct.price ? (
                            <div className="flex items-center gap-2 text-nrg-sun bg-nrg-sun/10 px-3 py-2 rounded-lg text-xs font-bold w-full">
                              <CheckCircle2 size={16} /> Satınalma İçin Bütçe Hazır! Bu ürünü hemen satın alabilirsiniz.
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-ai-bright bg-ai-bright/10 px-3 py-2 rounded-lg text-xs font-bold w-full">
                              <AlertCircle size={16} /> Kalan Borç / Bütçe İhtiyacı: ₺{(activeProduct.price - activeProduct.savedAmount).toLocaleString('tr-TR')} daha biriktirilmesi gerekiyor.
                            </div>
                          )}
                        </div>

                        {/* Interactive Budget Allocator */}
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Hızlı Bütçe Aktarımı / Para Biriktir</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {[100, 500, 1000, 5000].map((val) => (
                              <button
                                key={val}
                                onClick={() => handleAllocateBudget(activeProduct.id, val)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-focus-neon/15 hover:text-focus-neon text-white text-xs font-bold rounded-lg border border-white/5 hover:border-focus-neon/30 transition-all font-mono"
                              >
                                +₺{val.toLocaleString('tr-TR')}
                              </button>
                            ))}
                            <button
                              onClick={() => handleAllocateBudget(activeProduct.id, activeProduct.price - activeProduct.savedAmount)}
                              disabled={activeProduct.savedAmount >= activeProduct.price}
                              className="px-3 py-1.5 bg-nrg-sun/15 hover:bg-nrg-sun text-nrg-sun hover:text-black text-xs font-bold rounded-lg border border-nrg-sun/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Bütçeyi Tamamla
                            </button>
                            <button
                              onClick={() => handleAllocateBudget(activeProduct.id, -activeProduct.savedAmount)}
                              disabled={activeProduct.savedAmount <= 0}
                              className="px-3 py-1.5 bg-white/5 hover:bg-crit-vivid/15 hover:text-crit-vivid text-text-secondary text-xs font-bold rounded-lg border border-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                            >
                              Sıfırla
                            </button>
                          </div>

                          {/* Custom manual add/subtract input */}
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary font-bold">₺</span>
                              <input
                                type="number"
                                placeholder="Özel miktar girin..."
                                id="custom-budget-input"
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-6 pr-3 py-2 text-xs text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const input = document.getElementById('custom-budget-input') as HTMLInputElement;
                                const val = Number(input?.value);
                                if (val && val > 0) {
                                  handleAllocateBudget(activeProduct.id, val);
                                  if (input) input.value = '';
                                }
                              }}
                              className="px-4 py-2 bg-focus-neon text-black hover:bg-focus-neon/90 text-xs font-bold rounded-lg transition-all"
                            >
                              Bütçe Ekle
                            </button>
                            <button
                              onClick={() => {
                                const input = document.getElementById('custom-budget-input') as HTMLInputElement;
                                const val = Number(input?.value);
                                if (val && val > 0) {
                                  handleAllocateBudget(activeProduct.id, -val);
                                  if (input) input.value = '';
                                }
                              }}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 hover:text-crit-vivid text-text-secondary text-xs font-bold rounded-lg transition-all"
                            >
                              Eksilt
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Store detail quick metadata info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">ÖNCELİK DURUMU</p>
                          <p className="text-white text-sm font-bold mt-1">{activeProduct.priority}</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                          <p className="text-[10px] text-text-secondary uppercase font-bold">PLANLAMA DURUMU</p>
                          <p className="text-white text-sm font-bold mt-1">{activeProduct.status}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {detailsTab === 'specs' && (
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1">
                      <h4 className="text-xs uppercase font-bold text-text-secondary mb-3 tracking-wider flex items-center gap-2">
                        <Cpu size={14} className="text-focus-neon" /> Teknik Detay Sayfası
                      </h4>
                      {activeProduct.specs && activeProduct.specs.length > 0 ? (
                        activeProduct.specs.map((spec, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.01] px-2 rounded transition-colors">
                            <span className="text-text-secondary text-xs font-bold">{spec.key}</span>
                            <span className="text-text-primary text-xs font-mono font-medium text-right">{spec.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 italic py-6 text-center text-xs">Bu ürün için teknik özellik tablosu kaydedilmemiş.</p>
                      )}
                    </div>
                  )}

                  {detailsTab === 'features' && (
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase font-bold text-text-secondary mb-1 tracking-wider flex items-center gap-2">
                        <Layers size={14} className="text-ai-bright" /> Öne Çıkan Ürün Özellikleri (Checklist)
                      </h4>
                      {activeProduct.features && activeProduct.features.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeProduct.features.map((feat, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-3">
                              <CheckCircle2 size={16} className="text-focus-neon mt-0.5 shrink-0" />
                              <span className="text-xs text-white leading-relaxed">{feat}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 italic py-6 text-center text-xs">Öne çıkan ürün özellikleri kaydedilmemiş.</p>
                      )}
                    </div>
                  )}

                  {detailsTab === 'reviews' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-xs uppercase font-bold text-text-secondary tracking-wider flex items-center gap-2">
                          <MessageSquare size={14} className="text-yellow-400" /> Web Süzücü Kullanıcı Değerlendirmeleri
                        </h4>
                        {activeProduct.rating && (
                          <span className="bg-yellow-400/10 text-yellow-400 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            ★ {activeProduct.rating} / 5
                          </span>
                        )}
                      </div>

                      {activeProduct.reviews && activeProduct.reviews.length > 0 ? (
                        <div className="space-y-3">
                          {activeProduct.reviews.map((rev, idx) => (
                            <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white font-bold">{rev.author}</span>
                                <span className="text-text-secondary font-mono">{rev.date}</span>
                              </div>
                              <div className="flex text-yellow-400 gap-0.5">
                                {Array.from({ length: 5 }).map((_, s) => (
                                  <Star key={s} size={11} fill={s < rev.rating ? 'currentColor' : 'none'} className={s < rev.rating ? 'text-yellow-400' : 'text-zinc-600'} />
                                ))}
                              </div>
                              <p className="text-xs text-zinc-300 italic leading-relaxed">"{rev.comment}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 italic py-6 text-center text-xs">Bu ürün için taranan yorum bulunmamaktadır.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-white/10 bg-white/[0.01] flex justify-between items-center shrink-0">
                <a 
                  href={activeProduct.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={14} /> Mağaza Sayfasını Aç
                </a>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setFormData(activeProduct);
                      setWizardTab('manual');
                      setIsWizardOpen(true);
                      setSelectedProduct(null);
                    }}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl text-xs font-bold transition-colors"
                  >
                    Planı Düzenle
                  </button>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 py-2.5 bg-focus-neon text-black rounded-xl text-xs font-bold hover:bg-focus-neon/90 transition-colors"
                  >
                    Raporu Kapat
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Mini Modals */}
      <AnimatePresence>
        {summaryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pure-black/75 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6"
            >
              <button 
                onClick={() => setSummaryModal(null)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors z-10"
              >
                <X size={16} />
              </button>
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">
                {summaryModal.title}
              </h2>
              <p className="text-3xl font-display font-black text-text-primary mb-4">
                {summaryModal.value}
              </p>
              
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 max-h-[260px] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {purchases.filter(p => {
                    if (summaryModal.type === 'total-planned') return p.status !== 'Satın Alındı';
                    if (summaryModal.type === 'ready-buy') return p.status === 'Alınabilir' || p.savedAmount >= p.price;
                    if (summaryModal.type === 'total-bought') return p.status === 'Satın Alındı';
                    return false;
                  }).map(p => (
                    <div key={p.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="min-w-0 pr-4">
                        <p className="text-xs font-bold text-text-primary truncate">{p.title}</p>
                        <p className="text-[9px] text-text-secondary">{p.status} • {p.priority}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-focus-neon shrink-0">₺{p.price.toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                  {purchases.filter(p => {
                    if (summaryModal.type === 'total-planned') return p.status !== 'Satın Alındı';
                    if (summaryModal.type === 'ready-buy') return p.status === 'Alınabilir' || p.savedAmount >= p.price;
                    if (summaryModal.type === 'total-bought') return p.status === 'Satın Alındı';
                    return false;
                  }).length === 0 && (
                    <p className="text-xs text-text-secondary text-center py-4">Kayıt bulunamadı.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                 <button onClick={() => setSummaryModal(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors">
                   Kapat
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Budget Modal */}
      <AnimatePresence>
        {quickBudgetProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-pure-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative"
            >
              <button 
                onClick={() => setQuickBudgetProduct(null)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors z-10"
              >
                <X size={16} />
              </button>
              
              <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
                <Wallet size={16} className="text-ai-bright" /> Hızlı Bütçe Ayır
              </h3>
              <p className="text-xs text-text-secondary mb-4 truncate">{quickBudgetProduct.title}</p>
              
              <div className="space-y-4">
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[9px] text-text-secondary uppercase">BİRİKEN / FİYAT</p>
                    <p className="text-white font-mono font-bold mt-0.5">
                      ₺{quickBudgetProduct.savedAmount.toLocaleString('tr-TR')} / ₺{quickBudgetProduct.price.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-text-secondary uppercase">İHTİYAÇ</p>
                    <p className="text-focus-neon font-mono font-bold mt-0.5">
                      ₺{Math.max(0, quickBudgetProduct.price - quickBudgetProduct.savedAmount).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary mb-2 uppercase">Bütçeye Eklenecek Tutar (₺)</label>
                  <input 
                    type="number"
                    placeholder="Eklenecek tutarı girin (Örn: 500)"
                    value={quickBudgetAmount}
                    onChange={(e) => setQuickBudgetAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-focus-neon/50 transition-colors font-mono text-xs"
                    autoFocus
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[100, 200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setQuickBudgetAmount(amt.toString())}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[11px] font-mono font-semibold text-text-secondary hover:text-white transition-colors"
                    >
                      +₺{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => setQuickBudgetAmount((quickBudgetProduct.price - quickBudgetProduct.savedAmount).toString())}
                    className="px-2.5 py-1 bg-nrg-sun/15 text-nrg-sun hover:bg-nrg-sun hover:text-black rounded-md text-[11px] font-semibold transition-colors"
                  >
                    Hepsini Tamamla
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button 
                  onClick={() => setQuickBudgetProduct(null)} 
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={() => {
                    const amt = Number(quickBudgetAmount);
                    if (!isNaN(amt) && amt > 0) {
                      handleAllocateBudget(quickBudgetProduct.id, amt);
                      setQuickBudgetProduct(null);
                    } else {
                      setToast({ message: "Lütfen geçerli bir bütçe tutarı giriniz.", type: 'error' });
                    }
                  }} 
                  className="px-5 py-2 bg-focus-neon text-black text-xs font-bold rounded-xl hover:bg-focus-neon/90 transition-colors"
                >
                  Bütçeyi Ekle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP: DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 p-5 rounded-2xl shadow-2xl space-y-4"
            >
              <h2 className="text-xs font-display font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                <Trash2 size={14} />
                {deleteConfirm.title}
              </h2>
              
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed bg-black/25 p-3 rounded-lg border border-white/5">
                {deleteConfirm.message}
              </p>
              
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3.5 py-1.5 text-[9px] font-mono text-zinc-400 hover:text-white uppercase"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={executeDeleteProduct}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-white text-[9px] font-mono font-bold uppercase transition-all"
                >
                  Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[220] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg font-mono text-[10px]"
            style={{
              backgroundColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(59, 130, 246, 0.95)',
              borderColor: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#3b82f6',
              color: '#ffffff'
            }}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <X size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
