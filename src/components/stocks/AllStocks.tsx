import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  PackagePlus,
  ArrowDownToLine,
  X,
  Eye,
  Edit2,
  Trash2,
  Archive,
  ChevronRight,
  ChevronLeft,
  Info,
  Tag,
  Warehouse,
  DollarSign,
  Barcode,
  Plus,
  LayoutGrid,
  List,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { HighlightText } from '../common/HighlightText';
import { smartFilter } from '../../utils/searchUtils';
import { StockWizardModal } from './StockWizardModal';

export function AllStocks() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardScenario, setWizardScenario] = useState<'MANUAL' | 'BULK' | null>(null);
  const [editingStock, setEditingStock] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  
  // New UI States
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const categories = ['All', ...new Set(stocks.map(s => s.category))];

  const fetchStocks = () => {
    setIsLoading(true);
    fetch('/api/stocks/summary')
      .then(res => res.json())
      .then(data => {
        setStocks(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const filteredStocks = smartFilter(
    stocks,
    searchTerm,
    ['name', 'code', 'brand', 'category'],
    {
      kod: 'code',
      ad: 'name',
      kat: 'category',
      marka: 'brand',
      durum: (stock) => stock.balance < stock.critical_level ? 'Kritik' : 'Yeterli'
    }
  ).filter(stock => {
    const matchesCategory = filterCategory === 'All' || stock.category === filterCategory;
    const isCritical = stock.balance < stock.critical_level;
    const matchesStatus = filterStatus === 'All' || 
                        (filterStatus === 'Critical' && isCritical) ||
                        (filterStatus === 'Sufficient' && !isCritical);
    return matchesCategory && matchesStatus;
  }).sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSaveStocks = async (newStocks: any[]) => {
    try {
      if (newStocks.length > 0) {
        const response = await fetch('/api/stocks/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStocks)
        });
        
        if (response.ok) {
          fetchStocks();
        }
      } else {
        // Just refresh if it was a single save handled by the modal
        fetchStocks();
      }
    } catch (error) {
      console.error('Error saving stocks:', error);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedStock) return;
    try {
      const response = await fetch(`/api/stocks/${selectedStock.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: adjustQty, type: adjustType })
      });
      if (response.ok) {
        setIsAdjusting(false);
        setAdjustQty(1);
        fetchStocks();
        // Update selected stock balance locally or refetch
        const updated = await fetch('/api/stocks/summary').then(res => res.json());
        const newSelected = updated.find((s: any) => s.id === selectedStock.id);
        if (newSelected) setSelectedStock(newSelected);
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const handleDeleteStock = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Bu stok kartını silmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`/api/stocks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchStocks();
      } else {
        const data = await response.json();
        alert(data.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
      alert('Bir hata oluştu.');
    }
  };

  const handleArchiveStock = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Bu stok kartını arşivlemek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`/api/stocks/${id}/archive`, { method: 'POST' });
      if (response.ok) {
        fetchStocks();
      } else {
        const data = await response.json();
        alert(data.error || 'Arşivleme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Error archiving stock:', error);
      alert('Bir hata oluştu.');
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-skel-glass mb-1">Tüm Stoklar</h1>
          <p className="text-skel-metal text-sm">Sistemdeki tüm stok kartları ve güncel miktarları.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setWizardScenario('BULK');
              setIsWizardOpen(true);
            }}
            className="os-btn os-btn-secondary"
          >
            <ArrowDownToLine size={16} />
            İçe Aktar
          </button>
          <button 
            onClick={() => {
              setWizardScenario('MANUAL');
              setIsWizardOpen(true);
            }}
            className="os-btn os-btn-primary"
          >
            <PackagePlus size={16} />
            Yeni Stok
          </button>
        </div>
      </div>

      {/* Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="layer-3d flex-1 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-skel-matte/20 flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 bg-skel-matte/5">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-skel-matte group-focus-within:text-focus-neon transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Stok Kodu, Adı veya Barkod Ara... (kod:, ad:, kat:)" 
                className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-10 py-2 text-sm text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-skel-metal hover:text-skel-glass transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-skel-space/50 border border-skel-matte/20 rounded-xl px-3 py-2 text-xs text-skel-metal focus:outline-none focus:border-focus-neon transition-all appearance-none"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Tüm Kategoriler' : c}</option>)}
              </select>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-skel-space/50 border border-skel-matte/20 rounded-xl px-3 py-2 text-xs text-skel-metal focus:outline-none focus:border-focus-neon transition-all appearance-none"
              >
                <option value="All">Tüm Durumlar</option>
                <option value="Critical">Kritik Seviye</option>
                <option value="Sufficient">Yeterli</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex bg-skel-matte/20 p-1 rounded-xl border border-skel-matte/20">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-focus-neon text-skel-dark shadow-lg' : 'text-skel-metal hover:text-skel-glass'}`}
                title="Liste Görünümü"
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-focus-neon text-skel-dark shadow-lg' : 'text-skel-metal hover:text-skel-glass'}`}
                title="Kutu Görünümü"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-focus-neon/20 border-t-focus-neon rounded-full animate-spin" />
              <p className="text-skel-metal animate-pulse">Stoklar yükleniyor...</p>
            </div>
          ) : viewMode === 'table' ? (
            <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="sticky top-0 bg-skel-dark/95 backdrop-blur z-10">
                    <tr className="border-b border-skel-matte/20 text-[10px] uppercase tracking-widest text-skel-matte font-bold">
                      <th className="p-4 cursor-pointer hover:text-skel-glass transition-colors" onClick={() => toggleSort('code')}>
                        <div className="flex items-center gap-2">Stok Kodu <ArrowUpDown size={12} /></div>
                      </th>
                      <th className="p-4 cursor-pointer hover:text-skel-glass transition-colors" onClick={() => toggleSort('name')}>
                        <div className="flex items-center gap-2">Stok Adı <ArrowUpDown size={12} /></div>
                      </th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4 text-right cursor-pointer hover:text-skel-glass transition-colors" onClick={() => toggleSort('balance')}>
                        <div className="flex items-center justify-end gap-2">Mevcut <ArrowUpDown size={12} /></div>
                      </th>
                      <th className="p-4 text-right">Kritik</th>
                      <th className="p-4">Birim</th>
                      <th className="p-4">Durum</th>
                      <th className="p-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                          <tbody className="text-sm divide-y divide-white/5">
                            {filteredStocks.map((stock, index) => {
                              const isCritical = stock.balance < stock.critical_level;
                              return (
                                <tr 
                                  key={stock.id + '-' + index} 
                                  className="hover:bg-skel-matte/10 transition-colors group cursor-pointer"
                                >
                                  <td className="p-4 font-mono text-skel-glass text-xs" onClick={() => setSelectedStock(stock)}>
                                    <HighlightText text={stock.code} highlight={searchTerm} />
                                  </td>
                                  <td className="p-4" onClick={() => setSelectedStock(stock)}>
                                    <div className="flex flex-col">
                                      <span className="text-skel-glass font-medium">
                                        <HighlightText text={stock.name} highlight={searchTerm} />
                                      </span>
                                      <span className="text-[10px] text-skel-matte uppercase tracking-wider">
                                        <HighlightText text={stock.brand || 'Markasız'} highlight={searchTerm} />
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-4" onClick={() => setSelectedStock(stock)}>
                                    <span className="px-2 py-1 rounded-lg bg-skel-matte/20 text-[10px] text-skel-metal border border-skel-matte/20">
                                      <HighlightText text={stock.category} highlight={searchTerm} />
                                    </span>
                                  </td>
                                  <td className="p-4 text-right" onClick={() => setSelectedStock(stock)}>
                                    <div className="flex flex-col items-end">
                                      <span className={`font-mono font-bold text-lg ${isCritical ? 'text-crit-vivid' : 'text-focus-neon'}`}>
                                        {stock.balance.toLocaleString()}
                                      </span>
                                      <div className="w-16 h-1 bg-skel-matte/20 rounded-full mt-1 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${isCritical ? 'bg-crit-vivid' : 'bg-grow-main'}`}
                                          style={{ width: `${Math.min(100, (stock.balance / (stock.critical_level * 2 || 1)) * 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 text-right font-mono text-skel-metal text-xs" onClick={() => setSelectedStock(stock)}>{stock.critical_level}</td>
                                  <td className="p-4 text-skel-metal text-xs" onClick={() => setSelectedStock(stock)}>{stock.unit}</td>
                                  <td className="p-4" onClick={() => setSelectedStock(stock)}>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'text-crit-vivid' : 'text-grow-main'}`}>
                                      {isCritical ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                      {isCritical ? 'Kritik' : 'Yeterli'}
                                    </div>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button 
                                        onClick={() => {
                                          setEditingStock(stock);
                                          setIsWizardOpen(true);
                                        }}
                                        className="p-2 text-skel-metal hover:text-skel-glass transition-colors rounded-lg hover:bg-skel-matte/20"
                                        title="Düzenle"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleArchiveStock(stock.id)}
                                        className="p-2 text-amber-500/70 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/5"
                                        title="Arşivle"
                                      >
                                        <Archive size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteStock(stock.id)}
                                        className="p-2 text-crit-vivid/70 hover:text-crit-vivid transition-colors rounded-lg hover:bg-crit-vivid/5"
                                        title="Sil"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStocks.map((stock, index) => {
                const isCritical = stock.balance < stock.critical_level;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={stock.id + '-' + index}
                    onClick={() => setSelectedStock(stock)}
                    className="layer-3d p-5 bg-skel-matte/10 border-skel-matte/20 hover:border-skel-matte/20 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    {isCritical && (
                      <div className="absolute top-0 right-0 w-16 h-16">
                        <div className="absolute transform rotate-45 bg-crit-vivid text-skel-glass text-[8px] font-bold py-1 px-10 -right-6 top-2 shadow-lg uppercase tracking-tighter">
                          Kritik
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-skel-matte/20 flex items-center justify-center text-skel-metal group-hover:text-focus-neon transition-colors">
                        <Package size={20} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingStock(stock); setIsWizardOpen(true); }}
                          className="p-1.5 text-skel-metal hover:text-skel-glass bg-skel-matte/20 rounded-lg"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <h3 className="text-skel-glass font-bold truncate">{stock.name}</h3>
                      <p className="text-[10px] text-skel-matte font-mono uppercase tracking-wider">{stock.code} • {stock.brand || 'Markasız'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-skel-matte/20">
                      <div>
                        <p className="text-[8px] uppercase font-bold text-skel-matte tracking-widest mb-1">Mevcut</p>
                        <p className={`text-lg font-mono font-bold ${isCritical ? 'text-crit-vivid' : 'text-focus-neon'}`}>
                          {stock.balance} <span className="text-[10px] font-normal text-skel-metal">{stock.unit}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase font-bold text-skel-matte tracking-widest mb-1">Kritik</p>
                        <p className="text-lg font-mono font-bold text-skel-metal">
                          {stock.critical_level}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 w-full h-1 bg-skel-matte/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-crit-vivid' : 'bg-grow-main'}`}
                        style={{ width: `${Math.min(100, (stock.balance / (stock.critical_level * 2 || 1)) * 100)}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!isLoading && filteredStocks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-skel-matte/20 flex items-center justify-center text-skel-matte mb-4">
                <Search size={40} />
              </div>
              <h3 className="text-skel-glass font-bold text-lg">Kayıt Bulunamadı</h3>
              <p className="text-skel-metal text-sm max-w-xs mt-2">
                Arama kriterlerinize uygun stok bulunamadı. Lütfen filtreleri kontrol edin veya yeni bir stok ekleyin.
              </p>
              <button 
                onClick={() => { setSearchTerm(''); setFilterCategory('All'); setFilterStatus('All'); }}
                className="mt-6 text-focus-neon text-sm font-bold hover:underline"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-skel-matte/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-skel-metal shrink-0 bg-skel-matte/5">
          <div className="flex items-center gap-4">
            <span>Toplam <strong>{filteredStocks.length}</strong> kayıt gösteriliyor</span>
            <div className="h-4 w-[1px] bg-skel-matte/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-grow-main" />
              <span>Yeterli</span>
              <div className="w-2 h-2 rounded-full bg-crit-vivid ml-2" />
              <span>Kritik</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-skel-matte/20 hover:bg-skel-matte/20 transition-colors disabled:opacity-30" disabled>Önceki</button>
            <button className="px-3 py-1.5 rounded-lg border border-skel-matte/20 hover:bg-skel-matte/20 transition-colors disabled:opacity-30" disabled>Sonraki</button>
          </div>
        </div>
      </motion.div>

      <StockWizardModal 
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setWizardScenario(null);
          setEditingStock(null);
        }}
        onSave={handleSaveStocks}
        initialScenario={wizardScenario}
        editingStock={editingStock}
      />

      {/* Stock Detail Modal */}
      {selectedStock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedStock(null)}
            className="absolute inset-0 bg-skel-dark/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-3xl layer-3d overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-skel-matte/20 flex justify-between items-center shrink-0 bg-skel-matte/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-focus-neon/10 flex items-center justify-center text-focus-neon">
                  <Tag size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-skel-glass">{selectedStock.name}</h2>
                  <p className="text-skel-metal text-sm font-mono uppercase">{selectedStock.code}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStock(null)}
                className="p-2 text-skel-metal hover:text-skel-glass transition-colors rounded-lg hover:bg-skel-matte/20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="layer-3d p-4 bg-skel-matte/10 border-skel-matte/20">
                  <p className="text-xs font-bold text-skel-matte uppercase tracking-widest mb-1">Mevcut Stok</p>
                  <p className="text-2xl font-bold text-focus-neon font-mono">{selectedStock.balance.toLocaleString()} <span className="text-sm font-normal text-skel-metal">{selectedStock.unit}</span></p>
                </div>
                <div className="layer-3d p-4 bg-skel-matte/10 border-skel-matte/20">
                  <p className="text-xs font-bold text-skel-matte uppercase tracking-widest mb-1">Kritik Seviye</p>
                  <p className="text-2xl font-bold text-crit-vivid font-mono">{selectedStock.critical_level.toLocaleString()} <span className="text-sm font-normal text-skel-metal">{selectedStock.unit}</span></p>
                </div>
                <div className="layer-3d p-4 bg-skel-matte/10 border-skel-matte/20">
                  <p className="text-xs font-bold text-skel-matte uppercase tracking-widest mb-1">Kategori</p>
                  <p className="text-xl font-bold text-skel-glass">{selectedStock.category}</p>
                </div>
              </div>

              {/* Detailed Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-skel-glass uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} className="text-focus-neon" />
                    Ürün Bilgileri
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-skel-matte/20">
                      <span className="text-skel-metal">Marka</span>
                      <span className="text-skel-glass font-medium">{selectedStock.brand || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-skel-matte/20">
                      <span className="text-skel-metal">Model</span>
                      <span className="text-skel-glass font-medium">{selectedStock.model || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-skel-matte/20">
                      <span className="text-skel-metal">Barkod</span>
                      <span className="text-skel-glass font-mono">{selectedStock.barcode || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-skel-matte/20">
                      <span className="text-skel-metal">Depo Konumu</span>
                      <span className="text-skel-glass font-medium flex items-center gap-1">
                        <Warehouse size={12} className="text-skel-matte" />
                        {selectedStock.location || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-skel-glass uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} className="text-grow-main" />
                    Fiyatlandırma
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-skel-matte/20">
                      <span className="text-skel-metal">Alış Fiyatı</span>
                      <span className="text-skel-glass font-mono">{selectedStock.purchase_price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-skel-matte/20">
                      <span className="text-skel-metal">Satış Fiyatı</span>
                      <span className="text-skel-glass font-mono">{selectedStock.sale_price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-skel-matte/20">
                      <span className="text-skel-metal">KDV Oranı</span>
                      <span className="text-skel-glass font-medium">%{selectedStock.tax_rate || '18'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStock.description && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-skel-glass uppercase tracking-widest">Açıklama</h3>
                  <div className="p-4 bg-skel-matte/20 rounded-xl text-skel-glass text-sm leading-relaxed">
                    {selectedStock.description}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-skel-matte/20 bg-skel-matte/10 flex justify-between items-center shrink-0">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setAdjustType('IN');
                    setIsAdjusting(true);
                  }}
                  className="os-btn bg-grow-main/10 text-grow-main border-grow-main/20 hover:bg-grow-main/20"
                >
                  <Plus size={16} />
                  Stok Ekle
                </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveStock(selectedStock.id, e);
                      setSelectedStock(null);
                    }}
                    className="os-btn bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                  >
                    <Archive size={16} />
                    Arşivle
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStock(selectedStock.id, e);
                      setSelectedStock(null);
                    }}
                    className="os-btn bg-crit-vivid/10 text-crit-vivid border-crit-vivid/20 hover:bg-crit-vivid/20"
                  >
                    <Trash2 size={16} />
                    Sil
                  </button>
                </div>
                <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedStock(null)}
                  className="os-btn os-btn-secondary"
                >
                  Kapat
                </button>
                <button 
                  onClick={() => {
                    setEditingStock(selectedStock);
                    setIsWizardOpen(true);
                    setSelectedStock(null);
                  }}
                  className="os-btn os-btn-primary"
                >
                  <Edit2 size={16} />
                  Düzenle
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Adjustment Modal */}
      {isAdjusting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAdjusting(false)}
            className="absolute inset-0 bg-skel-dark/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md layer-3d p-6 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-skel-glass">
                {adjustType === 'IN' ? 'Stok Ekle' : 'Stok Çıkar'}
              </h3>
              <button onClick={() => setIsAdjusting(false)} className="text-skel-metal hover:text-skel-glass">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-skel-matte/20 rounded-lg border border-skel-matte/20">
                <p className="text-xs text-skel-metal uppercase font-bold mb-1">Seçili Ürün</p>
                <p className="text-skel-glass font-medium">{selectedStock?.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-skel-metal">Miktar ({selectedStock?.unit})</label>
                <input 
                  type="number" 
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setIsAdjusting(false)}
                className="os-btn os-btn-secondary"
              >
                İptal
              </button>
              <button 
                onClick={handleAdjustStock}
                className={`os-btn ${adjustType === 'IN' ? 'bg-grow-main hover:bg-grow-main/90' : 'bg-crit-vivid hover:bg-crit-vivid/90'} text-skel-glass border-transparent`}
              >
                {adjustType === 'IN' ? 'Ekle' : 'Çıkar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
