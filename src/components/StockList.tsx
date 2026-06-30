import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  History, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  X,
  CheckCircle2,
  Package,
  Box,
  Truck,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ArrowUpDown,
  FileText,
  PlusCircle,
  RotateCcw,
  RefreshCw,
  Archive,
  Download,
  ShoppingCart,
  User,
  Clock,
  ArrowRight,
  MoreVertical as MoreVerticalIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

/* --------------------------------- Types --------------------------------- */

interface StockItem {
  id: string;
  code: string;
  name: string;
  category: 'Hammadde' | 'Yarı Mamul' | 'Mamul' | 'Sarf Malzeme' | 'Ambalaj';
  unit: 'Adet' | 'Kg' | 'Metre' | 'Litre' | 'Paket';
  barcode: string;
  minQuantity: number;
  maxQuantity: number;
  currentQuantity: number;
  price: number;
  currency: 'TL' | 'USD' | 'EUR';
  warehouse: string;
  supplier: string;
  weight?: string;
  size?: string;
  shelfLife?: string;
  criticalAlert: boolean;
  notes?: string;
}

/* ------------------------------- Mock Data ------------------------------- */

const CATEGORIES = ['Hammadde', 'Yarı Mamul', 'Mamul', 'Sarf Malzeme', 'Ambalaj'] as const;
const UNITS = ['Adet', 'Kg', 'Metre', 'Litre', 'Paket'] as const;

const INITIAL_DATA: StockItem[] = [
  { id: '1', code: 'ST-001', name: 'Alüminyum Profil A1', category: 'Hammadde', unit: 'Metre', barcode: '8680001', minQuantity: 100, maxQuantity: 1000, currentQuantity: 450, price: 120, currency: 'TL', warehouse: 'Ana Depo', supplier: 'Metal Sanayi A.Ş.', criticalAlert: true },
  { id: '2', code: 'ST-002', name: 'Elektrik Motoru 1.5kW', category: 'Mamul', unit: 'Adet', barcode: '8680002', minQuantity: 10, maxQuantity: 50, currentQuantity: 8, price: 250, currency: 'USD', warehouse: 'Bölge Depo', supplier: 'Volt Motor', criticalAlert: true },
  { id: '3', code: 'ST-003', name: 'Sıvı Soğutma Kablosu', category: 'Yarı Mamul', unit: 'Metre', barcode: '8680003', minQuantity: 500, maxQuantity: 5000, currentQuantity: 2800, price: 15, currency: 'EUR', warehouse: 'Kablo Depo', supplier: 'Nexans', criticalAlert: false },
  { id: '4', code: 'ST-004', name: 'Yağlama Gres', category: 'Sarf Malzeme', unit: 'Kg', barcode: '8680004', minQuantity: 20, maxQuantity: 100, currentQuantity: 65, price: 85, currency: 'TL', warehouse: 'Sarf Depo', supplier: 'Shell', criticalAlert: false },
  { id: '5', code: 'ST-005', name: 'Karton Kutu 40x40', category: 'Ambalaj', unit: 'Adet', barcode: '8680005', minQuantity: 1000, maxQuantity: 10000, currentQuantity: 500, price: 2.5, currency: 'TL', warehouse: 'Ambalaj Depo', supplier: 'Oluklu Mukavva', criticalAlert: true },
  { id: '6', code: 'ST-006', name: 'Paslanmaz Vida M8', category: 'Hammadde', unit: 'Adet', barcode: '8680006', minQuantity: 5000, maxQuantity: 50000, currentQuantity: 12000, price: 0.45, currency: 'TL', warehouse: 'Vida Ambarı', supplier: 'Norm Cıvata', criticalAlert: false },
  { id: '7', code: 'ST-007', name: 'Elektronik Kart X-1', category: 'Yarı Mamul', unit: 'Adet', barcode: '8680007', minQuantity: 50, maxQuantity: 200, currentQuantity: 120, price: 45, currency: 'USD', warehouse: 'Elektronik Depo', supplier: 'PCB World', criticalAlert: false },
  { id: '8', code: 'ST-008', name: 'Hidrolik Yağ ISO 46', category: 'Sarf Malzeme', unit: 'Litre', barcode: '8680008', minQuantity: 200, maxQuantity: 2000, currentQuantity: 0, price: 40, currency: 'TL', warehouse: 'Sıvı Depo', supplier: 'Castrol', criticalAlert: true },
  { id: '9', code: 'ST-009', name: 'Plastik Kapak 60mm', category: 'Ambalaj', unit: 'Adet', barcode: '8680009', minQuantity: 5000, maxQuantity: 20000, currentQuantity: 18000, price: 0.15, currency: 'TL', warehouse: 'Ambalaj Depo', supplier: 'Plastik A.Ş.', criticalAlert: false },
  { id: '10', code: 'ST-010', name: 'Boya Beyaz 20kg', category: 'Hammadde', unit: 'Paket', barcode: '868010', minQuantity: 50, maxQuantity: 200, currentQuantity: 75, price: 1450, currency: 'TL', warehouse: 'Boya Depo', supplier: 'Dyo', criticalAlert: false },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Hammadde', value: 3, color: '#3b82f6' },
  { name: 'Yarı Mamul', value: 2, color: '#8b5cf6' },
  { name: 'Mamul', value: 1, color: '#06b6d4' },
  { name: 'Sarf Malzeme', value: 2, color: '#f59e0b' },
  { name: 'Ambalaj', value: 2, color: '#ec4899' },
];

const MOVEMENT_DATA = [
  { name: 'Pzt', in: 400, out: 240 },
  { name: 'Sal', in: 300, out: 139 },
  { name: 'Çar', in: 200, out: 980 },
  { name: 'Per', in: 278, out: 390 },
  { name: 'Cum', in: 189, out: 480 },
  { name: 'Cmt', in: 239, out: 380 },
  { name: 'Paz', in: 349, out: 430 },
];

/* ------------------------------- Components ------------------------------ */

const FloatingLabelInput = ({ label, value, onChange, type = "text", placeholder = " ", ...props }: any) => (
  <div className="relative group">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={clsx(
        "peer w-full bg-black/40 border border-white/10 rounded-2xl h-14 px-4 pt-4 text-white",
        "focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm",
        "placeholder-transparent"
      )}
      {...props}
    />
    <label className={clsx(
      "absolute left-4 top-1 text-[10px] uppercase tracking-widest text-text-secondary transition-all",
      "peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-blue-400"
    )}>
      {label}
    </label>
  </div>
);

const ToggleSwitch = ({ active, onToggle, label, sublabel }: any) => (
  <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5">
    <div>
      <h4 className="text-white font-bold text-sm">{label}</h4>
      <p className="text-text-secondary text-[10px] uppercase tracking-tighter">{sublabel}</p>
    </div>
    <div 
      onClick={onToggle}
      className={clsx(
        "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
        active ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-white/10"
      )}
    >
      <motion.div 
        animate={{ x: active ? 24 : 4 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
      />
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }: { title: string, onClose: () => void }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic">{title}</h2>
    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
      <X size={20} className="text-text-secondary" />
    </button>
  </div>
);

const StatCard = ({ title, value, icon, color, trend, onClick }: { title: string, value: string | number, icon: React.ReactNode, color: string, trend?: { value: string, up: boolean }, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -10, rotateX: 5, rotateY: 5, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="relative group perspective-1000 cursor-pointer"
  >
    <div className={clsx(
      "p-6 rounded-3xl bento-card border-skel-metal/10 bg-skel-space/40 backdrop-blur-xl relative overflow-hidden transition-all duration-500",
      "hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-white/20",
      "active:shadow-none"
    )}>
      {/* Glow Effect */}
      <div className={clsx(
        "absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity",
        color === 'blue' ? "bg-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.6)]" : 
        color === 'purple' ? "bg-purple-500 shadow-[0_0_50px_rgba(139,92,246,0.6)]" : 
        color === 'cyan' ? "bg-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.6)]" : 
        color === 'orange' ? "bg-orange-500 shadow-[0_0_50px_rgba(245,158,11,0.6)]" : 
        color === 'pink' ? "bg-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.6)]" : "bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.6)]"
      )} />

      <div className="flex justify-between items-start mb-4">
        <div className={clsx(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
          color === 'blue' ? "bg-blue-500/20 text-blue-400" : 
          color === 'purple' ? "bg-purple-500/20 text-purple-400" : 
          color === 'cyan' ? "bg-cyan-500/20 text-cyan-400" : 
          color === 'orange' ? "bg-orange-500/20 text-orange-400" : 
          color === 'pink' ? "bg-pink-500/20 text-pink-400" : "bg-emerald-500/20 text-emerald-400"
        )}>
          {icon}
        </div>
        {trend && (
          <div className={clsx(
            "flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full",
            trend.up ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          )}>
            {trend.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-text-secondary text-xs uppercase tracking-widest font-mono opacity-60">
          {title}
        </h3>
        <p className="text-3xl font-display font-black text-white tracking-tight">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const ReportModal = ({ isOpen, onClose, type, data }: { isOpen: boolean, onClose: () => void, type: string, data: any }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-skel-space/90 ring-1 ring-white/10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh] backdrop-blur-2xl"
      >
        <div className="p-8 border-b border-white/5 bg-white/2">
          <ModalHeader title={type} onClose={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-4">
            {data.length > 0 ? data.map((item: any, i: number) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="group flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  onClose();
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 text-text-secondary group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all")}>
                    {item.icon || <Package size={18} />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-tight">{item.label}</h4>
                    <p className="text-text-secondary text-[10px] uppercase tracking-widest opacity-60">{item.sublabel}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-white font-mono font-black text-sm">{item.value}</span>
                  {item.trend && (
                    <span className={clsx("text-[10px] font-mono", item.trend.up ? "text-emerald-400" : "text-rose-400")}>
                      {item.trend.value}
                    </span>
                  )}
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-20">
                <p className="text-text-secondary font-mono text-xs uppercase tracking-widest opacity-40">Veri bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const RowActions = ({ item, onAction }: { item: StockItem, onAction: (type: string, item: StockItem) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'edit', label: 'Düzelt', icon: <Edit2 size={14} />, color: 'blue' },
    { id: 'movement', label: 'Stok Hareketi', icon: <PlusCircle size={14} />, color: 'emerald' },
    { id: 'order', label: 'Sipariş Talebi', icon: <ShoppingCart size={14} />, color: 'cyan' },
    { id: 'count', label: 'Stok Sayımı', icon: <History size={14} />, color: 'purple' },
    { id: 'transfer', label: 'Depo Transfer', icon: <Truck size={14} />, color: 'orange' },
    { id: 'archive', label: 'Arşivle', icon: <Archive size={14} />, color: 'stone' },
    { id: 'delete', label: 'Sil', icon: <Trash2 size={14} />, color: 'rose' },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-2 rounded-xl transition-all",
          isOpen ? "bg-blue-500 text-white" : "hover:bg-white/5 text-text-secondary hover:text-white"
        )}
      >
        <MoreVerticalIcon size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[140]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10, x: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 top-12 w-56 bg-skel-space/95 backdrop-blur-2xl ring-1 ring-white/10 rounded-3xl shadow-2xl z-[150] overflow-hidden p-2"
            >
              <div className="space-y-1">
                {actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => {
                      onAction(action.id, item);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono uppercase tracking-widest transition-all",
                      "hover:bg-white/5 text-text-secondary hover:text-white"
                    )}
                  >
                    <div className={clsx(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                      action.color === 'blue' ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500" :
                      action.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
                      action.color === 'cyan' ? "bg-cyan-500/10 text-cyan-400" :
                      action.color === 'purple' ? "bg-purple-500/10 text-purple-400" :
                      action.color === 'orange' ? "bg-orange-500/10 text-orange-400" :
                      action.color === 'rose' ? "bg-rose-500/10 text-rose-400" : "bg-white/10 text-stone-400"
                    )}>
                      {action.icon}
                    </div>
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const BulkActionBar = ({ selectedCount, onAction, onClear }: { selectedCount: number, onAction: (type: string) => void, onClear: () => void }) => {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4"
    >
      <div className="bg-skel-space/80 backdrop-blur-3xl ring-1 ring-white/20 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-4 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-6 px-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              {selectedCount}
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">STOK SEÇİLDİ</span>
          </div>
          <button onClick={onClear} className="text-[10px] font-mono uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-all underline underline-offset-4">Seçimi Kaldır</button>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'order', label: 'Talebi Oluştur', icon: <ShoppingCart size={14} />, color: 'cyan' },
            { id: 'update', label: 'Güncelle', icon: <RefreshCw size={14} />, color: 'emerald' },
            { id: 'export', label: 'Excel (Seçilenler)', icon: <Download size={14} />, color: 'blue' },
            { id: 'delete', label: 'Tamamını Sil', icon: <Trash2 size={14} />, color: 'rose' },
          ].map(btn => (
            <button 
              key={btn.id}
              onClick={() => onAction(btn.id)}
              className={clsx(
                "flex items-center gap-2 px-6 h-12 rounded-2xl border transition-all text-[10px] font-mono uppercase tracking-widest",
                btn.color === 'cyan' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20" :
                btn.color === 'emerald' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" :
                btn.color === 'blue' ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20" :
                "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
              )}
            >
              {btn.icon}
              <span className="hidden lg:inline">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const OrderRequestWizard = ({ isOpen, onClose, items }: { isOpen: boolean, onClose: () => void, items: StockItem[] }) => {
  const [step, setStep] = useState(1);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-skel-space ring-1 ring-white/10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-3xl"
      >
        <div className="p-8 border-b border-white/5 bg-white/2">
          <ModalHeader title="Sipariş Talebi Oluştur" onClose={onClose} />
          <div className="flex gap-4 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={clsx("flex-1 h-1 rounded-full", step >= s ? "bg-cyan-500" : "bg-white/5")} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h4 className="text-white font-mono text-[10px] uppercase tracking-[0.2em] mb-4">Seçilen Ürünler ve Miktarlar</h4>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Package size={14} />
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold">{item.name}</p>
                          <p className="text-text-secondary text-[10px] font-mono">{item.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="number" defaultValue="100" className="w-20 bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-white text-xs" />
                        <span className="text-[10px] font-mono text-text-secondary">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <FloatingLabelInput label="Tedarikçi Seçimi" />
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <select className="w-full bg-black/40 border border-white/10 rounded-2xl h-14 px-4 pt-4 text-white focus:outline-none focus:border-cyan-500/50 appearance-none font-mono text-sm">
                      <option>Normal</option>
                      <option>Acil</option>
                      <option>Kritik</option>
                    </select>
                    <label className="absolute left-4 top-1 text-[10px] uppercase tracking-widest text-text-secondary">Aciliyet Seviyesi</label>
                  </div>
                  <FloatingLabelInput label="Talep Eden Birim" />
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center py-10">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase">TALEP HAZIR!</h3>
                <p className="text-text-secondary text-xs font-mono uppercase tracking-[0.2em] max-w-sm mx-auto">
                  {items.length} kalem ürün için satınalma talebi oluşturuldu. Onayınız ile departmana iletilecek.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-white/5 bg-black/50 flex justify-between gap-4">
          <button onClick={step === 1 ? onClose : () => setStep(s => s-1)} className="px-8 h-12 rounded-2xl bg-white/5 text-white text-xs font-mono uppercase tracking-widest">{step === 1 ? 'VAZGEÇ' : 'GERİ'}</button>
          <button onClick={step === 3 ? onClose : () => setStep(s => s+1)} className="px-10 h-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white text-xs font-mono font-black uppercase tracking-[0.2em]">{step === 3 ? 'GÖNDER' : 'İLERİ'}</button>
        </div>
      </motion.div>
    </div>
  );
};
const AddStockWizard = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (item: StockItem) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    code: 'ST-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    name: '',
    category: 'Hammadde',
    unit: 'Adet',
    barcode: '',
    min: 10,
    max: 1000,
    current: 100,
    price: 0,
    currency: 'TL',
    warehouse: '',
    supplier: '',
    critical: true,
    notes: ''
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const steps = [
    { id: 1, title: 'Temel Bilgiler', icon: <Package className="text-blue-400" /> },
    { id: 2, title: 'Envanter Detayı', icon: <Layers className="text-cyan-400" /> },
    { id: 3, title: 'Sonlandırma', icon: <CheckCircle2 className="text-emerald-400" /> }
  ];

  const handleSubmit = () => {
    if (step === 3) {
      onAdd({
        id: Math.random().toString(36).substring(2, 9),
        code: formData.code,
        name: formData.name || 'Yeni Envanter Kalemi',
        category: formData.category as any,
        unit: formData.unit as any,
        barcode: formData.barcode || Math.floor(1000000000000 + Math.random() * 9000000000000).toString(),
        minQuantity: formData.min,
        maxQuantity: formData.max,
        currentQuantity: formData.current,
        price: formData.price,
        currency: formData.currency as any,
        warehouse: formData.warehouse || 'Ana Depo',
        supplier: formData.supplier || 'Genel Tedarikçi',
        criticalAlert: formData.current < formData.min,
        notes: formData.notes
      });
      onClose();
    } else {
      nextStep();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={clsx(
          "w-full max-w-2xl bg-gradient-to-b from-skel-space to-black/95",
          "ring-1 ring-white/10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]",
          "backdrop-blur-2xl"
        )}
      >
        {/* Step Indicator Section */}
        <div className="p-8 border-b border-white/5 relative bg-white/2">
          <ModalHeader title="Yeni Stok Ekleme Sihirbazı" onClose={onClose} />
          
          <div className="relative mt-8">
            {/* Progress Bar Background */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-1 bg-white/5 rounded-full" />
            
            {/* Active Progress Bar */}
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 left-4 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-full z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              initial={{ width: '0%' }}
              animate={{ width: `${(step - 1) * 50}%` }}
              transition={{ duration: 0.5 }}
            />

            <div className="relative z-20 flex justify-between items-center px-4">
              {steps.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                    step === s.id ? "bg-blue-500 text-white ring-8 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : 
                    step > s.id ? "bg-emerald-500 text-white" : "bg-black/60 border border-white/10 text-text-secondary"
                  )}>
                    {step > s.id ? <Check size={20} /> : s.id}
                  </div>
                  <span className={clsx(
                    "text-[10px] font-mono uppercase tracking-widest",
                    step === s.id ? "text-blue-400 font-black" : "text-text-secondary opacity-60"
                  )}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  {steps[step - 1].icon}
                </div>
                <div>
                  <h3 className="text-white font-display font-black text-lg uppercase tracking-tighter italic">Adım {step}: {steps[step - 1].title}</h3>
                  <p className="text-text-secondary text-xs opacity-60 uppercase tracking-widest">Lütfen aşağıdaki alanları eksiksiz doldurun.</p>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FloatingLabelInput 
                      label="Stok Kodu" 
                      value={formData.code} 
                      onChange={(e: any) => setFormData({...formData, code: e.target.value})} 
                    />
                    <FloatingLabelInput 
                      label="Barkod / QR" 
                      placeholder="Barkod tara..." 
                      value={formData.barcode}
                      onChange={(e: any) => setFormData({...formData, barcode: e.target.value})}
                    />
                  </div>
                  <FloatingLabelInput 
                    label="Stok Adı / Tanımı" 
                    value={formData.name}
                    onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative">
                      <select 
                        value={formData.category} 
                        onChange={(e: any) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl h-14 px-4 pt-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-mono text-sm"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <label className="absolute left-4 top-1 text-[10px] uppercase tracking-widest text-text-secondary">Kategori</label>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
                    </div>
                    <div className="relative">
                      <select 
                        value={formData.unit} 
                        onChange={(e: any) => setFormData({...formData, unit: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl h-14 px-4 pt-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-mono text-sm"
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <label className="absolute left-4 top-1 text-[10px] uppercase tracking-widest text-text-secondary">Birim</label>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <FloatingLabelInput 
                      label="Mevcut Miktar" 
                      type="number" 
                      value={formData.current}
                      onChange={(e: any) => setFormData({...formData, current: Number(e.target.value)})}
                    />
                    <FloatingLabelInput 
                      label="Min. Seviye" 
                      type="number" 
                      value={formData.min}
                      onChange={(e: any) => setFormData({...formData, min: Number(e.target.value)})}
                    />
                    <FloatingLabelInput 
                      label="Max. Seviye" 
                      type="number" 
                      value={formData.max}
                      onChange={(e: any) => setFormData({...formData, max: Number(e.target.value)})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <FloatingLabelInput 
                      label="Birim Fiyat" 
                      type="number" 
                      value={formData.price}
                      onChange={(e: any) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                    <div className="relative">
                      <select 
                        value={formData.currency}
                        onChange={(e: any) => setFormData({...formData, currency: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl h-14 px-4 pt-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-mono text-sm"
                      >
                        <option value="TL">Türk Lirası (₺)</option>
                        <option value="USD">Dolar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                      <label className="absolute left-4 top-1 text-[10px] uppercase tracking-widest text-text-secondary">Para Birimi</label>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
                    </div>
                  </div>
                  <FloatingLabelInput 
                    label="Depo / Raf Adresi" 
                    value={formData.warehouse}
                    onChange={(e: any) => setFormData({...formData, warehouse: e.target.value})}
                  />
                  <FloatingLabelInput 
                    label="Tedarikçi Firma" 
                    value={formData.supplier}
                    onChange={(e: any) => setFormData({...formData, supplier: e.target.value})}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <ToggleSwitch 
                    active={formData.critical} 
                    onToggle={() => setFormData({...formData, critical: !formData.critical})}
                    label="Kritik Stok Takibi"
                    sublabel="Miktar Kritik Seviyenin Altına Düştüğünde Sistem Uyarı Verir"
                  />
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] ml-2">Görsel Yükle / Drag-Drop</label>
                    <div className="h-40 rounded-[32px] border-2 border-dashed border-white/10 bg-white/2 hover:bg-white/5 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary group-hover:text-blue-400 group-hover:scale-110 transition-all">
                        <PlusCircle size={32} strokeWidth={1} />
                      </div>
                      <span className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary">Fotoğraf Seçin veya Buraya Sürükleyin</span>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea 
                      className="peer w-full bg-black/40 border border-white/10 rounded-3xl p-6 pt-10 text-white focus:outline-none focus:border-emerald-500/50 transition-all min-h-[160px] font-mono text-xs"
                      placeholder=" "
                      value={formData.notes}
                      onChange={(e: any) => setFormData({...formData, notes: e.target.value})}
                    />
                    <label className="absolute left-6 top-4 text-[10px] uppercase tracking-widest text-text-secondary">Ek Notlar & Açıklama</label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-8 border-t border-white/5 bg-black/50 backdrop-blur-xl flex justify-between items-center">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={clsx(
              "px-10 h-14 rounded-2xl font-display font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-2",
              step === 1 ? "opacity-30 cursor-not-allowed text-stone-500" : "bg-white/5 text-white hover:bg-white/10 hover:shadow-lg"
            )}
          >
            <ChevronLeft size={16} /> Geri
          </button>
          
          <button 
            onClick={handleSubmit}
            className="px-12 h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white font-display font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all flex items-center gap-4 group"
          >
            {step === 3 ? 'SİSTEMİ GÜNCELLE' : 'SONRAKİ ADIM'}
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export function StockList() {
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useLocalStorage<StockItem[]>('stock_items_list', INITIAL_DATA);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [reportState, setReportState] = useState<{isOpen: boolean, type: string, data: any}>({ isOpen: false, type: '', data: [] });
  const [isBulkOrderOpen, setIsBulkOrderOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'zero'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockItem, direction: 'asc' | 'desc' } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const scrollToItem = (id: string) => {
    setHighlightedId(id);
    const element = document.getElementById(`stock-row-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightedId(null), 3000);
    }
  };

  const getReportData = (type: string) => {
    switch(type) {
      case 'TOPLAM STOK ÇEŞİDİ':
        return CATEGORY_DISTRIBUTION.map(c => ({
          label: c.name,
          sublabel: 'Envanterdeki ürün çeşidi',
          value: c.value,
          icon: <Box size={18} className="text-blue-400" />
        }));
      case 'TOPLAM STOK DEĞERİ':
        return items.slice(0, 5).map(item => ({
          label: item.name,
          sublabel: item.code,
          value: `${item.price} ${item.currency}`,
          icon: <DollarSign size={18} className="text-purple-400" />
        }));
      case 'KRİTİK SEVİYE':
        return items.filter(i => i.criticalAlert).map(item => ({
          label: item.name,
          sublabel: 'Minimum stok seviyesi altında',
          value: `${item.currentQuantity} / ${item.minQuantity}`,
          icon: <AlertTriangle size={18} className="text-orange-400" />,
          onClick: () => scrollToItem(item.id)
        }));
      case 'STOKTA OLMAYANLAR':
        return items.filter(i => i.currentQuantity === 0).map(item => ({
          label: item.name,
          sublabel: 'Tedarik süreci bekleniyor',
          value: '0 STOK',
          icon: <Package size={18} className="text-pink-400" />,
          onClick: () => scrollToItem(item.id)
        }));
      case 'BUGÜN HAREKET':
        return items.slice(0, 3).map(item => ({
          label: item.name,
          sublabel: 'Depo Çıkışı - 14:20',
          value: '-12 Adet',
          icon: <History size={18} className="text-cyan-400" />
        }));
      case 'BU AY EKLENEN':
        return items.slice().reverse().slice(0, 4).map(item => ({
          label: item.name,
          sublabel: 'Hammadde Girişi',
          value: '+200',
          icon: <CheckCircle2 size={18} className="text-emerald-400" />
        }));
      default: return [];
    }
  };

  const stats = [
    { title: "TOPLAM STOK ÇEŞİDİ", value: "12,450", icon: <Layers size={24} />, color: "blue", trend: { value: "+12%", up: true } },
    { title: "TOPLAM STOK DEĞERİ", value: "₺2.4M", icon: <DollarSign size={24} />, color: "purple", trend: { value: "+4%", up: true } },
    { title: "KRİTİK SEVİYE", value: "42", icon: <AlertTriangle size={24} />, color: "orange", trend: { value: "-15%", up: false } },
    { title: "BUGÜN HAREKET", value: "156", icon: <History size={24} />, color: "cyan" },
    { title: "STOKTA OLMAYANLAR", value: "12", icon: <Truck size={24} />, color: "pink" },
    { title: "BU AY EKLENEN", value: "84", icon: <CheckCircle2 size={24} />, color: "emerald" },
  ];

  const handleStatClick = (stat: any) => {
    setReportState({
      isOpen: true,
      type: stat.title,
      data: getReportData(stat.title)
    });
  };

  const filteredData = useMemo(() => {
    let data = [...items];

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.name || '').toLowerCase().includes(lowSearch) || 
        (item.code || '').toLowerCase().includes(lowSearch) || 
        (item.barcode || '').includes(lowSearch)
      );
    }

    if (activeTab === 'critical') {
      data = data.filter(item => item.criticalAlert);
    } else if (activeTab === 'zero') {
      data = data.filter(item => item.currentQuantity === 0);
    }

    if (sortConfig) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key]!;
        const bVal = b[sortConfig.key]!;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [searchTerm, activeTab, sortConfig]);

  const toggleSort = (key: keyof StockItem) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredData.map(i => i.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-20 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Box size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter italic">Stok Listesi</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-text-secondary text-sm font-mono uppercase tracking-widest opacity-60">Sistem Çevrimiçi • Envanter v2.4.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Stok ara (isim, kod, barkod)..."
              className="h-14 w-80 bento-card bg-skel-space/40 backdrop-blur-xl border-skel-metal/10 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
            />
          </div>
          
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all flex items-center gap-4 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            YENİ STOK OLUŞTUR
          </button>
        </div>
      </div>

      {/* Stats Cards Grid - 3D Hover Effects */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} onClick={() => handleStatClick(stat)} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-8 rounded-[40px] bento-card border-skel-metal/10 bg-skel-space/30 backdrop-blur-xl">
          <h3 className="text-text-secondary text-xs font-mono uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
            <TrendingUp size={16} className="text-blue-400" />
            KATEGORİ DAĞILIMI
          </h3>
          <div className="h-[280px]">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {CATEGORY_DISTRIBUTION.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] text-text-secondary uppercase font-mono">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-8 rounded-[40px] bento-card border-skel-metal/10 bg-skel-space/30 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-text-secondary text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-3">
              <History size={16} className="text-purple-400" />
              SON 7 GÜN STOK HAREKETİ
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/50 border border-blue-400" />
                <span className="text-[10px] text-text-secondary uppercase font-mono">Giriş</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500/50 border border-purple-400" />
                <span className="text-[10px] text-text-secondary uppercase font-mono">Çıkış</span>
              </div>
            </div>
          </div>
          <div className="h-[320px]">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOVEMENT_DATA}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                  />
                  <Area type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                  <Area type="monotone" dataKey="out" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Modern Table Section */}
      <div className="flex flex-col gap-6">
        {/* Table Tabs/Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('all')}
              className={clsx(
                "px-6 h-10 rounded-xl text-xs font-mono uppercase tracking-widest transition-all",
                activeTab === 'all' ? "bg-white/10 text-white shadow-xl" : "text-text-secondary hover:text-white"
              )}
            >
              Tüm Stoklar
            </button>
            <button 
              onClick={() => setActiveTab('critical')}
              className={clsx(
                "px-6 h-10 rounded-xl text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'critical' ? "bg-orange-500/20 text-orange-400 shadow-xl border border-orange-500/30" : "text-text-secondary hover:text-white"
              )}
            >
              {activeTab === 'critical' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
              Kritik Seviye
            </button>
            <button 
              onClick={() => setActiveTab('zero')}
              className={clsx(
                "px-6 h-10 rounded-xl text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'zero' ? "bg-rose-500/20 text-rose-400 shadow-xl border border-rose-500/30" : "text-text-secondary hover:text-white"
              )}
            >
              {activeTab === 'zero' && <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
              Tükenenler
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-widest">
              <Filter size={16} />
              GELİŞMİŞ FİLTRE
            </button>
            <button className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-widest">
              <ArrowDownRight size={16} />
              DIŞA AKTAR (XLSX)
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="rounded-[40px] bento-card border-skel-metal/10 bg-skel-space/30 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded-md border-white/20 bg-transparent focus:ring-blue-500 checked:bg-blue-500 cursor-pointer" 
                      onChange={toggleSelectAll}
                      checked={selectedItems.size === filteredData.length && filteredData.length > 0}
                    />
                  </th>
                  <th className="px-6 py-6" onClick={() => toggleSort('code')}>
                    <div className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">Stok Kodu</span>
                      <ArrowUpDown size={12} className="text-text-secondary/30" />
                    </div>
                  </th>
                  <th className="px-6 py-6" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">Stok Adı</span>
                      <ArrowUpDown size={12} className="text-text-secondary/30" />
                    </div>
                  </th>
                  <th className="px-6 py-6">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Kategori</span>
                  </th>
                  <th className="px-6 py-6 text-right">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Birim</span>
                  </th>
                  <th className="px-6 py-6 text-right" onClick={() => toggleSort('currentQuantity')}>
                    <div className="flex items-center justify-end gap-2 cursor-pointer group">
                      <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">Mevcut</span>
                      <ArrowUpDown size={12} className="text-text-secondary/30" />
                    </div>
                  </th>
                  <th className="px-6 py-6 text-right">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Değer</span>
                  </th>
                  <th className="px-6 py-6 text-center">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Durum</span>
                  </th>
                  <th className="px-8 py-6 text-right">
                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((item, idx) => (
                  <tr 
                    key={item.id}
                    id={`stock-row-${item.id}`}
                    className={clsx(
                      "group transition-all hover:bg-white/[0.02]",
                      selectedItems.has(item.id) && "bg-blue-500/[0.03]",
                      highlightedId === item.id && "bg-blue-500/20 ring-2 ring-blue-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10"
                    )}
                  >
                    <td className="px-8 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded-md border-white/20 bg-transparent focus:ring-blue-500"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-blue-400">{item.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-display font-medium text-white group-hover:text-blue-200 transition-colors">{item.name}</span>
                        <span className="text-[10px] font-mono text-text-secondary opacity-50 uppercase tracking-tighter">{item.barcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={clsx(
                        "inline-flex px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border",
                        item.category === 'Hammadde' ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                        item.category === 'Mamul' ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" :
                        item.category === 'Yarı Mamul' ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
                        item.category === 'Sarf Malzeme' ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                        "text-pink-400 bg-pink-500/10 border-pink-500/20"
                      )}>
                        {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-mono text-text-secondary">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={clsx(
                        "text-sm font-display font-black",
                        item.currentQuantity === 0 ? "text-rose-500" :
                        item.currentQuantity <= item.minQuantity ? "text-orange-400" : "text-emerald-400"
                      )}>
                        {item.currentQuantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-mono font-medium text-white">
                        {item.price.toLocaleString()} {item.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.currentQuantity === 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-mono uppercase font-black">
                          <Truck size={10} />
                          STOK YOK
                        </div>
                      ) : item.currentQuantity <= item.minQuantity ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono uppercase font-black">
                         <AlertTriangle size={10} />
                          KRİTİK
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-black">
                          <CheckCircle2 size={10} />
                          NORMAL
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <RowActions 
                        item={item} 
                        onAction={(type, itm) => {
                          if (type === 'order') setIsBulkOrderOpen(true);
                          if (type === 'delete') {
                            if (confirm(`${itm.name} ürününü silmek istediğinize emin misiniz?`)) {
                              setItems(prev => prev.filter(i => i.id !== itm.id));
                            }
                          }
                          console.log('Action:', type, itm.code);
                        }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
              GÖSTERİLEN: <span className="text-white">1-{filteredData.length}</span> / {filteredData.length} KAYIT
            </p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-all">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                <button className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs">1</button>
                <button className="w-10 h-10 rounded-xl bg-white/5 text-text-secondary flex items-center justify-center font-bold text-xs hover:bg-white/10">2</button>
                <button className="w-10 h-10 rounded-xl bg-white/5 text-text-secondary flex items-center justify-center font-bold text-xs hover:bg-white/10">3</button>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isWizardOpen && (
          <AddStockWizard 
            isOpen={isWizardOpen} 
            onClose={() => setIsWizardOpen(false)} 
            onAdd={(newItem) => {
              setItems(prev => [newItem, ...prev]);
            }}
          />
        )}
        {reportState.isOpen && (
          <ReportModal 
            isOpen={reportState.isOpen} 
            onClose={() => setReportState(s => ({...s, isOpen: false}))} 
            type={reportState.type} 
            data={reportState.data} 
          />
        )}
        {selectedItems.size > 0 && (
          <BulkActionBar 
            selectedCount={selectedItems.size} 
            onClear={() => setSelectedItems(new Set())}
            onAction={(type) => {
              if (type === 'order') setIsBulkOrderOpen(true);
              if (type === 'delete') {
                if (confirm('Seçilen tüm ürünleri silmek istediğinize emin misiniz?')) {
                  setItems(prev => prev.filter(i => !selectedItems.has(i.id)));
                  setSelectedItems(new Set());
                }
              }
            }}
          />
        )}
        {isBulkOrderOpen && (
          <OrderRequestWizard 
            isOpen={isBulkOrderOpen} 
            onClose={() => setIsBulkOrderOpen(false)} 
            items={items.filter(i => selectedItems.has(i.id))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default StockList;
