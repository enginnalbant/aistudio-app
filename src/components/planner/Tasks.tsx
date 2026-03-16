import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Check, Minus, LayoutGrid, List, Sparkles, Zap, Target, 
  MoreVertical, Copy, ArrowRight, Archive, Paperclip, GripVertical,
  AlertCircle, TrendingUp, CheckSquare
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

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string; // 'pending', 'partial', 'completed'
  priority: 'low' | 'medium' | 'high';
  sort_order: number;
  is_archived: number;
}

const SortableTaskRow = ({ 
  task, 
  onUpdate, 
  onDelete, 
  onCopy, 
  onMove, 
  onArchive,
  onTimeClick 
}: { 
  task: Task; 
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onCopy: (task: Task) => void;
  onMove: (task: Task) => void;
  onArchive: (id: string) => void;
  onTimeClick: (task: Task) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusToNum = (s: string) => s === 'completed' ? 1 : s === 'partial' ? 2 : 0;
  const numToStatus = (n: number) => n === 1 ? 'completed' : n === 2 ? 'partial' : 'pending';

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-text-secondary bg-bg-app border-border';
    }
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`hover:bg-emerald-500/5 transition-all group border-b border-border/50 ${task.status === 'completed' ? 'opacity-40 grayscale' : ''}`}
    >
      <td className="p-4 w-12">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={18} />
        </button>
      </td>
      <td className="p-4 text-center flex items-center justify-center gap-2">
        <StatusButton 
          status={statusToNum(task.status)} 
          onChange={(s) => onUpdate(task.id, { status: numToStatus(s) })} 
        />
        <button 
          onClick={() => onUpdate(task.id, { status: 'completed' })}
          className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors"
        >
          Tamamla
        </button>
      </td>
      <td className="p-4">
        <input 
          value={task.title}
          onChange={(e) => onUpdate(task.id, { title: e.target.value })}
          className={`bg-transparent border-none outline-none font-black text-text-primary w-full text-lg focus:ring-2 focus:ring-emerald-500/20 rounded-lg px-2 ${task.status === 'completed' ? 'line-through' : ''}`}
        />
      </td>
      <td className="p-4">
        <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
          {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-text-secondary font-mono text-xs font-bold">
          <CalendarIcon size={12} />
          {task.due_date}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <FileUploader relatedId={task.id} relatedType="task" />
          
          <div className="relative group/menu">
            <button className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-bg-app">
              <MoreVertical size={18} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-2xl shadow-2xl z-50 hidden group-hover/menu:block backdrop-blur-xl">
              <div className="p-2 space-y-1">
                <button onClick={() => onCopy(task)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                  <Copy size={16} /> Kopyala
                </button>
                <button onClick={() => onMove(task)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all">
                  <ArrowRight size={16} /> Taşı
                </button>
                <button onClick={() => onArchive(task.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-ai-bright hover:bg-ai-bright/10 rounded-xl transition-all">
                  <Archive size={16} /> Arşivle
                </button>
                <div className="h-px bg-border/50 my-1" />
                <button onClick={() => onDelete(task.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
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

export const Tasks = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [moveModal, setMoveModal] = useState<Task | null>(null);
  const [moveDate, setMoveDate] = useState(date);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchAllTasks();
  }, [date]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = (await res.json()) || [];
      setTasks(Array.isArray(data) ? data.filter((t: Task) => t.due_date === date) : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = (await res.json()) || [];
      setAllTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      setAllTasks([]);
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchTasks();
    fetchAllTasks();
  };

  const addTask = async () => {
    if (!title.trim()) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        priority, 
        due_date: date,
        sort_order: tasks.length 
      })
    });
    setTitle('');
    setShowAddModal(false);
    fetchTasks();
    fetchAllTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
    fetchAllTasks();
  };

  const archiveTask = async (id: string) => {
    await updateTask(id, { is_archived: 1 });
  };

  const copyTask = async (task: Task) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...task, 
        id: undefined, 
        title: `${task.title} (Kopya)`,
        sort_order: tasks.length 
      })
    });
    fetchTasks();
  };

  const moveTask = async () => {
    if (!moveModal) return;
    await updateTask(moveModal.id, { due_date: moveDate });
    setMoveModal(null);
    fetchTasks();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((i) => i.id === active.id);
      const newIndex = tasks.findIndex((i) => i.id === over.id);
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      await Promise.all(newTasks.map((task, idx) => 
        fetch(`/api/tasks/${task.id}`, {
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

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-12 h-full overflow-y-auto custom-scrollbar scroll-smooth">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/10">
              <CheckSquare size={32} />
            </div>
            Görev <span className="text-emerald-500">Yönetimi</span>
          </h1>
          <p className="text-lg text-text-secondary mt-2">Hedeflerinizi belirleyin ve başarıya ulaşın.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-2 font-black shadow-xl shadow-emerald-500/20 hover:-translate-y-1"
          >
            <Plus size={20} />
            Yeni Görev Ekle
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

      {/* Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="layer-3d p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">İlerleme</p>
            <h3 className="text-3xl font-black text-text-primary">{progress}%</h3>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <TrendingUp size={28} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="layer-3d p-6 flex items-center justify-between border-l-4 border-l-accent">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Toplam</p>
            <h3 className="text-3xl font-black text-text-primary">{tasks.length}</h3>
          </div>
          <div className="p-4 bg-accent/10 rounded-2xl text-accent">
            <CalendarIcon size={28} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="layer-3d p-6 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Bekleyen</p>
            <h3 className="text-3xl font-black text-text-primary">{tasks.length - completedCount}</h3>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
            <Clock size={28} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="layer-3d p-6 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Kritik</p>
            <h3 className="text-3xl font-black text-text-primary">{tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}</h3>
          </div>
          <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500">
            <AlertCircle size={28} />
          </div>
        </motion.div>
      </div>

      {/* Tasks Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Zap size={24} />
            </div>
            <h2 className="text-2xl font-black text-text-primary">Günlük Görev Tablosu</h2>
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
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-card/95 backdrop-blur-xl border-b border-border">
                <tr className="text-text-secondary text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="p-4 w-12"></th>
                  <th className="p-4 w-24 text-center">DURUM</th>
                  <th className="p-4">GÖREV BAŞLIĞI</th>
                  <th className="p-4 w-40">ÖNCELİK</th>
                  <th className="p-4 w-40">TARİH</th>
                  <th className="p-4 w-32">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <SortableTaskRow 
                    key={task.id} 
                    task={task} 
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onCopy={copyTask}
                    onMove={(it) => setMoveModal(it)}
                    onArchive={archiveTask}
                    onTimeClick={() => {}}
                  />
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-text-secondary font-bold opacity-50">
                      Bu tarih için görev bulunmuyor.
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

      {/* Archived Tasks Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Archive size={24} />
            </div>
            <h2 className="text-2xl font-black text-text-primary">Geçmiş Görevler (Bitenler/Arşivlenenler)</h2>
          </div>
        </div>

        <div className="layer-3d overflow-hidden border-amber-500/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-card/95 backdrop-blur-xl border-b border-border">
                <tr className="text-text-secondary text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="p-4">GÖREV BAŞLIĞI</th>
                  <th className="p-4 w-40">DURUM</th>
                  <th className="p-4 w-40">TARİH</th>
                </tr>
              </thead>
              <tbody>
                {allTasks.filter(t => t.status === 'completed' || t.is_archived === 1).map((task) => (
                  <tr key={task.id} className="border-b border-border/50">
                    <td className="p-4 font-bold text-text-primary">{task.title}</td>
                    <td className="p-4 text-emerald-500 font-bold text-xs">
                      {task.status === 'completed' ? 'Tamamlandı' : 'Arşivlendi'}
                    </td>
                    <td className="p-4 text-text-secondary font-mono text-xs">{task.due_date}</td>
                  </tr>
                ))}
                {allTasks.filter(t => t.status === 'completed' || t.is_archived === 1).length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-16 text-center text-text-secondary font-bold opacity-50">
                      Henüz tamamlanmış veya arşivlenmiş görev bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                <Zap className="text-emerald-500" />
                Yeni Görev Ekle
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Görev Başlığı</label>
                  <input 
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: Raporu Tamamla"
                    className="os-input w-full text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Öncelik</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="os-input w-full text-lg font-bold"
                  >
                    <option value="low">Düşük Öncelik</option>
                    <option value="medium">Orta Öncelik</option>
                    <option value="high">Yüksek Öncelik</option>
                  </select>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-text-secondary font-black uppercase tracking-widest text-xs">İptal</button>
                  <button onClick={addTask} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20">Kaydet</button>
                </div>
              </div>
            </motion.div>
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
                Görevi Taşı
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
                  <button onClick={moveTask} className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20">Taşı</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
