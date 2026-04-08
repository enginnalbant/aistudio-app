import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Package, 
  Users, 
  BarChart3, 
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  CheckCircle2,
  Box,
  Contact,
  FileText,
  Zap,
  Activity,
  Terminal,
  Calendar,
  CheckSquare,
  Bell,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  ShoppingCart,
  PieChart,
  PlaySquare,
  Newspaper,
  Library,
  GraduationCap,
  Video,
  Truck,
  Clock,
  MapPin,
  Settings,
  MoreHorizontal,
  Languages,
  MessageSquare,
  Files
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSettings } from '../context/SettingsContext';

interface SidebarProps {
  isOpen: boolean;
  activeModule: string;
  setActiveModule: (module: string) => void;
  closeSidebar?: () => void;
}

export const Sidebar = React.memo(function Sidebar({ isOpen, activeModule, setActiveModule, closeSidebar }: SidebarProps) {
  const { settings } = useSettings();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    jobs: true,
    stocks: false,
    accounts: false,
    'reports-menu': false,
    planning: false,
    shipment: false,
    others: false,
    purchasing: false,
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    {
      id: 'jobs',
      label: 'İşler',
      icon: <Briefcase size={18} />,
      subItems: [
        { id: 'jobs-dashboard', label: 'İşler Dashboard', icon: <LayoutDashboard size={14} /> },
        { id: 'jobs-open', label: 'Açık İşler', icon: <ListTodo size={14} /> },
        { id: 'jobs-all', label: 'Tüm İşler', icon: <CheckCircle2 size={14} /> },
      ]
    },
    {
      id: 'stocks',
      label: 'Stoklar',
      icon: <Box size={18} />,
      subItems: [
        { id: 'stocks-dashboard', label: 'Stok Dashboard', icon: <LayoutDashboard size={14} /> },
        { id: 'stocks-all', label: 'Tüm Stoklar', icon: <Box size={14} /> },
      ]
    },
    {
      id: 'accounts',
      label: 'Cariler',
      icon: <Users size={18} />,
      subItems: [
        { id: 'accounts-dashboard', label: 'Cari Dashboard', icon: <LayoutDashboard size={14} /> },
        { id: 'accounts-list', label: 'Cari Listesi', icon: <Contact size={14} /> },
        { id: 'accounts-reconciliation', label: 'Cari Mutabakat', icon: <FileText size={14} /> },
      ]
    },
    {
      id: 'reports-menu',
      label: 'Raporlar',
      icon: <BarChart3 size={18} />,
      subItems: [
        { id: 'reports', label: 'Genel Raporlar', icon: <BarChart3 size={14} /> },
      ]
    },
    {
      id: 'planning',
      label: 'Planlama',
      icon: <Calendar size={18} />,
      subItems: [
        { id: 'planner-dashboard', label: 'Planlama Dashboard', icon: <LayoutDashboard size={14} /> },
        { id: 'planner-daily', label: 'Ajanda', icon: <Calendar size={14} /> },
        { id: 'planner-tasks', label: 'Görevler', icon: <CheckSquare size={14} /> },
        { id: 'planner-notes', label: 'Notlar', icon: <FileText size={14} /> },
        { id: 'planner-reminders', label: 'Hatırlatıcılar', icon: <Bell size={14} /> },
      ]
    },
    {
      id: 'shipment',
      label: 'Sevkiyat Takip',
      icon: <Truck size={18} />,
      subItems: [
        { id: 'shipment-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
        { id: 'shipment-pending', label: 'Bekleyen sevkiyatlar', icon: <Clock size={14} /> },
        { id: 'shipment-transit', label: 'Yoldakiler', icon: <MapPin size={14} /> },
        { id: 'shipment-all', label: 'Tüm sevkiyatlar', icon: <Package size={14} /> },
        { id: 'shipment-reports', label: 'Raporlar', icon: <BarChart3 size={14} /> },
        { id: 'shipment-settings', label: 'Ayarlar', icon: <Settings size={14} /> },
      ]
    },
    {
      id: 'others',
      label: 'Diğer İşler',
      icon: <MoreHorizontal size={18} />,
      subItems: [
        { id: 'others-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
        { id: 'others-transliteration', label: 'Harf Çevirme', icon: <Terminal size={14} /> },
        { id: 'others-translation', label: 'Çeviri', icon: <Languages size={14} /> },
        { id: 'others-templates', label: 'Akıllı Şablon Motoru', icon: <MessageSquare size={14} /> },
        { id: 'others-answers', label: 'Cevaplar', icon: <MessageSquare size={14} /> },
        { id: 'others-documents', label: 'Belge ve dökümanlar', icon: <Files size={14} /> },
      ]
    },
    {
      id: 'purchasing',
      label: 'Satınalma Planlaması',
      icon: <ShoppingCart size={18} />,
      subItems: [
        { id: 'purchasing-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
        { id: 'purchasing-requests', label: 'Satınalma Talepleri', icon: <ListTodo size={14} /> },
        { id: 'purchasing-planning', label: 'Satınalma Planlaması', icon: <Calendar size={14} /> },
        { id: 'purchasing-quotes', label: 'Fiyat Teklifleri', icon: <FileText size={14} /> },
        { id: 'purchasing-orders', label: 'Verilen Siparişler', icon: <Truck size={14} /> },
        { id: 'purchasing-all', label: 'Tüm siparişler', icon: <Package size={14} /> },
        { id: 'purchasing-reports', label: 'Raporlar', icon: <BarChart3 size={14} /> },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-skel-space/60 backdrop-blur-md z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isOpen ? 280 : 96,
          x: typeof window !== 'undefined' && window.innerWidth < 1024 ? (isOpen ? 0 : -280) : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={clsx(
          "bento-card h-full flex flex-col shrink-0 relative overflow-hidden group/sidebar z-[101]",
          "fixed inset-y-0 left-0 lg:relative lg:inset-auto"
        )}
      >
        {/* Sidebar Ambient Glow */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-focus-neon/20 to-transparent" />

      <div className="h-24 flex items-center px-6 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-focus-main flex items-center justify-center shadow-[0_8px_20px_rgba(30,144,255,0.4)] group-hover/sidebar:rotate-12 transition-transform duration-700 shrink-0">
          <Zap className="text-pure-white" size={24} />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 flex flex-col justify-center"
            >
              <h1 className="text-2xl font-display font-black tracking-tighter text-text-primary leading-none">
                APEX<span className="text-focus-neon">OS</span>
              </h1>
              <div className="label-mono text-[8px] mt-1 opacity-50">Apex Core v4.2</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        <button
          onClick={() => setActiveModule('main-dashboard')}
          className={clsx(
            "w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-700 group relative overflow-hidden",
            activeModule === 'main-dashboard'
              ? "bg-focus-main/15 text-focus-neon border border-focus-neon/30 shadow-lg shadow-focus-neon/5"
              : "hover:bg-skel-matte/10 text-text-secondary hover:text-text-primary border border-transparent"
          )}
        >
          {activeModule === 'main-dashboard' && (
            <motion.div 
              layoutId="active-pill"
              className="absolute left-0 w-1.5 h-8 bg-focus-neon rounded-r-full shadow-[0_0_15px_rgba(112,161,255,0.8)]"
            />
          )}
          <span className="shrink-0 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center w-6">
            <LayoutDashboard size={20} />
          </span>
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-4 font-display font-black text-sm flex-1 text-left whitespace-nowrap overflow-hidden tracking-tight"
              >
                Merkezi Dashboard
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="h-px bg-skel-metal/15 my-6 mx-4" />

        {menuItems.map((menu) => (
          <div key={menu.id} className="space-y-1">
            <button
              onClick={() => {
                if (!isOpen) {
                  setActiveModule(menu.subItems[0].id);
                } else {
                  toggleMenu(menu.id);
                }
              }}
              className={clsx(
                "w-full flex items-center px-5 py-3 rounded-2xl transition-all duration-700 group",
                "hover:bg-skel-matte/10 text-text-secondary hover:text-text-primary border border-transparent"
              )}
            >
              <span className="shrink-0 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center w-6">
                {menu.icon}
              </span>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-4 font-display font-bold text-sm flex-1 text-left whitespace-nowrap overflow-hidden tracking-tight"
                  >
                    {menu.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isOpen && (
                <motion.span
                  animate={{ rotate: expandedMenus[menu.id] ? 90 : 0 }}
                  className="shrink-0 opacity-30 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={14} />
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {isOpen && expandedMenus[menu.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-12 pr-2 space-y-1"
                >
                  {menu.subItems.map((sub) => {
                    const isActive = activeModule === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveModule(sub.id)}
                        className={clsx(
                          "w-full flex items-center px-4 py-2.5 rounded-xl text-sm transition-all duration-700 relative group",
                          isActive 
                            ? "text-focus-neon font-black bg-focus-neon/10" 
                            : "text-skel-metal hover:text-skel-glass hover:bg-skel-matte/10"
                        )}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId={`active-sub-${menu.id}`}
                            className="absolute left-0 w-1 h-5 bg-focus-neon/50 rounded-r-full shadow-[0_0_10px_rgba(112,161,255,0.5)]"
                          />
                        )}
                        <span className="mr-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          {sub.icon}
                        </span>
                        <span className="whitespace-nowrap font-display font-bold tracking-tight">{sub.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      <div className="p-8 border-t border-skel-metal/15 shrink-0">
        <div className={clsx(
          "flex items-center gap-4 transition-all duration-700",
          !isOpen && "justify-center"
        )}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-focus-neon/20 to-ai-royal/20 p-[1px] shrink-0 group-hover/sidebar:scale-110 transition-transform shadow-lg">
            <div className="w-full h-full rounded-[15px] bg-skel-space overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Engin" 
                alt="User" 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="text-sm font-display font-black text-skel-glass truncate tracking-tight">{settings.user_name}</div>
                <div className="label-mono text-[9px] mt-0.5 opacity-60">{settings.user_dept}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
    </>
  );
});
