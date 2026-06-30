import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  Tag,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

/* ------------------------------- Mock Data ------------------------------- */

const CARI_TYPES = ['Tümü', 'Müşteri', 'Tedarikçi', 'Personel', 'Resmi Kurum', 'Diğer'];
const STATUS_TYPES = ['Tümü', 'Aktif', 'Pasif', 'Riskli', 'Engellenmiş'];
const REGIONS = ['Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Kocaeli', 'Gaziantep'];

const MOCK_CARILER = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  code: `C-${1000 + i}`,
  name: i % 2 === 0 ? ['Global Lojistik A.Ş', 'Tekno Market', 'Mavi İnşaat', 'Özdemir Metal', 'Delta Yazılım'][i % 5] : ['Ahmet Yılmaz', 'Mehmet Sunal', 'Ayşe Demir', 'Can Koç', 'Derya Ak'][i % 5],
  type: CARI_TYPES[1 + (i % 5)],
  status: ['Aktif', 'Aktif', 'Aktif', 'Riskli', 'Pasif'][i % 5],
  city: REGIONS[1 + (i % 6)],
  balance: (i % 2 === 0 ? '+' : '-') + (Math.floor(Math.random() * 500000) + 1000),
  lastTransaction: `12.05.2026`,
  email: `info@${(i % 10)}.com`,
  phone: `+90 532 000 00 ${i % 10}${i % 10}`,
  taxNumber: `12345678${i % 10}${i % 10}`,
  isFavorite: i % 7 === 0
}));

/* ------------------------------- Components ------------------------------ */

export const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  const [selectedRegion, setSelectedRegion] = useState('Tümü');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredCariler = MOCK_CARILER.filter(cari => {
    const matchesSearch = (cari.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (cari.code || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesType = selectedType === 'Tümü' || cari.type === selectedType;
    const matchesStatus = selectedStatus === 'Tümü' || cari.status === selectedStatus;
    const matchesRegion = selectedRegion === 'Tümü' || cari.city === selectedRegion;
    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  });

  const totalPages = Math.ceil(filteredCariler.length / itemsPerPage);
  const currentItems = filteredCariler.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase mb-2">
            CARİ <span className="text-purple-500 underline decoration-purple-500/30">ÜNVAN LİSTESİ</span>
          </h1>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em] opacity-60">Toplam {MOCK_CARILER.length} Kayıtlı Organizasyon ve Kişi</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center gap-2">
            <Download size={14} /> Şablon İndir
          </button>
          <button className="px-8 h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-display font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 group">
            <Plus size={16} /> Yeni Cari Ekle
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Ünvan veya Kod ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-14 pl-12 pr-4 rounded-2xl text-white font-mono text-xs focus:border-purple-500/50 outline-none transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-14 pl-12 pr-4 rounded-2xl text-white font-mono text-xs focus:border-purple-500/50 outline-none transition-all appearance-none"
            >
              {CARI_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-14 pl-12 pr-4 rounded-2xl text-white font-mono text-xs focus:border-purple-500/50 outline-none transition-all appearance-none"
            >
              {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Region Filter */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-14 pl-12 pr-4 rounded-2xl text-white font-mono text-xs focus:border-purple-500/50 outline-none transition-all appearance-none"
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="p-8 rounded-[40px] bg-skel-space/30 border border-white/5 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 px-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Ünvan / Kod</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Kategori</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Durum</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest">Bölge</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest text-right">Bakiye</th>
                <th className="pb-4 px-4 text-text-secondary font-mono text-[10px] uppercase tracking-widest text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {currentItems.map((cari) => (
                  <motion.tr 
                    key={cari.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-white/2 transition-colors cursor-pointer"
                  >
                    <td className="py-5 px-4 max-w-xs">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform",
                          cari.type === 'Müşteri' ? "bg-blue-500/10 text-blue-400" : 
                          cari.type === 'Tedarikçi' ? "bg-purple-500/10 text-purple-400" : "bg-cyan-500/10 text-cyan-400"
                        )}>
                          {cari.type === 'Müşteri' ? <Users size={20} /> : cari.type === 'Tedarikçi' ? <Building2 size={20} /> : <Briefcase size={20} />}
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold truncate italic uppercase line-clamp-1 group-hover:text-purple-400 transition-colors uppercase">{cari.name}</p>
                          <p className="text-text-secondary font-mono text-[10px] opacity-40 uppercase tracking-widest">{cari.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-white opacity-80">{cari.type}</span>
                        <div className="flex items-center gap-2 text-[9px] text-text-secondary font-mono opacity-40">
                             <Tag size={10} /> {cari.taxNumber}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm",
                        cari.status === 'Aktif' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                        cari.status === 'Riskli' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-white/5 text-text-secondary border border-white/10"
                      )}>
                        {cari.status}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <MapPin size={14} className="text-white/20" />
                        {cari.city}
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <p className={clsx(
                        "text-sm font-display font-black tracking-tighter",
                        cari.balance.startsWith('+') ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {cari.balance.replace('+', '').replace('-', '')} <span className="text-[10px] opacity-60">₺</span>
                        {cari.balance.startsWith('+') ? <ArrowUpRight size={12} className="inline ml-1" /> : <ArrowDownRight size={12} className="inline ml-1" />}
                      </p>
                      <p className="text-[9px] font-mono text-text-secondary opacity-40 tracking-widest uppercase">Son Hareket: {cari.lastTransaction}</p>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-purple-500/20 text-text-secondary hover:text-purple-400 rounded-xl transition-all"><Eye size={16} /></button>
                        <button className="p-2 hover:bg-blue-500/20 text-text-secondary hover:text-blue-400 rounded-xl transition-all"><Edit size={16} /></button>
                        <button className="p-2 hover:bg-rose-500/20 text-text-secondary hover:text-rose-400 rounded-xl transition-all"><Trash2 size={16} /></button>
                        <button className="p-2 hover:bg-white/10 text-text-secondary rounded-xl transition-all"><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-white/5">
          <p className="text-text-secondary text-[10px] font-mono uppercase tracking-[2px] opacity-40">
            {filteredCariler.length} kayıt içerisinden {(currentPage-1)*itemsPerPage+1}-{Math.min(currentPage*itemsPerPage, filteredCariler.length)} arası gösteriliyor
          </p>
          <div className="flex items-center gap-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={clsx(
                    "w-10 h-10 rounded-xl font-mono text-[10px] transition-all",
                    currentPage === i + 1 ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "bg-white/5 text-text-secondary hover:bg-white/10"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[40px] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 flex items-center justify-between group cursor-pointer hover:border-purple-500/40 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-tight italic">Toplu Mutabakat Başlat</h4>
              <p className="text-[10px] text-text-secondary font-mono uppercase tracking-widest opacity-40">Müşterilere bakiye bildirimlerini otomatik gönder</p>
            </div>
          </div>
          <ArrowRight size={24} className="text-purple-500 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
        </div>
        
        <div className="p-8 rounded-[40px] bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 flex items-center justify-between group cursor-pointer hover:border-blue-500/40 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <DollarSign size={28} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-tight italic">Risk Raporu Oluştur</h4>
              <p className="text-[10px] text-text-secondary font-mono uppercase tracking-widest opacity-40">Limit aşımı yapan carileri detaylı analiz et</p>
            </div>
          </div>
          <ArrowRight size={24} className="text-blue-500 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
        </div>
      </div>
    </div>
  );
};
