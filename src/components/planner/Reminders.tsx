import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Check, Minus, LayoutGrid, List, Sparkles, Zap, Target, 
  MoreVertical, Copy, ArrowRight, Archive, Paperclip, GripVertical,
  Bell, BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusButton } from './StatusButton';
import { TimePicker3D } from './TimePicker3D';
import { FileUploader } from './FileUploader';
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
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  is_completed: number; // 0, 1, 2 (using same StatusButton logic)
  sort_order: number;
  is_archived: number;
}

const SortableReminderRow = ({ 
  reminder, 
  onUpdate, 
  onDelete, 
  onCopy, 
  onMove, 
  onArchive,
  onTimeClick 
}: { 
  reminder: Reminder; 
  onUpdate: (id: string, data: Partial<Reminder>) => void;
  onDelete: (id: string) => void;
  onCopy: (reminder: Reminder) => void;
  onMove: (reminder: Reminder) => void;
  onArchive: (id: string) => void;
  onTimeClick: (reminder: Reminder) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: reminder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`hover:bg-emerald-500/5 transition-all group border-b border-border/50 ${reminder.is_completed === 1 ? 'opacity-40 grayscale' : ''}`}
    >
      <td className="p-4 w-12">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={18} />
        </button>
      </td>
      <td className="p-4 text-center">
        <StatusButton 
          status={reminder.is_completed} 
          onChange={(s) => onUpdate(reminder.id, { is_completed: s })} 
        />
      </td>
      <td className="p-4">
        <input 
          value={reminder.title}
          onChange={(e) => onUpdate(reminder.id, { title: e.target.value })}
          className={`bg-transparent border-none outline-none font-black text-text-primary w-full text-lg focus:ring-2 focus:ring-emerald-500/20 rounded-lg px-2 ${reminder.is_completed === 1 ? 'line-through' : ''}`}
        />
      </td>
      <td className="p-4">
        <button 
          onClick={() => onTimeClick(reminder)}
          className="w-full text-left px-4 py-2 bg-bg-app/50 rounded-xl border border-border/50 font-mono text-sm font-black text-emerald-500 hover:border-emerald-500/50 transition-all flex items-center gap-2"
        >
          <Clock size={14} />
          {reminder.time || 'Saat Seç'}
        </button>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-text-secondary font-mono text-xs font-bold">
          <CalendarIcon size={12} />
          {reminder.date}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <FileUploader relatedId={reminder.id} relatedType="reminder" />
          
          <div className="relative group/menu">
            <button className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-bg-app">
              <MoreVertical size={18} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-2xl shadow-2xl z-50 hidden group-hover/menu:block backdrop-blur-xl">
              <div className="p-2 space-y-1">
                <button onClick={() => onCopy(reminder)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                  <Copy size={16} /> Kopyala
                </button>
                <button onClick={() => onMove(reminder)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all">
                  <ArrowRight size={16} /> Taşı
                </button>
                <button onClick={() => onArchive(reminder.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-ai-bright hover:bg-ai-bright/10 rounded-xl transition-all">
                  <Archive size={16} /> Arşivle
                </button>
                <div className="h-px bg-border/50 my-1" />
                <button onClick={() => onDelete(reminder.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                  <Trash2 size={16} /> Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export const Reminders = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [moveModal, setMoveModal] = useState<Reminder | null>(null);
  const [moveDate, setMoveDate] = useState(date);
  const [activeTimePicker, setActiveTimePicker] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchReminders();
  }, [date]);

  const fetchReminders = async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setReminders(data.filter((r: any) => r.date === date && r.type === 'reminder').map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      date: r.date,
      time: r.time,
      is_completed: r.is_completed || 0,
      sort_order: r.sort_order || 0,
      is_archived: r.is_archived || 0
    })));
  };

  const updateReminder = async (id: string, data: Partial<Reminder>) => {
    // Map reminder fields to event fields for the API
    const eventData = {
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      is_completed: data.is_completed,
      sort_order: data.sort_order,
      is_archived: data.is_archived,
      type: 'reminder'
    };
    await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    fetchReminders();
  };

  const addReminder = async () => {
    if (!title.trim()) return;
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        date, 
        time: '09:00',
        type: 'reminder',
        sort_order: reminders.length 
      })
    });
    setTitle('');
    setShowAddModal(false);
    fetchReminders();
  };

  const deleteReminder = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchReminders();
  };

  const archiveReminder = async (id: string) => {
    await updateReminder(id, { is_archived: 1 });
  };

  const copyReminder = async (reminder: Reminder) => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...reminder, 
        id: undefined, 
        title: `${reminder.title} (Kopya)`,
        type: 'reminder',
        sort_order: reminders.length 
      })
    });
    fetchReminders();
  };

  const moveReminder = async () => {
    if (!moveModal) return;
    await updateReminder(moveModal.id, { date: moveDate });
    setMoveModal(null);
    fetchReminders();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = reminders.findIndex((i) => i.id === active.id);
      const newIndex = reminders.findIndex((i) => i.id === over.id);
      const newReminders = arrayMove(reminders, oldIndex, newIndex);
      setReminders(newReminders);

      await Promise.all(newReminders.map((rem, idx) => 
        fetch(`/api/events/${rem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: idx, type: 'reminder' })
        })
      ));
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="p-6 space-y-12 h-full overflow-y-auto custom-scrollbar scroll-smooth">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/10">
              <BellRing size={32} />
            </div>
            Hatırlatıcı <span className="text-emerald-500">Sistemi</span>
          </h1>
          <p className="text-lg text-text-secondary mt-2">Önemli anları kaçırmayın, zamanında haberdar olun.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-2 font-black shadow-xl shadow-emerald-500/20"
          >
            <Plus size={20} />
            Yeni Hatırlatıcı
          </button>
          
          <div className="flex items-center gap-3 bg-bg-card p-2 rounded-3xl border border-border shadow-xl backdrop-blur-md">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-bg-app rounded-xl transition-colors text-text-secondary hover:text-text-primary">
              <ChevronLeft size={24} />
            </button>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="bg-transparent border-none outline-none text-text-primary font-black cursor-pointer px-2 text-lg" 
            />
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-bg-app rounded-xl transition-colors text-text-secondary hover:text-text-primary">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Reminders Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Zap size={24} />
            </div>
            <h2 className="text-2xl font-black text-text-primary">Günlük Hatırlatıcı Tablosu</h2>
          </div>
        </div>

        <div className="layer-3d overflow-hidden border-emerald-500/10 shadow-2xl">
          <div className="overflow-x-auto">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={reminders.map(r => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-card/95 backdrop-blur-xl border-b border-border">
                <tr className="text-text-secondary text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="p-4 w-12"></th>
                  <th className="p-4 w-24 text-center">DURUM</th>
                  <th className="p-4">HATIRLATICI BAŞLIĞI</th>
                  <th className="p-4 w-48">SAAT</th>
                  <th className="p-4 w-40">TARİH</th>
                  <th className="p-4 w-32">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((reminder) => (
                  <SortableReminderRow 
                    key={reminder.id} 
                    reminder={reminder} 
                    onUpdate={updateReminder}
                    onDelete={deleteReminder}
                    onCopy={copyReminder}
                    onMove={(it) => setMoveModal(it)}
                    onArchive={archiveReminder}
                    onTimeClick={(it) => setActiveTimePicker(it)}
                  />
                ))}
                {reminders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-text-secondary font-bold opacity-50">
                      Bu tarih için hatırlatıcı bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black text-text-primary mb-6 flex items-center gap-3">
                <Bell className="text-emerald-500" />
                Yeni Hatırlatıcı Ekle
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Başlık</label>
                  <input 
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: İlaç Saati"
                    className="os-input w-full text-lg font-bold"
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-text-secondary font-black uppercase tracking-widest text-xs">İptal</button>
                  <button onClick={addReminder} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20">Kaydet</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTimePicker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <TimePicker3D 
              value={activeTimePicker.time || ''} 
              onChange={(v) => updateReminder(activeTimePicker.id, { time: v })}
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
                Hatırlatıcıyı Taşı
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
                  <button onClick={moveReminder} className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20">Taşı</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
