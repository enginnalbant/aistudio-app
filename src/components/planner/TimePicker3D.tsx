import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Check, X, ChevronUp, ChevronDown } from 'lucide-react';

interface TimePicker3DProps {
  value: string; // "HH:mm" or "HH:mm - HH:mm"
  onChange: (newValue: string) => void;
  onClose: () => void;
}

export const TimePicker3D: React.FC<TimePicker3DProps> = ({ value, onChange, onClose }) => {
  const [startHour, setStartHour] = useState(value.split(':')[0] || '09');
  const [startMin, setStartMin] = useState(value.split(':')[1]?.split(' ')[0] || '00');
  const [endHour, setEndHour] = useState(value.split('-')[1]?.trim().split(':')[0] || '');
  const [endMin, setEndMin] = useState(value.split('-')[1]?.trim().split(':')[1] || '');
  const [isRange, setIsRange] = useState(value.includes('-'));

  // Auto-update end time when start time changes if range is active and end time is not set or invalid
  React.useEffect(() => {
    if (isRange && (!endHour || parseInt(endHour) <= parseInt(startHour))) {
      const nextHour = (parseInt(startHour) + 1) % 24;
      setEndHour(nextHour.toString().padStart(2, '0'));
      setEndMin(startMin);
    }
  }, [startHour, startMin, isRange]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const handleSave = () => {
    let result = `${startHour}:${startMin}`;
    if (isRange && endHour && endMin) {
      result += ` - ${endHour}:${endMin}`;
    }
    onChange(result);
    onClose();
  };

  const Wheel = ({ current, options, onSelect }: { current: string, options: string[], onSelect: (v: string) => void }) => (
    <div className="flex flex-col items-center gap-2 h-40 overflow-y-auto custom-scrollbar p-2 bg-bg-app/50 rounded-2xl border border-border/50">
      {options.map((opt) => (
        <motion.button
          key={opt}
          whileHover={{ scale: 1.1, x: 5 }}
          onClick={() => onSelect(opt)}
          className={`px-4 py-2 rounded-xl text-lg font-black transition-all ${
            current === opt 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-bg-card border border-border rounded-3xl p-8 shadow-2xl w-full max-w-md relative overflow-hidden backdrop-blur-2xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Clock size={120} className="text-emerald-500" />
      </div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-2xl font-black text-text-primary flex items-center gap-3">
          <Clock className="text-emerald-500" />
          Saat Seçimi
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-bg-app rounded-xl text-text-secondary">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="flex items-center gap-4 p-4 bg-bg-app/30 rounded-2xl border border-border/50">
          <button 
            onClick={() => setIsRange(!isRange)}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!isRange ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-text-secondary'}`}
          >
            Tek Saat
          </button>
          <button 
            onClick={() => setIsRange(!isRange)}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isRange ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-text-secondary'}`}
          >
            Aralık
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Başlangıç</p>
            <div className="flex gap-2">
              <Wheel current={startHour} options={hours} onSelect={setStartHour} />
              <Wheel current={startMin} options={minutes} onSelect={setStartMin} />
            </div>
          </div>

          {isRange && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Bitiş</p>
              <div className="flex gap-2">
                <Wheel current={endHour || '10'} options={hours} onSelect={setEndHour} />
                <Wheel current={endMin || '00'} options={minutes} onSelect={setEndMin} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-text-secondary hover:bg-bg-app rounded-2xl transition-all font-black uppercase tracking-widest text-xs"
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20"
          >
            Uygula
          </button>
        </div>
      </div>
    </motion.div>
  );
};
