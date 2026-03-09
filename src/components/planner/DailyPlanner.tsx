import React, { useState, useEffect, useRef } from 'react';
import { PlanWizardModal } from './PlanWizardModal';
import { PlannerSummaryWidgets, SummaryWidgetConfig } from './PlannerSummaryWidgets';
import { SmartSummaryPanel } from './SmartSummaryPanel';
import { HeroSection } from './HeroSection';
import { FilterBar } from './FilterBar';
import { 
  Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Check, Minus, LayoutGrid, List, Sparkles, Zap, Target, 
  MoreVertical, Copy, ArrowRight, Archive, Paperclip, GripVertical, Download,
  CheckCircle2, AlertCircle, X, Mic, Star, Pencil, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';
import { StatusButton } from './StatusButton';
import { TimePicker3D } from './TimePicker3D';
import { FileUploader } from './FileUploader';
import { CalendarView } from './CalendarView';
import { DaysBar } from './DaysBar';
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
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlannerItem {
  id: string;
  date: string;
  item_key: string;
  time_range: string;
  morning_status: number;
  evening_status: number;
  description: string;
  detail: string;
  sort_order: number;
  is_archived: number;
  priority: number;
  category: string;
  estimated_time: string;
  actual_time: string;
  assigned_to: string;
  recurrence: string;
  color_tag: string;
  sub_tasks: string;
  comments: string;
  url: string;
}

const COLORS = [
  'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
  'bg-emerald-500', 'bg-cyan-500', 'bg-blue-500', 'bg-violet-500'
];

const SortableRow = ({ 
  item, 
  onUpdate, 
  onDelete, 
  onCopy, 
  onMove, 
  onArchive,
  onTimeClick 
}: { 
  item: PlannerItem; 
  onUpdate: (id: string, data: Partial<PlannerItem>) => void;
  onDelete: (id: string) => void;
  onCopy: (item: PlannerItem) => void;
  onMove: (item: PlannerItem) => void;
  onArchive: (id: string) => void;
  onTimeClick: (item: PlannerItem) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-white rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-all group">
      <div 
        ref={setNodeRef} 
        style={style}
        {...attributes} 
        {...listeners}
        className="flex items-center gap-3"
      >
        <button className="p-1 text-text-secondary hover:text-emerald-500 cursor-grab active:cursor-grabbing">
          <GripVertical size={16} />
        </button>
        
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        
        <span className="font-mono text-xs text-text-secondary">{item.time_range || '00:00'}</span>
        
        <span className={`flex-1 font-bold text-text-primary ${item.morning_status === 1 ? 'line-through text-text-secondary' : ''}`}>
          {item.item_key}
        </span>

        <StatusButton 
          status={item.morning_status} 
          onChange={(s) => onUpdate(item.id, { morning_status: s })} 
          type="morning"
        />

        <div className="flex gap-1">
          {[1, 2, 3].map(star => (
            <button key={star} onClick={() => onUpdate(item.id, { priority: star })}>
              <Star size={14} className={star <= (item.priority || 0) ? 'fill-amber-500 text-amber-500' : 'text-border'} />
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <button onClick={() => onUpdate(item.id, { morning_status: item.morning_status === 1 ? 0 : 1 })} className="p-1 hover:bg-emerald-100 rounded"><Check size={14} /></button>
          <button className="p-1 hover:bg-blue-100 rounded"><Pencil size={14} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1 hover:bg-rose-100 rounded text-rose-500"><Trash2 size={14} /></button>
        </div>

        <button onClick={() => setShowSubTasks(!showSubTasks)} className="p-1">
          {showSubTasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showSubTasks && (
        <div className="grid grid-cols-4 gap-4 p-4 text-xs text-text-secondary border-t border-border/50">
          <div><span className="font-bold">Kategori:</span> {item.category || '-'}</div>
          <div><span className="font-bold">Tahmini:</span> {item.estimated_time || '-'}</div>
          <div><span className="font-bold">Gerçekleşen:</span> {item.actual_time || '-'}</div>
          <div><span className="font-bold">Kişi:</span> {item.assigned_to || '-'}</div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_WIDGETS: SummaryWidgetConfig[] = [
  { id: 'progress', type: 'progress', title: 'Tamamlanma', color: 'border-l-emerald-500' },
  { id: 'total', type: 'total', title: 'Toplam Plan', color: 'border-l-accent' },
  { id: 'completed', type: 'completed', title: 'Tamamlanan', color: 'border-l-blue-500' },
  { id: 'pending', type: 'pending', title: 'Bekleyen', color: 'border-l-amber-500' },
  { id: 'urgent', type: 'urgent', title: 'Acil İşler', color: 'border-l-rose-500' },
];

export const DailyPlanner = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [allPlannerItems, setAllPlannerItems] = useState<PlannerItem[]>([]);
  const [summary, setSummary] = useState('');
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [summaryWidgets, setSummaryWidgets] = useState<SummaryWidgetConfig[]>(DEFAULT_WIDGETS);

  const handleWizardSave = async (plan: any) => {
    const { type, items: planItems, selectedWeekDays, selectedMonthDays, date: startDate } = plan;
    
    let datesToAdd: string[] = [];
    
    if (type === 'daily') {
      datesToAdd.push(startDate);
    } else if (type === 'weekly') {
      const start = new Date(startDate);
      for (let i = 0; i < 28; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
        if (selectedWeekDays?.includes(dayOfWeek)) {
          datesToAdd.push(d.toISOString().split('T')[0]);
        }
      }
    } else if (type === 'monthly') {
      const start = new Date(startDate);
      for (let i = 0; i < 90; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (selectedMonthDays?.includes(d.getDate())) {
          datesToAdd.push(d.toISOString().split('T')[0]);
        }
      }
    }

    if (datesToAdd.length === 0) {
      datesToAdd.push(startDate);
    }

    for (const targetDate of datesToAdd) {
      for (const itemText of planItems) {
        await addItem(itemText, targetDate);
      }
    }
    setShowWizard(false);
  };
  const [newItemTitle, setNewItemTitle] = useState('');
  const [activeTimePicker, setActiveTimePicker] = useState<PlannerItem | null>(null);
  const [activePopupDate, setActivePopupDate] = useState<string | null>(null);
  const [moveModal, setMoveModal] = useState<PlannerItem | null>(null);
  const [moveDate, setMoveDate] = useState(date);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ... (rest of the component logic)

  useEffect(() => {
    fetchItems();
    fetchSummary();
    fetchAllItems();
  }, [date]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/planner/${date}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = (await res.json()) || [];
      console.log('fetchItems data:', data);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching planner items:', error);
      setItems([]);
    }
  };

  const fetchAllItems = async () => {
    try {
      const res = await fetch('/api/planner');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = (await res.json()) || [];
      setAllPlannerItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching all planner items:', error);
      setAllPlannerItems([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/planner/summary/${date}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSummary(data.summary || '');
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary('');
    }
  };

  const updateItem = async (id: string, data: Partial<PlannerItem>) => {
    await fetch(`/api/planner/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchItems();
    fetchAllItems();
  };

  const addItem = async (itemKey: string, targetDate: string = date) => {
    await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        date: targetDate, 
        item_key: itemKey,
        sort_order: items.length
      })
    });
    fetchItems();
    fetchAllItems();
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/planner/${id}`, { method: 'DELETE' });
    fetchItems();
    fetchAllItems();
  };

  const archiveItem = async (id: string) => {
    await updateItem(id, { is_archived: 1 });
  };

  const copyItem = async (item: PlannerItem) => {
    await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...item, 
        id: undefined, 
        item_key: `${item.item_key} (Kopya)`,
        sort_order: items.length 
      })
    });
    fetchItems();
  };

  const moveItem = async () => {
    if (!moveModal) return;
    await updateItem(moveModal.id, { date: moveDate });
    setMoveModal(null);
    fetchItems();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update sort order in DB
      await Promise.all(newItems.map((item, idx) => 
        fetch(`/api/planner/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: idx })
        })
      ));
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.text(`Günlük Plan - ${date}`, 14, 20);
    
    if (summary) {
      doc.setFontSize(10);
      doc.text(`Özet: ${summary}`, 14, 30);
    }

    autoTable(doc, {
      head: [['Saat', 'Plan', 'Açıklama', 'Durum']],
      body: items.map(item => [
        item.time_range || '-',
        item.item_key,
        item.description || '-',
        item.morning_status === 1 ? 'Tamamlandı' : item.morning_status === 2 ? 'Kısmen' : 'Bekliyor'
      ]),
      startY: summary ? 40 : 30,
    });
    doc.save(`plan_${date}.pdf`);
  };

  const exportPNG = async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `plan_${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  const handleWidgetDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSummaryWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const completedCount = items.filter(i => i.morning_status === 1 && i.evening_status === 1).length;

  const calculateProgress = () => {
    if (items.length === 0) return 0;
    
    let totalPoints = 0;
    let maxPoints = items.length * 2; // Morning + Evening

    items.forEach(item => {
      // Morning
      if (item.morning_status === 1) totalPoints += 1;
      else if (item.morning_status === 2) totalPoints += 0.5;

      // Evening
      if (item.evening_status === 1) totalPoints += 1;
      else if (item.evening_status === 2) totalPoints += 0.5;
    });

    return Math.round((totalPoints / maxPoints) * 100);
  };

  const progress = calculateProgress();

  // Fetch items for the popup when activePopupDate changes
  const [popupItems, setPopupItems] = useState<PlannerItem[]>([]);
  useEffect(() => {
    if (activePopupDate) {
      const fetchPopupItems = async () => {
        try {
          const res = await fetch(`/api/planner/${activePopupDate}`);
          if (res.ok) {
            const data = await res.json();
            setPopupItems(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Error fetching popup items:', error);
          setPopupItems([]);
        }
      };
      fetchPopupItems();
    } else {
      setPopupItems([]);
    }
  }, [activePopupDate]);

  const exportPopupPDF = () => {
    if (!activePopupDate) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.text(`Günlük Plan - ${activePopupDate}`, 14, 20);
    
    autoTable(doc, {
      head: [['Saat', 'Plan', 'Açıklama', 'Durum']],
      body: popupItems.map(item => [
        item.time_range || '-',
        item.item_key,
        item.description || '-',
        item.morning_status === 1 ? 'Tamamlandı' : item.morning_status === 2 ? 'Kısmen' : 'Bekliyor'
      ]),
      startY: 30,
    });
    doc.save(`plan_${activePopupDate}.pdf`);
  };

  const popupRef = useRef<HTMLDivElement>(null);

  const exportPopupPNG = async () => {
    if (!popupRef.current) return;
    try {
      const dataUrl = await toPng(popupRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `plan_${activePopupDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    }
  };

  const [filter, setFilter] = useState('Tümü');

  return (
    <div ref={containerRef} className="h-full flex flex-col overflow-y-auto custom-scrollbar scroll-smooth bg-bg-app">
      <div className="p-6 space-y-8 flex-1">
        
        <HeroSection date={date} />

        <div className="flex items-center justify-between gap-4">
          <DaysBar date={date} setDate={setDate} onDateClick={setActivePopupDate} />
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-8">
          {/* Left Panel: Summary & Widgets */}
          <div className="space-y-6">
            <SmartSummaryPanel items={items} completedCount={completedCount} />
            
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleWidgetDragEnd}
            >
              <SortableContext 
                items={summaryWidgets.map(w => w.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 gap-6">
                  <PlannerSummaryWidgets 
                    items={items} 
                    completedCount={completedCount} 
                    progress={progress} 
                    widgets={summaryWidgets}
                  />
                  
                  <div className="layer-3d p-4 flex flex-col justify-center bg-bg-card/50 rounded-2xl border border-border">
                    <button 
                      onClick={() => setShowWizard(true)}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 font-black shadow-xl shadow-emerald-500/20"
                    >
                      <Plus size={20} />
                      Yeni Plan Ekle
                    </button>
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Right Panel: Main Table View */}
          <div className="layer-3d bg-bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6">
            {view === 'daily' && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-text-primary">Günlük Plan Tablosu</h2>
                  <div className="flex items-center gap-2">
                    <FilterBar currentFilter={filter} onFilterChange={setFilter} />
                    <button 
                      onClick={() => setShowWizard(true)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all flex items-center gap-2 font-black text-xs uppercase"
                    >
                      <Plus size={14} />
                      Yeni Plan
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar border-emerald-500/10 shadow-2xl bg-bg-card/50 backdrop-blur-md rounded-2xl">
                  <div className="min-w-[1800px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-[40px_20px_80px_1fr_100px_100px_100px_40px] gap-4 p-4 bg-bg-card/95 backdrop-blur-xl border-b border-border text-text-secondary text-[10px] uppercase tracking-[0.2em] font-black sticky top-0 z-10">
                      <div className="w-8"></div>
                      <div></div> {/* Color Tag */}
                      <div className="text-center">SAAT</div>
                      <div>PLAN / ETKİNLİK</div>
                      <div className="text-center">DURUM</div>
                      <div className="text-center">ÖNCELİK</div>
                      <div className="text-center">AKSİYON</div>
                      <div className="w-8"></div>
                    </div>

                    {/* Table Body */}
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="divide-y divide-border/30">
                          {items.map((item) => (
                            <SortableRow 
                              key={item.id} 
                              item={item} 
                              onUpdate={updateItem}
                              onDelete={deleteItem}
                              onCopy={copyItem}
                              onMove={(it) => setMoveModal(it)}
                              onArchive={archiveItem}
                              onTimeClick={(it) => setActiveTimePicker(it)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    
                    {items.length === 0 && (
                      <div className="p-16 text-center text-text-secondary font-bold opacity-50">
                        Bu tarih için plan bulunmuyor. Yeni bir plan ekleyerek başlayın.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
            
            {view !== 'daily' && (
              <div className="text-center py-20 layer-3d bg-bg-card/30 border-dashed rounded-3xl">
                <Sparkles size={64} className="mx-auto mb-4 text-emerald-500 opacity-20" />
                <p className="text-xl font-black text-text-primary">{view === 'weekly' ? 'Haftalık Görünüm' : 'Aylık Görünüm'}</p>
                <p className="text-sm text-text-secondary mt-2">Bu görünüm yakında daha fazla detay ile güncellenecek.</p>
              </div>
            )}
          </div>
        </div>
        
        <CalendarView date={date} setDate={setDate} />

      {/* Popup for DaysBar clicks */}
      {activePopupDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div ref={popupRef} className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-2xl font-black text-text-primary">{activePopupDate} Planı</h2>
              <button onClick={() => setActivePopupDate(null)} className="p-2 hover:bg-bg-app rounded-xl"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-6">
              {popupItems.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="p-3 text-text-secondary font-bold text-sm">Saat</th>
                      <th className="p-3 text-text-secondary font-bold text-sm">Görev</th>
                      <th className="p-3 text-text-secondary font-bold text-sm">Açıklama</th>
                      <th className="p-3 text-text-secondary font-bold text-sm">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popupItems.map((item) => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="p-3 font-mono text-emerald-500 font-bold">{item.time_range || '-'}</td>
                        <td className="p-3 font-bold text-text-primary">{item.item_key}</td>
                        <td className="p-3 text-text-secondary text-sm">{item.description}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            item.morning_status === 1 ? 'bg-emerald-500/10 text-emerald-500' : 
                            item.morning_status === 2 ? 'bg-amber-500/10 text-amber-500' : 
                            'bg-skel-metal/10 text-text-secondary'
                          }`}>
                            {item.morning_status === 1 ? 'Tamamlandı' : item.morning_status === 2 ? 'Kısmen' : 'Bekliyor'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  <p>Bu tarih için plan bulunamadı.</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end flex-shrink-0">
              <button onClick={() => { setDate(activePopupDate); setActivePopupDate(null); }} className="px-4 py-2 hover:bg-bg-app rounded-xl font-bold text-text-secondary mr-auto">
                Bu Güne Git
              </button>
              <button onClick={exportPopupPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all">
                <Download size={16} /> PDF
              </button>
              <button onClick={exportPopupPNG} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all">
                <Download size={16} /> PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        <PlanWizardModal 
          isOpen={showWizard} 
          onClose={() => setShowWizard(false)} 
          onSave={handleWizardSave} 
        />
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black text-text-primary mb-6 flex items-center gap-3">
                <Plus className="text-emerald-500" />
                Yeni Plan Ekle
              </h2>
              <div className="space-y-4">
                <input 
                  autoFocus
                  placeholder="Plan başlığı..."
                  className="os-input w-full text-lg font-bold"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" className="os-input w-full" value={date} onChange={(e) => setDate(e.target.value)} />
                  <input type="time" className="os-input w-full" />
                </div>
                <p className="text-xs text-text-secondary font-bold opacity-50">Enter tuşuna basarak kaydedebilirsiniz.</p>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => { setShowAddModal(false); setNewItemTitle(''); }} className="flex-1 py-4 text-text-secondary font-black uppercase tracking-widest text-xs">İptal</button>
                  <button onClick={() => { addItem(newItemTitle); setNewItemTitle(''); setShowAddModal(false); }} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20">Kaydet</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTimePicker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <TimePicker3D 
              value={activeTimePicker.time_range || ''} 
              onChange={(v) => updateItem(activeTimePicker.id, { time_range: v })}
              onClose={() => setActiveTimePicker(null)}
            />
          </div>
        )}

        {moveModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black text-text-primary mb-6 flex items-center gap-3">
                <ArrowRight className="text-amber-500" />
                Planı Taşı
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Hedef Tarih</label>
                  <input 
                    type="date" 
                    value={moveDate}
                    onChange={(e) => setMoveDate(e.target.value)}
                    className="os-input w-full text-lg font-bold"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setMoveModal(null)} className="flex-1 py-4 text-text-secondary font-black uppercase tracking-widest text-xs">İptal</button>
                  <button onClick={moveItem} className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20">Taşı</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
