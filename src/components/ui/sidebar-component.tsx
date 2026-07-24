"use client";

import React, { useState } from "react";
import { 
  Zap,
  LayoutDashboard,
  Settings as SettingsIcon,
  ChevronDown,
  Search,
  LogOut,
  Clock,
  Package,
  FileBarChart,
  LineChart,
  FileText,
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
  CalendarDays,
  Sparkles,
  Radio
} from "lucide-react";
import { SettingsModal } from './SettingsModal';
import { clsx } from "clsx";

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Brand / Logos ----------------------------- */

function ApexLogo({ subBrand = "FİNANS" }: { subBrand?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-all duration-500 ${
        subBrand === 'FİNANS' ? 'bg-focus-main shadow-focus-main/30' : 
        subBrand === 'KÜTÜPHANE' ? 'bg-indigo-600 shadow-indigo-600/30' :
        subBrand === 'NOTLARIM' ? 'bg-amber-600 shadow-amber-600/30' :
        subBrand === 'BÜLTEN' ? 'bg-rose-600 shadow-rose-600/30' :
        subBrand === 'LOGISTICS' ? 'bg-blue-600 shadow-blue-600/30' : 'bg-neutral-800'
      }`}>
        <Zap size={16} className="text-pure-white" />
      </div>
      <div className="flex flex-col -space-y-1">
        <span className="text-lg font-display font-black tracking-tighter text-text-primary whitespace-nowrap">
          APEX<span className="text-focus-neon">OS</span>
        </span>
        <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-500 ${
          subBrand === 'FİNANS' ? 'text-focus-neon' : 
          subBrand === 'KÜTÜPHANE' ? 'text-indigo-400' :
          subBrand === 'NOTLARIM' ? 'text-amber-400' :
          subBrand === 'BÜLTEN' ? 'text-rose-400' : 'text-text-secondary'
        }`}>
          {subBrand}
        </span>
      </div>
    </div>
  );
}

function BrandBadge({ onClick, subBrand }: { onClick?: () => void, subBrand?: string }) {
  return (
    <div className="relative shrink-0 w-full mb-4">
      <div 
        className="flex items-center p-1 w-full cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        <ApexLogo subBrand={subBrand} />
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
    library: {
      title: "Kütüphane",
      sections: [
        {
          title: "Genel",
          items: [
            { id: 'library-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'library-dashboard' },
          ],
        },
        {
          title: "E-Kitap",
          items: [
            { id: 'library-ebook-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'library-ebook-dashboard' },
            { id: 'library-ebooks', icon: <BookOpen size={16} />, label: 'E-Kitaplar', moduleId: 'library-ebooks' },
            { id: 'library-ebook-panel', icon: <Settings2 size={16} />, label: 'E-Kitap Panel', moduleId: 'library-ebook-panel' },
          ],
        },
        {
          title: "Manga",
          items: [
            { id: 'library-manga-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'library-manga-dashboard' },
            { id: 'library-mangas', icon: <ImageIcon size={16} />, label: 'Mangalar', moduleId: 'library-mangas' },
            { id: 'library-manga-panel', icon: <Settings2 size={16} />, label: 'Manga Paneli', moduleId: 'library-manga-panel' },
            { id: 'library-manga-universe', icon: <Network size={16} />, label: 'Manga Evreni', moduleId: 'library-manga-universe' },
          ],
        },
        {
          title: "Dökümanlar",
          items: [
            { id: 'library-docs-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'library-docs-dashboard' },
            { id: 'library-docs', icon: <FileText size={16} />, label: 'Dökümanlar', moduleId: 'library-docs' },
          ],
        },
      ],
    },
    notes: {
      title: "Notlarım",
      sections: [
        {
          title: "Genel",
          items: [
            { id: 'notes-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'notes-dashboard' },
            { id: 'notes-todo', icon: <CheckSquare size={16} />, label: 'Todo', moduleId: 'notes-todo' },
            { id: 'notes-bookmarks', icon: <Bookmark size={16} />, label: 'Bookmarks', moduleId: 'notes-bookmarks' },
            { id: 'notes-passwords', icon: <Settings2 size={16} />, label: 'Parolalar', moduleId: 'notes-passwords' },
          ],
        },
        {
          title: "Notlar",
          items: [
            { id: 'notes-quick', icon: <Zap size={16} />, label: 'Hızlı Notlar', moduleId: 'notes-quick' },
            { id: 'notes-notebook', icon: <BookText size={16} />, label: 'Not Defteri', moduleId: 'notes-notebook' },
          ],
        },
        {
          title: "Planlayıcı",
          items: [
            { id: 'notes-planner-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'notes-planner-dashboard' },
            { id: 'notes-planner-plans', icon: <CalendarDays size={16} />, label: 'Günlük/Haftalık/Aylık', moduleId: 'notes-planner-plans' },
          ],
        },
      ],
    },
    bulletin: {
      title: "Bülten",
      sections: [
        {
          title: "Genel",
          items: [
            { id: 'bulletin-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'bulletin-dashboard' },
            { id: 'bulletin-news', icon: <Rss size={16} />, label: 'Haber & Akışlar', moduleId: 'bulletin-news' },
            { id: 'bulletin-digest', icon: <Sparkles size={16} />, label: 'Akıllı Bülten (AI)', moduleId: 'bulletin-digest' },
            { id: 'bulletin-saved', icon: <Bookmark size={16} />, label: 'Kaydedilenler', moduleId: 'bulletin-saved' },
            { id: 'bulletin-feeds', icon: <Radio size={16} />, label: 'RSS Kaynakları', moduleId: 'bulletin-feeds' },
          ],
        },
        {
          title: "Video & Medya",
          items: [
            { id: 'bulletin-video-dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', moduleId: 'bulletin-video-dashboard' },
            { id: 'bulletin-series-movies', icon: <PlaySquare size={16} />, label: 'Dizi/Film', moduleId: 'bulletin-series-movies' },
            { id: 'bulletin-videos', icon: <PlaySquare size={16} />, label: 'Videolar', moduleId: 'bulletin-videos' },
            { id: 'bulletin-mangas', icon: <ImageIcon size={16} />, label: 'Mangalar', moduleId: 'bulletin-mangas' },
            { id: 'bulletin-music', icon: <Rss size={16} />, label: 'Müzikler', moduleId: 'bulletin-music' },
          ],
        },
      ],
    },
  };

  return contentMap[activeSection] || contentMap.finance;
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
    { id: "library", icon: <Library size={18} />, label: "Kütüphane", moduleId: 'library-dashboard' },
    { id: "notes", icon: <NotebookPen size={18} />, label: "Notlarım", moduleId: 'notes-dashboard' },
    { id: "bulletin", icon: <Rss size={18} />, label: "Bülten", moduleId: 'bulletin-dashboard' },
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
          onSectionChange('finance');
          setActiveModule('finance-dashboard');
        }}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
          activeSection === 'finance' ? 'bg-focus-main shadow-focus-main/30' : 'bg-neutral-800 shadow-black/20'
        }`}>
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
        <IconNavButton 
          isActive={false} 
          onClick={() => setIsSettingsOpen(true)} 
          label="Ayarlar"
        >
          <SettingsIcon size={18} />
        </IconNavButton>
        <div className="size-8 cursor-pointer mt-1" onClick={() => setIsSettingsOpen(true)}>
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
  const subBrand = 
    activeSection === 'finance' ? 'FİNANS' : 
    activeSection === 'library' ? 'KÜTÜPHANE' : 
    activeSection === 'notes' ? 'NOTLARIM' : 
    activeSection === 'bulletin' ? 'BÜLTEN' : 'OS';

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
        onSectionChange('finance');
        setActiveModule('finance-dashboard');
      }} subBrand={subBrand} />}

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
  const [activeSection, setActiveSection] = useState("finance");

  // Sync activeSection with activeModule when it changes from outside (e.g. Header)
  React.useEffect(() => {
    if (activeModule.startsWith('finance-')) {
      setActiveSection('finance');
    } else if (activeModule.startsWith('library-')) {
      setActiveSection('library');
    } else if (activeModule.startsWith('notes-')) {
      setActiveSection('notes');
    } else if (activeModule.startsWith('bulletin-')) {
      setActiveSection('bulletin');
    }
  }, [activeModule]);

  return (
    <div className="flex flex-row h-full">
      <IconNavigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        setActiveModule={setActiveModule} 
        setIsSettingsOpen={() => (window as any).openSettingsModal?.()} 
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
    </div>
  );
}

export default TwoLevelSidebar;
