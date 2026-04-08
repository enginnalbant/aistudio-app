import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  X,
  Edit2,
  Trash2,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  Building2,
  MapPin,
  Globe,
  FileText,
  Download,
  Upload,
  ArrowUpDown,
  ExternalLink,
  MoreVertical,
  AlertCircle,
  Archive
} from 'lucide-react';
import { HighlightText } from '../common/HighlightText';
import { smartFilter } from '../../utils/searchUtils';
import { AccountWizardModal } from './AccountWizardModal';

export function AccountsList() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tümü');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardScenario, setWizardScenario] = useState<'MANUAL' | 'BULK' | null>(null);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/accounts/summary?t=${Date.now()}`);
      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Bu cari kaydını silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchAccounts();
        } else {
          const data = await response.json();
          alert(data.error || 'Silme işlemi başarısız oldu.');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Bir hata oluştu.');
      }
    }
  };

  const handleArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Bu cari kaydını arşivlemek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`/api/accounts/${id}/archive`, { method: 'POST' });
        if (response.ok) {
          fetchAccounts();
        } else {
          const data = await response.json();
          alert(data.error || 'Arşivleme işlemi başarısız oldu.');
        }
      } catch (error) {
        console.error('Error archiving account:', error);
        alert('Bir hata oluştu.');
      }
    }
  };

  const handleBulkSave = async (bulkData: any[]) => {
    try {
      const response = await fetch('/api/accounts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });
      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error saving bulk accounts:', error);
    }
  };

  const filteredAccounts = smartFilter(
    accounts,
    searchTerm,
    ['name', 'series', 'tax_number'],
    {
      kod: 'series',
      ad: 'name',
      tip: 'type',
      vergi: 'tax_number',
      borc: (a) => a.balance > 0 ? 'Borçlu' : a.balance < 0 ? 'Alacaklı' : 'Kapalı'
    }
  ).filter(a => {
    const matchesType = filterType === 'Tümü' || a.type === filterType;
    const matchesOverdue = filterOverdue ? (a.overdue_debt && a.overdue_debt > 0) : true;
    return matchesType && matchesOverdue;
  }).sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    
    if (sortBy === 'balance') {
      valA = a.balance || 0;
      valB = b.balance || 0;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const types = ['Tümü', 'Müşteri', 'Tedarikçi', 'Fason', 'Hizmet', 'Personel'];

  return (
    <div className="space-y-6 h-full flex flex-col pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-skel-glass mb-1">Tüm Cariler</h1>
          <p className="text-skel-metal text-sm">Sistemdeki tüm müşteri, tedarikçi ve iş ortaklarının listesi.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-skel-matte/20 rounded-xl p-1 border border-skel-matte/20">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-focus-neon text-skel-dark shadow-lg shadow-focus-neon/20' : 'text-skel-metal hover:text-skel-glass'}`}
            >
              <TableIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-focus-neon text-skel-dark shadow-lg shadow-focus-neon/20' : 'text-skel-metal hover:text-skel-glass'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <div className="relative group">
            <button className="os-btn os-btn-primary">
              <UserPlus size={16} />
              Cari Ekle
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 layer-3d border border-skel-matte/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button 
                onClick={() => { setWizardScenario('MANUAL'); setEditingAccount(null); setIsWizardOpen(true); }}
                className="w-full text-left px-4 py-3 text-sm text-skel-glass hover:bg-skel-matte/20 flex items-center gap-2"
              >
                <Edit2 size={14} /> Manuel Giriş
              </button>
              <button 
                onClick={() => { setWizardScenario('BULK'); setEditingAccount(null); setIsWizardOpen(true); }}
                className="w-full text-left px-4 py-3 text-sm text-skel-glass hover:bg-skel-matte/20 flex items-center gap-2"
              >
                <Upload size={14} /> Toplu İçe Aktar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="layer-3d p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-skel-metal group-focus-within:text-focus-neon transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari unvanı, kod veya vergi no ara... (kod:, ad:, tip:)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-skel-metal hover:text-skel-glass transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => setFilterOverdue(!filterOverdue)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
              filterOverdue 
                ? 'bg-crit-vivid/20 border-crit-vivid/50 text-crit-vivid' 
                : 'bg-skel-matte/20 border-skel-matte/20 text-skel-metal hover:text-skel-glass'
            }`}
          >
            <AlertCircle size={14} />
            Vadesi Gelenler
          </button>
          
          <div className="w-px h-6 bg-skel-matte/30 mx-1"></div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={16} className="text-skel-metal" />
            <span className="text-xs font-bold text-skel-metal uppercase tracking-widest">Tip:</span>
          </div>
          {types.map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                filterType === type 
                  ? 'bg-focus-neon/10 border-focus-neon/30 text-focus-neon' 
                  : 'bg-skel-matte/20 border-skel-matte/20 text-skel-metal hover:text-skel-glass'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-focus-neon/20 border-t-focus-neon rounded-full animate-spin" />
            <p className="text-skel-metal text-sm font-medium">Cariler yükleniyor...</p>
          </div>
        ) : filteredAccounts.length > 0 ? (
          viewMode === 'table' ? (
            <div className="layer-3d overflow-hidden flex flex-col h-full">
              <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="sticky top-0 bg-skel-dark/95 backdrop-blur-md z-10">
                    <tr className="border-b border-skel-matte/20 text-[10px] uppercase tracking-[0.2em] text-skel-metal font-bold">
                      <th className="p-4">
                        <button 
                          onClick={() => { setSortBy('series'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          className="flex items-center gap-2 hover:text-skel-glass transition-colors"
                        >
                          Kod <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="p-4">
                        <button 
                          onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          className="flex items-center gap-2 hover:text-skel-glass transition-colors"
                        >
                          Cari Unvanı <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="p-4">Tip</th>
                      <th className="p-4">İletişim</th>
                      <th className="p-4">
                        <button 
                          onClick={() => { setSortBy('balance'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                          className="flex items-center gap-2 hover:text-skel-glass transition-colors"
                        >
                          Kalan Borç <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="p-4">Vadesi Gelen</th>
                      <th className="p-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredAccounts.map((account, index) => (
                      <tr key={account.id || `account-${index}`} className="hover:bg-skel-matte/10 transition-colors group">
                        <td className="p-4" onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}>
                          <span className="font-mono text-focus-neon font-bold bg-focus-neon/5 px-2 py-1 rounded border border-focus-neon/10 text-xs">
                            <HighlightText text={account.series || 'KODSUZ'} highlight={searchTerm} />
                          </span>
                        </td>
                        <td className="p-4" onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}>
                          <div className="flex flex-col">
                            <span className="text-skel-glass font-bold">
                              <HighlightText text={account.name} highlight={searchTerm} />
                            </span>
                            <span className="text-[10px] text-skel-metal font-mono tracking-wider">
                              <HighlightText text={account.tax_number || 'Vergi No Girilmemiş'} highlight={searchTerm} />
                            </span>
                          </div>
                        </td>
                        <td className="p-4" onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}>
                          <span className="text-xs font-bold text-skel-metal bg-skel-matte/20 px-2 py-1 rounded border border-skel-matte/20 uppercase tracking-wider">
                            {account.type}
                          </span>
                        </td>
                        <td className="p-4" onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}>
                          <div className="flex flex-col gap-1 text-xs text-skel-metal">
                            {account.phone && <div className="flex items-center gap-1.5"><Phone size={12} /> {account.phone}</div>}
                            {account.email && <div className="flex items-center gap-1.5"><Mail size={12} /> {account.email}</div>}
                          </div>
                        </td>
                        <td className="p-4" onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}>
                          <div className="flex flex-col">
                            <span className={`font-mono font-bold text-lg ${account.balance > 0 ? 'text-crit-vivid' : account.balance < 0 ? 'text-grow-main' : 'text-skel-glass'}`}>
                              ₺{Math.abs(account.balance).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-skel-metal uppercase font-bold tracking-widest mt-0.5">
                              {account.balance > 0 ? 'Borçluyuz' : account.balance < 0 ? 'Alacaklıyız' : 'Kapalı'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4" onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}>
                          {account.overdue_debt > 0 ? (
                            <span className="font-mono font-bold text-crit-vivid bg-crit-vivid/10 px-2 py-1 rounded border border-crit-vivid/20 text-sm">
                              ₺{account.overdue_debt.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-skel-metal">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}
                              className="p-2 text-skel-metal hover:text-focus-neon hover:bg-focus-neon/10 rounded-lg transition-all"
                              title="Düzenle"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleArchive(account.id)}
                              className="p-2 text-skel-metal hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                              title="Arşivle"
                            >
                              <Archive size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(account.id)}
                              className="p-2 text-skel-metal hover:text-crit-vivid hover:bg-crit-vivid/10 rounded-lg transition-all"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-skel-matte/20 bg-skel-matte/5 flex justify-between items-center shrink-0">
                <p className="text-xs text-skel-metal font-bold uppercase tracking-widest">
                  Toplam <span className="text-skel-glass">{filteredAccounts.length}</span> Cari Listeleniyor
                </p>
                <div className="flex gap-2">
                  <button className="os-btn os-btn-secondary text-xs py-1.5">
                    <Download size={14} /> Dışa Aktar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto h-full pr-2 custom-scrollbar">
              {filteredAccounts.map((account, index) => (
                <motion.div 
                  key={account.id || `account-grid-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="layer-3d p-6 group hover:border-focus-neon/30 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}
                      className="p-1.5 text-skel-metal hover:text-skel-glass"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-skel-matte/20 border border-skel-matte/20 flex items-center justify-center text-skel-metal group-hover:text-focus-neon transition-colors shrink-0">
                      <Building2 size={28} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-skel-glass font-bold truncate group-hover:text-focus-neon transition-colors">{account.name}</h3>
                      <p className="text-[10px] text-skel-metal font-mono uppercase tracking-wider">{account.series || 'KODSUZ'} • {account.type}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-skel-metal font-bold uppercase tracking-widest mb-1">Kalan Borç</p>
                        <p className={`text-xl font-mono font-bold ${account.balance > 0 ? 'text-crit-vivid' : account.balance < 0 ? 'text-grow-main' : 'text-skel-glass'}`}>
                          ₺{Math.abs(account.balance).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-skel-metal font-bold uppercase tracking-widest mb-1">Durum</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          account.balance > 0 ? 'text-crit-vivid border-crit-vivid/30 bg-crit-vivid/5' : 
                          account.balance < 0 ? 'text-grow-main border-grow-main/30 bg-grow-main/5' :
                          'text-skel-metal border-skel-matte/20 bg-skel-matte/20'
                        }`}>
                          {account.balance > 0 ? 'BORÇLUYUZ' : account.balance < 0 ? 'ALACAKLIYIZ' : 'KAPALI'}
                        </span>
                      </div>
                    </div>

                    {account.overdue_debt > 0 && (
                      <div className="pt-3 border-t border-skel-matte/20 flex justify-between items-center">
                        <span className="text-[10px] text-crit-vivid font-bold uppercase tracking-widest flex items-center gap-1">
                          <AlertCircle size={12} /> Vadesi Gelen
                        </span>
                        <span className="font-mono font-bold text-crit-vivid">
                          ₺{account.overdue_debt.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-skel-matte/20 space-y-2">
                      {account.phone && (
                        <div className="flex items-center gap-2 text-xs text-skel-metal">
                          <Phone size={14} className="opacity-50" />
                          {account.phone}
                        </div>
                      )}
                      {account.email && (
                        <div className="flex items-center gap-2 text-xs text-skel-metal">
                          <Mail size={14} className="opacity-50" />
                          <span className="truncate">{account.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => { setEditingAccount(account); setWizardScenario('MANUAL'); setIsWizardOpen(true); }}
                      className="os-btn os-btn-secondary text-[10px] py-2"
                    >
                      <Edit2 size={12} /> Düzenle
                    </button>
                    <button 
                      onClick={() => handleArchive(account.id)}
                      className="os-btn os-btn-secondary text-[10px] py-2 text-amber-500"
                    >
                      <Archive size={12} /> Arşiv
                    </button>
                    <button 
                      onClick={() => handleDelete(account.id)}
                      className="os-btn os-btn-secondary text-[10px] py-2 text-rose-500"
                    >
                      <Trash2 size={12} /> Sil
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 layer-3d">
            <div className="w-20 h-20 rounded-full bg-skel-matte/20 flex items-center justify-center text-skel-matte mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-skel-glass mb-2">Cari Bulunamadı</h3>
            <p className="text-skel-metal max-w-md">
              Arama kriterlerinize uygun bir cari kaydı bulunamadı. Lütfen farklı bir anahtar kelime deneyin veya yeni bir cari ekleyin.
            </p>
            <button 
              onClick={() => { setWizardScenario('MANUAL'); setEditingAccount(null); setIsWizardOpen(true); }}
              className="mt-6 os-btn os-btn-primary"
            >
              <UserPlus size={16} /> Yeni Cari Ekle
            </button>
          </div>
        )}
      </div>

      <AccountWizardModal 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSave={(bulkData) => {
          if (bulkData.length > 0) handleBulkSave(bulkData);
          else fetchAccounts();
        }}
        initialScenario={wizardScenario}
        editingAccount={editingAccount}
      />
    </div>
  );
}
