"use client";

import React, { useState } from "react";
import { 
  Zap,
  LayoutDashboard,
  Settings as SettingsIcon,
  ChevronDown,
  Search,
  LogOut,
  ShoppingCart,
  ClipboardList,
  FileSearch,
  Clock,
  CheckCircle2,
  Package,
  FileBarChart,
  LineChart,
  FileText,
  Wrench,
  Factory,
  Box,
  Users,
  Scale,
  NotebookPen,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  ShoppingBag,
  BarChart3,
  BookText,
  CheckSquare,
  Bell,
  Bookmark,
  Network,
  Library,
  BookOpen,
  Settings2,
  Languages,
  Image as ImageIcon,
  Rss,
  PlaySquare,
  CalendarDays
} from "lucide-react";
import { SidebarSettingsModal } from '../SidebarSettingsModal';
import { clsx } from "clsx";

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Brand / Logos ----------------------------- */

function ApexLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-focus-main flex items-center justify-center shadow-lg shadow-focus-main/20 shrink-0">
        <Zap size={14} className="text-pure-white" />
      </div>
      <span className="text-lg font-display font-black tracking-tighter text-text-primary whitespace-nowrap">
        APEX<span className="text-focus-neon">OS</span>
      </span>
    </div>
  );
}

function BrandBadge({ onClick }: { onClick?: () => void }) {
  return (
    <div className="relative shrink-0 w-full mb-4">
      <div 
        className="flex items-center p-1 w-full cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        <ApexLogo />
      </div>
    </div>
  );
}

/* --------------------------------- Avatar -------------------------------- */

function AvatarCircle() {
  return (
    <div className="relative rounded-full shrink-0 size-8 bg-skel-matte/20 overflow-hidden border border-skel-metal/10">
      <img 
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Apex" 
        alt="User" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

/* ------------------------------ Search Input ----------------------------- */

function SearchContainer({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div
      className={clsx(
        "relative shrink-0 transition-all duration-500 mb-4",
        isCollapsed ? "w-full flex justify-center" : "w-full"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={clsx(
          "bg-skel-matte/10 h-10 relative rounded-xl flex items-center transition-all duration-500 border border-skel-metal/10",
          isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
        )}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div
          className={clsx(
            "flex items-center justify-center shrink-0 transition-all duration-500",
            isCollapsed ? "p-1" : "px-3"
          )}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <Search size={16} className="text-text-secondary" />
        </div>

        {!isCollapsed && (
          <input
            type="text"
            placeholder="Ara..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none font-display font-bold text-[13px] text-text-primary placeholder:text-text-secondary/40"
          />
        )}
      </div>
    </div>
  );
}

/* --------------------------- Types / Content Map -------------------------- */

interface MenuItemT {
  icon?: React.ReactNode;
  label: string;
  hasDropdown?: boolean;
  isActive?: boolean;
  children?: MenuItemT[];
  id?: string;
  moduleId?: string;
}
interface MenuSectionT {
  title: string;
  items: MenuItemT[];
}
interface SidebarContent {
  title: string;
  sections: MenuSectionT[];
}

function getSidebarContent(activeSection: string): SidebarContent {
  const contentMap: Record<string, SidebarContent> = {
    dashboard: {
      title: "Dashboard",
      sections: [
        {
          title: "Sistem",
          items: [
            { id: 'main-dashboard', icon: <LayoutDashboard size={16} />, label: "Genel Bakış", isActive: true },
          ],
        },
      ],
    },
    purchasing: {
      title: "Satınalma",
      sections: [
        {
          title: "Süreç Yönetimi",
          items: [
            { id: 'purchasing-requests', icon: <ClipboardList size={16} />, label: "Satınalma Talepleri" },
            { id: 'purchasing-lists', icon: <FileSearch size={16} />, label: "Satınalma Listeleri" },
            { id: 'purchasing-quotes', icon: <FileText size={16} />, label: "Fiyat Teklifleri" },
            { id: 'purchasing-pending-orders', icon: <Clock size={16} />, label: "Onay Bekleyen Siparişler" },
            { id: 'purchasing-sent-orders', icon: <CheckCircle2 size={16} />, label: "Verilen Siparişler" },
            { id: 'purchasing-all-orders', icon: <Package size={16} />, label: "Tüm Siparişler" },
            { id: 'purchasing-reports', icon: <FileBarChart size={16} />, label: "Raporlar" },
            { id: 'purchasing-analytics', icon: <LineChart size={16} />, label: "Analizler" },
          ],
        },
      ],
    },
    fason: {
      title: "Fason İşler",
      sections: [
        {
          title: "Üretim Takibi",
          items: [
            { id: 'fason-dashboard', icon: <LayoutDashboard size={16} />, label: "Dashboard" },
            { id: 'fason-outgoing', icon: <ClipboardList size={16} />, label: "Giden İşler" },
            { id: 'fason-all', icon: <Package size={16} />, label: "Tüm İşler" },
            { id: 'fason-reports', icon: <FileBarChart size={16} />, label: "Raporlar" },
            { id: 'fason-analytics', icon: <LineChart size={16} />, label: "Analizler" },
          ],
        },
      ],
    },
    stocks: {
      title: "Stoklar",
      sections: [
        {
          title: "Envanter Yönetimi",
          items: [
            { id: 'stocks-dashboard', icon: <LayoutDashboard size={16} />, label: "Dashboard" },
            { id: 'stocks-list', icon: <Box size={16} />, label: "Stok Listesi" },
            { id: 'stocks-reports', icon: <FileBarChart size={16} />, label: "Stok Raporlar" },
            { id: 'stocks-analytics', icon: <LineChart size={16} />, label: "Stok Analizler" },
          ],
        },
      ],
    },
    contacts: {
      title: "Cariler",
      sections: [
        {
          title: "Portföy Yönetimi",
          items: [
            { id: 'contacts-dashboard', icon: <LayoutDashboard size={16} />, label: "Dashboard" },
            { id: 'contacts-list', icon: <Users size={16} />, label: "Cari Listesi" },
            { id: 'contacts-reports', icon: <FileBarChart size={16} />, label: "Cari Raporlar" },
            { id: 'contacts-analytics', icon: <LineChart size={16} />, label: "Cari Analizler" },
          ],
        },
      ],
    },
    recon: {
      title: "Mutabakat",
      sections: [
        {
          title: "Finansal Kontrol",
          items: [
            { id: 'recon-dashboard', icon: <LayoutDashboard size={16} />, label: "Dashboard" },
            { id: 'recon-contacts', icon: <Scale size={16} />, label: "Cari Mutabakat" },
            { id: 'recon-reports', icon: <FileBarChart size={16} />, label: "Raporlar" },
            { id: 'recon-analytics', icon: <LineChart size={16} />, label: "Analizler" },
          ],
        },
      ],
    },
    notes: {
      title: "Notlar",
      sections: [
        {
          title: "Kişisel Alan",
          items: [
            { id: 'notes-dashboard', icon: <LayoutDashboard size={16} />, label: "Dashboard" },
            { id: 'notes-list', icon: <NotebookPen size={16} />, label: "Notlar" },
            { id: 'notes-todo', icon: <CheckCircle2 size={16} />, label: "Todolist" },
            { id: 'notes-planner', icon: <Clock size={16} />, label: "Planlayıcı" },
            { id: 'notes-docs', icon: <FileText size={16} />, label: "Dokümanlar" },
          ],
        },
      ],
    },
    finance: {
      title: "Kişisel Finans",
      sections: [
        {
          title: "Yönetim",
          items: [
            { id: 'finance-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'finance-dashboard' },
            { id: 'finance-incomes', icon: <TrendingUp size={16} />, label: 'Gelirlerim', moduleId: 'finance-incomes' },
            { id: 'finance-expenses', icon: <TrendingDown size={16} />, label: 'Giderlerim', moduleId: 'finance-expenses' },
            { id: 'finance-subscriptions', icon: <CreditCard size={16} />, label: 'Abonelik ve Borçlarım', moduleId: 'finance-subscriptions' },
            { id: 'finance-investments', icon: <PiggyBank size={16} />, label: 'Yatırım ve Birikimlerim', moduleId: 'finance-investments' },
            { id: 'finance-purchasing', icon: <ShoppingBag size={16} />, label: 'Satınalma Planlamam', moduleId: 'finance-purchasing' },
            { id: 'finance-analytics', icon: <BarChart3 size={16} />, label: 'Analizler', moduleId: 'finance-analytics' },
            { id: 'finance-reports', icon: <FileText size={16} />, label: 'Raporlar', moduleId: 'finance-reports' },
          ],
        },
      ],
    },
    notebook: {
      title: "Notebook",
      sections: [
        {
          title: "Yönetim",
          items: [
            { id: 'notebook-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'notebook-dashboard' },
            { id: 'notebook-notes', icon: <BookText size={16} />, label: 'Notlarım', moduleId: 'notebook-notes' },
            { id: 'notebook-todo', icon: <CheckSquare size={16} />, label: 'TODO', moduleId: 'notebook-todo' },
            { id: 'notebook-reminders', icon: <Bell size={16} />, label: 'Hatırlatıcı/Bildirim', moduleId: 'notebook-reminders' },
            { id: 'notebook-bookmarks', icon: <Bookmark size={16} />, label: 'Bookmarks', moduleId: 'notebook-bookmarks' },
            { id: 'notebook-graph', icon: <Network size={16} />, label: 'Graph', moduleId: 'notebook-graph' },
          ],
        },
      ],
    },
    library: {
      title: "Kütüphane",
      sections: [
        {
          title: "Yönetim",
          items: [
            { id: 'library-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'library-dashboard' },
          ]
        },
        {
          title: "E-Kitap",
          items: [
            { id: 'ebook-dashboard', icon: <BookOpen size={16} />, label: 'E-Kitap Dashboard', moduleId: 'ebook-dashboard' },
            { id: 'ebooks', icon: <Library size={16} />, label: 'E-Kitaplar', moduleId: 'ebooks' },
            { id: 'ebook-panel', icon: <Settings2 size={16} />, label: 'E-Kitap Paneli', moduleId: 'ebook-panel' },
            { id: 'ebook-translate', icon: <Languages size={16} />, label: 'E-Kitap Translate', moduleId: 'ebook-translate' },
          ]
        },
        {
          title: "Manga",
          items: [
            { id: 'manga-dashboard', icon: <ImageIcon size={16} />, label: 'Manga Dashboard', moduleId: 'manga-dashboard' },
            { id: 'mangas', icon: <Library size={16} />, label: 'Mangalar', moduleId: 'mangas' },
            { id: 'manga-panel', icon: <Settings2 size={16} />, label: 'Manga Paneli', moduleId: 'manga-panel' },
            { id: 'manga-translate', icon: <Languages size={16} />, label: 'Manga Translate', moduleId: 'manga-translate' },
          ]
        }
      ]
    },
    media: {
      title: "Medya",
      sections: [
        {
          title: "Yönetim",
          items: [
            { id: 'media-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'media-dashboard' },
            { id: 'media-rss', icon: <Rss size={16} />, label: 'Rss Reader', moduleId: 'media-rss' },
          ]
        }
      ]
    },
    planning: {
      title: "Planlama",
      sections: [
        {
          title: "Yönetim",
          items: [
            { id: 'planning-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'planning-dashboard' },
            { id: 'planning-scheduler', icon: <CalendarDays size={16} />, label: 'Planlayıcı', moduleId: 'planning-scheduler' },
          ]
        }
      ]
    }
  };

  return contentMap[activeSection] || contentMap.dashboard;
}

/* ---------------------------- Left Icon Nav Rail -------------------------- */

function IconNavButton({
  children,
  isActive = false,
  onClick,
  label
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={clsx(
        "flex items-center justify-center rounded-xl size-10 min-w-10 transition-all duration-500 border relative group",
        isActive 
          ? "bg-focus-neon/10 text-focus-neon border-focus-neon/30 shadow-lg shadow-focus-neon/5" 
          : "hover:bg-skel-matte/10 text-text-secondary hover:text-text-primary border-transparent"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
      onClick={onClick}
      title={label}
    >
      {children}
      {isActive && (
        <div className="absolute left-0 w-1 h-4 bg-focus-neon rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
      )}
    </button>
  );
}

function IconNavigation({
  activeSection,
  onSectionChange,
  setActiveModule,
  setIsSettingsOpen,
  setSidebarOpen
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  setActiveModule: (mod: string) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setSidebarOpen?: (open: boolean) => void;
}) {
  const navItems = [
    { id: "finance", icon: <Wallet size={18} />, label: "Kişisel Finans", moduleId: 'finance-dashboard' },
    { id: "notebook", icon: <BookText size={18} />, label: "Notebook", moduleId: 'notebook-dashboard' },
    { id: "library", icon: <Library size={18} />, label: "Kütüphane", moduleId: 'library-dashboard' },
    { id: "media", icon: <PlaySquare size={18} />, label: "Medya", moduleId: 'media-dashboard' },
    { id: "planning", icon: <CalendarDays size={18} />, label: "Planlama", moduleId: 'planning-dashboard' },
  ];

  const handleSectionClick = (item: any) => {
    onSectionChange(item.id);
    setSidebarOpen?.(true);
    if (item.moduleId) {
      setActiveModule(item.moduleId);
    }
  };

  return (
    <aside className="bg-white/[0.03] backdrop-blur-3xl flex flex-col gap-2 items-center p-2 w-14 h-full border border-white/10 rounded-2xl shadow-[10px_0_40px_rgba(0,0,0,0.2)]">
      {/* Logo Icon Only */}
      <div 
        className="mb-3 size-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        onClick={() => {
          onSectionChange('dashboard');
          setActiveModule('main-dashboard');
        }}
      >
        <div className="w-7 h-7 rounded-lg bg-focus-main flex items-center justify-center shadow-lg shadow-focus-main/20">
          <Zap size={14} className="text-pure-white" />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => handleSectionClick(item)}
            label={item.label}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>

      <div className="flex-1" />

      {/* Bottom section */}
      <div className="flex flex-col gap-2 w-full items-center">
        <div className="size-8 cursor-pointer" onClick={() => (window as any).openSettingsModal?.()}>
          <AvatarCircle />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------ Right Sidebar ----------------------------- */

function SectionTitle({
  title,
  onToggleCollapse,
  isCollapsed,
}: {
  title: string;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <div className="w-full flex justify-center mb-4">
      </div>
    );
  }

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-xl text-text-primary tracking-tight uppercase">
          {title}
        </h2>
      </div>
    </div>
  );
}

function DetailSidebar({ activeSection, onSectionChange, setActiveModule, activeModule }: { activeSection: string, onSectionChange: (sec: string) => void, setActiveModule: (mod: string) => void, activeModule: string }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const content = getSidebarContent(activeSection);

  // Auto-expand sections that have children when switching to them
  React.useEffect(() => {
    const newExpanded = new Set<string>();
    content.sections.forEach((section, sIndex) => {
      section.items.forEach((item, iIndex) => {
        if (item.hasDropdown) {
          newExpanded.add(`${section.title}-${iIndex}`);
        }
      });
    });
    setExpandedItems(newExpanded);
  }, [activeSection]);

  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const toggleCollapse = () => setIsCollapsed((s) => !s);

  return (
    <aside
      className={clsx(
        "bg-white/[0.03] backdrop-blur-3xl flex flex-col p-4 rounded-2xl transition-all duration-500 h-full border border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.3)] ml-2",
        isCollapsed ? "w-16 min-w-16 !px-2" : "w-64"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {!isCollapsed && <BrandBadge onClick={() => {
        onSectionChange('dashboard');
        setActiveModule('main-dashboard');
      }} />}

      <SectionTitle title={content.title} onToggleCollapse={toggleCollapse} isCollapsed={isCollapsed} />
      <SearchContainer isCollapsed={isCollapsed} />

      <div
        className={clsx(
          "flex flex-col w-full overflow-y-auto custom-scrollbar flex-1",
          isCollapsed ? "gap-2 items-center" : "gap-4 items-start"
        )}
      >
        {content.sections.map((section, index) => (
          <MenuSection
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={isCollapsed}
            setActiveModule={setActiveModule}
            activeModule={activeModule}
          />
        ))}
      </div>

      {!isCollapsed && (
        <div className="w-full mt-auto pt-4 border-t border-skel-metal/10">
          <div className="flex items-center gap-3 px-2 py-2 group cursor-pointer" onClick={() => (window as any).openSettingsModal?.()}>
            <AvatarCircle />
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm text-text-primary truncate">Apex User</div>
              <div className="font-mono text-[10px] text-text-secondary opacity-60 uppercase tracking-widest">Admin</div>
            </div>
            <button
              type="button"
              className="size-8 rounded-lg flex items-center justify-center hover:bg-skel-matte/10 text-text-secondary"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------ Menu Elements ---------------------------- */

function MenuItem({
  item,
  isExpanded,
  onToggle,
  onItemClick,
  isCollapsed,
}: {
  item: MenuItemT;
  isExpanded?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
  isCollapsed?: boolean;
}) {
  const handleClick = () => {
    if (item.hasDropdown && onToggle) onToggle();
    if (item.id) onItemClick?.();
  };

  return (
    <div className={clsx("relative w-full", isCollapsed && "flex justify-center")}>
      <div
        className={clsx(
          "rounded-xl cursor-pointer transition-all duration-300 flex items-center relative group",
          item.isActive ? "bg-focus-neon/10 text-focus-neon" : "hover:bg-skel-matte/10 text-text-secondary hover:text-text-primary",
          isCollapsed ? "size-10 justify-center" : "w-full h-10 px-3"
        )}
        onClick={handleClick}
      >
        <div className="flex items-center justify-center shrink-0">{item.icon}</div>

        {!isCollapsed && (
          <div className="flex-1 ml-3 font-display font-bold text-[13px] truncate">
            {item.label}
          </div>
        )}

        {item.hasDropdown && !isCollapsed && (
          <ChevronDown
            size={14}
            className={clsx("transition-transform duration-300", isExpanded && "rotate-180")}
          />
        )}
      </div>
    </div>
  );
}

function SubMenuItem({ item, onItemClick }: { item: MenuItemT; onItemClick?: () => void }) {
  return (
    <div className="w-full pl-8 pr-1 py-[1px]">
      <div
        className="h-8 w-full rounded-lg cursor-pointer transition-colors hover:bg-skel-matte/10 flex items-center px-3 text-text-secondary hover:text-text-primary gap-3"
        onClick={onItemClick}
      >
        <div className="shrink-0 text-text-secondary/50 group-hover:text-text-primary transition-colors">
          {item.icon}
        </div>
        <div className="font-display font-medium text-[12px] truncate">
          {item.label}
        </div>
      </div>
    </div>
  );
}

function MenuSection({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
  setActiveModule,
  activeModule
}: {
  section: MenuSectionT;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
  isCollapsed?: boolean;
  setActiveModule: (mod: string) => void;
  activeModule: string;
}) {
  return (
    <div className="flex flex-col w-full">
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.2em]">
            {section.title}
          </span>
        </div>
      )}

      <div className="space-y-1">
        {section.items.map((item, index) => {
          const itemKey = `${section.title}-${index}`;
          const isExpanded = expandedItems.has(itemKey);
          const isActive = item.id === activeModule;
          
          return (
            <div key={itemKey} className="w-full flex flex-col">
              <MenuItem
                item={{...item, isActive}}
                isExpanded={isExpanded}
                onToggle={() => onToggleExpanded(itemKey)}
                onItemClick={() => item.id && setActiveModule(item.id)}
                isCollapsed={isCollapsed}
              />
              {isExpanded && item.children && !isCollapsed && (
                <div className="mt-1 space-y-1">
                  {item.children.map((child, childIndex) => (
                    <SubMenuItem
                      key={`${itemKey}-${childIndex}`}
                      item={child}
                      onItemClick={() => child.id && setActiveModule(child.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Layout -------------------------------- */

export function TwoLevelSidebar({ setActiveModule, isOpen, activeModule, setSidebarOpen }: { setActiveModule: (mod: string) => void, isOpen: boolean, activeModule: string, setSidebarOpen?: (open: boolean) => void }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync activeSection with activeModule when it changes from outside (e.g. Header)
  React.useEffect(() => {
    if (activeModule === 'main-dashboard') {
      setActiveSection('dashboard');
    } else if (activeModule.startsWith('purchasing-')) {
      setActiveSection('purchasing');
    } else if (activeModule.startsWith('fason-')) {
      setActiveSection('fason');
    } else if (activeModule.startsWith('stocks-')) {
      setActiveSection('stocks');
    } else if (activeModule.startsWith('contacts-')) {
      setActiveSection('contacts');
    } else if (activeModule.startsWith('recon-')) {
      setActiveSection('recon');
    } else if (activeModule.startsWith('notes-')) {
      setActiveSection('notes');
    }
  }, [activeModule]);

  return (
    <div className="flex flex-row h-full">
      <IconNavigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        setActiveModule={setActiveModule} 
        setIsSettingsOpen={setIsSettingsOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      {isOpen && (
        <DetailSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          setActiveModule={setActiveModule} 
          activeModule={activeModule} 
        />
      )}
      <SidebarSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default TwoLevelSidebar;
