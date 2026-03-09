import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight,
  Plus,
  MapPin,
  Users
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

export function CalendarMenu({ onClose, onViewAll }: { onClose: () => void; onViewAll: () => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const todayEvents = events.filter(e => isSameDay(new Date(e.date), today));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-skel-dark border border-skel-matte/20 overflow-hidden z-50 shadow-2xl rounded-2xl"
    >
      <div className="p-4 border-b border-skel-matte/20 bg-skel-matte/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-nrg-sun" />
          <div>
            <h3 className="text-sm font-bold text-skel-glass uppercase tracking-widest">Ajanda</h3>
            <p className="text-[10px] text-skel-metal font-medium">{format(today, 'd MMMM yyyy, EEEE', { locale: tr })}</p>
          </div>
        </div>
        <button 
          onClick={onViewAll}
          className="p-2 rounded-lg bg-nrg-sun/10 text-nrg-sun hover:bg-nrg-sun/20 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-nrg-sun/20 border-t-nrg-sun rounded-full animate-spin" />
            <p className="text-[10px] text-skel-metal font-bold uppercase tracking-widest">Yükleniyor...</p>
          </div>
        ) : todayEvents.length > 0 ? (
          todayEvents.map((event) => (
            <div 
              key={event.id}
              className="group relative pl-4 border-l-2 border-skel-matte/20 hover:border-nrg-sun transition-all cursor-pointer"
            >
              <div className="absolute left-[-2px] top-0 bottom-0 w-0.5 bg-nrg-sun opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-skel-glass group-hover:text-nrg-sun transition-colors">
                  {event.title}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                  event.type === 'meeting' ? 'bg-focus-neon/10 text-focus-neon' :
                  event.type === 'deadline' ? 'bg-crit-vivid/10 text-crit-vivid' :
                  'bg-skel-metal/10 text-skel-metal'
                }`}>
                  {event.type === 'meeting' ? 'Toplantı' : event.type === 'deadline' ? 'Termin' : 'Hatırlatıcı'}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-[10px] text-skel-metal font-medium">
                <div className="flex items-center gap-1">
                  <Clock size={12} /> {event.time}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} /> {event.location}
                  </div>
                )}
                {event.attendees && (
                  <div className="flex items-center gap-1">
                    <Users size={12} /> {event.attendees} Kişi
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <CalendarIcon size={32} className="mx-auto text-skel-glass/5 mb-3" />
            <p className="text-xs text-skel-matte italic">Bugün için kayıtlı etkinlik bulunmuyor.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-skel-matte/20 bg-skel-matte/5">
        <button 
          onClick={onViewAll}
          className="w-full py-2.5 rounded-xl border border-skel-matte/20 text-[10px] font-bold text-skel-metal uppercase tracking-widest hover:bg-skel-matte/20 hover:text-skel-glass transition-all flex items-center justify-center gap-2"
        >
          Takvimi Tam Ekran Aç <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}
