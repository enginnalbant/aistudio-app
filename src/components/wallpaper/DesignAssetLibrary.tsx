import React, { useState, useEffect, useMemo } from 'react';
import { 
  Palette, 
  Type, 
  Bot, 
  Sparkles, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Star, 
  Download, 
  Upload, 
  Search, 
  Sliders, 
  Undo, 
  Check, 
  Eye, 
  HelpCircle,
  FolderOpen,
  Settings,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ColorPalette, FontCollection, TypographyTree, TypographyLevel, AIRecommendation, ThemeAssetSettings } from '../../types';
import { BUILT_IN_PALETTES, BUILT_IN_FONTS, getDefaultTypographyTree, getAIAssetRecommendations } from '../../utils/designAssets';

interface DesignAssetLibraryProps {
  dominantColor: string;
  isDarkTheme: boolean;
  currentPresetId?: string;
  activePalette: any;
  onApplyPalette: (pal: any) => void;
  onApplyFont: (fontFamily: string, tree?: TypographyTree) => void;
  onSaveWithTheme: (assetSettings: ThemeAssetSettings) => void;
}

export default function DesignAssetLibrary({
  dominantColor,
  isDarkTheme,
  currentPresetId,
  activePalette,
  onApplyPalette,
  onApplyFont,
  onSaveWithTheme
}: DesignAssetLibraryProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'palettes' | 'typography' | 'ai'>('palettes');

  // Load from LocalStorage or initialize
  const [palettes, setPalettes] = useState<ColorPalette[]>(() => {
    try {
      const saved = localStorage.getItem('apex_custom_palettes');
      if (saved) {
        const custom = JSON.parse(saved);
        return [...BUILT_IN_PALETTES, ...custom];
      }
    } catch (e) {
      console.error(e);
    }
    return BUILT_IN_PALETTES;
  });

  const [fonts, setFonts] = useState<FontCollection[]>(() => {
    try {
      const saved = localStorage.getItem('apex_custom_fonts');
      if (saved) {
        const custom = JSON.parse(saved);
        return [...BUILT_IN_FONTS, ...custom];
      }
    } catch (e) {
      console.error(e);
    }
    return BUILT_IN_FONTS;
  });

  // Active selections
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(activePalette?.id || palettes[0].id);
  const [selectedFontId, setSelectedFontId] = useState<string>(BUILT_IN_FONTS[0].id);
  
  // Custom theme overrides state
  const [overrideMode, setOverrideMode] = useState<'ai' | 'builtIn' | 'imported' | 'custom' | 'manual'>('ai');

  // Palette states
  const [paletteSearch, setPaletteSearch] = useState('');
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'favorites' | 'builtIn' | 'custom'>('all');
  const [editingPalette, setEditingPalette] = useState<ColorPalette | null>(null);
  const [isImportingPalette, setIsImportingPalette] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'css' | 'tailwind'>('json');

  // Font states
  const [fontSearch, setFontSearch] = useState('');
  const [fontFilter, setFontFilter] = useState<'all' | 'favorites' | 'monospace' | 'installed'>('all');
  const [previewText, setPreviewText] = useState('Apex OS Elegant Display Typography');
  const [editingTreeFontId, setEditingTreeFontId] = useState<string | null>(null);
  const [isImportingFont, setIsImportingFont] = useState(false);
  
  // Font import model properties
  const [importFontName, setImportFontName] = useState('');
  const [importFontFamily, setImportFontFamily] = useState('');
  const [importFontWeights, setImportFontWeights] = useState('300, 400, 500, 700');
  const [importFontLicense, setImportFontLicense] = useState('OFL (Open Font License)');

  // Save changes helper
  const persistCustomPalettes = (updatedList: ColorPalette[]) => {
    const customOnly = updatedList.filter(p => p.isCustom);
    localStorage.setItem('apex_custom_palettes', JSON.stringify(customOnly));
    setPalettes(updatedList);
  };

  const persistCustomFonts = (updatedList: FontCollection[]) => {
    const customOnly = updatedList.filter(f => f.isCustom);
    localStorage.setItem('apex_custom_fonts', JSON.stringify(customOnly));
    setFonts(updatedList);
  };

  // Selected object references
  const selectedPalette = useMemo(() => {
    return palettes.find(p => p.id === selectedPaletteId) || palettes[0];
  }, [palettes, selectedPaletteId]);

  const selectedFont = useMemo(() => {
    return fonts.find(f => f.id === selectedFontId) || fonts[0];
  }, [fonts, selectedFontId]);

  // AI Recommendation engine
  const aiRecommendation = useMemo<AIRecommendation>(() => {
    return getAIAssetRecommendations(dominantColor, isDarkTheme, currentPresetId);
  }, [dominantColor, isDarkTheme, currentPresetId]);

  // Sync AI Recommendation to Theme components
  useEffect(() => {
    if (overrideMode === 'ai') {
      const recPal = palettes.find(p => p.id === aiRecommendation.recommendedPaletteId) || palettes[0];
      const recFont = fonts.find(f => f.id === aiRecommendation.recommendedFontId) || fonts[0];
      
      setSelectedPaletteId(recPal.id);
      setSelectedFontId(recFont.id);
      
      // Fire callback to instantly apply to preview window
      onApplyPalette({
        primaryNeon: recPal.primary,
        secondaryMain: recPal.secondary,
        darkObsidian: recPal.background,
        glassTint: recPal.glassTint || `rgba(15, 23, 42, 0.75)`,
        glowRgb: recPal.primary.startsWith('#') ? hexToRgb(recPal.primary) : '59, 130, 246',
        accentHexList: recPal.chartColors,
        isDarkTheme: true
      });
      onApplyFont(recFont.family, recFont.typographyTree);
    }
  }, [overrideMode, aiRecommendation]);

  // Apply manual selected palette instantly
  const handleSelectPalette = (id: string) => {
    setSelectedPaletteId(id);
    setOverrideMode('manual');
    const pal = palettes.find(p => p.id === id);
    if (pal) {
      onApplyPalette({
        primaryNeon: pal.primary,
        secondaryMain: pal.secondary,
        darkObsidian: pal.background,
        glassTint: pal.glassTint || `rgba(15, 23, 42, 0.75)`,
        glowRgb: pal.primary.startsWith('#') ? hexToRgb(pal.primary) : '59, 130, 246',
        accentHexList: pal.chartColors,
        isDarkTheme: true
      });
    }
  };

  // Apply manual selected font instantly
  const handleSelectFont = (id: string) => {
    setSelectedFontId(id);
    setOverrideMode('manual');
    const fnt = fonts.find(f => f.id === id);
    if (fnt) {
      onApplyFont(fnt.family, fnt.typographyTree);
    }
  };

  // Utility to convert Hex to RGB csv
  function hexToRgb(hex: string): string {
    const h = hex.replace('#', '');
    if (h.length === 3) {
      const r = parseInt(h.substring(0, 1) + h.substring(0, 1), 16);
      const g = parseInt(h.substring(1, 2) + h.substring(1, 2), 16);
      const b = parseInt(h.substring(2, 3) + h.substring(2, 3), 16);
      return `${r}, ${g}, ${b}`;
    } else if (h.length === 6) {
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }
    return '59, 130, 246';
  }

  // Trigger Save with Theme package
  useEffect(() => {
    onSaveWithTheme({
      selectedPaletteId,
      selectedFontId,
      overrideMode,
      aiRecommendation,
      customPaletteOverrides: selectedPalette,
      customTypographyOverrides: selectedFont.typographyTree
    });
  }, [selectedPaletteId, selectedFontId, overrideMode, selectedPalette, selectedFont]);

  // Palette Actions: Create, Duplicate, Rename, Delete, Favorite, Search, Filter, Import, Export
  const handleCreatePalette = () => {
    const newPal: ColorPalette = {
      id: `pal_custom_${Date.now()}`,
      name: 'Yeni Özel Palet',
      description: 'Kullanıcı tarafından oluşturulmuş dinamik sarmal tasarım paleti.',
      category: 'Custom',
      tags: ['Custom', 'User'],
      creationDate: new Date().toISOString().split('T')[0],
      version: '1.0',
      isFavorite: false,
      isCustom: true,
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#ec4899',
      background: '#0a0b10',
      surface: '#12131a',
      card: '#181a24',
      sidebar: '#07080c',
      header: '#12131a',
      border: '#27272a',
      textPrimary: '#fafafa',
      textSecondary: '#a1a1aa',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      chartColors: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
      glowColors: ['#3b82f6', '#ec4899'],
      shadowColors: ['rgba(59, 130, 246, 0.25)']
    };
    const updated = [...palettes, newPal];
    persistCustomPalettes(updated);
    setSelectedPaletteId(newPal.id);
  };

  const handleDuplicatePalette = (pal: ColorPalette) => {
    const copy: ColorPalette = {
      ...pal,
      id: `pal_custom_${Date.now()}`,
      name: `${pal.name} (Kopya)`,
      isCustom: true,
      isFavorite: false,
      creationDate: new Date().toISOString().split('T')[0]
    };
    const updated = [...palettes, copy];
    persistCustomPalettes(updated);
    setSelectedPaletteId(copy.id);
  };

  const handleDeletePalette = (id: string) => {
    const updated = palettes.filter(p => p.id !== id);
    persistCustomPalettes(updated);
    if (selectedPaletteId === id) {
      setSelectedPaletteId(palettes[0].id);
    }
  };

  const handleToggleFavoritePalette = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = palettes.map(p => {
      if (p.id === id) {
        return { ...p, isFavorite: !p.isFavorite };
      }
      return p;
    });
    persistCustomPalettes(updated);
  };

  const handleUpdatePaletteField = (field: keyof ColorPalette, value: any) => {
    if (!editingPalette) return;
    const updatedEditing = { ...editingPalette, [field]: value };
    setEditingPalette(updatedEditing);

    const updatedList = palettes.map(p => {
      if (p.id === editingPalette.id) {
        return updatedEditing;
      }
      return p;
    });
    persistCustomPalettes(updatedList);
  };

  // Palette Import Logic
  const handleImportPalette = () => {
    try {
      let imported: any = null;
      if (importFormat === 'json') {
        imported = JSON.parse(importText);
      } else if (importFormat === 'css') {
        // Simple CSS regex parser
        const primary = importText.match(/--focus-neon:\s*(#[a-fA-F0-9]{3,8})/)?.[1] || '#3b82f6';
        const background = importText.match(/--app-bg:\s*(#[a-fA-F0-9]{3,8})/)?.[1] || '#090a0f';
        imported = {
          name: 'CSS Imported Palette',
          primary,
          background,
          secondary: '#64748b',
          accent: primary,
          surface: '#12131a',
          card: '#181a24',
          sidebar: '#07080c',
          header: '#12131a',
          border: '#27272a',
          textPrimary: '#fafafa',
          textSecondary: '#a1a1aa'
        };
      } else {
        // Tailwind structure guesser
        imported = {
          name: 'Tailwind Imported',
          primary: '#38bdf8',
          secondary: '#64748b',
          accent: '#f43f5e',
          background: '#0f172a',
          surface: '#1e293b',
          card: '#1e293b',
          sidebar: '#0f172a',
          header: '#1e293b',
          border: '#334155',
          textPrimary: '#f8fafc',
          textSecondary: '#94a3b8'
        };
      }

      const newPal: ColorPalette = {
        id: `pal_custom_${Date.now()}`,
        name: imported.name || 'İçe Aktarılan Tema',
        description: imported.description || 'Dış kaynaktan başarıyla ayrıştırılmış renk kütüphanesi.',
        category: 'Imported',
        tags: ['Imported', 'Custom'],
        creationDate: new Date().toISOString().split('T')[0],
        version: '1.0',
        isFavorite: false,
        isCustom: true,
        primary: imported.primary || '#3b82f6',
        secondary: imported.secondary || '#64748b',
        accent: imported.accent || '#ec4899',
        background: imported.background || '#090a10',
        surface: imported.surface || '#12131a',
        card: imported.card || '#181a24',
        sidebar: imported.sidebar || '#07080c',
        header: imported.header || '#12131a',
        border: imported.border || '#27272a',
        textPrimary: imported.textPrimary || '#fafafa',
        textSecondary: imported.textSecondary || '#a1a1aa',
        success: imported.success || '#10b981',
        warning: imported.warning || '#f59e0b',
        danger: imported.danger || '#ef4444',
        info: imported.info || '#3b82f6',
        chartColors: imported.chartColors || ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
        glowColors: imported.glowColors || ['#3b82f6', '#ec4899'],
        shadowColors: imported.shadowColors || ['rgba(59, 130, 246, 0.25)']
      };

      const updated = [...palettes, newPal];
      persistCustomPalettes(updated);
      setSelectedPaletteId(newPal.id);
      setIsImportingPalette(false);
      setImportText('');
    } catch (err) {
      alert('Renk şablonu ayrıştırılamadı. Formatı kontrol edin.');
    }
  };

  const handleExportPalette = (pal: ColorPalette) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pal, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apex_palette_${pal.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Font Actions: Import, Favorite, Edit Typography Tree
  const handleToggleFavoriteFont = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = fonts.map(f => {
      if (f.id === id) {
        return { ...f, isFavorite: !f.isFavorite };
      }
      return f;
    });
    persistCustomFonts(updated);
  };

  const handleToggleEnableFont = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = fonts.map(f => {
      if (f.id === id) {
        return { ...f, isEnabled: !f.isEnabled };
      }
      return f;
    });
    persistCustomFonts(updated);
  };

  const handleImportFontCollection = () => {
    if (!importFontName || !importFontFamily) {
      alert('Lütfen Yazı Tipi Adı ve Font Family alanlarını doldurun.');
      return;
    }
    const weightsArr = importFontWeights.split(',').map(w => w.trim());
    const newFont: FontCollection = {
      id: `font_custom_${Date.now()}`,
      name: importFontName,
      family: importFontFamily,
      weights: weightsArr,
      styles: ['normal', 'italic'],
      isMonospace: importFontFamily.toLowerCase().includes('mono'),
      isFavorite: false,
      isInstalled: true,
      isEnabled: true,
      isCustom: true,
      license: importFontLicense,
      characterSupport: 'Latin (Extended)',
      languageSupport: ['TR', 'EN'],
      preview: 'Akıllı Tipografi Önizlemesi',
      typographyTree: getDefaultTypographyTree(importFontFamily)
    };

    const updated = [...fonts, newFont];
    persistCustomFonts(updated);
    setSelectedFontId(newFont.id);
    setIsImportingFont(false);
    setImportFontName('');
    setImportFontFamily('');
  };

  const handleUpdateTypographyLevel = (
    fontId: string,
    levelKey: keyof TypographyTree,
    field: keyof TypographyLevel,
    value: string
  ) => {
    const updatedFonts = fonts.map(f => {
      if (f.id === fontId && f.typographyTree) {
        const updatedLevel = { ...f.typographyTree[levelKey], [field]: value };
        const updatedTree = { ...f.typographyTree, [levelKey]: updatedLevel };
        return { ...f, typographyTree: updatedTree };
      }
      return f;
    });
    persistCustomFonts(updatedFonts);
  };

  // Filtered Palettes
  const filteredPalettes = useMemo(() => {
    return palettes.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(paletteSearch.toLowerCase()) || 
                            p.description.toLowerCase().includes(paletteSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(paletteSearch.toLowerCase());
      
      if (!matchesSearch) return false;
      if (paletteFilter === 'favorites') return p.isFavorite;
      if (paletteFilter === 'builtIn') return !p.isCustom;
      if (paletteFilter === 'custom') return p.isCustom;
      return true;
    });
  }, [palettes, paletteSearch, paletteFilter]);

  // Filtered Fonts
  const filteredFonts = useMemo(() => {
    return fonts.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase()) || 
                            f.family.toLowerCase().includes(fontSearch.toLowerCase());
      
      if (!matchesSearch) return false;
      if (fontFilter === 'favorites') return f.isFavorite;
      if (fontFilter === 'monospace') return f.isMonospace;
      if (fontFilter === 'installed') return f.isInstalled;
      return true;
    });
  }, [fonts, fontSearch, fontFilter]);

  return (
    <div className="space-y-6 animate-fade-in" id="design-asset-library-module">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-display font-black text-white flex items-center gap-2">
            <Palette size={20} className="text-focus-neon animate-pulse" /> Apex OS Design Asset Library
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Renk paletlerini, tipografi ağaçlarını ve font koleksiyonlarını merkezi olarak yönetin.
          </p>
        </div>

        {/* Master selector mode for AI compatibility */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl">
          {[
            { mode: 'ai', label: 'AI Öneri', icon: Bot },
            { mode: 'builtIn', label: 'Dahili Kitaplık', icon: FolderOpen },
            { mode: 'custom', label: 'Özel Stiller', icon: Sliders },
            { mode: 'manual', label: 'Manuel Ayar', icon: Settings }
          ].map((item) => {
            const isSel = overrideMode === item.mode;
            const Icon = item.icon;
            return (
              <button
                key={item.mode}
                onClick={() => setOverrideMode(item.mode as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all ${
                  isSel 
                    ? 'bg-focus-neon text-white shadow-md' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={11} /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Internal Module Nav Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
        <button
          onClick={() => setActiveTab('palettes')}
          className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'palettes' ? 'bg-focus-neon text-white shadow-sm' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Palette size={14} /> Color Palette Library ({palettes.length})
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'typography' ? 'bg-focus-neon text-white shadow-sm' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Type size={14} /> Typography Library ({fonts.length})
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'ai' ? 'bg-focus-neon text-white shadow-sm' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Bot size={14} /> AI Recommendation Engine
        </button>
      </div>

      {/* TAB 1: COLOR PALETTE LIBRARY */}
      {activeTab === 'palettes' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search and Filters */}
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Palet ara (örn. Tokyo Night, Nord, AMOLED)..."
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-focus-neon font-mono"
                />
              </div>

              <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'favorites', label: 'Yıldızlılar' },
                  { id: 'builtIn', label: 'Dahili' },
                  { id: 'custom', label: 'Özel' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPaletteFilter(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      paletteFilter === item.id ? 'bg-white/15 text-white' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setIsImportingPalette(true)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold border border-white/10 flex items-center gap-1"
                title="İçe Aktar (Import)"
              >
                <Upload size={13} /> İçe Aktar
              </button>
              <button
                onClick={handleCreatePalette}
                className="px-3 py-2 rounded-xl bg-focus-neon text-white text-xs font-mono font-bold flex items-center gap-1 hover:bg-blue-600 shadow-md"
              >
                <Plus size={13} /> Yeni Palet Ekle
              </button>
            </div>
          </div>

          {/* PALETTE CONTAINER SCROLL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {filteredPalettes.map((pal) => {
              const isSelected = selectedPaletteId === pal.id;
              return (
                <div
                  key={pal.id}
                  onClick={() => handleSelectPalette(pal.id)}
                  className={`group relative cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                    isSelected 
                      ? 'border-focus-neon bg-focus-neon/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-focus-neon/30' 
                      : 'border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        {pal.name}
                        {pal.isCustom && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[8px] font-mono">Özel</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => handleToggleFavoritePalette(pal.id, e)}
                          className={`p-1 rounded hover:bg-white/10 ${pal.isFavorite ? 'text-amber-400' : 'text-text-secondary'}`}
                        >
                          <Star size={11} fill={pal.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicatePalette(pal); }}
                          className="p-1 rounded hover:bg-white/10 text-text-secondary hover:text-white"
                          title="Kopyala"
                        >
                          <Copy size={11} />
                        </button>
                        {pal.isCustom && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingPalette(pal); }}
                              className="p-1 rounded hover:bg-white/10 text-text-secondary hover:text-focus-neon"
                              title="Düzenle"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePalette(pal.id); }}
                              className="p-1 rounded hover:bg-white/10 text-text-secondary hover:text-red-500"
                              title="Sil"
                            >
                              <Trash2 size={11} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExportPalette(pal); }}
                          className="p-1 rounded hover:bg-white/10 text-text-secondary hover:text-white"
                          title="İhracat Et"
                        >
                          <Download size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-normal line-clamp-2 h-7 font-mono">
                      {pal.description}
                    </p>
                  </div>

                  {/* Palette color preview ribbon */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-5 h-5 rounded-lg overflow-hidden border border-white/5">
                      <div style={{ backgroundColor: pal.primary }} title={`Primary: ${pal.primary}`} />
                      <div style={{ backgroundColor: pal.secondary }} title={`Secondary: ${pal.secondary}`} />
                      <div style={{ backgroundColor: pal.accent }} title={`Accent: ${pal.accent}`} />
                      <div style={{ backgroundColor: pal.background }} title={`Background: ${pal.background}`} />
                      <div style={{ backgroundColor: pal.surface }} title={`Surface: ${pal.surface}`} />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-text-secondary">
                      <span>Ver: {pal.version}</span>
                      <span>Cat: {pal.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PALETTE EDIT DRAWER/MODAL (INLINE CARD) */}
          <AnimatePresence>
            {editingPalette && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-5 rounded-2xl bg-slate-900 border border-focus-neon/30 space-y-4 text-xs font-mono"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Edit3 size={13} className="text-focus-neon" /> Palet Editörü: {editingPalette.name}
                  </span>
                  <button onClick={() => setEditingPalette(null)} className="text-text-secondary hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Text properties */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[9px] text-text-secondary block font-bold">PALET ADI</label>
                      <input
                        type="text"
                        value={editingPalette.name}
                        onChange={(e) => handleUpdatePaletteField('name', e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-text-secondary block font-bold">AÇIKLAMA</label>
                      <textarea
                        value={editingPalette.description}
                        onChange={(e) => handleUpdatePaletteField('description', e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none h-16 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-text-secondary block font-bold">KATEGORİ</label>
                      <input
                        type="text"
                        value={editingPalette.category}
                        onChange={(e) => handleUpdatePaletteField('category', e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Colors block 1 */}
                  <div className="space-y-2">
                    {[
                      { key: 'primary', label: 'Primary (Neon)' },
                      { key: 'secondary', label: 'Secondary (Muted)' },
                      { key: 'accent', label: 'Accent Color' },
                      { key: 'background', label: 'App Background' },
                      { key: 'surface', label: 'Surface Base' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between gap-2 p-1.5 bg-black/20 rounded-lg">
                        <span className="text-[10px] text-white/70">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={(editingPalette as any)[item.key]}
                            onChange={(e) => handleUpdatePaletteField(item.key as any, e.target.value)}
                            className="w-16 p-1 bg-black/40 border border-white/10 text-[10px] text-center text-white"
                          />
                          <input
                            type="color"
                            value={(editingPalette as any)[item.key]}
                            onChange={(e) => handleUpdatePaletteField(item.key as any, e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Colors block 2 */}
                  <div className="space-y-2">
                    {[
                      { key: 'card', label: 'Card Container' },
                      { key: 'sidebar', label: 'Sidebar Panel' },
                      { key: 'border', label: 'Border Line' },
                      { key: 'textPrimary', label: 'Text Primary' },
                      { key: 'textSecondary', label: 'Text Secondary' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between gap-2 p-1.5 bg-black/20 rounded-lg">
                        <span className="text-[10px] text-white/70">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={(editingPalette as any)[item.key]}
                            onChange={(e) => handleUpdatePaletteField(item.key as any, e.target.value)}
                            className="w-16 p-1 bg-black/40 border border-white/10 text-[10px] text-center text-white"
                          />
                          <input
                            type="color"
                            value={(editingPalette as any)[item.key]}
                            onChange={(e) => handleUpdatePaletteField(item.key as any, e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      setEditingPalette(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-focus-neon hover:bg-blue-600 text-white text-xs font-bold font-mono"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PALETTE IMPORT OVERLAY VIEW */}
          <AnimatePresence>
            {isImportingPalette && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 rounded-2xl bg-slate-900 border border-focus-neon/30 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                    <Upload size={13} className="text-focus-neon" /> Renk Paleti İçe Aktar (Format Ayrıştırıcı)
                  </span>
                  <button onClick={() => setIsImportingPalette(false)} className="text-text-secondary hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[
                      { id: 'json', label: 'JSON Şablonu' },
                      { id: 'css', label: 'CSS Variables' },
                      { id: 'tailwind', label: 'Tailwind Config' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setImportFormat(item.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                          importFormat === item.id 
                            ? 'bg-focus-neon/20 border-focus-neon text-focus-neon' 
                            : 'bg-black/30 border-white/10 text-text-secondary'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={
                      importFormat === 'json' 
                        ? '{\n  "name": "Benim Tasarımım",\n  "primary": "#ff007f",\n  "background": "#050010"\n}'
                        : importFormat === 'css'
                        ? ':root {\n  --focus-neon: #ff007f;\n  --app-bg: #050010;\n}'
                        : 'theme: {\n  extend: {\n    colors: {\n      primary: "#ff007f"\n    }\n  }\n}'
                    }
                    className="w-full h-32 p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-focus-neon resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-mono">
                  <button
                    onClick={() => setIsImportingPalette(false)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 text-text-secondary hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleImportPalette}
                    className="px-4 py-2 rounded-xl bg-focus-neon text-white font-bold"
                  >
                    Ayrıştır & Ekle (Import)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 2: TYPOGRAPHY LIBRARY */}
      {activeTab === 'typography' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search and Filters */}
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Yazı tipi ara (örn. Inter, Geist, JetBrains Mono)..."
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-focus-neon font-mono"
                />
              </div>

              <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'favorites', label: 'Sık Kullanılanlar' },
                  { id: 'monospace', label: 'Monospace' },
                  { id: 'installed', label: 'Sistemdekiler' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setFontFilter(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      fontFilter === item.id ? 'bg-white/15 text-white' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setIsImportingFont(true)}
                className="px-3.5 py-2 rounded-xl bg-focus-neon text-white text-xs font-mono font-bold flex items-center gap-1 hover:bg-blue-600 shadow-md"
              >
                <Plus size={13} /> Özel Font Yükle (Import)
              </button>
            </div>
          </div>

          {/* Interactive Preview Text Control */}
          <div className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-1.5">
            <label className="text-[10px] text-text-secondary font-mono block">DİNAMİK ÖNİZLEME METNİ</label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full bg-transparent text-xs font-mono text-white focus:outline-none border-b border-white/10 pb-1"
            />
          </div>

          {/* FONTS CONTAINER SCROLL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {filteredFonts.map((fnt) => {
              const isSelected = selectedFontId === fnt.id;
              const isEditingTree = editingTreeFontId === fnt.id;

              return (
                <div
                  key={fnt.id}
                  onClick={() => handleSelectFont(fnt.id)}
                  className={`group relative cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                    isSelected 
                      ? 'border-focus-neon bg-focus-neon/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-focus-neon/30' 
                      : 'border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        {fnt.name}
                        {fnt.isMonospace && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-mono">Monospace</span>
                        )}
                        {fnt.isCustom && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[8px] font-mono">Özel</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => handleToggleFavoriteFont(fnt.id, e)}
                          className={`p-1 rounded hover:bg-white/10 ${fnt.isFavorite ? 'text-amber-400' : 'text-text-secondary'}`}
                          title="Sık Kullanılan"
                        >
                          <Star size={11} fill={fnt.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => handleToggleEnableFont(fnt.id, e)}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                            fnt.isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}
                          title={fnt.isEnabled ? "Aktif (Tıkla Pasifleştir)" : "Pasif (Tıkla Aktifleştir)"}
                        >
                          {fnt.isEnabled ? 'AÇIK' : 'KAPALI'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTreeFontId(isEditingTree ? null : fnt.id);
                          }}
                          className={`p-1 rounded hover:bg-white/10 ${isEditingTree ? 'text-focus-neon' : 'text-text-secondary hover:text-white'}`}
                          title="Tipografi Ağacını Düzenle"
                        >
                          <Sliders size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Font Preview Area */}
                    <div 
                      className="p-3 bg-black/60 rounded-xl border border-white/5 text-center min-h-[48px] flex items-center justify-center overflow-hidden"
                      style={{ fontFamily: fnt.family }}
                    >
                      <span className="text-white text-sm font-medium leading-tight truncate w-full">
                        {previewText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-text-secondary">
                    <span>Ağırlıklar: {fnt.weights.length} seviye</span>
                    <span>Lisans: {fnt.license || 'OFL'}</span>
                  </div>

                  {/* SUB-SECTION: Typography Tree Inline Levels Editors */}
                  {isEditingTree && fnt.typographyTree && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 p-3 bg-slate-900 rounded-xl border border-white/10 space-y-3 font-mono text-[10px]"
                    >
                      <span className="font-bold text-focus-neon block">Tipografi Ağacı Seviyeleri (Typography Tree levels)</span>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {[
                          { key: 'displayXl', label: 'Display XL' },
                          { key: 'headingXl', label: 'Heading XL' },
                          { key: 'bodyMedium', label: 'Body Medium' },
                          { key: 'button', label: 'Button text' },
                          { key: 'code', label: 'Code' }
                        ].map((levelItem) => {
                          const levelData = (fnt.typographyTree as any)[levelItem.key] as TypographyLevel;
                          if (!levelData) return null;
                          return (
                            <div key={levelItem.key} className="p-2 bg-black/40 rounded-lg space-y-1.5">
                              <div className="flex justify-between items-center text-white/80 font-bold">
                                <span>{levelItem.label}</span>
                                <span className="text-[9px] text-text-secondary">({levelData.fontSize})</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[8px] text-text-secondary">PİKSEL BOYUTU</label>
                                  <input
                                    type="text"
                                    value={levelData.fontSize}
                                    onChange={(e) => handleUpdateTypographyLevel(fnt.id, levelItem.key as any, 'fontSize', e.target.value)}
                                    className="w-full mt-0.5 p-1 bg-black/40 border border-white/10 rounded text-white text-[9px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] text-text-secondary">AĞIRLIK (WEIGHT)</label>
                                  <input
                                    type="text"
                                    value={levelData.fontWeight}
                                    onChange={(e) => handleUpdateTypographyLevel(fnt.id, levelItem.key as any, 'fontWeight', e.target.value)}
                                    className="w-full mt-0.5 p-1 bg-black/40 border border-white/10 rounded text-white text-[9px]"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FONT COLLECTION IMPORT DRAWER */}
          <AnimatePresence>
            {isImportingFont && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-5 rounded-2xl bg-slate-900 border border-focus-neon/30 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                    <Type size={13} className="text-focus-neon" /> Özel Yazı Tipi Kitaplığına Ekle (Font Pack Scan)
                  </span>
                  <button onClick={() => setIsImportingFont(false)} className="text-text-secondary hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
                  <div>
                    <label className="text-[9px] text-text-secondary block font-bold">YAZI TİPİ ADI (NAME)</label>
                    <input
                      type="text"
                      placeholder="Örn. Cabinet Grotesk"
                      value={importFontName}
                      onChange={(e) => setImportFontName(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-text-secondary block font-bold">FONT FAMILY (CSS DECLARATION)</label>
                    <input
                      type="text"
                      placeholder='Örn. "Cabinet Grotesk", sans-serif'
                      value={importFontFamily}
                      onChange={(e) => setImportFontFamily(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-text-secondary block font-bold">AĞIRLIKLAR (WEIGHTS)</label>
                    <input
                      type="text"
                      value={importFontWeights}
                      onChange={(e) => setImportFontWeights(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-text-secondary block font-bold">LİSANS SÖZLEŞMESİ</label>
                    <input
                      type="text"
                      value={importFontLicense}
                      onChange={(e) => setImportFontLicense(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-950/20 border border-focus-neon/20 rounded-xl text-[10px] font-mono text-text-secondary">
                  💡 <strong>Tipografi Ağacı Taraması:</strong> Eklenen yazı tipi için standart Display XL, Heading L ve Body Medium gibi 19 farklı hiyerarşik tipografi seviyesi içeren bir ağaç otomatik olarak inşa edilir.
                </div>

                <div className="flex justify-end gap-2 text-xs font-mono">
                  <button
                    onClick={() => setIsImportingFont(false)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 text-text-secondary hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleImportFontCollection}
                    className="px-4 py-2 rounded-xl bg-focus-neon text-white font-bold"
                  >
                    Taramayı Başlat & Kaydet
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 3: AI RECOMMENDATION ENGINE */}
      {activeTab === 'ai' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-gradient-to-b from-blue-950/20 to-slate-950/50 border border-focus-neon/30 space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-focus-neon/5 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-focus-neon/15 flex items-center justify-center text-focus-neon border border-focus-neon/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Bot size={20} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-white">Yapay Zeka Tasarım Sentez Raporu</h4>
                <p className="text-[10px] font-mono text-text-secondary">Apex OS AI Engine v5.0 Pro Analizi</p>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-xs font-mono text-text-secondary space-y-2 relative z-10 leading-relaxed">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider block">Görsel ve Uyumluluk Analizi</span>
              <p>{aiRecommendation.reason}</p>
            </div>

            {/* Scorecard grids */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 font-mono text-xs">
              {[
                { label: 'UYUMLULUK SKORU', val: aiRecommendation.compatibilityScore, color: 'text-focus-neon' },
                { label: 'OKUNABİLİRLİK SKORU', val: aiRecommendation.readabilityScore, color: 'text-emerald-400' },
                { label: 'KONTRAST DEĞERİ', val: aiRecommendation.contrastScore, color: 'text-sky-400' },
                { label: 'GÖRSEL HARMONİ', val: aiRecommendation.visualHarmonyScore, color: 'text-purple-400' }
              ].map((score, idx) => (
                <div key={idx} className="p-3 bg-black/50 border border-white/5 rounded-xl text-center space-y-1">
                  <span className="text-[8px] text-white/50 block">{score.label}</span>
                  <span className={`text-lg font-black ${score.color}`}>%{score.val}</span>
                </div>
              ))}
            </div>

            {/* AI Recommendation applying panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-focus-neon/5 border border-focus-neon/20 rounded-2xl relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-focus-neon font-bold uppercase tracking-widest block">ÖNERİLEN KOMBİNASYON</span>
                <span className="text-xs text-white font-bold block">
                  {palettes.find(p => p.id === aiRecommendation.recommendedPaletteId)?.name || 'Default'} Palet + {fonts.find(f => f.id === aiRecommendation.recommendedFontId)?.name || 'Default'} Font
                </span>
              </div>
              <button
                onClick={() => {
                  setOverrideMode('ai');
                }}
                className="px-4 py-2.5 rounded-xl bg-focus-neon hover:bg-blue-600 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/20"
              >
                AI Tavsiyesini Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
