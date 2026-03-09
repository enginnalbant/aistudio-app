import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Check, Minus, LayoutGrid, List, Sparkles, Zap, Target, 
  MoreVertical, Copy, ArrowRight, Archive, Paperclip, GripVertical,
  FileText, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

interface Note {
  id: string;
  title: string;
  content: string;
  target_date: string;
  sort_order: number;
  is_archived: number;
}

const SortableNoteRow = ({ 
  note, 
  onUpdate, 
  onDelete, 
  onCopy, 
  onMove, 
  onArchive 
}: { 
  note: Note; 
  onUpdate: (id: string, data: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onCopy: (note: Note) => void;
  onMove: (note: Note) => void;
  onArchive: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: note.id });

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
      className="hover:bg-emerald-500/5 transition-all group border-b border-border/50"
    >
      <td className="p-4 w-12">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={18} />
        </button>
      </td>
      <td className="p-4">
        <input 
          value={note.title}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
          className="bg-transparent border-none outline-none font-black text-text-primary w-full text-lg focus:ring-2 focus:ring-emerald-500/20 rounded-lg px-2"
        />
      </td>
      <td className="p-4">
        <input 
          value={note.content}
          onChange={(e) => onUpdate(note.id, { content: e.target.value })}
          placeholder="Not içeriği..."
          className="bg-transparent border-none outline-none text-text-secondary w-full text-sm focus:ring-2 focus:ring-emerald-500/20 rounded-lg px-2"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-text-secondary font-mono text-xs font-bold">
          <CalendarIcon size={12} />
          {note.target_date}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <FileUploader relatedId={note.id} relatedType="note" />
          
          <div className="relative group/menu">
            <button className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-bg-app">
              <MoreVertical size={18} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-2xl shadow-2xl z-50 hidden group-hover/menu:block backdrop-blur-xl">
              <div className="p-2 space-y-1">
                <button onClick={() => onCopy(note)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                  <Copy size={16} /> Kopyala
                </button>
                <button onClick={() => onMove(note)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all">
                  <ArrowRight size={16} /> Taşı
                </button>
                <button onClick={() => onArchive(note.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-ai-bright hover:bg-ai-bright/10 rounded-xl transition-all">
                  <Archive size={16} /> Arşivle
                </button>
                <div className="h-px bg-border/50 my-1" />
                <button onClick={() => onDelete(note.id)} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
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

export const Notes = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [moveModal, setMoveModal] = useState<Note | null>(null);
  const [moveDate, setMoveDate] = useState(date);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchNotes();
  }, [date]);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data.filter((n: Note) => n.target_date === date) : []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchNotes();
  };

  const addNote = async () => {
    if (!title.trim()) return;
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        content, 
        target_date: date,
        sort_order: notes.length 
      })
    });
    setTitle('');
    setContent('');
    setShowAddModal(false);
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    fetchNotes();
  };

  const archiveNote = async (id: string) => {
    await updateNote(id, { is_archived: 1 });
  };

  const copyNote = async (note: Note) => {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...note, 
        id: undefined, 
        title: `${note.title} (Kopya)`,
        sort_order: notes.length 
      })
    });
    fetchNotes();
  };

  const moveNote = async () => {
    if (!moveModal) return;
    await updateNote(moveModal.id, { target_date: moveDate });
    setMoveModal(null);
    fetchNotes();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((i) => i.id === active.id);
      const newIndex = notes.findIndex((i) => i.id === over.id);
      const newNotes = arrayMove(notes, oldIndex, newIndex);
      setNotes(newNotes);

      await Promise.all(newNotes.map((note, idx) => 
        fetch(`/api/notes/${note.id}`, {
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

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-12 h-full overflow-y-auto custom-scrollbar scroll-smooth">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/10">
              <FileText size={32} />
            </div>
            Not <span className="text-emerald-500">Defteri</span>
          </h1>
          <p className="text-lg text-text-secondary mt-2">Fikirlerinizi kaydedin, hiçbir şeyi unutmayın.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              placeholder="Notlarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="os-input pl-12 w-64"
            />
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-2 font-black shadow-xl shadow-emerald-500/20"
          >
            <Plus size={20} />
            Yeni Not
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

      {/* Notes Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Zap size={24} />
            </div>
            <h2 className="text-2xl font-black text-text-primary">Günlük Not Tablosu</h2>
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
            items={filteredNotes.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-card/95 backdrop-blur-xl border-b border-border">
                <tr className="text-text-secondary text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="p-4 w-12"></th>
                  <th className="p-4">NOT BAŞLIĞI</th>
                  <th className="p-4">İÇERİK ÖZETİ</th>
                  <th className="p-4 w-40">TARİH</th>
                  <th className="p-4 w-32">İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <SortableNoteRow 
                    key={note.id} 
                    note={note} 
                    onUpdate={updateNote}
                    onDelete={deleteNote}
                    onCopy={copyNote}
                    onMove={(it) => setMoveModal(it)}
                    onArchive={archiveNote}
                  />
                ))}
                {filteredNotes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-text-secondary font-bold opacity-50">
                      Bu tarih için not bulunmuyor.
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
                <Plus className="text-emerald-500" />
                Yeni Not Ekle
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">Not Başlığı</label>
                  <input 
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Başlık..."
                    className="os-input w-full text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">İçerik</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="İçerik..."
                    rows={4}
                    className="os-input w-full text-lg font-bold resize-none"
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-text-secondary font-black uppercase tracking-widest text-xs">İptal</button>
                  <button onClick={addNote} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20">Kaydet</button>
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
                Notu Taşı
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
                  <button onClick={moveNote} className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20">Taşı</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
