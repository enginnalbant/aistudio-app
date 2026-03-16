import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, FileText, Bell, TrendingUp, Clock, AlertCircle, ChevronRight, CheckCircle2, ArrowRight, Check, Sparkles, Zap, Target, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PlannerDashboard = ({ setActiveModule }: { setActiveModule: (m: string) => void }) => {
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, today: 0, overdue: 0, pending: 0 },
    notes: { total: 0, today: 0 },
    reminders: { total: 0, upcoming: 0 },
    dailyProgress: 0,
    weeklyProgress: 0
  });
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [todayReminders, setTodayReminders] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [smartSummary, setSmartSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [tasks, notes, events, planner] = await Promise.all([
        fetch('/api/tasks').then(res => res.ok ? res.json() : []).catch(() => []),
        fetch('/api/notes').then(res => res.ok ? res.json() : []).catch(() => []),
        fetch('/api/events').then(res => res.ok ? res.json() : []).catch(() => []),
        fetch(`/api/planner/${today}`).then(res => res.ok ? res.json() : []).catch(() => [])
      ]);

      console.log('fetchStats data:', { tasks, notes, events, planner });
      
      const safeTasks = Array.isArray(tasks) ? tasks : [];
      const safeNotes = Array.isArray(notes) ? notes : [];
      const safeEvents = Array.isArray(events) ? events : [];
      const safePlanner = Array.isArray(planner) ? planner : [];

      const reminders = safeEvents.filter((e: any) => e.type === 'reminder');
      
      let dailyProgress = 0;
      if (safePlanner.length > 0) {
        const completed = safePlanner.reduce((acc: number, curr: any) => acc + (curr.morning_status ? 1 : 0) + (curr.evening_status ? 1 : 0), 0);
        dailyProgress = Math.round((completed / (safePlanner.length * 2)) * 100);
      }

      const pendingTasks = safeTasks.filter((t: any) => t.status !== 'completed');
      const overdueTasks = safeTasks.filter((t: any) => t.due_date < today && t.status !== 'completed');

      setStats({
        tasks: {
          total: safeTasks.length,
          completed: safeTasks.filter((t: any) => t.status === 'completed').length,
          today: safeTasks.filter((t: any) => t.due_date === today).length,
          overdue: overdueTasks.length,
          pending: pendingTasks.length
        },
        notes: {
          total: safeNotes.length,
          today: safeNotes.filter((n: any) => n.target_date === today).length
        },
        reminders: {
          total: reminders.length,
          upcoming: reminders.filter((r: any) => r.date >= new Date().toISOString()).length
        },
        dailyProgress,
        weeklyProgress: 45 // Mock for now
      });

      setTodayTasks(safeTasks.filter((t: any) => t.due_date === today).slice(0, 5));
      setTodayReminders(reminders.filter((r: any) => r.date.startsWith(today)).slice(0, 5));
      setUpcomingEvents(safeEvents.filter((e: any) => e.date >= today).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(0, 5));

      // Generate a smart summary based on data
      generateSummary(safeTasks, reminders, safePlanner, overdueTasks.length);
    } catch (error) {
      console.error('Error fetching planner stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = (tasks: any[], reminders: any[], planner: any[], overdueCount: number) => {
    const todayTasks = tasks.filter(t => t.due_date === today && t.status !== 'completed');
    const todayReminders = reminders.filter(r => r.date.startsWith(today));
    
    let summary = "";
    if (overdueCount > 0) {
      summary += `Dikkat! Tamamlanmamış ${overdueCount} gecikmiş göreviniz bulunuyor. `;
    }
    
    if (todayTasks.length > 0) {
      summary += `Bugün odaklanmanız gereken ${todayTasks.length} ana görev var. `;
    } else {
      summary += "Bugün için bekleyen acil bir göreviniz görünmüyor. ";
    }
    
    if (todayReminders.length > 0) {
      summary += `Ayrıca gün içinde ${todayReminders.length} hatırlatıcınız mevcut. `;
    }
    
    if (planner.length > 0) {
      const completed = planner.filter(p => p.morning_status && p.evening_status).length;
      summary += `Günlük planınızdaki ${planner.length} maddeden ${completed} tanesini tamamen bitirdiniz.`;
    }

    setSmartSummary(summary || "Bugün için planlanmış bir aktivite bulunmuyor. Yeni bir hedef belirlemeye ne dersiniz?");
  };

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-text-primary tracking-tight flex items-center gap-3">
            Planlayıcı <span className="text-accent">Merkezi</span>
          </h1>
          <p className="text-text-secondary mt-2 text-lg">Zamanınızı akıllıca yönetin, verimliliğinizi artırın.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-bg-card p-4 rounded-3xl border border-border shadow-xl backdrop-blur-md"
        >
          <div className="p-3 bg-accent/10 rounded-2xl text-accent">
            <CalendarDays size={24} />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Bugün</p>
            <p className="text-xl font-black text-text-primary">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </motion.div>
      </div>

      {/* Smart Summary Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="layer-3d p-8 bg-gradient-to-r from-accent/10 via-bg-card to-ai-bright/10 border-accent/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={120} className="text-accent" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center text-white shadow-2xl shadow-accent/40 flex-shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Zap size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-text-primary mb-2 flex items-center justify-center md:justify-start gap-2">
              Günün Akıllı Özeti <Sparkles size={20} className="text-accent animate-pulse" />
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              {isLoading ? "Veriler analiz ediliyor..." : smartSummary}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-accent">{stats.tasks.pending}</div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-tighter">Bekleyen</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-rose-500">{stats.tasks.overdue}</div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-tighter">Geciken</div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Günlük Plan', 
            val: `${stats.dailyProgress}%`, 
            sub: 'Bugünkü İlerleme', 
            icon: Calendar, 
            color: 'accent', 
            module: 'planner-daily',
            progress: stats.dailyProgress
          },
          { 
            label: 'Görevler', 
            val: stats.tasks.today, 
            sub: 'Bugünkü Görevler', 
            icon: CheckSquare, 
            color: 'emerald-500', 
            module: 'planner-tasks',
            extra: `Toplam: ${stats.tasks.total}`
          },
          { 
            label: 'Notlar', 
            val: stats.notes.today, 
            sub: 'Bugünkü Notlar', 
            icon: FileText, 
            color: 'ai-bright', 
            module: 'planner-notes',
            extra: `Toplam: ${stats.notes.total}`
          },
          { 
            label: 'Hatırlatıcılar', 
            val: stats.reminders.upcoming, 
            sub: 'Yaklaşanlar', 
            icon: Bell, 
            color: 'amber-500', 
            module: 'planner-reminders',
            extra: `Toplam: ${stats.reminders.total}`
          }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`layer-3d p-6 flex flex-col gap-4 cursor-pointer group relative overflow-hidden border-t-4 border-t-${item.color}`}
            onClick={() => setActiveModule(item.module)}
          >
            <div className={`absolute -right-6 -top-6 text-${item.color}/5 group-hover:text-${item.color}/10 transition-colors`}>
              <item.icon size={120} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-3 bg-${item.color}/10 rounded-2xl text-${item.color}`}>
                <item.icon size={28} />
              </div>
              <span className="text-3xl font-black text-text-primary">{item.val}</span>
            </div>
            <div className="relative z-10 mt-2">
              <h2 className="font-bold text-lg text-text-primary">{item.label}</h2>
              <p className="text-sm text-text-secondary">{item.sub}</p>
            </div>
            {item.progress !== undefined ? (
              <div className="w-full bg-bg-app h-2 rounded-full mt-2 relative z-10 overflow-hidden">
                <div className={`bg-${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }} />
              </div>
            ) : (
              <div className="text-xs font-medium px-2 py-1 bg-bg-app rounded-md text-text-secondary w-fit relative z-10">
                {item.extra}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tasks & Reminders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Tasks */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="layer-3d p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/10">
                  <CheckSquare size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-primary">Bugünün Görevleri</h3>
                  <p className="text-sm text-text-secondary">Öncelikli işlerinizi takip edin</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModule('planner-tasks')}
                className="p-2 hover:bg-bg-app rounded-xl text-text-secondary hover:text-emerald-500 transition-all group"
              >
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-4">
              {todayTasks.length > 0 ? (
                todayTasks.map((task, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={task.id || idx} 
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${task.status === 'completed' ? 'bg-bg-app/50 border-transparent opacity-60' : 'bg-bg-card border-border hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border group-hover:border-emerald-500'}`}>
                        {task.status === 'completed' && <Check size={14} />}
                      </div>
                      <span className={`font-bold text-lg ${task.status === 'completed' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black px-3 py-1 rounded-full border uppercase tracking-tighter ${
                        task.priority === 'high' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 
                        task.priority === 'medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 
                        'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                      }`}>
                        {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-text-secondary bg-bg-app/30 rounded-3xl border-2 border-dashed border-border">
                  <CheckSquare size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-bold">Bugün için görev bulunmuyor.</p>
                  <p className="text-sm opacity-60">Yeni bir görev ekleyerek güne başlayın.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Events / Calendar Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="layer-3d p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shadow-lg shadow-amber-500/10">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-primary">Yaklaşan Etkinlikler</h3>
                  <p className="text-sm text-text-secondary">Takviminizdeki önemli tarihler</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModule('planner-reminders')}
                className="p-2 hover:bg-bg-app rounded-xl text-text-secondary hover:text-amber-500 transition-all group"
              >
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={event.id || idx} 
                    className="p-5 bg-bg-card border border-border rounded-2xl hover:border-amber-500/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Calendar size={64} />
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-bg-app rounded-xl text-text-secondary font-mono text-xs font-bold">
                        {new Date(event.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                      </div>
                      <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                        {event.time || 'Tüm Gün'}
                      </div>
                    </div>
                    <h4 className="font-bold text-text-primary text-lg mb-1 truncate">{event.title}</h4>
                    <p className="text-xs text-text-secondary line-clamp-1">{event.location || 'Konum belirtilmedi'}</p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-text-secondary bg-bg-app/30 rounded-3xl border-2 border-dashed border-border">
                  <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-bold">Yakın zamanda etkinlik yok.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Alerts & Quick Actions */}
        <div className="space-y-8">
          {/* Status Tracker */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="layer-3d p-8 flex flex-col"
          >
            <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2">
              <Target size={20} className="text-accent" />
              Durum Takibi
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-text-secondary">Haftalık Hedef</span>
                  <span className="text-accent">{stats.weeklyProgress}%</span>
                </div>
                <div className="w-full bg-bg-app h-3 rounded-full overflow-hidden border border-border/50">
                  <div className="bg-accent h-full rounded-full" style={{ width: `${stats.weeklyProgress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-app rounded-2xl border border-border">
                  <div className="text-2xl font-black text-emerald-500">{stats.tasks.completed}</div>
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Tamamlanan</div>
                </div>
                <div className="p-4 bg-bg-app rounded-2xl border border-border">
                  <div className="text-2xl font-black text-amber-500">{stats.tasks.pending}</div>
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Bekleyen</div>
                </div>
              </div>

              <div 
                onClick={() => setActiveModule('planner-tasks')}
                className="flex items-center justify-between p-5 bg-rose-500/5 rounded-2xl border border-rose-500/20 hover:bg-rose-500/10 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <span className="font-black text-text-primary block">Gecikenler</span>
                    <span className="text-xs text-text-secondary">Acil aksiyon gerekli</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black text-rose-500">{stats.tasks.overdue}</span>
                  <ChevronRight size={20} className="text-text-secondary group-hover:text-rose-500 transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="layer-3d p-10 bg-gradient-to-br from-accent to-ai-bright text-white border-none relative overflow-hidden group shadow-2xl shadow-accent/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="flex flex-col justify-center items-center text-center space-y-8 relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <Calendar size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-3">Gününüzü Planlayın</h3>
                <p className="text-white/80 text-lg font-medium max-w-xs mx-auto leading-relaxed">
                  Verimliliğinizi zirveye taşıyın. Bugünün hedeflerini şimdi belirleyin.
                </p>
              </div>
              <button 
                onClick={() => setActiveModule('planner-daily')}
                className="w-full py-4 bg-white text-accent rounded-2xl font-black text-lg hover:bg-bg-app transition-all duration-300 shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <Calendar size={20} />
                Planlamaya Başla
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
