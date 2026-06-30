import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  ChevronRight, 
  Target,
  BookmarkCheck,
  CalendarCheck2
} from 'lucide-react';

interface QuickTask {
  id: string;
  text: string;
  completed: boolean;
  time: string;
  priority: 'low' | 'medium' | 'high';
}

export const PlanningDashboard = () => {
  const [tasks, setTasks] = useState<QuickTask[]>([
    { id: '1', text: 'Sabah Rutini & Planlama Gözden Geçirme', completed: true, time: '09:00', priority: 'medium' },
    { id: '2', text: 'Haftalık Finansal Rapor Analizi', completed: false, time: '11:30', priority: 'high' },
    { id: '3', text: 'Kütüphane Kitap Çeviri Kontrolü', completed: false, time: '14:00', priority: 'low' },
    { id: '4', text: 'Manga Çeviri Geliştirmeleri', completed: false, time: '16:30', priority: 'high' },
  ]);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const newTask: QuickTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      priority: newTaskPriority
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Title & Accent Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-focus-neon/15 text-focus-neon rounded-full border border-focus-neon/20 animate-pulse">
              Modül 05
            </span>
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight text-text-primary">
            Planlama Dashboard
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Günlük, haftalık ve aylık rutinlerinizi koordine edin.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl">
          <CalendarDays size={14} className="text-focus-neon" />
          <span className="text-xs font-mono font-bold text-text-primary">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-focus-neon/5 blur-2xl rounded-full transition-opacity duration-500 group-hover:bg-focus-neon/10" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-text-secondary">Günlük Tamamlama</span>
            <span className="p-1.5 rounded-lg bg-focus-neon/10 text-focus-neon">
              <CalendarCheck2 size={14} />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-text-primary">%{progressPercentage}</span>
              <span className="text-xs text-text-secondary font-mono">{completedCount}/{tasks.length} Görev</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
              <motion.div 
                className="h-full bg-gradient-to-r from-focus-main to-focus-neon"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Action Goal Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-focus-main/5 blur-2xl rounded-full transition-opacity duration-500 group-hover:bg-focus-main/10" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-text-secondary">Aktif Hedefler</span>
            <span className="p-1.5 rounded-lg bg-focus-main/10 text-focus-main">
              <Target size={14} />
            </span>
          </div>
          <div>
            <span className="text-3xl font-display font-black text-text-primary">3 Aktif</span>
            <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1">
              <Sparkles size={10} className="text-focus-neon animate-pulse" />
              Bu haftaki odak: Medya & Kütüphane entegrasyonu.
            </p>
          </div>
        </div>

        {/* Productivity Score Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-ai-bright/5 blur-2xl rounded-full transition-opacity duration-500 group-hover:bg-ai-bright/10" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-text-secondary">Haftalık Streak</span>
            <span className="p-1.5 rounded-lg bg-ai-bright/10 text-ai-bright">
              <BookmarkCheck size={14} />
            </span>
          </div>
          <div>
            <span className="text-3xl font-display font-black text-text-primary">5 Gün</span>
            <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1">
              <Clock size={10} className="text-ai-bright" />
              Kişisel planlama ritminiz %92 optimize edildi.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Quick Task List (3 cols) */}
        <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <CheckCircle2 size={16} className="text-focus-neon" />
                Bugünün Öncelikli Görevleri
              </h2>
              <span className="text-[10px] font-mono text-text-secondary bg-white/5 px-2 py-0.5 rounded-md">
                Hızlı Ekleme
              </span>
            </div>

            {/* Quick Task Creation Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input 
                type="text"
                placeholder="Yeni bir görev ekle..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-focus-neon/50 placeholder:text-text-secondary/40"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-white/[0.03] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-focus-neon/50"
              >
                <option value="low" className="bg-neutral-900">Düşük</option>
                <option value="medium" className="bg-neutral-900">Orta</option>
                <option value="high" className="bg-neutral-900">Yüksek</option>
              </select>
              <button 
                type="submit"
                className="bg-focus-neon hover:bg-focus-neon/80 text-pure-black font-bold p-2 rounded-xl transition-all duration-300 active:scale-95"
              >
                <Plus size={16} />
              </button>
            </form>

            {/* Task Item List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {tasks.map(task => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                      task.completed 
                        ? 'bg-white/[0.01] border-white/5 opacity-50' 
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-focus-neon border-focus-neon' : 'border-white/30'
                      }`}>
                        {task.completed && <CheckCircle2 size={12} className="text-pure-black" />}
                      </div>
                      <span className={`text-xs text-text-primary truncate transition-all ${task.completed ? 'line-through text-text-secondary' : ''}`}>
                        {task.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-text-secondary font-mono flex items-center gap-1">
                        <Clock size={10} />
                        {task.time}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        task.priority === 'high' 
                          ? 'bg-crit-blood/10 text-crit-vivid border border-crit-blood/20' 
                          : task.priority === 'medium'
                          ? 'bg-focus-main/10 text-focus-main border border-focus-main/20'
                          : 'bg-white/5 text-text-secondary'
                      }`}>
                        {task.priority === 'high' ? 'Önemli' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Recommended Schedule Assistant (2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-focus-neon/5 blur-2xl rounded-full" />
          
          <div className="relative z-10">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-ai-bright" />
              Günün Akıllı Tavsiyesi
            </h2>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 mb-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                Bugün öğleden sonra yoğunluğunuz az görünüyor. <strong className="text-text-primary">"Kütüphane Kitap Çeviri Kontrolü"</strong> görevini saat <strong className="text-focus-neon">14:00</strong> yerine <strong className="text-ai-bright">13:30</strong> saatine çekmek odaklanma sürenizi artıracaktır.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <AlertCircle size={12} className="text-focus-main shrink-0" />
                <span>Borç/Abonelik ödeme gününe 2 gün kaldı.</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <AlertCircle size={12} className="text-ai-bright shrink-0" />
                <span>Son 3 gündür hedeflerinizi kesintisiz tamamladınız!</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl py-2 px-3 text-xs text-text-primary font-bold transition-all duration-300 flex items-center justify-between group">
            <span>Haftalık Planlayıcıya Git</span>
            <ChevronRight size={14} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
