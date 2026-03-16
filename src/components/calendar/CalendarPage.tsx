import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Users,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Search,
  ArrowRight,
  Info,
  X,
  ExternalLink,
  Sparkles,
  Activity,
  Layers,
  FileText,
  Table
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarWizardModal } from './CalendarWizardModal';
import clsx from 'clsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location?: string;
  attendees?: number;
  type: 'meeting' | 'deadline' | 'reminder' | 'production';
  description?: string;
  detail?: string;
  morning_done?: boolean;
  evening_done?: boolean;
  related_id?: string;
}

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const formattedEvents = data.map((e: any) => ({
        ...e,
        date: new Date(e.date)
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Turkish character support: Standard fonts in jspdf have limited support.
    // However, for basic Turkish characters, helvetica usually works if encoded correctly.
    doc.setFont('helvetica');
    
    doc.setFontSize(18);
    doc.text(`Günlük Görev Raporu - ${format(selectedDate, 'dd MMMM yyyy', { locale: tr })}`, 14, 15);
    
    const eventsToExport = events.filter(e => isSameDay(e.date, selectedDate));
    
    let y = 25;
    eventsToExport.forEach((e, index) => {
      // Draw card background
      doc.setFillColor(245, 245, 245); // Light gray background
      doc.setDrawColor(200, 200, 200); // Light border
      doc.roundedRect(14, y, 268, 30, 3, 3, 'FD');
      
      // Title
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(e.title, 20, y + 10);
      
      // Time
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Zaman: ${e.time}`, 20, y + 18);
      
      // Status
      doc.text(`Sabah: ${e.morning_done ? '[X]' : '[ ]'}`, 100, y + 18);
      doc.text(`Akşam: ${e.evening_done ? '[X]' : '[ ]'}`, 140, y + 18);
      
      // Detail/Description
      doc.setFontSize(9);
      doc.text(`Detay: ${e.detail || '-'}`, 20, y + 25);
      doc.text(`Açıklama: ${e.description || '-'}`, 100, y + 25);
      
      y += 35;
      
      // Add new page if needed
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Gunluk_Gorev_Raporu_${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
  };

  const exportExcel = () => {
    const data = events
      .filter(e => isSameDay(e.date, selectedDate))
      .map(e => ({
        'Görev Başlığı': e.title,
        'Zaman': e.time,
        'Lokasyon': e.location || '-',
        'Tip': e.type === 'meeting' ? 'Toplantı' : e.type === 'deadline' ? 'Termin' : e.type === 'production' ? 'Üretim' : 'Hatırlatıcı',
        'Sabah': e.morning_done ? 'Evet' : 'Hayır',
        'Akşam': e.evening_done ? 'Evet' : 'Hayır',
        'Detay': e.detail || '-',
        'Açıklama': e.description || '-'
      }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Görevler");
    XLSX.writeFile(wb, `Gunluk_Gorev_Raporu_${format(selectedDate, 'yyyy-MM-dd')}.xlsx`);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative mb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-grow-main/10 border border-grow-phosphor/20 text-grow-phosphor label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-grow-phosphor/5">
              <Activity size={12} /> Zaman Çizelgesi Senkronize
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              OPERASYONEL <span className="text-grow-phosphor">TAKVİM</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70 max-w-2xl">
              Üretim planları, terminler ve kritik operasyonların merkezi yönetimi Apex Neural Engine tarafından optimize edilir.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={exportPDF} className="os-btn os-btn-secondary h-[54px]">
            <FileText size={18} /> PDF
          </button>
          <button onClick={exportExcel} className="os-btn os-btn-secondary h-[54px]">
            <Table size={18} /> Excel
          </button>
          <div className="flex p-1.5 rounded-2xl bg-skel-matte/5 border border-skel-metal/10 backdrop-blur-xl">
            <button 
              onClick={() => setView('month')}
              className={clsx(
                "p-3 rounded-xl transition-all duration-500",
                view === 'month' ? "bg-grow-phosphor text-pure-black shadow-[0_8px_20px_rgba(46,213,115,0.3)]" : "text-text-secondary hover:text-text-primary"
              )}
              title="Ay Görünümü"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={clsx(
                "p-3 rounded-xl transition-all duration-500",
                view === 'list' ? "bg-grow-phosphor text-pure-black shadow-[0_8px_20px_rgba(46,213,115,0.3)]" : "text-text-secondary hover:text-text-primary"
              )}
              title="Liste Görünümü"
            >
              <ListIcon size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="os-btn os-btn-primary h-[54px]"
          >
            <Plus size={20} /> <span>Yeni Etkinlik</span>
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return (
      <div className="grid grid-cols-7 mb-4 px-4">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-mono font-bold text-skel-metal uppercase tracking-[0.3em] py-4">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = events.filter(e => isSameDay(e.date, cloneDay));
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <div
            key={day.toString()}
            className={clsx(
              "min-h-[160px] p-5 border border-skel-metal/5 transition-all duration-500 relative group cursor-pointer overflow-hidden",
              !isCurrentMonth ? "bg-skel-matte/5 opacity-20" : "bg-skel-space/20 hover:bg-skel-space/40",
              isSelected ? "ring-2 ring-grow-phosphor ring-inset z-10 shadow-[0_0_30px_rgba(105,240,174,0.1)]" : ""
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            {/* Patina Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-void-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex justify-between items-start relative z-10">
              <span className={clsx(
                "text-lg font-display font-black tracking-tighter transition-all duration-500",
                isToday ? "w-10 h-10 flex items-center justify-center bg-grow-phosphor text-void-black rounded-2xl shadow-[0_0_15px_rgba(105,240,174,0.4)]" : 
                isCurrentMonth ? "text-skel-glass group-hover:text-void-white" : "text-skel-metal"
              )}>
                {format(day, "d")}
              </span>
              {dayEvents.length > 0 && (
                <span className="text-[9px] font-mono font-bold text-grow-phosphor/60 uppercase tracking-widest">{dayEvents.length} VERİ</span>
              )}
            </div>
            <div className="mt-6 space-y-2 relative z-10">
              {dayEvents.slice(0, 3).map(event => (
                <div 
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                  className={clsx(
                    "text-[10px] p-2.5 rounded-xl border truncate font-mono font-bold uppercase tracking-tighter transition-all duration-300 hover:scale-105 active:scale-95",
                    event.type === 'meeting' ? 'bg-focus-main/10 text-focus-neon border-focus-neon/20' :
                    event.type === 'deadline' ? 'bg-crit-blood/10 text-crit-vivid border-crit-blood/20' :
                    event.type === 'production' ? 'bg-grow-main/10 text-grow-phosphor border-grow-phosphor/20' :
                    'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'
                  )}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[9px] text-skel-metal font-mono font-bold text-center py-2 bg-skel-matte/20 rounded-xl border border-skel-metal/5">
                  +{dayEvents.length - 3} KATMAN
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bento-card overflow-hidden border-skel-metal/5">{rows}</div>;
  };

  return (
    <div className="space-y-8 pb-20 h-full overflow-y-auto custom-scrollbar pr-2">
      {renderHeader()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
          <div className="lg:col-span-3 space-y-8">
          <div className="bento-card p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CalendarIcon size={40} className="text-grow-phosphor" />
            </div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-black tracking-tighter text-text-primary">{format(currentMonth, 'MMMM yyyy', { locale: tr })}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2.5 rounded-xl bg-skel-matte/5 border border-skel-metal/10 text-text-secondary hover:text-text-primary transition-all"><ChevronLeft size={18} /></button>
                <button onClick={nextMonth} className="p-2.5 rounded-xl bg-skel-matte/5 border border-skel-metal/10 text-text-secondary hover:text-text-primary transition-all"><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="label-mono tracking-[0.3em]">Günün Özeti</h3>
                <span className="px-3 py-1 rounded-full bg-grow-phosphor/10 text-grow-phosphor font-mono text-[9px] font-bold border border-grow-phosphor/20 uppercase tracking-widest shadow-sm shadow-grow-phosphor/5">
                  {format(selectedDate, 'd MMMM', { locale: tr })}
                </span>
              </div>
              <div className="space-y-4">
                {events.filter(e => isSameDay(e.date, selectedDate)).length > 0 ? (
                  events.filter(e => isSameDay(e.date, selectedDate)).map(event => (
                    <motion.div 
                      key={event.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedEvent(event)}
                      className="p-5 rounded-3xl bg-skel-matte/10 border border-skel-metal/5 group hover:border-grow-phosphor/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={clsx(
                          "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]",
                          event.type === 'meeting' ? 'bg-focus-neon' :
                          event.type === 'deadline' ? 'bg-crit-vivid' :
                          event.type === 'production' ? 'bg-grow-phosphor' :
                          'bg-nrg-sun'
                        )} />
                        <h4 className="text-sm font-display font-bold text-skel-glass group-hover:text-void-white transition-colors truncate">{event.title}</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-skel-metal font-bold uppercase tracking-widest">
                          <Clock size={14} className="text-grow-phosphor" /> {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-3 text-[10px] font-mono text-skel-metal font-bold uppercase tracking-widest">
                            <MapPin size={14} className="text-skel-metal/50" /> {event.location}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-skel-metal/10 rounded-3xl group hover:border-grow-phosphor/20 transition-all">
                    <CalendarIcon size={40} className="mx-auto text-skel-metal/10 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-skel-metal font-medium italic">Bu tarih için kayıtlı veri akışı bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bento-card p-8">
            <h3 className="label-mono mb-8">Kategorizasyon</h3>
            <div className="space-y-3">
              {[
                { label: 'Toplantılar', color: 'bg-focus-neon', count: events.filter(e => e.type === 'meeting').length },
                { label: 'Terminler', color: 'bg-crit-vivid', count: events.filter(e => e.type === 'deadline').length },
                { label: 'Üretim Planı', color: 'bg-grow-phosphor', count: events.filter(e => e.type === 'production').length },
                { label: 'Hatırlatıcılar', color: 'bg-nrg-sun', count: events.filter(e => e.type === 'reminder').length },
              ].map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-skel-matte/5 border border-transparent hover:bg-skel-matte/10 hover:border-skel-metal/10 cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={clsx("w-3 h-3 rounded-full transition-transform duration-500 group-hover:scale-150", cat.color)} />
                    <span className="text-sm text-skel-metal font-bold group-hover:text-skel-glass transition-colors">{cat.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-skel-metal/50">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Calendar Area */}
        <div className="lg:col-span-9">
          {view === 'month' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              {renderDays()}
              {renderCells()}
            </motion.div>
          ) : (
            <div className="space-y-6">
              {events.length > 0 ? (
                events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    onClick={() => setSelectedEvent(event)}
                    className="bento-card p-8 flex items-center justify-between group hover:bg-skel-space/40 cursor-pointer relative overflow-hidden"
                  >
                    {/* Patina Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-void-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="flex items-center gap-12 relative z-10">
                      <div className="text-center min-w-[100px] p-5 rounded-3xl bg-skel-matte/30 border border-skel-metal/10 group-hover:border-grow-phosphor/30 transition-all duration-500">
                        <p className="text-[10px] font-mono font-bold text-skel-metal uppercase tracking-[0.3em] mb-1">{format(event.date, 'MMM', { locale: tr })}</p>
                        <p className="text-4xl font-display font-black text-skel-glass group-hover:text-grow-phosphor transition-colors tracking-tighter">{format(event.date, 'dd')}</p>
                      </div>
                      <div className="w-px h-16 bg-skel-metal/10" />
                      <div>
                        <h4 className="text-2xl font-display font-black text-skel-glass group-hover:text-void-white transition-colors tracking-tighter">{event.title}</h4>
                        <div className="flex items-center gap-8 mt-3 text-[10px] font-mono text-skel-metal font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-3"><Clock size={16} className="text-grow-phosphor" /> {event.time}</span>
                          {event.location && <span className="flex items-center gap-3"><MapPin size={16} className="text-skel-metal/50" /> {event.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                      <span className={clsx(
                        "text-[10px] font-mono font-bold px-6 py-2 rounded-full uppercase tracking-[0.2em] border transition-all duration-500",
                        event.type === 'meeting' ? 'bg-focus-main/10 text-focus-neon border-focus-neon/20' :
                        event.type === 'deadline' ? 'bg-crit-blood/10 text-crit-vivid border-crit-blood/20' :
                        event.type === 'production' ? 'bg-grow-main/10 text-grow-phosphor border-grow-phosphor/20' :
                        'bg-nrg-sun/10 text-nrg-sun border-nrg-sun/20'
                      )}>
                        {event.type === 'meeting' ? 'Toplantı' : 
                         event.type === 'deadline' ? 'Termin' : 
                         event.type === 'production' ? 'Üretim' : 'Hatırlatıcı'}
                      </span>
                      <ArrowRight size={24} className="text-skel-metal opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-32 text-center bento-card flex flex-col items-center justify-center gap-8 group">
                  <CalendarIcon size={80} className="mx-auto text-skel-metal/5 mb-4 group-hover:scale-110 transition-transform duration-700" />
                  <p className="text-2xl font-display font-black text-void-white tracking-tighter uppercase">Zaman Çizelgesi Boş</p>
                  <p className="text-skel-metal font-medium max-w-sm mx-auto">Henüz bir operasyonel veri girişi yapılmamış. Yeni bir etkinlik ekleyerek başlayabilirsiniz.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-skel-dark/80 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl layer-3d rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-skel-metal/10 flex items-center justify-between bg-skel-matte/5">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700",
                    selectedEvent.type === 'meeting' ? 'bg-focus-main/10 text-focus-neon shadow-focus-main/5' :
                    selectedEvent.type === 'deadline' ? 'bg-crit-blood/10 text-crit-vivid shadow-crit-blood/5' :
                    selectedEvent.type === 'production' ? 'bg-grow-main/10 text-grow-phosphor shadow-grow-main/5' :
                    'bg-nrg-sun/10 text-nrg-sun shadow-nrg-sun/5'
                  )}>
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-black text-text-primary tracking-tighter">{selectedEvent.title}</h2>
                    <p className="label-mono text-[10px] mt-0.5">
                      {selectedEvent.type === 'meeting' ? 'Toplantı Protokolü' : 
                       selectedEvent.type === 'deadline' ? 'Üretim Termini' : 
                       selectedEvent.type === 'production' ? 'Operasyonel Plan' : 'Sistem Hatırlatıcısı'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-2.5 rounded-xl hover:bg-skel-matte/10 text-text-secondary hover:text-text-primary transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-skel-matte/5 border border-skel-metal/10">
                    <p className="label-mono text-[10px] mb-3 flex items-center gap-2">
                      <CalendarIcon size={14} className="text-focus-neon" /> Tarih
                    </p>
                    <p className="text-lg font-display font-bold text-text-primary">
                      {format(selectedEvent.date, 'd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-skel-matte/5 border border-skel-metal/10">
                    <p className="label-mono text-[10px] mb-3 flex items-center gap-2">
                      <Clock size={14} className="text-focus-neon" /> Zaman Dilimi
                    </p>
                    <p className="text-lg font-display font-bold text-text-primary">{selectedEvent.time}</p>
                  </div>
                  {selectedEvent.location && (
                    <div className="col-span-1 md:col-span-2 p-6 rounded-2xl bg-skel-matte/5 border border-skel-metal/10">
                      <p className="label-mono text-[10px] mb-3 flex items-center gap-2">
                        <MapPin size={14} className="text-focus-neon" /> Lokasyon / Koordinat
                      </p>
                      <p className="text-lg font-display font-bold text-text-primary">{selectedEvent.location}</p>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="space-y-4">
                    <h3 className="label-mono text-[10px] ml-1">Veri Detayları</h3>
                    <div className="text-base text-text-secondary leading-relaxed bg-skel-matte/5 p-6 rounded-2xl border border-skel-metal/10 font-medium whitespace-pre-wrap">
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-skel-metal/10 bg-skel-matte/5 flex gap-4">
                {selectedEvent.related_id && (
                  <button className="flex-1 os-btn os-btn-primary">
                    <ExternalLink size={18} /> İlgili Veri Katmanını Gör
                  </button>
                )}
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 os-btn os-btn-secondary"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWizardOpen && (
          <CalendarWizardModal 
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
            onSave={() => {
              setIsWizardOpen(false);
              fetchEvents();
            }}
            initialDate={selectedDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
