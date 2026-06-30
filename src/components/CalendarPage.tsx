import React from 'react';
import { FullScreenCalendar } from './ui/fullscreen-calendar';
import { ArrowLeft } from 'lucide-react';

const dummyEvents = [
  {
    day: new Date(),
    events: [
      {
        id: 1,
        name: "Sistem Güncellemesi",
        time: "10:00 AM",
        datetime: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Ekip Toplantısı",
        time: "2:00 PM",
        datetime: new Date().toISOString(),
      },
    ],
  },
  {
    day: new Date(new Date().setDate(new Date().getDate() + 2)),
    events: [
      {
        id: 3,
        name: "Proje Lansmanı",
        time: "2:00 PM",
        datetime: new Date().toISOString(),
      },
    ],
  },
];

export const CalendarPage = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const handleBack = () => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule('main-dashboard');
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 lg:p-0">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="w-10 h-10 rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 flex items-center justify-center text-text-secondary transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-display font-black tracking-tight text-text-primary uppercase">
                Etkinlik Takvimi
              </h1>
              <p className="text-xs text-text-secondary opacity-60 font-mono uppercase tracking-widest">
                Planlanan tüm etkinlikler ve toplantılar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Container */}
      <div className="flex-1 bento-card border-skel-metal/10 overflow-hidden bg-skel-space/30 backdrop-blur-xl">
        <FullScreenCalendar data={dummyEvents} />
      </div>
    </div>
  );
};
