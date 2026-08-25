"use client";

import React, { useState } from "react";
import { 
  Home,
  Zap,
  LayoutDashboard,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserCheck,
  Briefcase,
  Tv,
  Library,
  BrainCircuit,
  FolderKanban,
  Boxes,
  Star,
  Layers,
  Sparkles,
  FileText,
  LogOut
} from "lucide-react";
import { SettingsModal } from './SettingsModal';
import { clsx } from "clsx";

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Brand / Logos ----------------------------- */

function ApexLogo({ subBrand = "ANA MENÜ" }: { subBrand?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
        subBrand === 'ANA MENÜ' ? 'bg-focus-main' :
        subBrand === 'PERSONELOS' ? 'bg-indigo-600' : 
        subBrand === 'WORKOS' ? 'bg-blue-600' :
        subBrand === 'MEDIAOS' ? 'bg-rose-600' :
        subBrand === 'LIBRARYOS' ? 'bg-amber-600' :
        subBrand === 'INTELLIGEOS' ? 'bg-purple-600' :
        subBrand === 'DOSYALAR' ? 'bg-emerald-600' :
        subBrand === 'UYGULAMALAR' ? 'bg-teal-600' : 'bg-neutral-800'
      }`}>
        <Zap size={16} className="text-pure-white" />
      </div>
      <div className="flex flex-col -space-y-1">
        <span className="text-lg font-display font-black tracking-tighter text-text-primary whitespace-nowrap">
          APEX<span className="text-focus-neon">OS</span>
        </span>
        <span className={`text-[10px] font-black tracking-[0.18em] uppercase transition-colors duration-500 ${
          subBrand === 'ANA MENÜ' ? 'text-focus-neon' :
          subBrand === 'PERSONELOS' ? 'text-indigo-400' : 
          subBrand === 'WORKOS' ? 'text-blue-400' :
          subBrand === 'MEDIAOS' ? 'text-rose-400' :
          subBrand === 'LIBRARYOS' ? 'text-amber-400' :
          subBrand === 'INTELLIGEOS' ? 'text-purple-400' :
          subBrand === 'DOSYALAR' ? 'text-emerald-400' :
          subBrand === 'UYGULAMALAR' ? 'text-teal-400' : 'text-text-secondary'
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
            placeholder="Modüllerde veya sayfalarda ara..."
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
    mainmenu: {
      title: "Ana Menü",
      sections: [
        {
          title: "Genel Bakış & Hızlı Erişim",
          items: [
            { id: 'overview-dashboard', icon: <LayoutDashboard size={16} className="text-focus-neon" />, label: 'Sistem Genel Bakış', moduleId: 'overview-dashboard' },
            { id: 'overview-workspace', icon: <Layers size={16} />, label: 'Çalışma Alanı', moduleId: 'overview-workspace' },
          ],
        },
        {
          title: "Favorilenmiş Sayfalar",
          items: [
            { id: 'fav-quick-access', icon: <Star size={16} className="text-amber-400" />, label: 'Favori Sayfalarım', moduleId: 'fav-quick-access' },
          ],
        },
      ],
    },
    personelos: {
      title: "PersonelOs",
      sections: [
        {
          title: "Personel & İK",
          items: [
            { id: 'personelos-main', icon: <UserCheck size={16} className="text-indigo-400" />, label: 'Personel Yönetimi', moduleId: 'personelos-main' },
          ],
        },
      ],
    },
    workos: {
      title: "WorkOs",
      sections: [
        {
          title: "İş & Görev Yönetimi",
          items: [
            { id: 'workos-main', icon: <Briefcase size={16} className="text-blue-400" />, label: 'İş & Proje Alanı', moduleId: 'workos-main' },
          ],
        },
      ],
    },
    mediaos: {
      title: "MediaOs",
      sections: [
        {
          title: "Medya & Akışlar",
          items: [
            { id: 'mediaos-main', icon: <Tv size={16} className="text-rose-400" />, label: 'Medya Merkezi', moduleId: 'mediaos-main' },
          ],
        },
      ],
    },
    libraryos: {
      title: "LibraryOs",
      sections: [
        {
          title: "Kütüphane & Bilgi",
          items: [
            { id: 'libraryos-main', icon: <Library size={16} className="text-amber-400" />, label: 'Kütüphane Yönetimi', moduleId: 'libraryos-main' },
          ],
        },
      ],
    },
    intelligeos: {
      title: "IntelligeOs",
      sections: [
        {
          title: "Yapay Zeka & Akıl",
          items: [
            { id: 'intelligeos-main', icon: <BrainCircuit size={16} className="text-purple-400" />, label: 'Zeka & Model Alanı', moduleId: 'intelligeos-main' },
          ],
        },
      ],
    },
    files: {
      title: "Dosya Yöneticisi",
      sections: [
        {
          title: "Depolama & Dokümanlar",
          items: [
            { id: 'files-main', icon: <FolderKanban size={16} className="text-emerald-400" />, label: 'Tüm Dosyalar & Dokümanlar', moduleId: 'files-main' },
          ],
        },
      ],
    },
    appstore: {
      title: "Açık Kaynak Uygulamalar",
      sections: [
        {
          title: "Uygulama Havuzu & Yönetim",
          items: [
            { id: 'appstore-main', icon: <Boxes size={16} className="text-teal-400" />, label: 'Uygulama Mağazası & Yönetim', moduleId: 'appstore-main' },
          ],
        },
      ],
    },
  };

  return contentMap[activeSection] || contentMap.mainmenu;
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
        "flex items-center justify-center rounded-xl size-10 min-w-10 transition-all duration-300 border relative group",
        isActive 
          ? "bg-focus-neon/15 text-focus-neon border-focus-neon/40 shadow-sm" 
          : "hover:bg-skel-matte/10 text-text-secondary hover:text-text-primary border-transparent"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
      onClick={onClick}
      title={label}
    >
      {children}
      {isActive && (
        <div className="absolute left-0 w-1 h-4 bg-focus-neon rounded-full" />
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
    { id: "mainmenu", icon: <Home size={18} />, label: "Ana Menü (Genel Bakış & Favoriler)", moduleId: 'overview-dashboard' },
    { id: "personelos", icon: <UserCheck size={18} />, label: "PersonelOs", moduleId: 'personelos-main' },
    { id: "workos", icon: <Briefcase size={18} />, label: "WorkOs", moduleId: 'workos-main' },
    { id: "mediaos", icon: <Tv size={18} />, label: "MediaOs", moduleId: 'mediaos-main' },
    { id: "libraryos", icon: <Library size={18} />, label: "LibraryOs", moduleId: 'libraryos-main' },
    { id: "intelligeos", icon: <BrainCircuit size={18} />, label: "IntelligeOs", moduleId: 'intelligeos-main' },
    { id: "files", icon: <FolderKanban size={18} />, label: "Dosya Yöneticisi (Toplu Doküman Yönetimi)", moduleId: 'files-main' },
    { id: "appstore", icon: <Boxes size={18} />, label: "Açık Kaynak Uygulama Yöneticisi", moduleId: 'appstore-main' },
  ];

  const handleSectionClick = (item: any) => {
    onSectionChange(item.id);
    setSidebarOpen?.(true);
    if (item.moduleId) {
      setActiveModule(item.moduleId);
    }
  };

  return (
    <aside className="bg-white/[0.03] backdrop-blur-3xl flex flex-col gap-2 items-center p-2 w-14 h-full border border-white/10 rounded-2xl shadow-sm">
      {/* Logo / Home Shortcut */}
      <div 
        className="mb-2 size-8 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        onClick={() => {
          onSectionChange('mainmenu');
          setActiveModule('overview-dashboard');
          setSidebarOpen?.(true);
        }}
        title="Ana Menü"
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 bg-focus-main shadow-sm">
          <Zap size={14} className="text-pure-white" />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-1.5 w-full items-center">
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
          label="Sistem Ayarları"
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
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-pure-white transition-all duration-300 cursor-pointer shadow-md hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Menüyü Genişlet"
        >
          <ChevronRight size={18} className="text-focus-neon" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display font-black text-xl text-text-primary tracking-tight uppercase truncate">
          {title}
        </h2>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-pure-white transition-all duration-300 cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center"
          title="Menüyü Daralt"
        >
          <ChevronLeft size={18} className="text-focus-neon" />
        </button>
      </div>
    </div>
  );
}

function DetailSidebar({ activeSection, onSectionChange, setActiveModule, activeModule }: { activeSection: string, onSectionChange: (sec: string) => void, setActiveModule: (mod: string) => void, activeModule: string }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const content = getSidebarContent(activeSection);
  
  const subBrandMap: Record<string, string> = {
    mainmenu: 'ANA MENÜ',
    personelos: 'PERSONELOS',
    workos: 'WORKOS',
    mediaos: 'MEDIAOS',
    libraryos: 'LIBRARYOS',
    intelligeos: 'INTELLIGEOS',
    files: 'DOSYALAR',
    appstore: 'UYGULAMALAR',
  };
  const subBrand = subBrandMap[activeSection] || 'ANA MENÜ';

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
      data-card="true"
      data-layer="2"
      className={clsx(
        "bento-card layer-2 flex flex-col p-4 rounded-2xl transition-all duration-300 h-full ml-2",
        isCollapsed ? "w-16 min-w-16 !px-2" : "w-64"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {!isCollapsed && <BrandBadge onClick={() => {
        onSectionChange('welcome');
        setActiveModule('welcome-overview');
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
  const [activeSection, setActiveSection] = useState("mainmenu");

  // Sync activeSection with activeModule prefix
  React.useEffect(() => {
    if (!activeModule) return;
    if (activeModule.startsWith('personelos')) setActiveSection('personelos');
    else if (activeModule.startsWith('workos')) setActiveSection('workos');
    else if (activeModule.startsWith('mediaos')) setActiveSection('mediaos');
    else if (activeModule.startsWith('libraryos')) setActiveSection('libraryos');
    else if (activeModule.startsWith('intelligeos')) setActiveSection('intelligeos');
    else if (activeModule.startsWith('files')) setActiveSection('files');
    else if (activeModule.startsWith('appstore')) setActiveSection('appstore');
    else if (activeModule.startsWith('overview') || activeModule.startsWith('fav') || activeModule === 'workspace-main') setActiveSection('mainmenu');
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
