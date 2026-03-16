import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus,
  Zap,
  Clock,
  LayoutGrid,
  Settings2,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Activity,
  Calendar,
  ClipboardList,
  Package,
  Users
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { JobWizardModal } from './jobs/JobWizardModal';
import { StockWizardModal } from './stocks/StockWizardModal';
import { AccountWizardModal } from './accounts/AccountWizardModal';
import { WidgetDetailsModal } from './dashboard/WidgetDetailsModal';
import { 
  WidgetRenderer, 
  WIDGET_DEFAULTS, 
  WidgetConfig, 
  WidgetType 
} from './dashboard/DashboardWidgets';

interface MainDashboardProps {
  setActiveModule: (module: string) => void;
}

import { useSettings } from '../context/SettingsContext';

interface SortableWidgetProps {
  key?: string | number;
  widget: WidgetConfig;
  data: any;
  onClick: (widget: WidgetConfig) => void;
  onRemove: (id: string) => void;
  setActiveModule: (module: string) => void;
  setIsJobModalOpen: (open: boolean) => void;
  setIsStockModalOpen: (open: boolean) => void;
  setIsAccountModalOpen: (open: boolean) => void;
}

function SortableWidget({ 
  widget, 
  data, 
  onClick, 
  onRemove, 
  setActiveModule, 
  setIsJobModalOpen, 
  setIsStockModalOpen, 
  setIsAccountModalOpen 
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1,
    scale: isDragging ? 1.02 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`${widget.gridSpan} group relative`}
    >
      {/* Digital Patina Effect (Subtle glow on hover) */}
      <div className="absolute inset-0 bg-focus-neon/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none" />
      
      <WidgetRenderer 
        widget={widget}
        data={data}
        onClick={onClick}
        onRemove={onRemove}
        setActiveModule={setActiveModule}
        setIsJobModalOpen={setIsJobModalOpen}
        setIsStockModalOpen={setIsStockModalOpen}
        setIsAccountModalOpen={setIsAccountModalOpen}
      />
    </div>
  );
}

export function MainDashboard({ setActiveModule }: MainDashboardProps) {
  const { settings } = useSettings();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('nexus_dashboard_widgets');
    return saved ? JSON.parse(saved) : WIDGET_DEFAULTS;
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleAddWidget = (e: any) => {
      const newWidget = e.detail;
      setWidgets(prev => [newWidget, ...prev]);
    };

    window.addEventListener('apex:add-widget', handleAddWidget);

    return () => {
      clearInterval(timer);
      window.removeEventListener('apex:add-widget', handleAddWidget);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_dashboard_widgets', JSON.stringify(widgets));
  }, [widgets]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/summary');
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const addWidget = (type: WidgetType) => {
    const base = WIDGET_DEFAULTS.find(w => w.type === type);
    if (base) {
      const newWidget = { ...base, id: `w-${Date.now()}` };
      setWidgets([...widgets, newWidget]);
    }
  };

  const resetDashboard = () => {
    setWidgets(WIDGET_DEFAULTS);
    localStorage.removeItem('nexus_dashboard_widgets');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'GÜNAYDIN';
    if (hour < 18) return 'TÜNAYDIN';
    return 'İYİ AKŞAMLAR';
  };

  if (isLoading || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-focus-neon/10 rounded-2xl" />
          <div className="absolute inset-0 border-4 border-t-focus-neon rounded-2xl animate-spin" />
          <Zap className="absolute inset-0 m-auto text-focus-neon animate-pulse" size={24} />
        </div>
        <div className="text-center">
          <p className="text-skel-glass font-display font-bold text-lg tracking-tighter">APEX ÇEKİRDEĞİ BAŞLATILIYOR</p>
          <p className="text-skel-metal font-mono text-[10px] uppercase tracking-[0.3em] mt-2">Nöral Ağlar Senkronize Ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 custom-scrollbar overflow-y-auto h-full pr-2">
      {/* Apex Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5">
              <Activity size={12} /> Sistem Aktif
            </div>
            <div className="px-4 py-1.5 rounded-full bg-grow-main/10 border border-grow-main/20 text-grow-main label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-grow-main/5">
              <ShieldCheck size={12} /> Güvenli Bağlantı
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              {getGreeting()}, <span className="text-focus-neon">{settings.user_name.split(' ')[0]}</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70">Apex Core v4.2 ile operasyonel zekayı yönetin.</p>
          </div>
          <div className="flex items-center gap-4 text-text-secondary font-bold">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-skel-matte/5 rounded-xl border border-skel-metal/10">
              <Clock size={16} className="text-focus-neon" /> 
              <span className="font-display tracking-tight text-sm">{currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <span className="w-1.5 h-1.5 bg-skel-metal/20 rounded-full" />
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-skel-matte/5 rounded-xl border border-skel-metal/10">
              <Calendar size={16} className="text-focus-neon" />
              <span className="font-display tracking-tight text-sm">{currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={clsx(
              "os-btn group",
              isCustomizing ? "os-btn-primary" : "os-btn-secondary"
            )}
          >
            {isCustomizing ? <Check size={18} /> : <Settings2 size={18} className="group-hover:rotate-90 transition-transform duration-500" />}
            <span>{isCustomizing ? 'Kaydet' : 'Arayüzü Özelleştir'}</span>
          </button>
          
          <AnimatePresence>
            {isCustomizing && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={resetDashboard}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-crit-blood/10 text-crit-vivid border border-crit-blood/20 hover:bg-crit-blood/20 transition-all"
                title="Sıfırla"
              >
                <RotateCcw size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Widget Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={widgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {widgets.map((widget) => (
              <SortableWidget 
                key={widget.id}
                widget={widget}
                data={data}
                onClick={(w) => setSelectedWidget(w)}
                onRemove={removeWidget}
                setActiveModule={setActiveModule}
                setIsJobModalOpen={setIsJobModalOpen}
                setIsStockModalOpen={setIsStockModalOpen}
                setIsAccountModalOpen={setIsAccountModalOpen}
              />
            ))}

            {/* Add Widget Button (Only in Customizing Mode) */}
            {isCustomizing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-4 bento-card p-10 border-dashed border-2 border-skel-metal/20 flex flex-col items-center justify-center gap-6 hover:border-focus-neon/50 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-focus-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 rounded-3xl bg-focus-main/10 text-focus-neon flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Plus size={40} />
                </div>
                <div className="text-center relative z-10">
                  <p className="text-xl font-display font-bold text-text-primary">Yeni Modül Ekle</p>
                  <p className="text-xs text-text-secondary mt-1">Apex ekosistemini genişletin</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2 relative z-10">
                  {WIDGET_DEFAULTS.filter(w => !widgets.find(ew => ew.type === w.type)).slice(0, 6).map(w => (
                    <button 
                      key={w.type}
                      onClick={() => addWidget(w.type)}
                      className="px-4 py-2 rounded-xl bg-skel-space border border-skel-metal/10 text-[10px] font-mono font-bold text-text-secondary hover:text-focus-neon hover:border-focus-neon/30 hover:bg-skel-space/80 transition-all uppercase tracking-widest"
                    >
                      {w.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Details Modal */}
      <WidgetDetailsModal 
        isOpen={!!selectedWidget}
        onClose={() => setSelectedWidget(null)}
        title={selectedWidget?.title || ''}
        description={selectedWidget?.description || ''}
        onNavigate={setActiveModule}
        linkTo={
          selectedWidget?.type.includes('job') ? 'jobs' : 
          selectedWidget?.type.includes('stock') ? 'stocks' : 
          selectedWidget?.type.includes('account') ? 'accounts' : undefined
        }
        details={
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-skel-space/50 border border-skel-metal/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Sparkles size={48} className="text-focus-neon" />
              </div>
              <div className="text-lg font-display font-bold text-void-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-focus-main/20 flex items-center justify-center">
                  <LayoutGrid size={18} className="text-focus-neon" />
                </div>
                Apex Analitik Özeti
              </div>
              <p className="text-skel-metal leading-relaxed font-medium">
                {selectedWidget?.type === 'ai_insights' ? (
                  "Apex AI, sistemdeki tüm veri akışlarını anlık olarak analiz ederek operasyonel verimliliği artırmak için derin öğrenme modelleri kullanır. Şu anki analizler, iş akışınızda %18'lik bir optimizasyon potansiyeli tespit etti."
                ) : selectedWidget?.type === 'net_balance' ? (
                  "Finansal motor, cari hesaplarınızdaki likidite oranlarını ve nakit akış projeksiyonlarını hesapladı. Önümüzdeki 30 gün için pozitif bir denge öngörülüyor."
                ) : selectedWidget?.type === 'critical_stocks' ? (
                  "Tedarik zinciri zekası, kritik seviyenin altına düşen stokların üretim terminlerini %22 oranında geciktirebileceğini öngörüyor. Acil ikmal protokolü başlatılmalıdır."
                ) : (
                  `Bu modül, sistemdeki ${selectedWidget?.title.toLowerCase()} katmanını gerçek zamanlı olarak izler. Apex Core verilerine göre tüm parametreler nominal değerlerdedir.`
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl border border-skel-metal/10 bg-skel-space/30">
                <p className="label-mono mb-2">Sistem Durumu</p>
                <div className="text-lg font-display font-bold text-grow-phosphor flex items-center gap-3">
                  <div className="w-2 h-2 bg-grow-phosphor rounded-full animate-ping" />
                  Veri Akışı Aktif
                </div>
              </div>
              <div className="p-6 rounded-3xl border border-skel-metal/10 bg-skel-space/30">
                <p className="label-mono mb-2">Güvenlik Katmanı</p>
                <div className="text-lg font-display font-bold text-void-white flex items-center gap-3">
                  <ShieldCheck size={20} className="text-focus-neon" />
                  Apex-X Korumalı
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* Wizards */}
      <AnimatePresence>
        {isJobModalOpen && (
          <JobWizardModal 
            isOpen={isJobModalOpen}
            onClose={() => setIsJobModalOpen(false)}
            onSave={() => {
              setIsJobModalOpen(false);
              fetchDashboardData();
            }}
          />
        )}
        {isStockModalOpen && (
          <StockWizardModal 
            isOpen={isStockModalOpen}
            onClose={() => setIsStockModalOpen(false)}
            onSave={() => {
              setIsStockModalOpen(false);
              fetchDashboardData();
            }}
          />
        )}
        {isAccountModalOpen && (
          <AccountWizardModal 
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            onSave={() => {
              setIsAccountModalOpen(false);
              fetchDashboardData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
