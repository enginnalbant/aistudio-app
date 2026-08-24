import React from 'react';
import { Calendar } from 'lucide-react';

interface PlannerTabProps {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({
  selectedDate,
  setSelectedDate
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" /> Strategic Planner & Calendar
          </h2>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
          />
        </div>

        {/* Time blocking agenda */}
        <div className="space-y-2 pt-2">
          {[
            { time: '09:00', title: 'Daily System Architecture Sync', status: 'Completed', color: 'text-emerald-400' },
            { time: '11:00', title: 'Deep Work: Vector Graph Optimization', status: 'In Progress', color: 'text-amber-400' },
            { time: '14:30', title: 'AI Research Paper Review', status: 'Scheduled', color: 'text-indigo-400' },
            { time: '16:30', title: 'Knowledge Base Backup & Cloud Sync', status: 'Scheduled', color: 'text-slate-400' }
          ].map((slot, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-indigo-300 font-bold w-12">{slot.time}</span>
                <span className="font-bold text-white">{slot.title}</span>
              </div>
              <span className={`font-mono text-[10px] font-bold ${slot.color}`}>{slot.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
