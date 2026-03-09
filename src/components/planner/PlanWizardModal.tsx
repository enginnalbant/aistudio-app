import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, List, Check, X } from 'lucide-react';

interface PlanWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: any) => void;
}

export const PlanWizardModal = ({ isOpen, onClose, onSave }: PlanWizardModalProps) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<string[]>(['']);

  const handleAddItem = () => setItems([...items, '']);
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);

  const toggleWeekDay = (day: number) => {
    if (selectedWeekDays.includes(day)) {
      setSelectedWeekDays(selectedWeekDays.filter(d => d !== day));
    } else {
      setSelectedWeekDays([...selectedWeekDays, day]);
    }
  };

  const toggleMonthDay = (day: number) => {
    if (selectedMonthDays.includes(day)) {
      setSelectedMonthDays(selectedMonthDays.filter(d => d !== day));
    } else {
      setSelectedMonthDays([...selectedMonthDays, day]);
    }
  };

  const handleSave = () => {
    onSave({ 
      type, 
      title, 
      date, 
      items: items.filter(i => i.trim()),
      selectedWeekDays,
      selectedMonthDays
    });
    onClose();
    setStep(1);
    setTitle('');
    setItems(['']);
    setSelectedWeekDays([]);
    setSelectedMonthDays([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-2xl shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
            <Plus className="text-emerald-500" />
            Yeni Plan Oluştur
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-app rounded-xl text-text-secondary"><X size={20} /></button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm font-bold text-text-secondary">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-500' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border'}`}>1</div>
              Plan Tipi
            </div>
            <div className="h-0.5 flex-1 bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-500' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border'}`}>2</div>
              Detaylar
            </div>
            <div className="h-0.5 flex-1 bg-border" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-500' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border'}`}>3</div>
              Maddeler
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { id: 'daily', label: 'Günlük Plan', icon: Calendar },
                { id: 'weekly', label: 'Haftalık Plan', icon: List },
                { id: 'monthly', label: 'Aylık Plan', icon: Calendar }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id as any)}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${type === t.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-border hover:border-emerald-500/50 hover:bg-bg-app'}`}
                >
                  <t.icon size={32} />
                  <span className="font-bold">{t.label}</span>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Başlık</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Plan başlığı..."
                  className="w-full p-4 bg-bg-app border border-border rounded-xl outline-none focus:border-emerald-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Tarih</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 bg-bg-app border border-border rounded-xl outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              {type === 'weekly' && (
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Hangi Günler?</label>
                  <div className="flex flex-wrap gap-2">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => (
                      <button
                        key={i}
                        onClick={() => toggleWeekDay(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${selectedWeekDays.includes(i + 1) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-bg-app text-text-secondary hover:bg-border'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {type === 'monthly' && (
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Hangi Günler?</label>
                  <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleMonthDay(day)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${selectedMonthDays.includes(day) ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-bg-app text-text-secondary hover:bg-border'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-text-secondary font-mono text-sm w-6">{i + 1}.</span>
                    <input 
                      value={item}
                      onChange={(e) => handleItemChange(i, e.target.value)}
                      placeholder="Madde..."
                      className="flex-1 p-3 bg-bg-app border border-border rounded-xl outline-none focus:border-emerald-500 font-bold text-sm"
                      autoFocus={i === items.length - 1}
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleAddItem} className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-emerald-500 hover:text-emerald-500 font-bold text-sm transition-all">
                + Yeni Madde Ekle
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-text-secondary font-bold hover:bg-bg-app rounded-xl">Geri</button>
          ) : <div />}
          
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600">İleri</button>
          ) : (
            <button onClick={handleSave} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 flex items-center gap-2">
              <Check size={18} />
              Kaydet
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
