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
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch
} from 'firebase/firestore';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface ActivityLog {
  timestamp: string;
  action: string;
}

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  subtasks: SubTask[];
  tags: string[];
  notes: string;
  pomodoroSessions: number;
  completedPomodoros: number;
  elapsedTime: number; // in seconds
  history: ActivityLog[];
}

const CATEGORIES = [
  'Genel',
  'Yazılım & Geliştirme',
  'Kişisel Gelişim',
  'Finans & Bütçe',
  'İş & Kariyer',
  'Sağlık & Spor',
  'Alışveriş & İhtiyaç'
];

const PRIORITIES = [
  { value: 'low', label: 'Düşük', color: 'text-skel-metal bg-skel-matte/10 border-skel-metal/20' },
  { value: 'medium', label: 'Orta', color: 'text-focus-neon bg-focus-neon/10 border-focus-neon/20' },
  { value: 'high', label: 'Yüksek', color: 'text-nrg-gold bg-nrg-gold/10 border-nrg-gold/20' },
  { value: 'critical', label: 'Kritik', color: 'text-crit-vivid bg-crit-vivid/10 border-crit-vivid/20 animate-pulse' }
];

export function NotesTodo() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States (New Todo)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [category, setCategory] = useState('Genel');
  const [dueDate, setDueDate] = useState('');
  const [pomodoroSessions, setPomodoroSessions] = useState(1);
  const [tagsInput, setTagsInput] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // Filter & Search & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Operations State
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);
  
  // Selected/Active Todo details drawer
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Pomodoro Timer State (Linked to Active Todo)
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [totalTimerDuration, setTotalTimerDuration] = useState(1500);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time Firestore sync
  useEffect(() => {
    if (!user) {
      setTodos([]);
      setIsLoading(false);
      return;
    }

    const path = `users/${user.uid}/todos`;
    const todosQuery = query(collection(db, 'users', user.uid, 'todos'));
    
    const unsub = onSnapshot(todosQuery, (snapshot) => {
      const list: Todo[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || 'Başlıksız Görev',
          description: data.description || '',
          completed: !!data.completed,
          priority: data.priority || 'medium',
          category: data.category || 'Genel',
          dueDate: data.dueDate || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          subtasks: Array.isArray(data.subtasks) ? data.subtasks : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          notes: data.notes || '',
          pomodoroSessions: Number(data.pomodoroSessions) || 1,
          completedPomodoros: Number(data.completedPomodoros) || 0,
          elapsedTime: Number(data.elapsedTime) || 0,
          history: Array.isArray(data.history) ? data.history : []
        });
      });
      setTodos(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsub();
  }, [user]);

  // Keep activeTodo details updated when real-time todos list changes
  useEffect(() => {
    if (activeTodo) {
      const updated = todos.find(t => t.id === activeTodo.id);
      if (updated) {
        setActiveTodo(updated);
      } else {
        // Active todo was deleted from somewhere else
        setActiveTodo(null);
        setIsTimerRunning(false);
      }
    }
  }, [todos, activeTodo?.id]);

  // Handle Pomodoro Timer tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // Timer finished
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          
          // Log active task time (increment elapsedTime by 1 second in Firestore occasionally, or keep it local and update on action)
          if (activeTodo) {
            // To prevent heavy writes, we accumulate time and write on stop/complete
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode, activeTodo?.id]);

  // Add new task
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    try {
      const processedTags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const timestamp = new Date().toISOString();
      const initialHistory: ActivityLog[] = [
        { timestamp, action: 'Görev oluşturuldu.' }
      ];

      const newTodo = {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        category,
        dueDate,
        createdAt: timestamp,
        updatedAt: timestamp,
        subtasks: [],
        tags: processedTags,
        notes: '',
        pomodoroSessions: Number(pomodoroSessions) || 1,
        completedPomodoros: 0,
        elapsedTime: 0,
        history: initialHistory
      };

      await addDoc(collection(db, 'users', user.uid, 'todos'), newTodo);
      
      // Reset
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Genel');
      setDueDate('');
      setPomodoroSessions(1);
      setTagsInput('');
      setIsAddingTodo(false);
    } catch (err) {
      console.error('Görev ekleme hatası:', err);
    }
  };

  // Toggle todo status (Completed / Active)
  const handleToggleCompleted = async (todo: Todo) => {
    if (!user) return;
    const timestamp = new Date().toISOString();
    const newStatus = !todo.completed;
    const updatedHistory = [
      ...todo.history,
      { timestamp, action: `Görev ${newStatus ? 'tamamlandı olarak işaretlendi.' : 'yeniden aktif hale getirildi.'}` }
    ];

    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', todo.id), {
        completed: newStatus,
        updatedAt: timestamp,
        history: updatedHistory
      });
    } catch (err) {
      console.error('Görev durum güncelleme hatası:', err);
    }
  };

  // Delete individual task
  const handleDeleteTodo = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
      if (activeTodo?.id === id) {
        setActiveTodo(null);
        setIsTimerRunning(false);
      }
    } catch (err) {
      console.error('Görev silme hatası:', err);
    }
  };

  // Add a subtask to the active todo
  const handleAddSubtask = async () => {
    if (!user || !activeTodo || !newSubtask.trim()) return;

    const timestamp = new Date().toISOString();
    const subtaskItem: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSubtask.trim(),
      completed: false
    };

    const updatedSubtasks = [...activeTodo.subtasks, subtaskItem];
    const updatedHistory = [
      ...activeTodo.history,
      { timestamp, action: `Alt görev eklendi: "${subtaskItem.title}"` }
    ];

    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', activeTodo.id), {
        subtasks: updatedSubtasks,
        updatedAt: timestamp,
        history: updatedHistory
      });
      setNewSubtask('');
    } catch (err) {
      console.error('Alt görev ekleme hatası:', err);
    }
  };

  // Toggle subtask status
  const handleToggleSubtask = async (subtaskId: string) => {
    if (!user || !activeTodo) return;

    const timestamp = new Date().toISOString();
    let subtaskTitle = '';
    const updatedSubtasks = activeTodo.subtasks.map(st => {
      if (st.id === subtaskId) {
        subtaskTitle = st.title;
        return { ...st, completed: !st.completed };
      }
      return st;
    });

    const isNowCompleted = updatedSubtasks.find(st => st.id === subtaskId)?.completed;
    const updatedHistory = [
      ...activeTodo.history,
      { timestamp, action: `"${subtaskTitle}" alt görevi ${isNowCompleted ? 'tamamlandı' : 'tamamlanmadı'} olarak işaretlendi.` }
    ];

    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', activeTodo.id), {
        subtasks: updatedSubtasks,
        updatedAt: timestamp,
        history: updatedHistory
      });
    } catch (err) {
      console.error('Alt görev durum güncelleme hatası:', err);
    }
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!user || !activeTodo) return;

    const timestamp = new Date().toISOString();
    const deletedSubtask = activeTodo.subtasks.find(st => st.id === subtaskId);
    const updatedSubtasks = activeTodo.subtasks.filter(st => st.id !== subtaskId);
    const updatedHistory = [
      ...activeTodo.history,
      { timestamp, action: `Alt görev silindi: "${deletedSubtask?.title || 'Bilinmeyen'}"` }
    ];

    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', activeTodo.id), {
        subtasks: updatedSubtasks,
        updatedAt: timestamp,
        history: updatedHistory
      });
    } catch (err) {
      console.error('Alt görev silme hatası:', err);
    }
  };

  // Save detailed notes for active task
  const handleSaveNotes = async () => {
    if (!user || !activeTodo) return;
    setIsSavingNotes(true);

    const timestamp = new Date().toISOString();
    const updatedHistory = [
      ...activeTodo.history,
      { timestamp, action: 'Görev detaylı notları güncellendi.' }
    ];

    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', activeTodo.id), {
        notes: editedNotes,
        updatedAt: timestamp,
        history: updatedHistory
      });
    } catch (err) {
      console.error('Not güncelleme hatası:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Switch Timer modes (Work, Break)
  const handleSetTimerMode = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    let duration = 1500; // 25 mins
    if (mode === 'shortBreak') duration = 300; // 5 mins
    if (mode === 'longBreak') duration = 900; // 15 mins
    setTimerSeconds(duration);
    setTotalTimerDuration(duration);
  };

  // Handle countdown complete
  const handleTimerComplete = async () => {
    if (!user || !activeTodo) return;

    const timestamp = new Date().toISOString();
    let actionLog = '';
    let updates: any = { updatedAt: timestamp };

    if (timerMode === 'work') {
      const newCompletedPomodoros = activeTodo.completedPomodoros + 1;
      const accumulatedTime = activeTodo.elapsedTime + totalTimerDuration;
      actionLog = `Pomodoro odaklanma seansı tamamlandı! (+25dk). Toplam tamamlanan: ${newCompletedPomodoros}`;
      
      updates = {
        ...updates,
        completedPomodoros: newCompletedPomodoros,
        elapsedTime: accumulatedTime,
        history: [...activeTodo.history, { timestamp, action: actionLog }]
      };
      
      // Confetti effect can go here, or simple alert/notification
    } else {
      actionLog = `Mola seansı tamamlandı. Yeniden odaklanmaya hazır olun!`;
      updates = {
        ...updates,
        history: [...activeTodo.history, { timestamp, action: actionLog }]
      };
    }

    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', activeTodo.id), updates);
      // Auto switch mode to break/work
      if (timerMode === 'work') {
        handleSetTimerMode('shortBreak');
      } else {
        handleSetTimerMode('work');
      }
    } catch (err) {
      console.error('Timer tamamlama güncelleme hatası:', err);
    }
  };

  // Stop Timer & Accumulate local seconds spent
  const handleStopTimer = async () => {
    if (!user || !activeTodo) {
      setIsTimerRunning(false);
      return;
    }

    setIsTimerRunning(false);
    const timeSpent = totalTimerDuration - timerSeconds;
    if (timeSpent > 5) { // Only log if they spent more than 5 seconds
      const timestamp = new Date().toISOString();
      const accumulatedTime = activeTodo.elapsedTime + timeSpent;
      const minutesSpent = Math.round(timeSpent / 60);
      const updatedHistory = [
        ...activeTodo.history,
        { timestamp, action: `Odaklanma durduruldu. Sürdürülen süre: ${minutesSpent > 0 ? minutesSpent + ' dk' : timeSpent + ' sn'}` }
      ];

      try {
        await updateDoc(doc(db, 'users', user.uid, 'todos', activeTodo.id), {
          elapsedTime: accumulatedTime,
          updatedAt: timestamp,
          history: updatedHistory
        });
      } catch (err) {
        console.error('Geçen süre kayıt hatası:', err);
      }
    }
  };

  // Bulk Complete
  const handleBulkComplete = async () => {
    if (!user || selectedTodoIds.length === 0) return;
    const timestamp = new Date().toISOString();
    
    try {
      const batch = writeBatch(db);
      selectedTodoIds.forEach((id) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
          const docRef = doc(db, 'users', user.uid, 'todos', id);
          batch.update(docRef, {
            completed: true,
            updatedAt: timestamp,
            history: [
              ...todo.history,
              { timestamp, action: 'Toplu işlemle tamamlandı olarak işaretlendi.' }
            ]
          });
        }
      });
      await batch.commit();
      setSelectedTodoIds([]);
    } catch (err) {
      console.error('Toplu tamamlama hatası:', err);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!user || selectedTodoIds.length === 0) return;
    if (!window.confirm(`${selectedTodoIds.length} adet görevi silmek istediğinize emin misiniz?`)) return;

    try {
      const batch = writeBatch(db);
      selectedTodoIds.forEach((id) => {
        const docRef = doc(db, 'users', user.uid, 'todos', id);
        batch.delete(docRef);
      });
      await batch.commit();
      setSelectedTodoIds([]);
      if (selectedTodoIds.includes(activeTodo?.id || '')) {
        setActiveTodo(null);
        setIsTimerRunning(false);
      }
    } catch (err) {
      console.error('Toplu silme hatası:', err);
    }
  };

  // Bulk Toggle Selection
  const handleToggleSelectTodo = (id: string) => {
    setSelectedTodoIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Set detail text for editor when opening active todo
  useEffect(() => {
    if (activeTodo) {
      setEditedNotes(activeTodo.notes || '');
      // Initialize timer duration
      setTimerMode('work');
      setTimerSeconds(1500);
      setTotalTimerDuration(1500);
      setIsTimerRunning(false);
    }
  }, [activeTodo?.id]);

  // Priority weight mapping for sorting
  const PRIORITY_WEIGHTS = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // Filter & Search & Sort Logic
  const filteredAndSortedTodos = useMemo(() => {
    let list = [...todos];

    // Status Filter
    if (filterStatus === 'active') {
      list = list.filter(t => !t.completed);
    } else if (filterStatus === 'completed') {
      list = list.filter(t => t.completed);
    }

    // Priority Filter
    if (filterPriority !== 'all') {
      list = list.filter(t => t.priority === filterPriority);
    }

    // Category Filter
    if (filterCategory !== 'all') {
      list = list.filter(t => t.category === filterCategory);
    }

    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        comparison = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      } else {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [todos, filterStatus, filterPriority, filterCategory, searchQuery, sortBy, sortOrder]);

  // Dynamic Dashboard Stats
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const critical = todos.filter(t => t.priority === 'critical' && !t.completed).length;
    const high = todos.filter(t => t.priority === 'high' && !t.completed).length;
    
    // Calculate total Pomodoros done
    const totalPomodoros = todos.reduce((acc, t) => acc + (t.completedPomodoros || 0), 0);
    const totalMinutes = Math.round(todos.reduce((acc, t) => acc + (t.elapsedTime || 0), 0) / 60);

    // Overdue items
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, critical, high, overdue, progressPercentage, totalPomodoros, totalMinutes };
  }, [todos]);

  // Format Timer text mm:ss
  const formatTimerTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Check if task is overdue
  const isOverdue = (todo: Todo) => {
    if (todo.completed || !todo.dueDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return todo.dueDate < todayStr;
  };

  // Quick helper for categories list
  const allUsedCategories = useMemo(() => {
    const set = new Set<string>();
    todos.forEach(t => {
      if (t.category) set.add(t.category);
    });
    CATEGORIES.forEach(c => set.add(c));
    return Array.from(set);
  }, [todos]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-text-primary">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 px-2 pt-2 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-black text-text-primary mb-1 flex items-center gap-3">
            <CheckSquare className="text-focus-neon animate-pulse shrink-0" size={28} />
            Gelişmiş Görev Yönetimi
          </h1>
          <p className="text-text-secondary text-xs">
            Hedeflerinizi alt görevlerle yapılandırın, Pomodoro zamanlayıcı ile odaklanın ve istatistiklerle verimliliğinizi izleyin.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => setIsAddingTodo(!isAddingTodo)}
            className="os-btn os-btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2"
          >
            <Plus size={14} />
            {isAddingTodo ? 'Kapat' : 'Hızlı Görev Ekle'}
          </button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4 shrink-0">
        
        {/* Total & Progress Card */}
        <div className="bento-card p-4 flex flex-col justify-between h-24">
          <span className="label-mono text-[9px]">Genel İlerleme</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-display font-black">{stats.completed}/{stats.total}</span>
            <span className="text-xs font-mono text-focus-neon font-bold">{stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.progressPercentage}%` }}
              className="h-full bg-focus-neon"
            />
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bento-card p-4 flex items-center gap-3.5 h-24">
          <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <CheckSquare size={18} />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Aktif Görevler</span>
            <span className="text-2xl font-display font-black block mt-0.5">{stats.active}</span>
          </div>
        </div>

        {/* Critical & High */}
        <div className="bento-card p-4 flex items-center gap-3.5 h-24">
          <div className="size-10 rounded-xl bg-crit-vivid/10 border border-crit-vivid/20 flex items-center justify-center text-crit-vivid shrink-0">
            <AlertCircle size={18} className="animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Kritik & Acil</span>
            <span className="text-2xl font-display font-black block mt-0.5 text-crit-vivid">{stats.critical + stats.high}</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="bento-card p-4 flex items-center gap-3.5 h-24">
          <div className="size-10 rounded-xl bg-nrg-gold/10 border border-nrg-gold/20 flex items-center justify-center text-nrg-gold shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <span className="label-mono text-[9px] block">Geciken Görevler</span>
            <span className="text-2xl font-display font-black block mt-0.5 text-nrg-gold">{stats.overdue}</span>
          </div>
        </div>

        {/* Pomodoro Focus */}
        <div className="bento-card p-4 flex items-center gap-3.5 col-span-2 lg:col-span-1 h-24">
          <div className="size-10 rounded-xl bg-grow-phosphor/10 border border-grow-phosphor/20 flex items-center justify-center text-grow-phosphor shrink-0">
            <Flame size={18} className="animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="label-mono text-[9px] block truncate">Odaklanma Süresi</span>
            <span className="text-xl font-display font-black block mt-0.5 truncate text-grow-phosphor">
              {stats.totalPomodoros} Seans ({stats.totalMinutes}dk)
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: Main task list & Filter panels */}
        <div className="xl:col-span-8 flex flex-col gap-4 overflow-hidden min-h-0">
          
          {/* Add Todo Panel */}
          <AnimatePresence>
            {isAddingTodo && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddTodo}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-sm relative shrink-0 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold font-mono text-text-secondary uppercase">Yeni Görev Kartı Tanımla</h3>
                  <button type="button" onClick={() => setIsAddingTodo(false)} className="text-text-secondary hover:text-text-primary p-1">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Görev Başlığı</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Haftalık gelir-gider raporunu hazırla..."
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                    >
                      {allUsedCategories.map((c) => (
                        <option key={c} value={c} className="bg-neutral-900">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">Açıklama / Özet</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Göreve ait detayları buraya yazabilirsiniz..."
                    rows={2}
                    className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Öncelik Seviyesi</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-2 text-xs text-text-primary transition-colors h-9"
                    >
                      <option value="low" className="bg-neutral-900 text-skel-metal">Düşük</option>
                      <option value="medium" className="bg-neutral-900 text-focus-neon">Orta</option>
                      <option value="high" className="bg-neutral-900 text-nrg-gold">Yüksek</option>
                      <option value="critical" className="bg-neutral-900 text-crit-vivid">Kritik</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Termin Tarihi</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-1.5 text-xs text-text-primary transition-colors h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Hedef Seans (Pomodoro)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={pomodoroSessions}
                      onChange={(e) => setPomodoroSessions(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-1.5 text-xs text-text-primary transition-colors h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Etiketler (Virgülle Ayırın)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="kodlama, rapor, acil"
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/40 outline-none rounded-xl px-3 py-1.5 text-xs text-text-primary transition-colors h-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTodo(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-text-secondary transition-all"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="os-btn os-btn-primary px-5 py-2 text-xs font-bold"
                  >
                    Görev Kaydet
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Filter & Search Bar Panel */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs bg-black/20 rounded-xl border border-white/5 h-10 flex items-center px-3 gap-2">
              <Search size={14} className="text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Görev, etiket veya kategori ara..."
                className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder:text-text-secondary/40 font-semibold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-text-secondary hover:text-text-primary">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Status Select */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-black/20 border border-white/5 outline-none rounded-xl px-3 py-2 text-xs text-text-secondary font-bold h-10"
              >
                <option value="all" className="bg-neutral-900">Tüm Durumlar</option>
                <option value="active" className="bg-neutral-900">Devam Edenler</option>
                <option value="completed" className="bg-neutral-900">Tamamlananlar</option>
              </select>

              {/* Priority Select */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="bg-black/20 border border-white/5 outline-none rounded-xl px-3 py-2 text-xs text-text-secondary font-bold h-10"
              >
                <option value="all" className="bg-neutral-900">Tüm Öncelikler</option>
                <option value="low" className="bg-neutral-900">Düşük</option>
                <option value="medium" className="bg-neutral-900">Orta</option>
                <option value="high" className="bg-neutral-900">Yüksek</option>
                <option value="critical" className="bg-neutral-900">Kritik</option>
              </select>

              {/* Sort By Toggle */}
              <button
                onClick={() => {
                  if (sortBy === 'dueDate') setSortBy('priority');
                  else if (sortBy === 'priority') setSortBy('createdAt');
                  else setSortBy('dueDate');
                }}
                className="flex items-center gap-1.5 px-3 bg-black/20 border border-white/5 hover:bg-white/[0.04] rounded-xl text-xs text-text-secondary font-bold h-10 transition-all"
                title={`Sıralama: ${sortBy === 'dueDate' ? 'Termin Tarihi' : sortBy === 'priority' ? 'Öncelik' : 'Oluşturma Tarihi'}`}
              >
                <ArrowUpDown size={12} />
                <span className="hidden md:inline">
                  {sortBy === 'dueDate' ? 'Termin' : sortBy === 'priority' ? 'Öncelik' : 'Oluşturma'}
                </span>
              </button>

              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 bg-black/20 border border-white/5 hover:bg-white/[0.04] rounded-xl text-xs text-text-secondary font-bold h-10 flex items-center justify-center transition-all"
              >
                {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
              </button>
            </div>
          </div>

          {/* Bulk Action Controls */}
          {selectedTodoIds.length > 0 && (
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-focus-neon/10 border border-focus-neon/20 px-4 py-2.5 rounded-xl flex items-center justify-between shrink-0"
            >
              <span className="text-xs text-focus-neon font-bold">
                {selectedTodoIds.length} Görev Seçildi
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkComplete}
                  className="px-3 py-1.5 bg-focus-neon text-white hover:bg-focus-neon/80 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  <Check size={11} />
                  Tamamlandı Yap
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-crit-vivid/20 hover:bg-crit-vivid text-crit-vivid hover:text-white border border-crit-vivid/20 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  <Trash2 size={11} />
                  Sil
                </button>
                <button
                  onClick={() => setSelectedTodoIds([])}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-text-secondary text-[11px] font-bold rounded-lg transition-all"
                >
                  Seçimi Temizle
                </button>
              </div>
            </motion.div>
          )}

          {/* MAIN TASKS CONTAINER LIST */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5 pb-8 min-h-0">
            {isLoading ? (
              <div className="h-48 w-full flex items-center justify-center">
                <Loader2 size={24} className="text-focus-neon animate-spin" />
              </div>
            ) : filteredAndSortedTodos.length === 0 ? (
              <div className="h-64 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-secondary mb-4">
                  <CheckSquare size={22} />
                </div>
                <h3 className="font-display font-bold text-sm text-text-primary">Eşleşen Görev Bulunamadı</h3>
                <p className="text-text-secondary text-xs mt-1 max-w-xs">
                  Aramanıza veya filtrelerinize uygun görev bulunmuyor. Yeni bir görev oluşturabilir veya filtreleri temizleyebilirsiniz.
                </p>
                {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterCategory('all');
                    }}
                    className="mt-4 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-text-primary rounded-lg transition-colors border border-white/5"
                  >
                    Filtreleri Sıfırla
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredAndSortedTodos.map((todo) => {
                  const completedSubtasks = todo.subtasks.filter(st => st.completed).length;
                  const totalSubtasks = todo.subtasks.length;
                  const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                  const selected = selectedTodoIds.includes(todo.id);
                  const active = activeTodo?.id === todo.id;

                  return (
                    <motion.div
                      key={todo.id}
                      layoutId={`todo-card-${todo.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`group border rounded-2xl p-4 transition-all duration-300 relative bg-white/[0.02] hover:bg-white/[0.04] ${
                        active 
                          ? 'border-focus-neon/40 shadow-lg shadow-focus-neon/5 bg-white/[0.05]' 
                          : selected 
                            ? 'border-focus-neon/20 bg-focus-neon/[0.02]' 
                            : 'border-white/5'
                      }`}
                    >
                      {/* Left border indicator of priority */}
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                        todo.priority === 'critical' ? 'bg-crit-vivid' :
                        todo.priority === 'high' ? 'bg-nrg-gold' :
                        todo.priority === 'medium' ? 'bg-focus-neon' : 'bg-skel-metal'
                      }`} />

                      <div className="flex items-start gap-3 pl-2.5">
                        {/* Custom Checkbox for Bulk Actions */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelectTodo(todo.id)}
                          className={`size-4.5 rounded border flex items-center justify-center shrink-0 transition-all mt-1 opacity-20 group-hover:opacity-100 ${
                            selected 
                              ? 'bg-focus-neon border-focus-neon text-white opacity-100' 
                              : 'border-white/30 hover:border-white'
                          }`}
                        >
                          {selected && <Check size={11} className="stroke-[3]" />}
                        </button>

                        {/* Completed Status Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleCompleted(todo)}
                          className={`size-5 rounded-full border flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                            todo.completed 
                              ? 'bg-grow-phosphor/20 border-grow-phosphor text-grow-phosphor shadow-[0_0_10px_rgba(46,213,115,0.2)]' 
                              : 'border-white/20 text-white/10 hover:border-white/50 hover:text-white/40'
                          }`}
                        >
                          {todo.completed ? (
                            <CheckCircle2 size={15} className="stroke-[2.5]" />
                          ) : (
                            <Circle size={15} />
                          )}
                        </button>

                        {/* Task Text Details */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer select-none"
                          onClick={() => setActiveTodo(todo)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-display font-bold leading-snug transition-colors ${
                              todo.completed ? 'text-text-secondary/50 line-through' : 'text-text-primary group-hover:text-focus-neon'
                            }`}>
                              {todo.title}
                            </h4>

                            {/* Category Badge */}
                            <span className="text-[9px] font-mono bg-white/5 border border-white/5 text-text-secondary px-1.5 py-0.5 rounded uppercase">
                              {todo.category}
                            </span>

                            {/* Overdue alert */}
                            {isOverdue(todo) && (
                              <span className="text-[9px] font-mono bg-crit-vivid/10 border border-crit-vivid/20 text-crit-vivid px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Gecikti
                              </span>
                            )}
                          </div>

                          <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                            todo.completed ? 'text-text-secondary/30' : 'text-text-secondary'
                          }`}>
                            {todo.description || 'Açıklama girilmemiş.'}
                          </p>

                          {/* Nested Checklist progress bar */}
                          {totalSubtasks > 0 && (
                            <div className="mt-3 flex items-center gap-2 max-w-xs">
                              <span className="text-[10px] font-mono text-text-secondary shrink-0">
                                Alt Görevler ({completedSubtasks}/{totalSubtasks})
                              </span>
                              <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-grow-phosphor" 
                                  style={{ width: `${subtaskPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer Details: Date, Tags, Pomodoro stats */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-2.5 border-t border-white/5">
                            {/* Due Date */}
                            {todo.dueDate && (
                              <div className={`flex items-center gap-1 text-[10px] font-mono ${isOverdue(todo) ? 'text-crit-vivid font-bold' : 'text-text-secondary'}`}>
                                <Calendar size={11} />
                                <span>{todo.dueDate}</span>
                              </div>
                            )}

                            {/* Pomodoros completed counter */}
                            <div className="flex items-center gap-1 text-[10px] font-mono text-text-secondary">
                              <Flame size={11} className={todo.completedPomodoros > 0 ? 'text-grow-phosphor' : ''} />
                              <span>{todo.completedPomodoros}/{todo.pomodoroSessions} Odak</span>
                            </div>

                            {/* Tags list */}
                            {todo.tags && todo.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {todo.tags.map((tag, i) => (
                                  <span key={i} className="text-[9px] font-semibold text-text-secondary/70 bg-white/[0.02] border border-white/5 px-1.5 py-0.2 rounded-md">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick action triggers */}
                        <div className="flex items-center gap-1.5 self-center">
                          <button
                            onClick={() => setActiveTodo(todo)}
                            className={`p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors ${
                              active ? 'bg-white/5 text-focus-neon' : ''
                            }`}
                            title="Görev Detayları & Odaklanma"
                          >
                            <ChevronRight size={15} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="p-1.5 rounded-lg hover:bg-crit-vivid/10 text-text-secondary hover:text-crit-vivid opacity-0 group-hover:opacity-100 transition-all duration-300"
                            title="Görevi Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Active Task Detail & Pomodoro workspace */}
        <div className="xl:col-span-4 flex flex-col gap-4 overflow-hidden min-h-0">
          
          <AnimatePresence mode="wait">
            {activeTodo ? (
              <motion.div
                key={activeTodo.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="bg-neutral-900/40 border border-white/10 rounded-[1.5rem] p-5 flex flex-col h-full overflow-hidden backdrop-blur-md"
              >
                {/* Header detail */}
                <div className="flex items-start justify-between border-b border-white/5 pb-3 shrink-0">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[9px] font-mono text-focus-neon bg-focus-neon/10 border border-focus-neon/20 px-2 py-0.5 rounded-full uppercase">
                      {activeTodo.category}
                    </span>
                    <h3 className="font-display font-black text-base text-text-primary mt-2 truncate">
                      {activeTodo.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      if (isTimerRunning) handleStopTimer();
                      setActiveTodo(null);
                    }} 
                    className="text-text-secondary hover:text-text-primary p-1 bg-white/5 rounded-lg transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-4 space-y-5 min-h-0">
                  
                  {/* SECTION 1: INTEGRATED POMODORO TIMER (ODAK MODU) */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-center space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-grow-phosphor uppercase font-bold flex items-center gap-1">
                        <Timer size={12} className={isTimerRunning ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
                        Odaklanma Zamanlayıcısı
                      </span>
                      
                      {/* Timer modes switcher */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSetTimerMode('work')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            timerMode === 'work' ? 'bg-focus-neon text-white' : 'bg-white/5 text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Çalışma
                        </button>
                        <button
                          onClick={() => handleSetTimerMode('shortBreak')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            timerMode === 'shortBreak' ? 'bg-grow-phosphor text-black' : 'bg-white/5 text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Mola (5dk)
                        </button>
                      </div>
                    </div>

                    {/* Clock UI circle representation */}
                    <div className="relative py-4 flex flex-col items-center justify-center">
                      
                      {/* Pulsing glow under countdown */}
                      <AnimatePresence>
                        {isTimerRunning && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0.2 }}
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className={`absolute size-32 rounded-full blur-2xl pointer-events-none ${
                              timerMode === 'work' ? 'bg-focus-neon/15' : 'bg-grow-phosphor/15'
                            }`}
                          />
                        )}
                      </AnimatePresence>

                      <div className="text-4xl font-mono font-black tracking-widest text-text-primary select-none tabular-nums">
                        {formatTimerTime(timerSeconds)}
                      </div>

                      {/* Progress estimation */}
                      <div className="text-[10px] font-mono text-text-secondary/50 mt-1 uppercase tracking-widest">
                        {timerMode === 'work' ? 'Odaklanma Seansı' : 'Dinlenme Arası'}
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-2.5">
                      {isTimerRunning ? (
                        <button
                          onClick={handleStopTimer}
                          className="px-4 py-2 bg-crit-vivid/20 hover:bg-crit-vivid text-crit-vivid hover:text-white border border-crit-vivid/25 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Pause size={13} />
                          Durdur
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsTimerRunning(true)}
                          className="px-5 py-2 bg-grow-phosphor text-black hover:bg-grow-phosphor/90 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-grow-phosphor/10"
                        >
                          <Play size={13} className="fill-black" />
                          Başlat
                        </button>
                      )}

                      <button
                        onClick={() => handleSetTimerMode(timerMode)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-xl transition-colors border border-white/5"
                        title="Zamanlayıcıyı Sıfırla"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>

                    {/* Total stats */}
                    <div className="flex items-center justify-around text-center pt-2.5 border-t border-white/5 font-mono text-[10px] text-text-secondary">
                      <div>
                        <span className="block font-black text-text-primary">{activeTodo.completedPomodoros} / {activeTodo.pomodoroSessions}</span>
                        <span>Seans Hedefi</span>
                      </div>
                      <div className="border-l border-white/5 h-6" />
                      <div>
                        <span className="block font-black text-text-primary">{Math.round(activeTodo.elapsedTime / 60)} dk</span>
                        <span>Odaklanılan Süre</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: SUBTASKS (ALT GÖREVLER) CHECKLIST */}
                  <div className="space-y-3 bg-black/10 border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-text-secondary uppercase font-bold flex items-center gap-1">
                      <CheckSquare size={12} />
                      Alt Görevler ve Kontrol Listesi
                    </span>

                    {/* Subtask input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                        placeholder="Yeni alt görev tanımla..."
                        className="flex-1 bg-black/20 border border-white/5 focus:border-focus-neon/30 outline-none rounded-lg px-2.5 py-1.5 text-xs text-text-primary transition-colors"
                      />
                      <button
                        onClick={handleAddSubtask}
                        className="px-3 bg-focus-neon/10 hover:bg-focus-neon/20 text-focus-neon border border-focus-neon/20 rounded-lg text-xs font-bold transition-all"
                      >
                        Ekle
                      </button>
                    </div>

                    {/* Subtasks listing */}
                    {activeTodo.subtasks.length === 0 ? (
                      <p className="text-[11px] text-text-secondary/50 text-center py-2 italic">
                        Henüz alt görev oluşturulmamış.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {activeTodo.subtasks.map((st) => (
                          <div 
                            key={st.id} 
                            className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5 group/st"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleSubtask(st.id)}
                                className={`size-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                  st.completed 
                                    ? 'bg-grow-phosphor/20 border-grow-phosphor text-grow-phosphor' 
                                    : 'border-white/20 hover:border-white/40'
                                }`}
                              >
                                {st.completed && <Check size={10} className="stroke-[3]" />}
                              </button>
                              <span className={`text-[11px] truncate ${
                                st.completed ? 'text-text-secondary/40 line-through' : 'text-text-primary/90'
                              }`}>
                                {st.title}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteSubtask(st.id)}
                              className="text-text-secondary hover:text-crit-vivid p-1 opacity-0 group-hover/st:opacity-100 transition-opacity"
                              title="Sil"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 3: NOTES & RICH THOUGHTS SECTION */}
                  <div className="space-y-3 bg-black/10 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-text-secondary uppercase font-bold flex items-center gap-1">
                        <Notebook size={12} />
                        Detaylı Görev Notları
                      </span>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes || activeTodo.notes === editedNotes}
                        className="px-2 py-1 bg-focus-neon/10 hover:bg-focus-neon border border-focus-neon/20 hover:text-white disabled:opacity-30 text-[9px] font-black uppercase rounded-md transition-all"
                      >
                        {isSavingNotes ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>

                    <textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Görevin amaçlarını, referanslarını veya adımlarını buraya not edebilirsiniz..."
                      rows={4}
                      className="w-full bg-black/20 border border-white/5 focus:border-focus-neon/30 outline-none rounded-xl p-3 text-xs text-text-primary leading-relaxed resize-none transition-colors"
                    />
                  </div>

                  {/* SECTION 4: HISTORIC TIMELINE ACTIVITY LOG */}
                  <div className="space-y-3 bg-black/10 border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-text-secondary uppercase font-bold flex items-center gap-1 border-b border-white/5 pb-2">
                      <History size={12} />
                      Görev İşlem Geçmişi (Logs)
                    </span>

                    <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar font-mono text-[10px] text-text-secondary/60">
                      {[...activeTodo.history].reverse().map((log, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <span className="text-focus-neon shrink-0">»</span>
                          <div className="min-w-0">
                            <p className="text-text-primary/70 leading-relaxed break-words">{log.action}</p>
                            <span className="text-[8px] text-text-secondary/40 block mt-0.5">
                              {new Date(log.timestamp).toLocaleTimeString()} - {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              /* EMPTY DETAILS WORKSPACE */
              <motion.div
                key="empty-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full bento-card p-6 flex flex-col items-center justify-center text-center bg-white/[0.01]"
              >
                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-secondary mb-4 animate-bounce" style={{ animationDuration: '4s' }}>
                  <Timer size={22} className="text-focus-neon" />
                </div>
                <h4 className="font-display font-bold text-sm text-text-primary">Odak Modu & Görev Detayları</h4>
                <p className="text-text-secondary text-xs mt-2 max-w-xs leading-relaxed">
                  İşlemleri yönetmek, alt görevleri düzenlemek ve Pomodoro zamanlayıcı ile çalışmak için sol listeden bir görev seçin.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
