import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Palette, 
  Sliders, 
  Check, 
  Eye, 
  Zap, 
  Layers, 
  Wand2, 
  Sun, 
  Droplet, 
  LayoutGrid, 
  Box, 
  RotateCcw,
  RotateCw,
  Bookmark,
  Activity,
  SlidersHorizontal,
  Cpu,
  Search,
  Columns,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Gauge,
  Sparkle,
  Layers3,
  Feather,
  Flame,
  Volume2,
  Lock,
  Lightbulb,
  MousePointer,
  Maximize2,
  Copy,
  Info,
  ChevronRight,
  ChevronLeft,
  BatteryCharging,
  ZapOff,
  Bot,
  Terminal,
  Send,
  Database,
  Trash2,
  HelpCircle,
  BarChart3,
  Monitor,
  Laptop,
  Tv,
  Heart,
  Star,
  FileText,
  Settings,
  Share2,
  Smartphone,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useWallpaper, WALLPAPER_PRESETS, WallpaperPreset, WallpaperSourceType, WallpaperConfig } from '../../context/WallpaperContext';
import { parseMlwFile, ParsedLivelyWallpaper } from '../../utils/mlwParser';
import { saveWallpaper, getAllWallpapers, deleteWallpaper, DbWallpaper } from '../../services/wallpaperDb';
import { 
  STUDIO_PRESETS, 
  StudioPreset, 
  runAiWallpaperAnalysis, 
  analyzeWallpaperV4,
  analyzeWallpaperV5,
  computeVisualQualityScore,
  computeHarmonyAdjustments,
  processNaturalLanguageCommand,
  processNaturalLanguageCommandV5,
  MATERIAL_PRESETS,
  EXPERIENCE_INTENTIONS,
  MaterialType,
  AiThemeAnalysisResult, 
  DetailedVisualQualityScore,
  AIWallpaperAnalysisV4,
  AIWallpaperAnalysisV5,
  generateThemeV4,
  generateThemeV5,
  trackUserPreference,
  trackUserEditV5,
  getLearnedPreferencesV5,
  resetLearnedPreferencesV5,
  exportPreferenceProfileV5,
  detectDeviceDNAV5,
  detectDisplayDNAV5,
  detectHardwareDNAV5,
  detectWallpaperFormat,
  DISPLAY_QUALITY_PROFILES,
  evaluateVisualRuleEngine,
  runWallpaperAiEnhancementPipeline,
  DeviceDNAV5,
  DisplayDNAV5,
  HardwareDNAV5
} from '../../utils/themeStudioEngine';

import DesignAssetLibrary from './DesignAssetLibrary';
import { GlowEngineStep } from './GlowEngineStep';
import { ThemeColorSystemStep } from './ThemeColorSystemStep';
import { TypographyFontSystemStep } from './TypographyFontSystemStep';
import { WallpaperDisplayInteractionStep } from './WallpaperDisplayInteractionStep';

export function WallpaperWizardModal() {
  const { 
    config, 
    updateConfig, 
    applyPaletteToTheme, 
    applyTypographyToTheme,
    isWizardOpen, 
    closeWizard, 
    resetToDefault,
    undo,
    redo,
    canUndo,
    canRedo,
    saveSnapshot,
    snapshots,
    loadSnapshot
  } = useWallpaper();

  // New Wizard Step state (1 - 6)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [assetSettings, setAssetSettings] = useState<any>(null);
  
  // Simulated viewport device in Step 4 & 6
  const [simulatedDevice, setSimulatedDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop');

  // AI Scanning visual states
  const [isAnalyzingStep2, setIsAnalyzingStep2] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [activeAnalysisLog, setActiveAnalysisLog] = useState<string>('Analiz başlatılıyor...');

  // Step 1 Selection Tabs
  const [step1Tab, setStep1Tab] = useState<'presets' | 'uploads' | 'snapshots'>('presets');

  // Step 3 Customization Accordion/Section
  const [customSec, setCustomSec] = useState<'colors' | 'materials' | 'cards' | 'typography'>('colors');

  // Step 6 Save options
  const [themeName, setThemeName] = useState<string>('');
  const [isThemeFavorite, setIsThemeFavorite] = useState<boolean>(false);
  const [beforeAfterSplit, setBeforeAfterSplit] = useState<number>(50); // percentage slider for before/after split
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);

  // Apply & Save workflow automation states
  const [isSavingPipelineActive, setIsSavingPipelineActive] = useState<boolean>(false);
  const [pipelineLog, setPipelineLog] = useState<string>('');
  const [successState, setSuccessState] = useState<{
    show: boolean;
    stage: 'idle' | 'created' | 'saved' | 'applied' | 'done';
  }>({ show: false, stage: 'idle' });
  const [recoverySession, setRecoverySession] = useState<any | null>(null);

  // Save workflow optional settings state
  const [optApplyImmediately, setOptApplyImmediately] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('opt_apply_immediately');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });
  const [optReturnToHome, setOptReturnToHome] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('opt_return_to_home');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });
  const [optKeepWizardOpen, setOptKeepWizardOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('opt_keep_wizard_open');
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [optStartNewAutomatically, setOptStartNewAutomatically] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('opt_start_new_automatically');
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [optOpenThemeEditor, setOptOpenThemeEditor] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('opt_open_theme_editor');
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [optReplaceExisting, setOptReplaceExisting] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('opt_replace_existing');
      return saved !== null ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [optCreateCopy, setOptCreateCopy] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('opt_create_copy');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });

  useEffect(() => {
    localStorage.setItem('opt_apply_immediately', JSON.stringify(optApplyImmediately));
  }, [optApplyImmediately]);
  useEffect(() => {
    localStorage.setItem('opt_return_to_home', JSON.stringify(optReturnToHome));
    if (optReturnToHome) setOptKeepWizardOpen(false);
  }, [optReturnToHome]);
  useEffect(() => {
    localStorage.setItem('opt_keep_wizard_open', JSON.stringify(optKeepWizardOpen));
    if (optKeepWizardOpen) setOptReturnToHome(false);
  }, [optKeepWizardOpen]);
  useEffect(() => {
    localStorage.setItem('opt_start_new_automatically', JSON.stringify(optStartNewAutomatically));
  }, [optStartNewAutomatically]);
  useEffect(() => {
    localStorage.setItem('opt_open_theme_editor', JSON.stringify(optOpenThemeEditor));
  }, [optOpenThemeEditor]);
  useEffect(() => {
    localStorage.setItem('opt_replace_existing', JSON.stringify(optReplaceExisting));
    if (optReplaceExisting) setOptCreateCopy(false);
  }, [optReplaceExisting]);
  useEffect(() => {
    localStorage.setItem('opt_create_copy', JSON.stringify(optCreateCopy));
    if (optCreateCopy) setOptReplaceExisting(false);
  }, [optCreateCopy]);

  // DB & Upload File State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dbWallpapers, setDbWallpapers] = useState<DbWallpaper[]>([]);

  // Design Taste Dials & Advanced Engine states
  const [knowledgeModeActive, setKnowledgeModeActive] = useState<boolean>(false);
  const [showHud, setShowHud] = useState<boolean>(true);
  const [helpPopup, setHelpPopup] = useState<{
    title: string;
    overview: string;
    aiReasoning: string;
    gpu: string;
    cpu: string;
    memory: string;
    fps: string;
    battery: string;
    accessibility: string;
    related: string;
    min: string;
    rec: string;
    max: string;
    practices: string;
  } | null>(null);

  // Advanced FPS & Resolution Engine states
  const [targetFps, setTargetFps] = useState<number>(144);
  const [autoFpsMode, setAutoFpsMode] = useState<boolean>(true);
  const [activeRenderingPreset, setActiveRenderingPreset] = useState<string>('Balanced');
  const [activeDisplayResolution, setActiveDisplayResolution] = useState<string>('4K UHD (3840×2160)');
  const [adaptiveBlurEnabled, setAdaptiveBlurEnabled] = useState<boolean>(true);
  const [dynamicLightingEnabled, setDynamicLightingEnabled] = useState<boolean>(true);
  const [reflectionLayerEnabled, setReflectionLayerEnabled] = useState<boolean>(true);
  const [lockedSettings, setLockedSettings] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDbWallpapers = useCallback(async () => {
    try {
      const list = await getAllWallpapers();
      setDbWallpapers(list);
    } catch (err) {
      console.error('Error loading custom wallpapers from db:', err);
    }
  }, []);

  useEffect(() => {
    if (isWizardOpen) {
      loadDbWallpapers();
    }
  }, [isWizardOpen, loadDbWallpapers]);

  // Simulated AI scan steps with dedicated Static vs Animated pipelines
  useEffect(() => {
    if (wizardStep === 2) {
      setIsAnalyzingStep2(true);
      setAnalysisProgress(0);
      setActiveAnalysisLog('Görsel Analiz Motoru başlatılıyor...');

      const format = detectWallpaperFormat(config.rawFileName || '', config.sourceType);
      const isAnimated = config.sourceType === 'video' || 
                         config.sourceType === 'lively' || 
                         format.includes('Video') || 
                         format.includes('Animated') || 
                         format.includes('Live') || 
                         format.includes('Lottie');

      const animatedLogs = [
        '[DECODER] Video kod çözücü ve arabellek akışı başlatılıyor...',
        '[SAMPLER] Akıllı Kare Örnekleyici (Smart Frame Sampler) aktif: 24 kare işleniyor...',
        '[DETECTOR] Anahtar Kare Dedektörü (Key Frame Detector) sahne geçişlerini ve flash pikselleri tarıyor...',
        '[SCENE ENGINE] Sahne Karakterizasyon Sınıflandırıcısı ve Mood Motoru analiz yapıyor...',
        '[MOTION ANALYZER] Hareket Analizörü vektör hızını, dalga stabilizasyonunu ve piksel enerjisini hesaplıyor...',
        '[TIMELINE] Renk Zaman Tüneli (Color Timeline Generator) 4 farklı oynatım fazının renk döngüsünü modelliyor...',
        '[READABILITY] Güvenli yerleşim alanları ve engelleyici nesne tespiti koordinat haritasını çıkarıyor...',
        '[DNA SYNTHESIS] APEX AI v5.0 Tema DNA Sentezi tamamlandı! Akışkan canlandırma profili kilitlendi.'
      ];

      const staticLogs = [
        '[IMAGE DECODER] Görsel kod çözücü pikselleri ham bellek alanına çıkarıyor...',
        '[SPECTRUM] Piksel matrisi, kenar keskinliği ve gürültü oranı taranıyor...',
        '[HARMONY] Baskın renk tayfı ve tamamlayıcı renk teorisi matrisi hesaplanıyor...',
        '[MATERIAL] Cam, akrilik, oled siyahı ve kristal materyal yansımaları hesaplanıyor...',
        '[LIGHTING] Küresel aydınlatma şiddeti, yönü ve gölge koordinatları simüle ediliyor...',
        '[CONTRAST] WCAG AA metin okunabilirlik kontrast puanı test ediliyor...',
        '[HARDWARE] Cihaz yetenekleri ve ekran yenileme hızı DNA uyumluluğu doğrulanıyor...',
        '[AI FINISH] Yapay zeka optimizasyonları ve statik tema sentezi başarıyla tamamlandı!'
      ];

      const activeLogs = isAnimated ? animatedLogs : staticLogs;

      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          const next = prev + 5;
          
          // Rotate active logs based on progress percentage
          const logIdx = Math.min(Math.floor((next / 100) * activeLogs.length), activeLogs.length - 1);
          setActiveAnalysisLog(activeLogs[logIdx]);

          if (next >= 100) {
            clearInterval(interval);
            setIsAnalyzingStep2(false);
            return 100;
          }
          return next;
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [wizardStep, config.rawFileName, config.sourceType]);

  // Compute AI analysis and Visual Quality Score live
  const aiAnalysisV4: AIWallpaperAnalysisV4 = analyzeWallpaperV4(config);
  const aiAnalysisV5: AIWallpaperAnalysisV5 = analyzeWallpaperV5(config, activeRenderingPreset === 'Eco' ? 'Low' : activeRenderingPreset === 'Balanced' ? 'Medium' : 'High');
  const qualityScore: DetailedVisualQualityScore = computeVisualQualityScore(config);
  const deviceDna: DeviceDNAV5 = detectDeviceDNAV5();
  const displayDna: DisplayDNAV5 = detectDisplayDNAV5();
  const hardwareDna: HardwareDNAV5 = detectHardwareDNAV5();
  const activeRules = evaluateVisualRuleEngine(config);

  // Auto-fill theme name based on selected preset or file name
  useEffect(() => {
    if (config.rawFileName) {
      setThemeName(config.rawFileName.split('.')[0] + ' AI Theme');
    } else if (config.presetId) {
      const preset = WALLPAPER_PRESETS.find(p => p.id === config.presetId);
      if (preset) {
        setThemeName(preset.name + ' Studio');
      }
    } else {
      setThemeName('Apex Custom Premium Theme');
    }
  }, [config.presetId, config.rawFileName]);

  // File Drop Processing
  const processSelectedFile = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const parsed = await parseMlwFile(file);

      let sourceType: WallpaperSourceType = 'image';
      if (parsed.type === 'video') sourceType = 'video';
      else if (parsed.type === 'lively' || parsed.type === 'html') sourceType = 'lively';
      else if (parsed.mimeType?.startsWith('video')) sourceType = 'video';

      const customId = `custom_${Date.now()}`;
      try {
        await saveWallpaper({
          id: customId,
          name: file.name,
          fileBlob: file,
          type: sourceType === 'video' ? 'video' : sourceType === 'lively' ? 'lively' : 'image',
          mimeType: file.type || parsed.mimeType,
          palette: parsed.palette,
          createdAt: Date.now()
        });
        loadDbWallpapers();
      } catch (dbErr) {
        console.error('Failed to save wallpaper to IndexedDB:', dbErr);
      }

      updateConfig({
        sourceType,
        customWallpaperId: customId,
        mediaUrl: parsed.mediaUrl,
        previewUrl: parsed.previewUrl || parsed.mediaUrl,
        rawFileName: parsed.rawFileName,
        mimeType: parsed.mimeType,
        presetId: undefined,
        activePalette: parsed.palette
      });

      if (config.autoSyncTheme) {
        applyPaletteToTheme(parsed.palette);
      }
      
      // Advance to Step 2 automatically upon successful file upload
      setWizardStep(2);
    } catch (err: any) {
      console.error('File process error:', err);
      setErrorMessage(err.message || 'Dosya okunamadı veya biçimi desteklenmiyor.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [config.autoSyncTheme, updateConfig, applyPaletteToTheme, loadDbWallpapers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Select Preset Wallpaper
  const handleApplyPreset = (preset: WallpaperPreset) => {
    updateConfig({
      presetId: preset.id,
      sourceType: 'preset',
      previewUrl: preset.previewUrl,
      mediaUrl: preset.previewUrl,
      activePalette: preset.palette,
      rawFileName: preset.name + '.jpg'
    });
    if (config.autoSyncTheme) {
      applyPaletteToTheme(preset.palette);
    }
  };

  // Select Material
  const handleSelectMaterial = (materialId: MaterialType) => {
    const mat = MATERIAL_PRESETS.find(m => m.id === materialId);
    if (mat) {
      updateConfig({
        selectedMaterial: materialId,
        ...mat.config
      });
    }
  };

  // Select IndexedDB stored wallpaper
  const handleSelectDbWallpaper = useCallback((item: DbWallpaper) => {
    const mediaUrl = URL.createObjectURL(item.fileBlob);
    const sourceType: WallpaperSourceType = item.type === 'video' ? 'video' : item.type === 'lively' ? 'lively' : 'image';
    updateConfig({
      sourceType,
      customWallpaperId: item.id,
      mediaUrl,
      previewUrl: mediaUrl,
      rawFileName: item.name,
      mimeType: item.mimeType,
      presetId: undefined,
      activePalette: item.palette
    });
    if (config.autoSyncTheme && item.palette) {
      applyPaletteToTheme(item.palette);
    }
  }, [config.autoSyncTheme, updateConfig, applyPaletteToTheme]);

  // Delete IndexedDB stored wallpaper
  const handleDeleteDbWallpaper = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteWallpaper(id);
      loadDbWallpapers();
    } catch (err) {
      console.error('Failed to delete wallpaper from IndexedDB:', err);
    }
  }, [loadDbWallpapers]);

  // Duplicate a Theme Snapshot
  const handleDuplicateSnapshot = (snapshot: any) => {
    updateConfig({
      ...snapshot.config,
      rawFileName: snapshot.name + ' Copy'
    });
  };

  // Helper function to programmatically capture a video frame for preview
  const captureVideoFrame = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(videoUrl);
        return;
      }
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.currentTime = 1.0; // Seek to 1s
      video.muted = true;
      video.playsInline = true;
      
      video.onloadeddata = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
            return;
          }
        } catch (err) {
          console.error('Failed to draw video frame to canvas:', err);
        }
        resolve(videoUrl);
      };

      video.onerror = () => {
        resolve(videoUrl);
      };
    });
  };

  // Final Save Theme Snapshots with Complete Theme Pipeline
  const handleSaveTheme = async () => {
    setIsSavingPipelineActive(true);
    setPipelineLog('Başlatılıyor...');
    
    try {
      // ----------------------------------------------------
      // STEP 1: VALIDATE ALL SETTINGS
      // ----------------------------------------------------
      setPipelineLog('Adım 1: Görsel ve parametre bütünlüğü doğrulanıyor...');
      await new Promise(r => setTimeout(r, 600));

      const updates: Partial<WallpaperConfig> = {};
      
      // Wallpaper Selection Check
      const hasWallpaper = config.presetId || config.customWallpaperId || config.mediaUrl;
      if (!hasWallpaper) {
        updates.presetId = WALLPAPER_PRESETS[0].id;
        updates.sourceType = 'preset';
        updates.previewUrl = WALLPAPER_PRESETS[0].previewUrl;
        updates.mediaUrl = WALLPAPER_PRESETS[0].previewUrl;
        updates.activePalette = WALLPAPER_PRESETS[0].palette;
      }

      // Theme generated & Color palette generated
      if (!config.activePalette || !config.activePalette.primaryNeon) {
        updates.activePalette = config.presetId 
          ? WALLPAPER_PRESETS.find(p => p.id === config.presetId)?.palette || WALLPAPER_PRESETS[0].palette
          : WALLPAPER_PRESETS[0].palette;
      }

      // AI Analysis completed check & Theme DNA created
      if (!config.themeDna) {
        updates.themeDna = {
          material: config.selectedMaterial || 'glass',
          mood: aiAnalysisV5.moodAnalysis?.primaryMood || 'Elegant',
          depth: 'Hyper-Depth 3D',
          motion: 'Calm',
          lighting: 'Soft Ambient',
          contrast: 'High',
          glass: 'Frosted',
          typography: 'Plus Jakarta',
          performanceProfile: 'Balanced',
          accessibility: 'WCAG AA',
          wallpaperProfile: config.rawFileName || 'Standard Profile',
          deviceDna: deviceDna,
          displayDna: displayDna,
          hardwareDna: hardwareDna,
          version: '5.0'
        };
      }

      // Card style defaults if missing
      if (config.cardBlurAmount === undefined) updates.cardBlurAmount = 24;
      if (config.cardBgOpacity === undefined) updates.cardBgOpacity = 18;
      if (config.cardBorderRadius === undefined) updates.cardBorderRadius = 24;
      if (config.cardBorderWidth === undefined) updates.cardBorderWidth = 1;
      if (config.cardBorderOpacity === undefined) updates.cardBorderOpacity = 25;
      if (config.cardGlowEffect === undefined) updates.cardGlowEffect = 'none';
      if (config.cardShadowDepth === undefined) updates.cardShadowDepth = 'deep-3d';

      // Animation & Glow settings defaults
      if (config.animationSpeedMs === undefined) updates.animationSpeedMs = 200;
      if (config.motionIntensity === undefined) updates.motionIntensity = 50;
      if (config.glowEnabled === undefined) updates.glowEnabled = true;

      // Apply any missing generated parameters immediately to keep state solid
      if (Object.keys(updates).length > 0) {
        updateConfig(updates);
      }

      // ----------------------------------------------------
      // STEP 2: BUILD THE THEME PACKAGE
      // ----------------------------------------------------
      setPipelineLog('Adım 2: APEX Premium Tema Paketi (V5.0) inşa ediliyor...');
      await new Promise(r => setTimeout(r, 700));

      const isAnimated = config.sourceType === 'video' || config.sourceType === 'lively';
      const wallpaperType = isAnimated ? 'Video / MLW' : 'Static Image';

      // Generate dynamic theme profile object
      const themeId = optReplaceExisting 
        ? (snapshots.find(s => s.name === themeName)?.id || `snap_${Date.now()}`)
        : `snap_${Date.now()}`;

      const completeThemeProfile = {
        themeId: themeId,
        themeName: themeName || 'Yeni Özel Tasarım Temam',
        creationDate: Date.now(),
        lastModified: Date.now(),
        version: '5.0' as const,
        isFavorite: isThemeFavorite,
        designAssets: {
          selectedPaletteId: assetSettings?.selectedPaletteId || 'material_default',
          selectedFontId: assetSettings?.selectedFontId || 'font_inter',
          overrideMode: assetSettings?.overrideMode || 'ai',
          customPaletteOverrides: assetSettings?.customPaletteOverrides || null,
          customTypographyOverrides: assetSettings?.customTypographyOverrides || null,
          aiRecommendation: assetSettings?.aiRecommendation || null
        },

        wallpaperInfo: {
          originalWallpaper: config.mediaUrl || config.previewUrl || WALLPAPER_PRESETS[0].previewUrl,
          thumbnail: config.previewUrl || config.mediaUrl || WALLPAPER_PRESETS[0].previewUrl,
          preview: config.previewUrl || config.mediaUrl || WALLPAPER_PRESETS[0].previewUrl,
          wallpaperType: wallpaperType,
          mimeType: config.mimeType || 'image/jpeg',
          position: 'center-cover'
        },

        aiAnalysis: {
          themeDna: config.themeDna || updates.themeDna,
          mood: aiAnalysisV5.moodAnalysis?.primaryMood || 'Elegant',
          materialDetection: config.selectedMaterial || 'glass',
          brightness: config.brightness || 100,
          contrast: config.saturation || 100,
          saturation: config.saturation || 100,
          motionProfile: aiAnalysisV5.motionIntelligence?.speed || 'None',
          readabilityScore: qualityScore.readabilityScore || 85
        },

        colorSystem: {
          activePalette: config.activePalette || updates.activePalette || WALLPAPER_PRESETS[0].palette,
          colorTimeline: aiAnalysisV5.colorTimeline || null,
          primaryNeon: config.activePalette?.primaryNeon || '#3b82f6',
          secondaryMain: config.activePalette?.secondaryMain || '#1d4ed8',
          glowRgb: config.activePalette?.glowRgb || '59, 130, 246',
          accentHexList: config.activePalette?.accentHexList || []
        },

        typography: {
          titleFont: 'Playfair Display',
          bodyFont: 'Plus Jakarta Sans',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSizeScale: 'Mathematical Minor Second (1.125)',
          readabilityScore: qualityScore.readabilityScore || 85
        },

        icons: {
          iconSet: 'lucide',
          sidebarIconsGlow: config.glowEnabled ?? true,
          dockIconSize: 48
        },

        animations: {
          speedMs: config.animationSpeedMs || 200,
          motionIntensity: config.motionIntensity || 50,
          transitionStyle: 'fade-and-slide'
        },

        glow: {
          glowEnabled: config.glowEnabled ?? true,
          glowType: config.glowType || 'pulse',
          glowShape: config.glowShape || 'corner-orbs',
          glowIntensity: config.glowIntensity || 25,
          glowRadius: config.glowRadius || 55,
          glowColorMode: config.glowColorMode || 'dual-gradient'
        },

        blur: {
          cardBlurAmount: config.cardBlurAmount || 24,
          overlayOpacity: config.overlayOpacity || 30
        },

        glassSettings: {
          selectedMaterial: config.selectedMaterial || 'glass',
          frostIntensity: config.frostIntensity || 45,
          glassTintOpacity: config.glassTintOpacity || 30,
          ambientLightingIntensity: config.ambientLightingIntensity || 35
        },

        cardStyles: {
          cardBorderRadius: config.cardBorderRadius || 20,
          cardBorderWidth: config.cardBorderWidth || 1,
          cardBorderOpacity: config.cardBorderOpacity || 25,
          cardGlowEffect: config.cardGlowEffect || 'none',
          cardShadowDepth: config.cardShadowDepth || 'deep-3d'
        },

        componentStyles: {
          sidebar: {
            blurAmount: config.sidebarBlurAmount || config.cardBlurAmount || 24,
            bgOpacity: config.sidebarBgOpacity || config.cardBgOpacity || 18
          },
          header: {
            blurAmount: config.headerBlurAmount || config.cardBlurAmount || 24,
            bgOpacity: config.headerBgOpacity || config.cardBgOpacity || 18
          },
          buttons: {
            borderRadius: config.cardBorderRadius || 20,
            glowIntensity: config.borderGlowIntensity || 25
          },
          charts: {
            harmonyEnabled: config.autoHarmonyEngine ?? true,
            opacity: 0.85
          },
          popup: {
            blurAmount: config.popupBlurAmount || 32,
            bgOpacity: config.popupBgOpacity || 45,
            borderOpacity: config.popupBorderOpacity || 35,
            shadowDepth: config.popupShadowDepth || 'floating-glow',
            glowEffect: config.popupGlowEffect || 'none'
          },
          notification: {
            slideDirection: 'top-right',
            durationMs: 4000
          },
          windowEffects: {
            scaleOnOpen: true,
            dragSmoothness: 0.92
          }
        },

        deviceProfiles: {
          deviceType: deviceDna.deviceType || 'Desktop',
          platform: deviceDna.platform || 'Web',
          displayDna: displayDna,
          hardwareDna: hardwareDna
        },

        performanceProfile: {
          fpsLimit: targetFps,
          autoFpsMode: autoFpsMode,
          activeRenderingPreset: activeRenderingPreset,
          gpuLoadPercentage: qualityScore.gpuLoadPercentage || 28,
          estimatedMemoryCostMb: qualityScore.memoryCostMb || 140
        },

        accessibility: {
          readabilityEngineActive: config.readabilityEngineActive ?? true,
          focusEngineActive: config.focusEngineActive ?? true,
          contrastStandard: 'WCAG AA'
        },

        userOverrides: null,
        config: {
          ...config,
          ...updates
        }
      };

      // ----------------------------------------------------
      // STEP 3: GENERATE THEME PREVIEW
      // ----------------------------------------------------
      setPipelineLog('Adım 3: Görsel önizlemeler ve ekran kartı render karesi üretiliyor...');
      
      let generatedPreviewFrame = config.previewUrl || config.mediaUrl || WALLPAPER_PRESETS[0].previewUrl;

      if (isAnimated && config.mediaUrl && !config.mediaUrl.startsWith('blob:')) {
        try {
          const videoFrame = await captureVideoFrame(config.mediaUrl);
          generatedPreviewFrame = videoFrame;
        } catch (captureErr) {
          console.warn('Video frame capture failed, utilizing default preview url', captureErr);
        }
      }

      // Add preview frame data URLs to theme profile
      completeThemeProfile.wallpaperInfo.preview = generatedPreviewFrame;
      completeThemeProfile.wallpaperInfo.thumbnail = generatedPreviewFrame;

      // ----------------------------------------------------
      // STEP 4: SAVE THEME
      // ----------------------------------------------------
      setPipelineLog('Adım 4: Premium tema kitaplığı veri tabanına yazılıyor...');
      await new Promise(r => setTimeout(r, 800));

      const newSnapshotPayload = {
        id: themeId,
        name: themeName || 'Yeni Tasarım Temam',
        timestamp: Date.now(),
        config: {
          ...config,
          ...updates
        },
        isCompleteTheme: true,
        themeProfile: completeThemeProfile
      };

      saveSnapshot(themeName || 'Yeni Tasarım Temam', newSnapshotPayload);

      // ----------------------------------------------------
      // STEP 5: APPLY THEME IMMEDIATELY
      // ----------------------------------------------------
      if (optApplyImmediately) {
        setPipelineLog('Adım 5: Yeni tema kök parametreleri tüm arayüze anında uygulanıyor...');
        await new Promise(r => setTimeout(r, 600));

        // Immediately update config state to apply theme properties
        updateConfig({
          ...config,
          ...updates
        });

        // Trigger root properties injection instantly
        if (config.activePalette || updates.activePalette) {
          applyPaletteToTheme(config.activePalette || updates.activePalette!);
        }
      }

      // ----------------------------------------------------
      // STEP 6: SUCCESS ANIMATION
      // ----------------------------------------------------
      setPipelineLog('Adım 6: Doğrulama tamamlandı!');
      
      setSuccessState({ show: true, stage: 'created' });
      await new Promise(r => setTimeout(r, 700));
      setSuccessState(prev => ({ ...prev, stage: 'saved' }));
      await new Promise(r => setTimeout(r, 700));
      setSuccessState(prev => ({ ...prev, stage: 'applied' }));
      await new Promise(r => setTimeout(r, 1200));
      setSuccessState(prev => ({ ...prev, stage: 'done' }));

      // ----------------------------------------------------
      // STEP 7: RETURN TO WIZARD HOME & RESET SESSION
      // ----------------------------------------------------
      setPipelineLog('Adım 7: Oturum kapatılıyor...');
      await new Promise(r => setTimeout(r, 450));

      // Clear temporary states (Session Reset)
      setIsAnalyzingStep2(false);
      setAnalysisProgress(0);
      setErrorMessage(null);
      setRecoverySession(null);
      setShowBeforeAfter(false);

      if (optReturnToHome) {
        // Return directly to Step 1 & Open 'snapshots' (Kayıtlı Temalarım) Tab
        setWizardStep(1);
        setStep1Tab('snapshots');
      } else if (optKeepWizardOpen) {
        setWizardStep(8);
      }

      if (optStartNewAutomatically) {
        resetToDefault();
        setWizardStep(1);
        setStep1Tab('presets');
      }

      if (optOpenThemeEditor) {
        console.log('Open Theme Editor after save option active');
      }

    } catch (err: any) {
      console.error('Theme finalization save pipeline failed:', err);
      
      // Recovery logic
      const backupSession = {
        themeName,
        config: { ...config },
        timestamp: Date.now()
      };
      setRecoverySession(backupSession);
      try {
        localStorage.setItem('apexos_theme_recovery', JSON.stringify(backupSession));
      } catch (recoverErr) {
        console.error('Failed to store recovery session in localStorage:', recoverErr);
      }

      setErrorMessage('Tema kaydedilirken kritik bir hata oluştu! Kurtarma oturumu oluşturuldu. Lütfen yeniden deneyin.');
    } finally {
      setIsSavingPipelineActive(false);
    }
  };

  // Restore Theme Config from Recovery Session
  const handleRestoreRecovery = () => {
    if (recoverySession?.config) {
      updateConfig(recoverySession.config);
      if (recoverySession.themeName) setThemeName(recoverySession.themeName);
      setErrorMessage(null);
      setRecoverySession(null);
    }
  };

  // Reset a specific customized setting to its AI recommended value
  const resetSettingToAi = (key: string) => {
    if (key === 'material') {
      handleSelectMaterial(aiAnalysisV4.recommendedMaterial || 'glass');
    } else if (key === 'blur') {
      updateConfig({ cardBlurAmount: aiAnalysisV4.recommendedBlur || 24 });
    } else if (key === 'opacity') {
      updateConfig({ cardBgOpacity: aiAnalysisV4.recommendedOpacity || 18 });
    } else if (key === 'glow') {
      updateConfig({ glowEnabled: aiAnalysisV4.recommendedGlow ?? true });
    } else if (key === 'speed') {
      updateConfig({ playbackSpeed: aiAnalysisV4.recommendedMotionSpeed || 1.0 });
    } else if (key === 'radius') {
      updateConfig({ cardBorderRadius: 20 });
    } else if (key === 'borderWidth') {
      updateConfig({ cardBorderWidth: 1 });
    } else if (key === 'shadowDepth') {
      updateConfig({ cardShadowDepth: 'medium' });
    } else if (key === 'colors' && aiAnalysisV4.colorIntelligence?.primaryColor) {
      const newPal = { ...config.activePalette, primaryNeon: aiAnalysisV4.colorIntelligence.primaryColor };
      updateConfig({ activePalette: newPal });
      applyPaletteToTheme(newPal);
    }
  };

  // Export current config as JSON file
  const handleExportTheme = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${themeName.toLowerCase().replace(/\s+/g, '_')}_theme_config.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const handleToggleLock = (key: string) => {
    setLockedSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openHelp = (key: string) => {
    const helpData: Record<string, any> = {
      colors: {
        title: 'Renk Paleti & Vurgu Tonu',
        overview: 'Arayüzdeki birincil neon butonlar, bağlantılar ve odaklama çizgilerini renklendirir.',
        aiReasoning: `AI bu duvar kağıdı için ${aiAnalysisV4.colorIntelligence?.primaryColor || 'canlı bir neon'} tonu seçti çünkü arka plandaki renk harmonisi ve ışık kontrastı bunu gerektiriyordu.`,
        gpu: 'Düşük • Sadece CSS boyama işlemi gerçekleştirilir.',
        cpu: 'Yok • Tarayıcı işlemcisine ek yük bindirmez.',
        memory: 'Yok • Bellek kullanımı sıfırdır.',
        fps: 'Etki etmez • FPS sabittir.',
        battery: 'Çok Düşük • OLED ekranlarda koyu pikseller pil tasarrufu sağlar.',
        accessibility: 'Yüksek • Yüksek kontrastlı renkler, görme engelli kullanıcıların okumasını kolaylaştırır.',
        related: 'Yazı Kontrastı, Kenarlık Parlaması, Neon Işıma',
        min: '#10B981 (Zümrüt Yeşil)',
        rec: aiAnalysisV4.colorIntelligence?.primaryColor || '#3B82F6',
        max: '#EF4444 (Ateş Kırmızısı)',
        practices: 'Arka planınız koyuysa daha parlak neon renkler; arka planınız çok açıksa daha doygun ve koyu vurgu renkleri tercih etmelisiniz.'
      },
      material: {
        title: 'Lüks Cam ve Render Materyalleri',
        overview: 'Panellerin ve widgetların arkasındaki görsel katmanın fiziksel niteliğini belirler.',
        aiReasoning: `Görsel karmaşıklığı dengelemek adına AI size ${aiAnalysisV4.recommendedMaterial || 'Aero Glass'} materyalini önerdi. Böylelikle metin okunabilirliği maksimum düzeye çıkarıldı.`,
        gpu: 'Yüksek • Backdrop-filter bulanıklaştırma için GPU piksel shader katmanlarını kullanır.',
        cpu: 'Düşük • CPU sadece katman yerleşimlerini hesaplar.',
        memory: 'Orta • Tarayıcı arabelleğinde (GPU VRAM) katman görüntüsü saklanır.',
        fps: '-2 ila -5 FPS etki edebilir.',
        battery: 'Orta • Sürekli ekran yenilemelerinde GPU gücü tüketebilir.',
        accessibility: 'Orta • Cam matlığı arttıkça arkadaki metin kontrastı artar ve göz konforu sağlanır.',
        related: 'Bulanıklık, Saydamlık, Kenarlık Kalınlığı',
        min: 'Acrylic (Kompakt)',
        rec: 'Aero Glass (Kristal Buğu)',
        max: 'Carbon / Titanium (Opak metalik)',
        practices: 'Hızlı ve akıcı performans için "Matte" veya "Slate" kullanın. Üst düzey premium estetik için "Crystal Glass" veya "Liquid Acrylic" tercih edin.'
      },
      blur: {
        title: 'Cam Arkası Bulanıklığı (Blur Radius)',
        overview: 'Widget arkasındaki arka plan görselinin ne kadar dağıtılacağını kontrol eder.',
        aiReasoning: `Duvar kağıdının doku yoğunluğu yüksek olduğu için AI buğulanmayı ${aiAnalysisV4.recommendedBlur || 24} piksel olarak belirledi. Bu, harika bir derinlik efekti sağlar.`,
        gpu: 'Çok Yüksek • En pahalı render efektidir. Piksel başına çoklu renk örneklemesi (multi-sampling) yapar.',
        cpu: 'Yok',
        memory: 'Düşük • VRAM tamponu oluşturulur.',
        fps: 'Yüksek çözünürlüklerde (4K/5K) -5 ila -10 FPS düzeltebilir.',
        battery: 'Yüksek • GPU shader ünitelerini yoğun kullanır.',
        accessibility: 'Kritik • Kapsayıcı okunabilirliğini doğrudan etkiler. Metinlerin okunabilmesi için en az 16px blur önerilir.',
        related: 'Kapsayıcı Şeffaflığı, Kenarlık Gölgeleri',
        min: '0px (Sıfır Bulanıklık)',
        rec: '24px (Maksimum Uyum)',
        max: '64px (Yoğun Akrilik)',
        practices: 'Karmaşık duvar kağıtlarında bulanıklığı arttırın (30px+). Düz ve minimalist duvar kağıtlarında düşük bulanıklık (8px-16px) daha temiz durur.'
      },
      opacity: {
        title: 'Kapsayıcı Saydamlığı (Opacity)',
        overview: 'Widgetların arka plan renginin yoğunluğunu ve doluluk oranını belirler.',
        aiReasoning: `Arka plan aydınlatmasına göre ideal kontrast oranı için AI saydamlığı %${aiAnalysisV4.recommendedOpacity || 18} seviyesinde tuttu.`,
        gpu: 'Düşük • Şeffaflık alfa kanalı harmanlaması GPU için kolaydır.',
        cpu: 'Yok',
        memory: 'Yok',
        fps: 'Etki Etmez • Sıfır kayıp.',
        battery: 'Çok Düşük',
        accessibility: 'Yüksek • Çok düşük şeffaflık (örneğin %5) metinlerin okunmasını zorlaştırabilir. En az %15-25 arası önerilir.',
        related: 'Bulanıklık Değeri, Gölge Yoğunluğu',
        min: '%5 (Ultra Transparan)',
        rec: '%18 (Dengeli)',
        max: '%85 (Neredeyse Mat)',
        practices: 'Arka planınız çok hareketliyse opasiteyi arttırarak metinlerin altına koruyucu bir renk tabakası ekleyin.'
      },
      radius: {
        title: 'Kenarlık Yuvarlaklığı (Border Radius)',
        overview: 'Kapsayıcı köşelerinin ne kadar yumuşak olacağını piksel cinsinden ayarlar.',
        aiReasoning: 'Sistemin genel estetik dilinde modern bir akış hissi yaratmak için 20px standart yuvarlaklık uygulandı.',
        gpu: 'Yok',
        cpu: 'Yok',
        memory: 'Yok',
        fps: 'Sıfır Kayıp',
        battery: 'Yok',
        accessibility: 'Yüksek • Yuvarlak köşeler, görsel elemanların birbirini kesmesini önleyerek göz yorgunluğunu azaltır.',
        related: 'Kenarlık Kalınlığı, Cam Efekti',
        min: '0px (Köşeli, Endüstriyel)',
        rec: '20px (Modern Yumuşak)',
        max: '36px (Süper Oval)',
        practices: 'Tüm arayüzde şekil tutarlılığına dikkat edin. Butonlar oval ise kartlar da oval olmalıdır.'
      },
      speed: {
        title: 'Canlı Duvar Kağıdı Oynatım Hızı',
        overview: 'Video ve interaktif canlı duvar kağıtlarının hareket hızını kontrol eder.',
        aiReasoning: 'Gözü yormayacak, sakin ve dinlendirici bir atmosfer yaratmak için hız 1.0x (normal) olarak önerildi.',
        gpu: 'Düşük • Video dekoder donanımını çalıştırır.',
        cpu: 'Düşük • CPU video çerçeve akışını yönetir.',
        memory: 'Düşük • Video çerçeve önbelleği saklanır.',
        fps: 'Video formatına bağlı olarak sabit kalır.',
        battery: 'Orta • Oynatım hızı arttıkça pil tüketimi milivat düzeyinde artabilir.',
        accessibility: 'Yüksek • Aşırı hızlı ve titrek hareketler bazı kullanıcılarda baş dönmesine (hareket hassasiyeti) yol açabilir.',
        related: 'Canlı Ses, Parallaks Etkisi',
        min: '0.5x (Ağır Çekim rüya gibi)',
        rec: '1.0x (Sakin Akış)',
        max: '2.0x (Dinamik & Hızlı)',
        practices: 'Odaklanma gerektiren çalışma saatlerinde hızı 0.75x veya daha düşük tutarak dikkat dağınıklığını önleyebilirsiniz.'
      }
    };
    
    setHelpPopup(helpData[key] || {
      title: 'Sistem Parametresi',
      overview: 'Bu parametre Apex OS Visual Engine üzerinde gerçek zamanlı görsel çıktı üretir.',
      aiReasoning: 'Yapay zeka duvar kağıdı taramasına göre en iyi performansı sağlayacak şekilde optimize etti.',
      gpu: 'Düşük etki',
      cpu: 'Düşük etki',
      memory: 'Sıfır bellek',
      fps: 'Sabit Kare Hızı',
      battery: 'Tasarruflu',
      accessibility: 'Standart Uyumlu',
      related: 'Görsel Motoru',
      min: 'Min Değer',
      rec: 'Önerilen Değer',
      max: 'Maks Değer',
      practices: 'Arayüz dengesini korumak için varsayılan veya önerilen değerlerde kalın.'
    });
  };

  if (!isWizardOpen) return null;

  // Active Wallpaper Metadata helper details
  const activeWpName = config.rawFileName || (config.presetId ? WALLPAPER_PRESETS.find(p => p.id === config.presetId)?.name : 'Bilinmeyen Görsel');
  const activeWpRes = config.sourceType === 'video' ? '3840x2160 UHD' : '2560x1440 QHD';
  const activeWpFormat = config.mimeType?.split('/')[1]?.toUpperCase() || (config.sourceType === 'video' ? 'MP4' : 'JPEG');
  const activeWpSize = config.sourceType === 'video' ? '18.4 MB' : '1.8 MB';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 md:p-5 overflow-hidden select-none">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeWizard}
          className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
        />

        {/* Main Modal Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-7xl h-[92vh] rounded-[2.5rem] bg-slate-950/90 border border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden flex flex-col text-white"
        >
          {/* HEADER BAR: Includes Wizard Progress Stepper */}
          <div className="px-6 py-4 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-focus-neon">
                  <Bot size={22} className={wizardStep === 2 ? "animate-bounce" : "animate-pulse"} />
                </div>
              </div>
              <div>
                <h2 className="text-sm font-display font-black tracking-tight text-white flex items-center gap-2">
                  APEX OS Theme Creation Wizard <span className="px-2 py-0.5 rounded-full bg-focus-neon/20 border border-focus-neon/40 text-[9px] font-mono text-focus-neon">v5.0 Pro</span>
                </h2>
                <p className="text-[10px] text-text-secondary font-mono">
                  {displayDna.aspectRatioString} • {hardwareDna.gpuTier} GPU • Adım {wizardStep} / 12
                </p>
              </div>
            </div>

            {/* PROGRESS LINE & STEP TIMELINE */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar max-w-full">
              {[
                { num: 1, label: 'Görsel', icon: LayoutGrid },
                { num: 2, label: 'AI Analiz', icon: Sparkles },
                { num: 3, label: 'DNA', icon: Compass },
                { num: 4, label: 'Renk', icon: Palette },
                { num: 5, label: 'Görünüm', icon: Maximize2 },
                { num: 6, label: 'Tipografi', icon: FileText },
                { num: 7, label: 'İnce Ayar', icon: Sliders },
                { num: 8, label: 'İkon', icon: Layers },
                { num: 9, label: 'Glow', icon: Sparkles },
                { num: 10, label: 'Animasyon', icon: Activity },
                { num: 11, label: 'Performans', icon: Cpu },
                { num: 12, label: 'Önizleme', icon: Eye }
              ].map((s) => {
                const isActive = wizardStep === s.num;
                const isPassed = wizardStep > s.num;
                const StepIcon = s.icon;
                return (
                  <button
                    key={s.num}
                    onClick={() => setWizardStep(s.num)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all shrink-0 ${
                      isActive 
                        ? 'bg-focus-neon text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/25' 
                        : isPassed 
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/25' 
                        : 'text-text-secondary hover:text-white bg-white/5 border border-white/5'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                      isActive ? 'bg-white text-focus-neon' : isPassed ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white/60'
                    }`}>
                      {s.num}
                    </span>
                    <span className="hidden xl:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ACTION CONTROLS */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={resetToDefault}
                title="Sıfırla"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 transition-all"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={closeWizard}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-text-secondary hover:text-white border border-white/10 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* MAIN MODAL CONTENT BODY */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            
            {/* LEFT CONTROL COLUMN: 7 COLS */}
            <div className="lg:col-span-7 p-6 overflow-y-auto flex flex-col justify-between border-r border-white/10 custom-scrollbar bg-slate-950/40">
              
              <div className="space-y-6">
                {/* STEP 1: WALLPAPER SELECTION */}
                {wizardStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <LayoutGrid size={22} className="text-focus-neon" /> 1. Adım: Duvar Kağıdı ve Kaynak Seçimi
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Sistem tasarımı için temel oluşturacak görseli veya canlı video duvar kağıdını belirleyin.
                      </p>
                    </div>

                    {/* Step 1 Inner Navigation Tabs */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                      <button
                        onClick={() => setStep1Tab('presets')}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                          step1Tab === 'presets' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                        }`}
                      >
                        Galeri Kitaplığı
                      </button>
                      <button
                        onClick={() => setStep1Tab('uploads')}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                          step1Tab === 'uploads' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                        }`}
                      >
                        Bilgisayardan Yükle
                      </button>
                      <button
                        onClick={() => setStep1Tab('snapshots')}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                          step1Tab === 'snapshots' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                        }`}
                      >
                        Kayıtlı Temalarım
                      </button>
                    </div>

                    {/* TAB A: PRESETS GALLERY */}
                    {step1Tab === 'presets' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1 custom-scrollbar">
                          {WALLPAPER_PRESETS.map((p) => {
                            const isSel = config.presetId === p.id;
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleApplyPreset(p)}
                                className={`group relative cursor-pointer rounded-2xl overflow-hidden border transition-all ${
                                  isSel 
                                    ? 'border-focus-neon ring-2 ring-focus-neon/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                                }`}
                              >
                                <div className="aspect-[16/10] bg-slate-900 overflow-hidden relative">
                                  <img 
                                    src={p.previewUrl} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/90">
                                    {p.category}
                                  </span>
                                </div>
                                <div className="p-2.5 bg-black/60 backdrop-blur-md">
                                  <h4 className="text-xs font-bold font-display truncate text-white">{p.name}</h4>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB B: UPLOAD PORT */}
                    {step1Tab === 'uploads' && (
                      <div className="space-y-4">
                        <div
                          onDrop={handleDrop}
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                            isDragOver 
                              ? 'border-focus-neon bg-focus-neon/15 scale-[1.01]' 
                              : 'border-white/20 bg-white/[0.02] hover:border-focus-neon/50 hover:bg-white/[0.04]'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.svg,.gif,.mp4,.m4v,.webm,.mov"
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {isAnalyzing ? (
                            <div className="space-y-3 py-4">
                              <div className="w-12 h-12 rounded-full border-4 border-focus-neon/20 border-t-focus-neon animate-spin mx-auto" />
                              <p className="font-display font-bold text-sm text-focus-neon animate-pulse">
                                Medya Analiz Ediliyor ve Palet Çıkarılıyor...
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="w-14 h-14 rounded-2xl bg-focus-neon/10 border border-focus-neon/30 flex items-center justify-center text-focus-neon shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                <Upload size={28} />
                              </div>
                              <div>
                                <h3 className="text-sm font-display font-black text-white">
                                  Görsel veya <span className="text-focus-neon">MP4 Video</span> Yükleyin
                                </h3>
                                <p className="text-xs text-text-secondary mt-1">
                                  Desteklenen formatlar: JPG, PNG, WEBP, MP4. Sürükleyip bırakabilirsiniz.
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {dbWallpapers.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                              Önceki Yüklemeleriniz ({dbWallpapers.length})
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {dbWallpapers.map((item) => {
                                const isSelected = config.customWallpaperId === item.id;
                                const isVideo = item.type === 'video';
                                const objectUrl = URL.createObjectURL(item.fileBlob);

                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => handleSelectDbWallpaper(item)}
                                    className={`group relative cursor-pointer rounded-xl border p-2 transition-all flex flex-col gap-1 overflow-hidden ${
                                      isSelected
                                        ? 'border-focus-neon bg-focus-neon/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    <div className="w-full h-16 rounded-lg overflow-hidden bg-black/60 relative border border-white/5 flex items-center justify-center">
                                      {isVideo ? (
                                        <video src={objectUrl} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                                      ) : (
                                        <img src={objectUrl} alt={item.name} className="w-full h-full object-cover" />
                                      )}
                                      <button
                                        onClick={(e) => handleDeleteDbWallpaper(item.id, e)}
                                        className="absolute top-1 right-1 p-1 rounded bg-black/80 text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                    <div className="truncate text-[10px] font-bold font-mono text-center text-white/90">{item.name}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB C: SAVED THEMES (SNAPSHOTS) */}
                    {step1Tab === 'snapshots' && (
                      <div className="space-y-4">
                        {snapshots.length === 0 ? (
                          <div className="p-8 text-center bg-white/[0.02] rounded-3xl border border-white/10 text-text-secondary italic text-xs">
                            Kayıtlı herhangi bir tasarımınız bulunmuyor. Temanızı oluşturduktan sonra kaydedebilirsiniz.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {snapshots.map((s) => (
                              <div
                                key={s.id}
                                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-focus-neon/50 transition-all flex items-center justify-between group"
                              >
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-white">{s.name}</h4>
                                  <span className="text-[10px] font-mono text-text-secondary block">
                                    {new Date(s.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => loadSnapshot(s.id)}
                                    className="px-2.5 py-1 rounded bg-focus-neon text-white text-[10px] font-bold hover:bg-blue-600"
                                  >
                                    Yükle
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateSnapshot(s)}
                                    className="p-1 rounded bg-white/5 text-text-secondary hover:text-white"
                                    title="Kopyala"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meta Info Deck */}
                    <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/10 space-y-3">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                        Aktif Duvar Kağıdı Detayları
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[9px] block">İSİM</span>
                          <span className="text-white font-bold truncate block">{activeWpName}</span>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[9px] block">ÇÖZÜNÜRLÜK</span>
                          <span className="text-emerald-400 font-bold block">{activeWpRes}</span>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[9px] block">DOSYA BOYUTU</span>
                          <span className="text-sky-400 font-bold block">{activeWpSize}</span>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-white/40 text-[9px] block">BİÇİM</span>
                          <span className="text-purple-400 font-bold block">{activeWpFormat}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: AI WALLPAPER ANALYSIS */}
                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <Sparkles size={22} className="text-focus-neon" /> 2. Adım: AI Görsel & Palet Analizi
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Yapay zeka duvar kağıdınızı analiz ederek renk uyumunu, cam matlığını, buğulanma değerini ve materyal gereksinimini çıkarır.
                      </p>
                    </div>

                    {/* Scanning Animation Port */}
                    {isAnalyzingStep2 ? (
                      <div className="p-8 rounded-3xl bg-gradient-to-b from-blue-950/20 to-slate-950/50 border border-focus-neon/30 text-center space-y-6 relative overflow-hidden">
                        {/* Glowing radial pulse */}
                        <div className="absolute inset-0 bg-radial-gradient from-focus-neon/5 to-transparent animate-pulse pointer-events-none" />
                        
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                          {/* Inner spinning brain/ai core */}
                          <div className="absolute inset-0 rounded-full border border-focus-neon/30 border-t-focus-neon animate-spin" />
                          <div className="absolute inset-2 rounded-full border border-purple-500/20 border-b-purple-500 animate-spin [animation-direction:reverse]" />
                          <Bot size={36} className="text-focus-neon animate-pulse" />
                        </div>

                        <div className="space-y-2 relative z-10">
                          <h4 className="text-sm font-bold font-mono tracking-widest text-white">
                            APEX AI CORE ANALİZ YAPIYOR
                          </h4>
                          <p className="text-xs text-text-secondary font-mono h-4">{activeAnalysisLog}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden max-w-md mx-auto">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" 
                            style={{ width: `${analysisProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 space-y-5 animate-fade-in text-xs font-mono">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                          <div className="space-y-1">
                            <span className="text-xs font-mono px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold inline-block">
                              ✓ {aiAnalysisV5.isStatic ? 'Statik Görsel Analizi' : 'Canlı Video/Hareket Analizi'} Tamamlandı
                            </span>
                            <div className="text-[10px] text-text-secondary mt-1">
                              Dosya Biçimi: <strong className="text-white">{aiAnalysisV5.format}</strong> • Örnekleme: <strong className="text-white">24 Kare Kod Çözümü</strong>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-text-secondary">
                              Genel Estetik Skor: <strong className="text-focus-neon text-sm">{qualityScore.overallScore}%</strong>
                            </span>
                            <div className="text-[9px] text-text-secondary font-mono">
                              Doğruluk Güvencesi: <strong>%{aiAnalysisV5.confidenceScores.themeGeneration}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Analysis Grid (6 core details) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Color Spectrum */}
                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                            <span className="text-[9px] font-mono text-text-secondary block">BASKIN VE İKİNCİL TONLAR</span>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="w-5 h-5 rounded-full border border-white/20 shadow-md" style={{ backgroundColor: config.activePalette?.primaryNeon }} />
                              <span className="w-5 h-5 rounded-full border border-white/20 shadow-md" style={{ backgroundColor: config.activePalette?.secondaryMain }} />
                              {config.activePalette?.accentHexList?.slice(2, 4).map((c, idx) => (
                                <span key={idx} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                              ))}
                              <span className="text-xs font-mono text-white font-bold ml-1">{config.activePalette?.primaryNeon}</span>
                            </div>
                            <p className="text-[10px] text-text-secondary pt-1">
                              Sıcaklık: <strong>%{aiAnalysisV5.colorIntelligence.warmColdRatio.warmPercentage} Sıcak</strong> / %{aiAnalysisV5.colorIntelligence.warmColdRatio.coldPercentage} Soğuk • {aiAnalysisV5.colorIntelligence.saturationDistribution}
                            </p>
                          </div>

                          {/* Render Material Recommended */}
                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[9px] font-mono text-text-secondary block">AKILLI RENDER MATERYALİ</span>
                            <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5 pt-1">
                              <Wand2 size={13} className="text-focus-neon" /> {aiAnalysisV5.recommendedMaterial.toUpperCase()} Preseti
                            </div>
                            <p className="text-[10px] text-text-secondary">
                              {aiAnalysisV5.reasonings.glass}
                            </p>
                          </div>

                          {/* Lighting Analysis */}
                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[9px] font-mono text-text-secondary block">IŞIK AÇISI VE MOOD SENTEZİ</span>
                            <div className="text-xs font-bold text-white pt-1">
                              {aiAnalysisV5.moodAnalysis.primaryMood} Atmosfer / {aiAnalysisV5.lightingAnalysis.lightDirection}
                            </div>
                            <p className="text-[10px] text-text-secondary">
                              Parlaklık: <strong>%{aiAnalysisV5.lightingAnalysis.globalBrightness}</strong> • Sıcaklık: <strong>{aiAnalysisV5.lightingAnalysis.lightTemperature}</strong>
                            </p>
                          </div>

                          {/* Recommended Blur */}
                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[9px] font-mono text-text-secondary block">DOKU VE OKUNABİLİRLİK DEĞERLERİ</span>
                            <div className="text-xs font-bold text-white pt-1">
                              Blur: {aiAnalysisV5.recommendedBlur}px • Opacity: %{aiAnalysisV5.recommendedOpacity}
                            </div>
                            <p className="text-[10px] text-text-secondary">
                              Glow Efekti: <strong>{aiAnalysisV5.recommendedGlow ? 'Aktif' : 'Pasif (Göz Konforu)'}</strong> • Hız Limitörü: <strong>{aiAnalysisV5.recommendedMotionSpeed}x</strong>
                            </p>
                          </div>
                        </div>

                        {/* NEXT-GEN: Color Timeline Progression */}
                        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                          <span className="text-[9px] font-mono text-text-secondary block tracking-wider font-bold">RENK ZAMAN TÜNELİ (COLOR TIMELINE GENERATION)</span>
                          <div className="grid grid-cols-4 gap-2">
                            {aiAnalysisV5.colorTimeline.phases.map((ph, idx) => (
                              <div key={idx} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col items-center text-center space-y-1.5">
                                <span className="text-[9px] font-bold text-white/50">{ph.phase}</span>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: ph.dominantColor }} />
                                  <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: ph.accentColor }} />
                                </div>
                                <span className="text-[8px] text-text-secondary font-mono">{ph.durationMs}ms</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-text-secondary">
                            * Duvar kağıdının canlı pikselleri zaman içinde bu 4 ana faz arasında %{aiAnalysisV5.colorTimeline.transitionSmoothness} yumuşaklıkla döngüye girer.
                          </p>
                        </div>

                        {/* NEXT-GEN: Motion Intelligence Pipeline (Conditional Render) */}
                        {!aiAnalysisV5.isStatic && (
                          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                <Activity size={14} className="text-indigo-400" /> Hareket Algılayıcı Raporu (Motion Intelligence Vector)
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[8px] font-bold uppercase">
                                Dinamik Analiz
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                              <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-white/40 text-[8px] block">VEKTÖR YÖNÜ</span>
                                <span className="text-white font-bold">{aiAnalysisV5.motionIntelligence.direction}</span>
                              </div>
                              <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-white/40 text-[8px] block">VAKİT / HIZ</span>
                                <span className="text-white font-bold">{aiAnalysisV5.motionIntelligence.speed} ({aiAnalysisV5.motionIntelligence.objectVelocity} px/s)</span>
                              </div>
                              <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-white/40 text-[8px] block">HAREKET ENERJİSİ</span>
                                <span className="text-indigo-300 font-bold">%{aiAnalysisV5.motionIntelligence.motionEnergy}</span>
                              </div>
                              <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                                <span className="text-white/40 text-[8px] block">DÖNGÜ STABİLİTESİ</span>
                                <span className="text-emerald-400 font-bold">%{aiAnalysisV5.motionIntelligence.motionStability}</span>
                              </div>
                            </div>
                            <p className="text-[9px] text-indigo-200 font-mono">
                              💡 <strong>Hassas Cam Ayarı:</strong> Yüksek hareket enerjisi nedeniyle, zemin titreşimlerini sönümlemek amacıyla arka plan buğusu <strong>+{8}px artırıldı</strong> ve kart neon glow derecesi dengelendi.
                            </p>
                          </div>
                        )}

                        {/* NEXT-GEN: Readability Placement Zones */}
                        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                          <span className="text-[9px] font-mono text-text-secondary block tracking-wider font-bold">ARAYÜZ YERLEŞİM GÜVENLİK BÖLGELERİ (READABILITY PLACEMENT ZONES)</span>
                          <div className="space-y-2">
                            {aiAnalysisV5.readabilityZones.map((z) => (
                              <div key={z.id} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-xl text-[10px]">
                                <span className="text-white font-bold">{z.zoneName}</span>
                                <div className="flex items-center gap-2">
                                  {z.avoidReason && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[8px]">
                                      {z.avoidReason}
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded font-bold ${z.isSafe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    {z.isSafe ? '✓ Güvenli' : '⚠ Riskli'} ({z.score} Puan)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* NEXT-GEN: Learning Mode Profile Status */}
                        {getLearnedPreferencesV5().learningEnabled && (
                          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bot size={15} className="text-emerald-400" />
                              <span className="text-[10px] text-emerald-300 font-mono">
                                Yapay Zeka Öğrenme Adaptasyonu: Son tasarımlarınızdaki malzeme ve buğu tercih geçmişiniz analiz edilerek önerilere yansıtıldı.
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                resetLearnedPreferencesV5();
                                alert('Yapay Zeka öğrenme geçmişi başarıyla sıfırlandı.');
                              }} 
                              className="text-[9px] font-bold text-white hover:text-red-400 underline"
                            >
                              Sıfırla
                            </button>
                          </div>
                        )}

                        {/* AI Reasonings Log */}
                        <div className="p-4 rounded-2xl bg-blue-950/20 border border-focus-neon/20 space-y-3">
                          <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                            <Bot size={15} className="text-focus-neon" /> AI Tasarım Mantık Gerekçesi (AI Reasonings & Decisional Logic)
                          </h4>
                          <div className="space-y-1.5 text-[11px] text-text-secondary leading-relaxed font-mono">
                            <p>• {aiAnalysisV5.reasonings.glass}</p>
                            <p>• {aiAnalysisV5.reasonings.blur}</p>
                            <p>• {aiAnalysisV5.reasonings.motion}</p>
                            <p>• {aiAnalysisV5.reasonings.readability}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: DESIGN ASSET LIBRARY */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <Palette size={22} className="text-focus-neon" /> 3. Adım: Tasarım Kitaplığı (Design System Studio)
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Renk paletlerini, tipografi ağaçlarını yönetin ve AI önerileri ile kendi özel zevklerinizi harmanlayın.
                      </p>
                    </div>

                    <DesignAssetLibrary
                      dominantColor={aiAnalysisV5.colorIntelligence?.primaryColor || '#3b82f6'}
                      isDarkTheme={true}
                      currentPresetId={config.presetId}
                      activePalette={config.activePalette}
                      onApplyPalette={(pal) => {
                        updateConfig({ activePalette: pal });
                        applyPaletteToTheme(pal);
                      }}
                      onApplyFont={(fontFamily) => {
                        // Update config typography to update preview instantly
                        updateConfig({
                          themeDna: {
                            ...config.themeDna,
                            typography: fontFamily
                          }
                        });
                      }}
                      onSaveWithTheme={(settings) => {
                        setAssetSettings(settings);
                      }}
                    />
                  </div>
                )}

                {/* STEP 4: THEME & COLOR SYSTEM */}
                {wizardStep === 4 && (
                  <ThemeColorSystemStep 
                    config={config} 
                    updateConfig={updateConfig} 
                    aiAnalysisV4={aiAnalysisV4} 
                    onOpenHelp={(topic) => openHelp(topic)} 
                    applyPaletteToTheme={applyPaletteToTheme} 
                  />
                )}

                {/* STEP 5: WALLPAPER DISPLAY & INTERACTION SETTINGS */}
                {wizardStep === 5 && (
                  <WallpaperDisplayInteractionStep 
                    config={config}
                    updateConfig={updateConfig}
                    aiAnalysisV4={aiAnalysisV4}
                    onOpenHelp={(topic) => openHelp(topic)}
                  />
                )}

                {/* STEP 6: TYPOGRAPHY & FONT SYSTEM */}
                {wizardStep === 6 && (
                  <TypographyFontSystemStep 
                    config={config}
                    updateConfig={updateConfig}
                    aiAnalysisV4={aiAnalysisV4}
                    onOpenHelp={(topic) => openHelp(topic)}
                    applyTypographyToTheme={applyTypographyToTheme}
                  />
                )}

                {/* STEP 6: MANUAL FINE-TUNING & CUSTOMIZATION */}
                {wizardStep === 6 && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                          <Sliders size={22} className="text-focus-neon" /> 6. Adım: İnce Ayar ve Özelleştirme
                        </h3>
                        <p className="text-xs text-text-secondary mt-1">
                          Yapay zekanın ürettiği tasarımı kendi zevkinize göre manuel özelleştirin.
                        </p>
                      </div>

                      {/* Knowledge Mode Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={knowledgeModeActive}
                          onChange={(e) => setKnowledgeModeActive(e.target.checked)}
                          className="rounded text-focus-neon focus:ring-focus-neon h-3.5 w-3.5 accent-focus-neon"
                        />
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
                          <Lightbulb size={12} className="text-amber-400" /> Bilgi Modu
                        </span>
                      </label>
                    </div>

                    {/* Step 4 Accordion Navigation Tabs */}
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
                      {[
                        { id: 'colors', label: 'Renkler', icon: Palette },
                        { id: 'materials', label: 'Materyal', icon: Box },
                        { id: 'cards', label: 'Kart Tasarımı', icon: Layers },
                        { id: 'typography', label: 'Tipografi & Hız', icon: FileText }
                      ].map((sec) => {
                        const Icon = sec.icon;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => setCustomSec(sec.id as any)}
                            className={`flex-1 min-w-[80px] py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                              customSec === sec.id ? 'bg-focus-neon text-white shadow-md' : 'text-text-secondary hover:text-white'
                            }`}
                          >
                            <Icon size={12} /> {sec.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* SUB-TAB: COLORS */}
                    {customSec === 'colors' && (
                      <div className="space-y-4 animate-fade-in">
                        {knowledgeModeActive && (
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed font-mono">
                            <strong>Tasarım Bilgisi:</strong> Vurgu renkleri, kullanıcının göz odak noktasını belirler. Arka plan koyuysa parlak neon renkler kontrastı dengeler; açık arka planlarda daha mat ve doygun renkler tercih edilmelidir.
                          </div>
                        )}

                        <div className="space-y-3">
                          <label className="text-xs font-mono text-text-secondary font-bold uppercase tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              Baskın Vurgu Renk Seçimi
                              <button onClick={() => openHelp('colors')} className="text-text-secondary hover:text-white"><Info size={11} /></button>
                              <button onClick={() => handleToggleLock('colors')} className="text-text-secondary hover:text-white">
                                <Lock size={11} className={lockedSettings['colors'] ? "text-amber-400" : "opacity-40"} />
                              </button>
                            </span>
                            {config.activePalette?.primaryNeon === aiAnalysisV4.colorIntelligence?.primaryColor ? (
                              <span className="text-[10px] font-mono text-emerald-400">✓ AI Önerisi Etkin</span>
                            ) : (
                              <button onClick={() => resetSettingToAi('colors')} className="text-[10px] font-mono text-amber-400 hover:underline">
                                ⚠ Reset
                              </button>
                            )}
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {config.activePalette?.accentHexList?.map((hex, idx) => {
                              const isSelected = config.activePalette.primaryNeon === hex;
                              return (
                                <button
                                  key={idx}
                                  disabled={lockedSettings['colors']}
                                  onClick={() => {
                                    const newPal = { ...config.activePalette, primaryNeon: hex };
                                    updateConfig({ activePalette: newPal });
                                    applyPaletteToTheme(newPal);
                                  }}
                                  className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                                    isSelected ? 'border-focus-neon bg-focus-neon/20 ring-1 ring-focus-neon/30' : 'border-white/10 bg-black/40 hover:bg-white/5'
                                  }`}
                                >
                                  <div className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: hex }} />
                                  <span className="text-[8px] font-mono text-white/90">{hex}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                            <label className="text-xs font-bold text-white block">Arka Plan Karartma (Overlay)</label>
                            <input
                              type="range"
                              min="0"
                              max="90"
                              value={config.overlayOpacity}
                              onChange={(e) => updateConfig({ overlayOpacity: Number(e.target.value) })}
                              className="w-full accent-focus-neon"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-text-secondary">
                              <span>Açık Cam</span>
                              <span className="text-focus-neon font-bold">%{config.overlayOpacity}</span>
                              <span>Koyu Sinematik</span>
                            </div>
                          </div>

                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                            <label className="text-xs font-bold text-white block">Aydınlatma Parlaklığı (Brightness)</label>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={config.brightness}
                              onChange={(e) => updateConfig({ brightness: Number(e.target.value) })}
                              className="w-full accent-focus-neon"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-text-secondary">
                              <span>Karanlık</span>
                              <span className="text-focus-neon font-bold">%{config.brightness}</span>
                              <span>Maks Parlak</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB: MATERIALS */}
                    {customSec === 'materials' && (
                      <div className="space-y-4 animate-fade-in">
                        {knowledgeModeActive && (
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed font-mono">
                            <strong>Tasarım Bilgisi:</strong> Render materyali, katman derinliğini belirler. Örneğin, "Crystal Glass" pencereleri saydamlaştırır ve ışığı kırar; "Slate" veya "Matte" ise pil tasarrufu için daha az GPU gücü harcar.
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-secondary font-bold uppercase tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              Özel Render Materyali
                              <button onClick={() => openHelp('material')} className="text-text-secondary hover:text-white"><Info size={11} /></button>
                              <button onClick={() => handleToggleLock('material')} className="text-text-secondary hover:text-white">
                                <Lock size={11} className={lockedSettings['material'] ? "text-amber-400" : "opacity-40"} />
                              </button>
                            </span>
                            {config.selectedMaterial === aiAnalysisV4.recommendedMaterial ? (
                              <span className="text-[10px] font-mono text-emerald-400">✓ AI Önerisi Etkin</span>
                            ) : (
                              <button onClick={() => resetSettingToAi('material')} className="text-[10px] font-mono text-amber-400 hover:underline">
                                Reset
                              </button>
                            )}
                          </label>

                          <div className="grid grid-cols-3 gap-2">
                            {MATERIAL_PRESETS.map((m) => {
                              const isSel = config.selectedMaterial === m.id;
                              return (
                                <button
                                  key={m.id}
                                  disabled={lockedSettings['material']}
                                  onClick={() => handleSelectMaterial(m.id)}
                                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 text-center transition-all ${
                                    isSel ? 'border-focus-neon bg-focus-neon/20 ring-1 ring-focus-neon/30' : 'border-white/10 bg-black/40 hover:bg-white/5'
                                  }`}
                                >
                                  <span className="text-xl">{m.icon}</span>
                                  <h5 className="text-[10px] font-bold text-white font-display truncate w-full">{m.name}</h5>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB: CARDS */}
                    {customSec === 'cards' && (
                      <div className="space-y-4 animate-fade-in">
                        {knowledgeModeActive && (
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed font-mono">
                            <strong>Tasarım Bilgisi:</strong> Cam buğusu (Blur) ne kadar yüksek olursa arkadaki görsel o kadar gizlenir ve metin okunabilirliği o kadar artar. Gölgeler ve yuvarlaklıklar ise pencerelerin havada durma (Y-axis) hissini pekiştirir.
                          </div>
                        )}

                        {/* Blur */}
                        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-white">
                            <span className="flex items-center gap-1">
                              Cam Bulanıklığı (Blur)
                              <button onClick={() => openHelp('blur')} className="text-text-secondary hover:text-white"><Info size={11} /></button>
                              <button onClick={() => handleToggleLock('blur')} className="text-text-secondary hover:text-white">
                                <Lock size={11} className={lockedSettings['blur'] ? "text-amber-400" : "opacity-40"} />
                              </button>
                            </span>
                            <span className="text-focus-neon font-mono font-bold">{config.cardBlurAmount || 24}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            disabled={lockedSettings['blur']}
                            value={config.cardBlurAmount || 24}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateConfig({ cardBlurAmount: val });
                              if (val < aiAnalysisV5.recommendedBlur) {
                                trackUserEditV5('reduce_blur');
                              }
                            }}
                            className="w-full accent-focus-neon"
                          />
                        </div>

                        {/* Opacity */}
                        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-white">
                            <span className="flex items-center gap-1">
                              Cam Saydamlığı (Opacity)
                              <button onClick={() => openHelp('opacity')} className="text-text-secondary hover:text-white"><Info size={11} /></button>
                              <button onClick={() => handleToggleLock('opacity')} className="text-text-secondary hover:text-white">
                                <Lock size={11} className={lockedSettings['opacity'] ? "text-amber-400" : "opacity-40"} />
                              </button>
                            </span>
                            <span className="text-focus-neon font-mono font-bold">%{config.cardBgOpacity || 18}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            disabled={lockedSettings['opacity']}
                            value={config.cardBgOpacity || 18}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateConfig({ cardBgOpacity: val });
                              if (val > aiAnalysisV5.recommendedOpacity) {
                                trackUserEditV5('increase_opacity');
                              }
                            }}
                            className="w-full accent-focus-neon"
                          />
                        </div>

                        {/* Radius & Border */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-white">
                              <span className="flex items-center gap-1">
                                Köşe Yuvarlaklığı
                                <button onClick={() => handleToggleLock('radius')} className="text-text-secondary hover:text-white">
                                  <Lock size={11} className={lockedSettings['radius'] ? "text-amber-400" : "opacity-40"} />
                                </button>
                              </span>
                              <span className="text-focus-neon font-mono font-bold">{config.cardBorderRadius || 20}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="36"
                              disabled={lockedSettings['radius']}
                              value={config.cardBorderRadius}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                updateConfig({ cardBorderRadius: val });
                                trackUserEditV5('change_border_radius', val);
                              }}
                              className="w-full accent-focus-neon"
                            />
                          </div>

                          <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-white">
                              <span className="flex items-center gap-1">
                                Kenarlık Kalınlığı
                                <button onClick={() => handleToggleLock('borderWidth')} className="text-text-secondary hover:text-white">
                                  <Lock size={11} className={lockedSettings['borderWidth'] ? "text-amber-400" : "opacity-40"} />
                                </button>
                              </span>
                              <span className="text-focus-neon font-mono font-bold">{config.cardBorderWidth || 1}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="4"
                              step="0.5"
                              disabled={lockedSettings['borderWidth']}
                              value={config.cardBorderWidth}
                              onChange={(e) => updateConfig({ cardBorderWidth: Number(e.target.value) })}
                              className="w-full accent-focus-neon"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB: TYPOGRAPHY & MOTION */}
                    {customSec === 'typography' && (
                      <div className="space-y-4 animate-fade-in">
                        {knowledgeModeActive && (
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed font-mono">
                            <strong>Tasarım Bilgisi:</strong> Akıllı tipografi koruyucu motorumuz, metinlerin arka planla kontrastını anlık analiz eder. Canlı duvar kağıdı oynatım hızı ise arayüzün dinamik temposunu belirler.
                          </div>
                        )}

                        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold text-white">
                            <span className="flex items-center gap-1">
                              Canlı Duvar Kağıdı Oynatım Hızı
                              <button onClick={() => openHelp('speed')} className="text-text-secondary hover:text-white"><Info size={11} /></button>
                              <button onClick={() => handleToggleLock('speed')} className="text-text-secondary hover:text-white">
                                <Lock size={11} className={lockedSettings['speed'] ? "text-amber-400" : "opacity-40"} />
                              </button>
                            </span>
                            <span className="text-focus-neon font-mono font-bold">{config.playbackSpeed || 1.0}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.25"
                            disabled={lockedSettings['speed']}
                            value={config.playbackSpeed || 1.0}
                            onChange={(e) => updateConfig({ playbackSpeed: Number(e.target.value) })}
                            className="w-full accent-focus-neon"
                          />
                        </div>

                        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2 text-xs">
                          <div className="flex justify-between items-center text-white font-bold">
                            <span>Akıllı Tipografi Koruma Sistemi</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Etkin</span>
                          </div>
                          <p className="text-text-secondary text-[11px] leading-relaxed font-mono">
                            Mevcut metin tonları ve boyutları, arka planın parlaklık endeksine göre ({displayDna.aspectRatioString}) otomatik dengelenir. Okunabilirlik skoru: %{qualityScore.readabilityScore} Pass. Metinler hiçbir koşulda arka planda kaybolmaz.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 7: ICON SYSTEM */}
                {wizardStep === 7 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <Layers size={22} className="text-focus-neon" /> 7. Adım: İkon Sistemi & Rozetler
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Arayüzdeki ikon setlerini, köşe yuvarlaklıklarını ve rozet stillerini tema DNA'sına uygun olarak özelleştirin.
                      </p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-secondary font-bold uppercase tracking-widest block">
                          İkon Stil Paketi
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: 'modern', name: 'Modern Minimal', desc: 'İnce hatlı, zarif ve keskin hatlar' },
                            { id: 'neon', name: 'Neon Glowing', desc: 'Hafif ışıma efektli parlayan ikonlar' },
                            { id: 'glass', name: 'Glassmorphic', desc: 'Cam katmanlı derinlikli ikonlar' }
                          ].map((style) => (
                            <button
                              key={style.id}
                              onClick={() => updateConfig({ iconStyle: style.id as any })}
                              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                                (config.iconStyle || 'modern') === style.id
                                  ? 'border-focus-neon bg-focus-neon/20 ring-1 ring-focus-neon/30'
                                  : 'border-white/10 bg-black/40 hover:bg-white/5'
                              }`}
                            >
                              <span className="text-xs font-bold text-white block">{style.name}</span>
                              <p className="text-[10px] text-text-secondary leading-tight font-mono">{style.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                        <span className="text-[10px] font-mono text-text-secondary font-bold block uppercase">İkon Boyutu ve Dolgu Oranı</span>
                        <input
                          type="range"
                          min="16"
                          max="32"
                          value={config.iconSize || 20}
                          onChange={(e) => updateConfig({ iconSize: Number(e.target.value) })}
                          className="w-full accent-focus-neon cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-text-secondary">
                          <span>Kompakt (16px)</span>
                          <span className="text-focus-neon font-bold">{config.iconSize || 20}px</span>
                          <span>Büyük (32px)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 8: GLOW ENGINE */}
                {wizardStep === 8 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <Sparkles size={22} className="text-focus-neon" /> 8. Adım: Glow Engine (Işıma & Derinlik Motoru)
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Yapay zeka destekli otomatik ışıma efektleri veya manuel kategori kontrollü gelişmiş aydınlatma yönetimi.
                      </p>
                    </div>

                    <GlowEngineStep 
                      config={config} 
                      updateConfig={updateConfig} 
                      onOpenHelp={(topic) => openHelp(topic)}
                    />
                  </div>
                )}

                {/* STEP 9: ANIMATION & MOTION */}
                {wizardStep === 9 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <Activity size={22} className="text-focus-neon" /> 9. Adım: Animasyon & Hareket Motoru
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Canlı duvar kağıdı oynatım hızı, kare geçişleri ve arayüz animasyon yoğunluğunu ayarlayın.
                      </p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-white">
                          <span>Oynatma Hızı (Playback Speed)</span>
                          <span className="text-focus-neon font-mono font-bold">{config.playbackSpeed || 1.0}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.1"
                          value={config.playbackSpeed || 1.0}
                          onChange={(e) => updateConfig({ playbackSpeed: Number(e.target.value) })}
                          className="w-full accent-focus-neon cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-white">
                          <span>Hareket Yoğunluğu (Motion Intensity)</span>
                          <span className="text-focus-neon font-mono font-bold">{config.motionIntensity || 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.motionIntensity || 50}
                          onChange={(e) => updateConfig({ motionIntensity: Number(e.target.value) })}
                          className="w-full accent-focus-neon cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 10: PERFORMANCE & DEVICE */}
                {wizardStep === 10 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <Cpu size={22} className="text-focus-neon" /> 10. Adım: Performans & Ekran Motoru
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Sistemin çalışma hızını (FPS) ve görsel efekt kalitesini donanım gücünüze göre ayarlayın.
                      </p>
                    </div>

                    {/* Smart FPS engine selector */}
                    <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>Smart FPS Limit Modu</span>
                        <span className="text-focus-neon font-mono font-bold">{targetFps === 240 ? 'Unlimited (240+)' : `${targetFps} FPS`}</span>
                      </div>
                      <div className="flex gap-2">
                        {[30, 60, 120, 144, 240].map((fps) => (
                          <button
                            key={fps}
                            onClick={() => setTargetFps(fps)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                              targetFps === fps 
                                ? 'bg-focus-neon text-white border-focus-neon' 
                                : 'bg-black/30 text-text-secondary border-white/5 hover:text-white'
                            }`}
                          >
                            {fps}Hz
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                        <span className="text-[10px] font-mono text-text-secondary">Otomatik FPS Kontrol Motoru (Düşük Pil ve Aşırı Isınmada optimize eder)</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoFpsMode}
                            onChange={(e) => setAutoFpsMode(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-focus-neon"></div>
                        </label>
                      </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-text-secondary font-bold uppercase tracking-widest block">
                        Ekran Kalite ve İşleme Profilleri
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {[
                          { id: 'eco', name: 'Eco (Tasarruf Modu)', desc: 'Gelişmiş blurlar pasifleşir, pil ömrü uzar.', impact: 'Düşük GPU' },
                          { id: 'balanced', name: 'Balanced (Dengeli)', desc: 'Akıcı 60 FPS, standart cam kırılması.', impact: 'Orta GPU' },
                          { id: 'high', name: 'High Quality (Yüksek)', desc: '144Hz destekli tam cam ve gölge efektleri.', impact: 'Yüksek GPU' },
                          { id: 'ultra', name: 'Ultra Studio (Maksimum)', desc: 'En yüksek piksel kalitesi ve gölgeler.', impact: 'Maksimum GPU' }
                        ].map((profile) => (
                          <button
                            key={profile.id}
                            onClick={() => {
                              setActiveRenderingPreset(profile.name);
                              if (profile.id === 'eco') {
                                updateConfig({ cardBlurAmount: 8, cardBgOpacity: 35 });
                              } else if (profile.id === 'balanced') {
                                updateConfig({ cardBlurAmount: 20, cardBgOpacity: 18 });
                              } else if (profile.id === 'high') {
                                updateConfig({ cardBlurAmount: 32, cardBgOpacity: 15 });
                              } else {
                                updateConfig({ cardBlurAmount: 48, cardBgOpacity: 12 });
                              }
                            }}
                            className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                              activeRenderingPreset.includes(profile.name.split(' ')[0])
                                ? 'border-focus-neon bg-focus-neon/10' 
                                : 'border-white/10 bg-black/40 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs font-bold text-white">
                              <span>{profile.name}</span>
                              <span className="text-[8px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-text-secondary">{profile.impact}</span>
                            </div>
                            <p className="text-[10px] text-text-secondary leading-tight font-mono">{profile.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 12: PREVIEW & SAVE & HEALTH REPORT */}
                {wizardStep === 12 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                        <Eye size={22} className="text-focus-neon" /> 12. Adım: Önizleme, Sağlık Raporu & Kaydetme
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Tasarımınız hazır! Kalite skorlarını inceleyin, isim verin ve sisteminize uygulamak için kaydedin.
                      </p>
                    </div>

                    {/* Health Report Mini Card */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                        <span className="text-[9px] font-mono text-emerald-400 block font-bold uppercase">OKUNABİLİRLİK</span>
                        <h4 className="text-lg font-black text-white font-mono">{qualityScore.readabilityScore}%</h4>
                      </div>
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1">
                        <span className="text-[9px] font-mono text-sky-400 block font-bold uppercase">RENK UYUMU</span>
                        <h4 className="text-lg font-black text-white font-mono">%{qualityScore.overallScore}</h4>
                      </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-text-secondary font-bold uppercase tracking-widest block">
                          TEMA ADI
                        </label>
                        <input
                          type="text"
                          value={themeName}
                          onChange={(e) => setThemeName(e.target.value)}
                          placeholder="Cam Esintisi Teması..."
                          className="w-full py-2.5 px-4 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-focus-neon font-mono"
                        />
                      </div>

                      {/* Favorites and export */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setIsThemeFavorite(!isThemeFavorite)}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
                            isThemeFavorite 
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                              : 'bg-white/5 text-text-secondary border-white/10 hover:text-white'
                          }`}
                        >
                          <Star size={13} fill={isThemeFavorite ? 'currentColor' : 'none'} />
                          Sık Kullanılanlara Ekle
                        </button>

                        <button
                          onClick={handleExportTheme}
                          className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 bg-white/5 text-text-secondary hover:text-white border border-white/10 transition-all"
                        >
                          <Share2 size={13} /> Export JSON
                        </button>
                      </div>
                    </div>

                    {/* Toggle Slider for Before / After Compare */}
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Önce / Sonra Kıyaslama Aracı (Before / After)</span>
                        <span className="text-[10px] text-text-secondary">Ham duvar kağıdı ile cam arayüz kontrastını kıyaslayın.</span>
                      </div>
                      <button
                        onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          showBeforeAfter ? 'bg-focus-neon text-white border-focus-neon' : 'bg-white/5 text-text-secondary border-white/10'
                        }`}
                      >
                        {showBeforeAfter ? 'Kapat' : 'Görsel Kıyasla'}
                      </button>
                    </div>

                    {showBeforeAfter && (
                      <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 space-y-2">
                        <span className="text-xs font-mono text-text-secondary">Geçiş Çubuğu: %{beforeAfterSplit}</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={beforeAfterSplit}
                          onChange={(e) => setBeforeAfterSplit(Number(e.target.value))}
                          className="w-full accent-focus-neon cursor-pointer"
                        />
                      </div>
                    )}

                    {/* ERROR RECOVERY SESSION PANEL */}
                    {recoverySession && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-red-400">
                          <RotateCcw size={16} className="animate-spin" />
                          <span className="text-xs font-mono font-bold">Kurtarılabilir Oturum Algılandı!</span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-normal font-mono">
                          Son kayıt denemesi sırasında oluşan hata nedeniyle yarıda kalan tasarımınız "{recoverySession.themeName || 'Adlandırılmamış'}" güvenle yedeklendi. Veri kaybı yaşamadan oturumu geri yükleyebilir ve yeniden kaydetmeyi deneyebilirsiniz.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRestoreRecovery}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-mono font-bold border border-red-500/30 transition-all flex items-center gap-1"
                          >
                            <RotateCcw size={11} /> Oturumu Kurtar
                          </button>
                          <button
                            onClick={handleSaveTheme}
                            className="px-3 py-1.5 rounded-lg bg-focus-neon hover:bg-blue-600 text-white text-[10px] font-mono font-bold border border-blue-400/20 transition-all"
                          >
                            Yeniden Dene
                          </button>
                        </div>
                      </div>
                    )}

                    {/* OPTIONAL SAVE & WORKFLOW SETTINGS */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1">
                          <Settings size={12} className="text-focus-neon" /> Kaydetme ve Otomasyon Seçenekleri
                        </span>
                        <span className="text-[9px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded-full">APEX Engine</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5">
                        {/* Toggle 1: Apply Immediately */}
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold text-white block">Temayı Anında Uygula</span>
                            <span className="text-[9px] text-text-secondary leading-tight block">Kayıt sonrası arayüz renk ve stil değişkenlerini hemen yeniler.</span>
                          </div>
                          <button
                            onClick={() => setOptApplyImmediately(!optApplyImmediately)}
                            className="text-text-secondary hover:text-white transition-all"
                          >
                            {optApplyImmediately ? (
                              <ToggleRight size={32} className="text-focus-neon" />
                            ) : (
                              <ToggleLeft size={32} />
                            )}
                          </button>
                        </div>

                        {/* Toggle 2: Return to Home */}
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold text-white block">Sihirbaz Giriş Ekranına Dön</span>
                            <span className="text-[9px] text-text-secondary leading-tight block">Tasarım kaydedildiğinde doğrudan ana galeriye geçiş yapar.</span>
                          </div>
                          <button
                            onClick={() => {
                              setOptReturnToHome(!optReturnToHome);
                            }}
                            className="text-text-secondary hover:text-white transition-all"
                          >
                            {optReturnToHome ? (
                              <ToggleRight size={32} className="text-focus-neon" />
                            ) : (
                              <ToggleLeft size={32} />
                            )}
                          </button>
                        </div>

                        {/* Toggle 3: Keep Wizard Open */}
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold text-white block">Sihirbazı Açık Tut</span>
                            <span className="text-[9px] text-text-secondary leading-tight block">Sihirbazı kapatmaz, son adımda kalmanızı sağlar.</span>
                          </div>
                          <button
                            onClick={() => {
                              setOptKeepWizardOpen(!optKeepWizardOpen);
                            }}
                            className="text-text-secondary hover:text-white transition-all"
                          >
                            {optKeepWizardOpen ? (
                              <ToggleRight size={32} className="text-focus-neon" />
                            ) : (
                              <ToggleLeft size={32} />
                            )}
                          </button>
                        </div>

                        {/* Toggle 4: Start New Automatically */}
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold text-white block">Otomatik Yeni Tema Başlat</span>
                            <span className="text-[9px] text-text-secondary leading-tight block">Önceki ayarları sıfırlayarak yeni bir şablon açar.</span>
                          </div>
                          <button
                            onClick={() => setOptStartNewAutomatically(!optStartNewAutomatically)}
                            className="text-text-secondary hover:text-white transition-all"
                          >
                            {optStartNewAutomatically ? (
                              <ToggleRight size={32} className="text-focus-neon" />
                            ) : (
                              <ToggleLeft size={32} />
                            )}
                          </button>
                        </div>

                        {/* Toggle 5: Open Theme Editor */}
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold text-white block">Gelişmiş Stüdyo Editörünü Aç</span>
                            <span className="text-[9px] text-text-secondary leading-tight block">Kaydettikten sonra derin piksel ayarları sayfasına yönlendirir.</span>
                          </div>
                          <button
                            onClick={() => setOptOpenThemeEditor(!optOpenThemeEditor)}
                            className="text-text-secondary hover:text-white transition-all"
                          >
                            {optOpenThemeEditor ? (
                              <ToggleRight size={32} className="text-focus-neon" />
                            ) : (
                              <ToggleLeft size={32} />
                            )}
                          </button>
                        </div>

                        {/* Toggle 6: Replace Existing or Create Copy */}
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold text-white block">Mevcut Temanın Üzerine Yaz</span>
                            <span className="text-[9px] text-text-secondary leading-tight block">Eğer mevcut bir tasarım ile çakışırsa üzerine yazarak kaydeder.</span>
                          </div>
                          <button
                            onClick={() => setOptReplaceExisting(!optReplaceExisting)}
                            className="text-text-secondary hover:text-white transition-all"
                          >
                            {optReplaceExisting ? (
                              <ToggleRight size={32} className="text-focus-neon" />
                            ) : (
                              <ToggleLeft size={32} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM FOOTER: Previous & Next Control Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-6 bg-slate-950/20 backdrop-blur-md">
                <button
                  onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                  disabled={wizardStep === 1}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                >
                  <ChevronLeft size={14} /> Önceki (Prev)
                </button>

                <button
                  onClick={() => {
                    if (wizardStep === 12) {
                      handleSaveTheme();
                    } else {
                      setWizardStep(prev => Math.min(12, prev + 1));
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-focus-neon text-white text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/20"
                >
                  {wizardStep === 12 ? (
                    <>
                      Uygula & Kaydet <Check size={14} />
                    </>
                  ) : (
                    <>
                      Sonraki (Next) <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: INTERACTIVE LIVE RENDERING PREVIEW */}
            <div className="lg:col-span-5 p-6 bg-slate-950/80 flex flex-col justify-between overflow-y-auto custom-scrollbar border-l border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                  <Monitor size={12} className="text-focus-neon" /> Canlı OS Masaüstü Render Önizlemesi
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Realtime Sync
                </span>
              </div>

              {/* DEVICE FRAME SIMULATION LAYER */}
              <div className="flex-1 flex items-center justify-center py-2">
                <div 
                  className={`relative overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between p-4 transition-all duration-300 ${
                    simulatedDevice === 'desktop' 
                      ? 'w-full h-[480px] rounded-3xl' 
                      : simulatedDevice === 'tablet' 
                      ? 'w-[360px] h-[480px] rounded-[2.25rem] mx-auto' 
                      : 'w-[260px] h-[480px] rounded-[2.5rem] mx-auto border-4'
                  }`}
                  style={!['video', 'lively'].includes(config.sourceType) ? {
                    backgroundImage: config.mediaUrl ? `url(${config.mediaUrl})` : `url(${config.previewUrl || WALLPAPER_PRESETS[0].previewUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {
                    backgroundColor: '#070a14',
                    position: 'relative'
                  }}
                >
                  {/* VIDEO / LIVELY BACKGROUND PLAYER */}
                  {(['video', 'lively'].includes(config.sourceType) && !config.mimeType?.includes('html') && (config.mediaUrl || config.previewUrl)) && (
                    <>
                      {/* After Video background with filters */}
                      <video
                        src={config.mediaUrl || config.previewUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-all duration-700"
                        style={{
                          filter: `blur(${config.blurAmount}px) brightness(${config.brightness}%) saturate(${config.saturation}%)`,
                          clipPath: showBeforeAfter ? `polygon(${beforeAfterSplit}% 0, 100% 0, 100% 100%, ${beforeAfterSplit}% 100%)` : 'none'
                        }}
                      />
                      {/* Before Video background split (unfiltered) */}
                      {showBeforeAfter && (
                        <video
                          src={config.mediaUrl || config.previewUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-all duration-700"
                          style={{
                            clipPath: `polygon(0 0, ${beforeAfterSplit}% 0, ${beforeAfterSplit}% 100%, 0 100%)`
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* HTML LIVELY BACKGROUND PLAYER */}
                  {(config.sourceType === 'lively' && config.mimeType?.includes('html') && config.mediaUrl) && (
                    <>
                      {/* After HTML background with filters */}
                      <iframe
                        src={config.mediaUrl}
                        className="absolute inset-0 w-full h-full border-0 z-0 pointer-events-none transition-all duration-700"
                        sandbox="allow-scripts allow-same-origin"
                        style={{
                          filter: `blur(${config.blurAmount}px) brightness(${config.brightness}%) saturate(${config.saturation}%)`,
                          clipPath: showBeforeAfter ? `polygon(${beforeAfterSplit}% 0, 100% 0, 100% 100%, ${beforeAfterSplit}% 100%)` : 'none'
                        }}
                      />
                      {/* Before HTML background split (unfiltered) */}
                      {showBeforeAfter && (
                        <iframe
                          src={config.mediaUrl}
                          className="absolute inset-0 w-full h-full border-0 z-0 pointer-events-none transition-all duration-700"
                          sandbox="allow-scripts allow-same-origin"
                          style={{
                            clipPath: `polygon(0 0, ${beforeAfterSplit}% 0, ${beforeAfterSplit}% 100%, 0 100%)`
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Static Before / After Comparison split overlay */}
                  {!((config.sourceType === 'video') || config.sourceType === 'lively') && (
                    <>
                      {/* Main static background with filters */}
                      <div 
                        className="absolute inset-0 z-0 bg-no-repeat bg-center bg-cover pointer-events-none transition-all duration-700"
                        style={{
                          backgroundImage: config.mediaUrl ? `url(${config.mediaUrl})` : `url(${config.previewUrl || WALLPAPER_PRESETS[0].previewUrl})`,
                          filter: `blur(${config.blurAmount}px) brightness(${config.brightness}%) saturate(${config.saturation}%)`,
                          clipPath: showBeforeAfter ? `polygon(${beforeAfterSplit}% 0, 100% 0, 100% 100%, ${beforeAfterSplit}% 100%)` : 'none'
                        }}
                      />
                      {/* Before Comparison static split overlay */}
                      {showBeforeAfter && (
                        <div 
                          className="absolute inset-0 z-0 bg-no-repeat bg-center bg-cover pointer-events-none"
                          style={{
                            backgroundImage: config.mediaUrl ? `url(${config.mediaUrl})` : `url(${config.previewUrl || WALLPAPER_PRESETS[0].previewUrl})`,
                            clipPath: `polygon(0 0, ${beforeAfterSplit}% 0, ${beforeAfterSplit}% 100%, 0 100%)`
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Dark transparent overlay overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={{ 
                      backgroundColor: `rgba(0, 0, 0, ${(config.overlayOpacity || 30) / 100})`,
                      clipPath: showBeforeAfter ? `polygon(${beforeAfterSplit}% 0, 100% 0, 100% 100%, ${beforeAfterSplit}% 100%)` : 'none'
                    }}
                  />

                  {/* Vertical slider divider bar indicator */}
                  {showBeforeAfter && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-focus-neon/80 z-20 shadow-[0_0_10px_rgba(59,130,246,0.8)] pointer-events-none"
                      style={{ left: `${beforeAfterSplit}%` }}
                    />
                  )}

                  {/* Top bar inside simulated device */}
                  <div 
                    className="relative z-10 w-full px-3.5 py-2 rounded-xl flex items-center justify-between border transition-all text-[11px]"
                    style={{
                      backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                      backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                      borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                      borderRadius: `${config.cardBorderRadius || 20}px`
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono font-bold text-white ml-1">APEX OS</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/50">{displayDna.aspectRatioString}</span>
                  </div>

                  {/* Simulated App Dashboard (Desktop vs Phone Layout variants) */}
                  {simulatedDevice === 'phone' ? (
                    /* Phone native viewport details stack */
                    <div className="relative z-10 space-y-2 mt-auto pb-4">
                      <div 
                        className="p-3 rounded-2xl border space-y-1.5"
                        style={{
                          backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                          backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                          borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                          borderRadius: `${config.cardBorderRadius || 20}px`
                        }}
                      >
                        <span className="text-[8px] font-mono text-text-secondary block">DONANIM PERFORMANSI</span>
                        <div className="text-xs font-black font-mono text-emerald-400">
                          {qualityScore.estimatedFps} FPS • %{qualityScore.gpuLoadPercentage} GPU
                        </div>
                      </div>

                      {/* Phone Bottom Nav Menu bar simulation */}
                      <div 
                        className="p-2 rounded-2xl border flex items-center justify-around gap-1"
                        style={{
                          backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                          backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                          borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                          borderRadius: `${config.cardBorderRadius || 20}px`
                        }}
                      >
                        <div className="w-6 h-6 rounded bg-focus-neon/20 flex items-center justify-center text-focus-neon"><LayoutGrid size={12} /></div>
                        <div className="w-6 h-6 rounded flex items-center justify-center text-white/60"><Activity size={12} /></div>
                        <div className="w-6 h-6 rounded flex items-center justify-center text-white/60"><Settings size={12} /></div>
                      </div>
                    </div>
                  ) : (
                    /* Desktop & Tablet grid layout */
                    <div className="relative z-10 grid grid-cols-2 gap-2 my-auto">
                      <div 
                        className="p-3 rounded-xl border space-y-1"
                        style={{
                          backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                          backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                          borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                          borderRadius: `${config.cardBorderRadius || 20}px`
                        }}
                      >
                        <span className="text-[8px] font-mono text-text-secondary block">LÜKS MATERYAL</span>
                        <div className="text-xs font-bold font-display text-white truncate">
                          {config.selectedMaterial || 'Glass'}
                        </div>
                      </div>

                      <div 
                        className="p-3 rounded-xl border space-y-1"
                        style={{
                          backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                          backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                          borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                          borderRadius: `${config.cardBorderRadius || 20}px`
                        }}
                      >
                        <span className="text-[8px] font-mono text-text-secondary block">NETLİK / KONTRAST</span>
                        <div className="text-xs font-bold font-mono text-emerald-400">
                          {qualityScore.readabilityScore}% OKUR
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simulated interactive active widget */}
                  <div 
                    className="relative z-10 w-full p-2.5 rounded-xl border flex items-center justify-between"
                    style={{
                      backdropFilter: `blur(${config.cardBlurAmount || 24}px)`,
                      backgroundColor: `rgba(15, 23, 42, ${(config.cardBgOpacity || 18) / 100})`,
                      borderColor: `rgba(255, 255, 255, ${(config.cardBorderOpacity || 25) / 100})`,
                      borderRadius: `${config.cardBorderRadius || 20}px`
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: config.activePalette?.primaryNeon }} />
                      <span className="text-[9px] font-mono font-bold text-white">Visual Engine Ready</span>
                    </div>
                    <button 
                      className="px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white shadow-sm"
                      style={{ backgroundColor: config.activePalette?.primaryNeon || '#3b82f6' }}
                    >
                      Uygula
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Info Display */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono text-text-secondary mt-4">
                <span>Materyal: <strong className="text-white uppercase">{config.selectedMaterial || 'Glass'}</strong></span>
                <span>Buğu: <strong className="text-focus-neon">{config.cardBlurAmount || 24}px</strong></span>
                <span>Gölge: <strong className="text-white">{config.cardShadowDepth || 'medium'}</strong></span>
              </div>
            </div>

          </div>

          {/* PIPELINE PROGRESS GLASS COVER OVERLAY */}
          {isSavingPipelineActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md rounded-[2.5rem] p-8 text-center space-y-6"
            >
              <div className="relative">
                {/* Rotating holographic ring */}
                <div className="w-20 h-20 rounded-full border border-focus-neon/30 animate-spin border-t-focus-neon border-r-focus-neon" />
                <div className="absolute inset-2 rounded-full border border-sky-500/10 animate-ping" />
                <Sparkles size={28} className="absolute inset-0 m-auto text-focus-neon animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md text-center flex flex-col items-center">
                <h3 className="text-base font-display font-black text-white">APEX OS Tema İnşası</h3>
                <div className="text-xs font-mono text-focus-neon animate-pulse">{pipelineLog}</div>
                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto mt-2">
                  <motion.div 
                    initial={{ width: '5%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4.5, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-focus-neon"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS CONFIRMATION SLIDE-IN POPUP */}
          <AnimatePresence>
            {successState.show && successState.stage !== 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-96 z-50 p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-[0_10px_50px_rgba(16,185,129,0.2)] backdrop-blur-xl space-y-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">Tema Başarıyla Hazırlandı</h4>
                    <span className="text-[10px] font-mono text-text-secondary">Premium sistem bütünleştirme akışı</span>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-[11px] leading-relaxed">
                  <div className="flex items-center justify-between text-white/90">
                    <span>✓ Tema Tasarımı Hazırlandı</span>
                    <span className="text-emerald-400 text-[10px] font-bold">TAMAMLANDI</span>
                  </div>
                  <div className="flex items-center justify-between text-white/90">
                    <span>{successState.stage === 'created' ? '○' : '✓'} Tema Kitaplığına Kaydedildi</span>
                    <span className={successState.stage === 'created' ? 'text-text-secondary animate-pulse' : 'text-emerald-400 text-[10px] font-bold'}>
                      {successState.stage === 'created' ? 'İŞLENİYOR' : 'TAMAMLANDI'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-white/90">
                    <span>{successState.stage === 'created' || successState.stage === 'saved' ? '○' : '✓'} Arayüze Entegre Edildi</span>
                    <span className={(successState.stage === 'created' || successState.stage === 'saved') ? 'text-text-secondary' : 'text-emerald-400 text-[10px] font-bold'}>
                      {(successState.stage === 'created' || successState.stage === 'saved') ? 'BEKLİYOR' : 'TAMAMLANDI'}
                    </span>
                  </div>
                </div>

                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-700"
                    style={{
                      width: successState.stage === 'created' ? '33%' : successState.stage === 'saved' ? '66%' : '100%'
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
