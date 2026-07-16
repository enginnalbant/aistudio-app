import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  ChevronRight, 
  SlidersHorizontal, 
  CheckSquare, 
  Clock, 
  ArrowUpDown, 
  Folder, 
  Play, 
  Pause, 
  RotateCcw, 
  History, 
  Notebook, 
  Timer, 
  Sparkles, 
  Loader2, 
  X, 
  Flame, 
  Check, 
  FileText,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TimeTracking {
  isTracking: boolean;
  elapsed: number;
  intervals: { start: string; end?: string }[];
}

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  subTasks: SubTask[];
  tags: string[];
  createdAt: string;
  timeTracking?: TimeTracking;
}

export const NotesTodo = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useLocalStorage<Todo[]>('apex_todos', []);
  const [isLoading, setIsLoading] = useState(false);

  // New todo form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDesc, setNewTodoDesc] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('Genel');
  const [newTodoTags, setNewTodoTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      const matchSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchStatus = statusFilter === 'all' ||
                          (statusFilter === 'completed' && t.completed) ||
                          (statusFilter === 'pending' && !t.completed);
      return matchSearch && matchPriority && matchStatus;
    });
  }, [todos, searchQuery, priorityFilter, statusFilter]);

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;
    const newEntry: Todo = {
      id: crypto.randomUUID(),
      title: newTodoTitle.trim(),
      description: newTodoDesc.trim(),
      completed: false,
      priority: newTodoPriority,
      dueDate: newTodoDueDate,
      category: newTodoCategory,
      subTasks: [],
      tags: newTodoTags,
      createdAt: new Date().toISOString(),
      timeTracking: { isTracking: false, elapsed: 0, intervals: [] }
    };
    setTodos(prev => [newEntry, ...prev]);
    setIsAddOpen(false);
    setNewTodoTitle('');
    setNewTodoDesc('');
    setNewTodoTags([]);
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleTodo = (todo: Todo) => {
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
  };

  const addTag = () => {
    if (tagInput.trim() && !newTodoTags.includes(tagInput.trim())) {
      setNewTodoTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full min-h-[500px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black text-text-primary uppercase tracking-tight">Yapılacaklar Listesi</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-focus-main hover:scale-105 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} /> Yeni Görev Ekle
        </button>
      </div>

      {isAddOpen && (
        <div className="p-5 border border-border/10 rounded-2xl bg-skel-matte/5 space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Başlık</label>
            <input
              type="text"
              placeholder="Görev Başlığı"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/5 text-sm text-text-primary outline-none border border-border/10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Açıklama</label>
            <textarea
              placeholder="Görev Açıklaması"
              value={newTodoDesc}
              onChange={(e) => setNewTodoDesc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/5 text-sm text-text-primary outline-none border border-border/10 resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Öncelik</label>
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/10 text-sm text-text-primary outline-none border border-border/10"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Bitiş Tarihi</label>
              <input
                type="date"
                value={newTodoDueDate}
                onChange={(e) => setNewTodoDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-skel-matte/10 text-sm text-text-primary outline-none border border-border/10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addTodo} className="flex-1 py-2.5 bg-focus-main text-white font-bold rounded-xl text-xs">Ekle</button>
            <button onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 bg-skel-matte/20 rounded-xl text-text-secondary text-xs">İptal</button>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Görevlerde ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-skel-matte/5 outline-none border border-border/10 text-sm text-text-primary"
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-skel-matte/10 outline-none border border-border/10 text-sm text-text-primary"
        >
          <option value="all">Tüm Öncelikler</option>
          <option value="high">Yüksek</option>
          <option value="medium">Orta</option>
          <option value="low">Düşük</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-skel-matte/10 outline-none border border-border/10 text-sm text-text-primary"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekleyenler</option>
          <option value="completed">Tamamlananlar</option>
        </select>
      </div>

      {/* Todo List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            className={`p-5 bento-card flex flex-col justify-between gap-3 border transition-all ${todo.completed ? 'opacity-50 border-border/10' : 'border-border/20 hover:border-border/40'}`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTodo(todo)} className="text-text-secondary hover:text-focus-neon">
                    {todo.completed ? <CheckSquare size={18} className="text-focus-neon" /> : <Circle size={18} />}
                  </button>
                  <span className={`text-base font-bold ${todo.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                    {todo.title}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${todo.priority === 'high' ? 'bg-crit-pale text-crit-vivid' : todo.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-grow-mint text-grow-main'}`}>
                  {todo.priority === 'high' ? 'Yüksek' : todo.priority === 'medium' ? 'Orta' : 'Düşük'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-2 opacity-70 leading-relaxed pl-7">{todo.description || 'Açıklama girilmemiş.'}</p>
            </div>

            <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-1 pl-7">
              <span className="text-[10px] font-mono text-text-secondary opacity-60">
                {todo.dueDate ? `Bitiş: ${todo.dueDate}` : 'Süre Sınırı Yok'}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 rounded-lg bg-skel-matte/5 hover:bg-crit-pale hover:text-crit-vivid text-text-secondary transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NotesTodo;
