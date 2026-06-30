import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  Activity,
  Calendar
} from 'lucide-react';

interface PlanItem {
  id: string;
  title: string;
  time: string;
  day: 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar';
  dateStr: string; // e.g., '2026-06-29'
  category: 'work' | 'personal' | 'finance' | 'learning' | 'health';
}

export const PlanningScheduler = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDay, setSelectedDay] = useState<'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar'>('Pazartesi');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Plan State
  const [plans, setPlans] = useState<PlanItem[]>([
    { id: '1', title: 'Finansal Analiz & Yatırım Değerlendirme', time: '10:00', day: 'Pazartesi', dateStr: '2026-06-29', category: 'finance' },
    { id: '2', title: 'Bireysel Çalışma & E-Kitap Okuma', time: '14:30', day: 'Pazartesi', dateStr: '2026-06-29', category: 'learning' },
    { id: '3', title: 'Haftalık Planlayıcı Düzenleme', time: '09:00', day: 'Salı', dateStr: '2026-06-30', category: 'personal' },
    { id: '4', title: 'Manga Çeviri Gözden Geçirme Toplantısı', time: '16:00', day: 'Salı', dateStr: '2026-06-30', category: 'work' },
    { id: '5', title: 'Doğa Yürüyüşü & Sağlık Rutini', time: '08:00', day: 'Çarşamba', dateStr: '2026-07-01', category: 'health' },
    { id: '6', title: 'Haber Bültenleri (RSS Reader) İnceleme', time: '19:00', day: 'Çarşamba', dateStr: '2026-07-01', category: 'learning' },
  ]);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('12:00');
  const [newDay, setNewDay] = useState<'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar'>('Pazartesi');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'finance' | 'learning' | 'health'>('work');

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: PlanItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      time: newTime,
      day: newDay,
      dateStr: '2026-06-29', // Simplification for mock representation
      category: newCategory
    };

    setPlans([...plans, newItem]);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'work': return 'bg-focus-main/10 text-focus-main border-focus-main/20';
      case 'personal': return 'bg-focus-neon/10 text-focus-neon border-focus-neon/20';
      case 'finance': return 'bg-ai-bright/10 text-ai-bright border-ai-bright/20';
      case 'learning': return 'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20';
      case 'health': return 'bg-crit-blood/10 text-crit-vivid border-crit-blood/20';
      default: return 'bg-white/5 text-text-secondary';
    }
  };

  const daysOfWeek: Array<'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar'> = [
    'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-text-primary flex items-center gap-2">
            <Calendar size={22} className="text-focus-neon" />
            Planlama Takvimi
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Özelleştirilmiş periyotlar ile hedeflerinizi organize edin.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/[0.03] border border-white/10 p-0.5 rounded-xl shrink-0">
          {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-focus-neon text-pure-black shadow-lg shadow-focus-neon/10' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'daily' ? 'Günlük' : tab === 'weekly' ? 'Haftalık' : 'Aylık'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 min-h-[420px] relative">
        
        {/* Active view: DAILY */}
        {activeTab === 'daily' && (
          <div className="space-y-4">
            {/* Day Selector Ribbon */}
            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                    selectedDay === day
                      ? 'bg-focus-main text-pure-white border-focus-main'
                      : 'bg-white/[0.02] border-white/5 text-text-secondary hover:bg-white/[0.05]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Daily Timetable */}
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-text-secondary">Saat Dilimleri ({selectedDay})</span>
                <button 
                  onClick={() => { setNewDay(selectedDay); setShowAddModal(true); }}
                  className="flex items-center gap-1.5 text-xs text-focus-neon bg-focus-neon/15 hover:bg-focus-neon/25 border border-focus-neon/20 rounded-lg px-2.5 py-1 transition-all"
                >
                  <PlusCircle size={12} />
                  Yeni Plan Ekle
                </button>
              </div>

              {/* Chronological list */}
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-1">
                {plans.filter(p => p.day === selectedDay).length === 0 ? (
                  <div className="py-12 text-center text-text-secondary text-xs">
                    Bu gün için henüz bir plan eklenmedi. Yeni bir plan oluşturabilirsiniz.
                  </div>
                ) : (
                  plans
                    .filter(p => p.day === selectedDay)
                    .sort((a,b) => a.time.localeCompare(b.time))
                    .map(plan => (
                      <div key={plan.id} className="py-3 flex items-start gap-4 hover:bg-white/[0.01] px-2 rounded-xl transition-all">
                        <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono font-bold text-focus-neon min-w-[50px]">
                          <Clock size={12} />
                          {plan.time}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-text-primary font-bold truncate">{plan.title}</p>
                          <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${getCategoryColor(plan.category)}`}>
                            {plan.category}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-text-secondary hover:text-crit-vivid p-1 rounded-md hover:bg-white/5 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active view: WEEKLY */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-text-secondary">Haftalık Kanban Görünümü</span>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 text-xs text-focus-neon bg-focus-neon/15 hover:bg-focus-neon/25 border border-focus-neon/20 rounded-lg px-2.5 py-1 transition-all"
              >
                <PlusCircle size={12} />
                Yeni Plan Ekle
              </button>
            </div>

            {/* Weekly Columns */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-x-auto pb-2">
              {daysOfWeek.map(day => {
                const dayPlans = plans.filter(p => p.day === day);
                return (
                  <div key={day} className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 flex flex-col min-w-[140px]">
                    <span className="text-xs font-black text-text-primary pb-2 border-b border-white/5 block mb-2">{day}</span>
                    <div className="space-y-2 flex-1">
                      {dayPlans.map(plan => (
                        <div key={plan.id} className="p-2 bg-white/[0.03] border border-white/10 rounded-lg relative group">
                          <p className="text-[10px] text-text-primary font-bold line-clamp-2">{plan.title}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] font-mono text-text-secondary">{plan.time}</span>
                            <span className={`text-[7px] px-1 rounded uppercase font-bold border ${getCategoryColor(plan.category)}`}>
                              {plan.category[0]}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeletePlan(plan.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-crit-vivid p-0.5 rounded transition-opacity"
                          >
                            <Trash2 size={8} />
                          </button>
                        </div>
                      ))}
                      {dayPlans.length === 0 && (
                        <div className="py-8 text-center text-[10px] text-text-secondary/50">
                          Plan Yok
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active view: MONTHLY */}
        {activeTab === 'monthly' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary">Haziran - Temmuz 2026</span>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 text-xs text-focus-neon bg-focus-neon/15 hover:bg-focus-neon/25 border border-focus-neon/20 rounded-lg px-2.5 py-1 transition-all"
              >
                <PlusCircle size={12} />
                Yeni Plan Ekle
              </button>
            </div>

            {/* Monthly Grid Mock Calendar */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Day headers */}
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-text-secondary py-1 bg-white/[0.02] rounded">
                  {d}
                </div>
              ))}
              
              {/* Month calendar cells (starting with mock offset 29th June) */}
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i + 22; // Quick sequence starting at June 22
                const isCurrentMonth = dayNum <= 30;
                const displayNum = isCurrentMonth ? dayNum : dayNum - 30;
                
                // Mock link to plans
                const hasPlan = i === 7 || i === 8 || i === 9; // matches 29, 30 June, 1 July

                return (
                  <div 
                    key={i} 
                    className={`aspect-square p-1.5 bg-white/[0.01] border rounded-lg flex flex-col justify-between group ${
                      hasPlan ? 'border-focus-neon/40 bg-focus-neon/5' : 'border-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold ${isCurrentMonth ? 'text-text-primary' : 'text-text-secondary/30'}`}>
                        {displayNum}
                      </span>
                      {hasPlan && (
                        <span className="w-1.5 h-1.5 rounded-full bg-focus-neon animate-pulse" />
                      )}
                    </div>
                    {hasPlan && (
                      <span className="text-[7px] text-text-secondary font-semibold truncate block">
                        Planlı Etkinlik
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Add Plan Modal / Overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-pure-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-sm font-black text-text-primary flex items-center gap-2">
                <Sparkles size={16} className="text-focus-neon" />
                Yeni Plan Programı Ekle
              </h2>

              <form onSubmit={handleAddPlan} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Aktivite Başlığı</label>
                  <input 
                    type="text"
                    required
                    placeholder="Örn: Finansal Rapor Gözden Geçirme"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-focus-neon/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Saat</label>
                    <input 
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-focus-neon/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Gün</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value as any)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-focus-neon/50"
                    >
                      {daysOfWeek.map(d => (
                        <option key={d} value={d} className="bg-neutral-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-focus-neon/50"
                  >
                    <option value="work" className="bg-neutral-900">İş (Work)</option>
                    <option value="personal" className="bg-neutral-900">Kişisel (Personal)</option>
                    <option value="finance" className="bg-neutral-900">Finans (Finance)</option>
                    <option value="learning" className="bg-neutral-900">Öğrenme (Learning)</option>
                    <option value="health" className="bg-neutral-900">Sağlık (Health)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl py-2 text-xs font-bold transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-focus-neon hover:bg-focus-neon/80 text-pure-black rounded-xl py-2 text-xs font-bold transition-all"
                  >
                    Planla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
