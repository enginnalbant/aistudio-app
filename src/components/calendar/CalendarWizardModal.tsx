import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Type, 
  AlignLeft,
  Save,
  AlertCircle
} from 'lucide-react';

interface CalendarWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
}

export function CalendarWizardModal({ isOpen, onClose, onSave, initialDate }: CalendarWizardModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    attendees: '',
    type: 'meeting',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Lütfen bir başlık girin.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attendees: formData.attendees ? parseInt(formData.attendees) : null
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-skel-dark/80 backdrop-blur-3xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg layer-3d rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-skel-metal/10 flex items-center justify-between bg-skel-matte/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nrg-sun/10 flex items-center justify-center text-nrg-sun shadow-lg shadow-nrg-sun/5">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-text-primary tracking-tighter">Yeni Etkinlik</h2>
              <p className="label-mono text-[10px] mt-0.5">Takvim Sihirbazı</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-skel-matte/10 text-text-secondary hover:text-text-primary transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-crit-vivid/10 border border-crit-vivid/20 text-crit-vivid text-xs flex items-center gap-3 font-bold">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="label-mono text-[10px] ml-1">Etkinlik Başlığı</label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Haftalık Planlama Toplantısı"
                className="os-input pl-12 w-full font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="label-mono text-[10px] ml-1">Tarih</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="os-input pl-12 w-full font-bold"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="label-mono text-[10px] ml-1">Saat</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                <input 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="os-input pl-12 w-full font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="label-mono text-[10px] ml-1">Tür</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="os-input w-full font-bold"
              >
                <option value="meeting">Toplantı</option>
                <option value="deadline">Termin</option>
                <option value="reminder">Hatırlatıcı</option>
                <option value="production">Üretim Planı</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="label-mono text-[10px] ml-1">Katılımcı Sayısı</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                <input 
                  type="number" 
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="0"
                  className="os-input pl-12 w-full font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="label-mono text-[10px] ml-1">Konum</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Örn: Toplantı Odası A"
                className="os-input pl-12 w-full font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="label-mono text-[10px] ml-1">Açıklama</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 text-text-secondary/40" size={18} />
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Etkinlik detayları..."
                className="os-input pl-12 min-h-[120px] py-4 w-full font-medium"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 os-btn os-btn-secondary"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-1 os-btn os-btn-primary bg-nrg-sun text-pure-black border-transparent hover:bg-nrg-sun/90 shadow-lg shadow-nrg-sun/20"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-pure-black/20 border-t-pure-black rounded-full animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Kaydet
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
