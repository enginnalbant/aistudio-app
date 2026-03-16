import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, List, Check, X, Star, Sun, Moon, AlignLeft, Save, Paperclip, Pencil, Trash2 } from 'lucide-react';

interface PlanWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: any) => void;
  allPlannerItems?: any[];
}

interface WizardItem {
  title: string;
  priority: number;
  timing: 'morning' | 'evening' | 'both';
  description: string;
  details: string;
  showDetails: boolean;
  attachments: string[];
}

export const PlanWizardModal = ({ isOpen, onClose, onSave, allPlannerItems = [] }: PlanWizardModalProps) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [mode, setMode] = useState<'new' | 'template'>('new');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [items, setItems] = useState<WizardItem[]>([{ title: '', priority: 0, timing: 'both', description: '', details: '', showDetails: false, attachments: [] }]);
  const [savedTasks, setSavedTasks] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    const localTasks = JSON.parse(localStorage.getItem('saved_wizard_tasks') || '[]');
    const historicalTasks = Array.from(new Set(allPlannerItems.map(item => item.item_key))).filter(Boolean);
    const combined = Array.from(new Set([...localTasks, ...historicalTasks]));
    setSavedTasks(combined);
    
    const localTemplates = JSON.parse(localStorage.getItem('planner_templates') || '[]');
    if (localTemplates.length === 0) {
      const defaultTemplates = [
        {
          id: 'def-work',
          title: 'Standart İş Günü',
          type: 'daily',
          items: [
            { title: 'E-postaları Kontrol Et', priority: 1, timing: 'morning', description: 'Gelen kutusunu temizle.', details: '', showDetails: false, attachments: [] },
            { title: 'Günlük Toplantı', priority: 2, timing: 'morning', description: 'Ekip ile durum değerlendirmesi.', details: '', showDetails: false, attachments: [] },
            { title: 'Derin Odaklanma', priority: 3, timing: 'both', description: 'En önemli proje çalışması.', details: '', showDetails: false, attachments: [] },
            { title: 'Günün Özeti', priority: 1, timing: 'evening', description: 'Yarını planla.', details: '', showDetails: false, attachments: [] }
          ]
        },
        {
          id: 'def-health',
          title: 'Sağlıklı Yaşam',
          type: 'daily',
          items: [
            { title: 'Sabah Egzersizi', priority: 2, timing: 'morning', description: '15 dk yoga/esneme.', details: '', showDetails: false, attachments: [] },
            { title: 'Su Takibi', priority: 1, timing: 'both', description: 'En az 2 litre su.', details: '', showDetails: false, attachments: [] },
            { title: 'Akşam Yürüyüşü', priority: 1, timing: 'evening', description: '30 dk yürüyüş.', details: '', showDetails: false, attachments: [] }
          ]
        }
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('planner_templates', JSON.stringify(defaultTemplates));
    } else {
      setTemplates(localTemplates);
    }
  }, [allPlannerItems, isOpen]);

  const handleAddItem = () => setItems([...items, { title: '', priority: 0, timing: 'both', description: '', details: '', showDetails: false, attachments: [] }]);
  
  const handleItemChange = (index: number, field: keyof WizardItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSaveTaskTemplate = (taskName: string) => {
    if (!taskName.trim()) return;
    const newSaved = Array.from(new Set([...savedTasks, taskName.trim()]));
    setSavedTasks(newSaved);
    localStorage.setItem('saved_wizard_tasks', JSON.stringify(newSaved));
  };

  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSaveTemplate = () => {
    if (!title.trim()) {
      alert('Lütfen şablon için bir başlık girin (Adım 2).');
      setStep(2);
      return;
    }

    const filteredItems = items.filter(i => i.title.trim());
    if (filteredItems.length === 0) {
      alert('Şablon kaydetmek için en az bir madde eklemelisiniz.');
      return;
    }

    let newTemplates;
    if (editingTemplateId && !editingTemplateId.startsWith('def-')) {
      newTemplates = templates.map(t => t.id === editingTemplateId ? { id: editingTemplateId, title, items: filteredItems, type } : t);
    } else {
      newTemplates = [...templates, { id: Date.now().toString(), title, items: filteredItems, type }];
    }
    
    setTemplates(newTemplates);
    localStorage.setItem('planner_templates', JSON.stringify(newTemplates));
    
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const handleLoadTemplate = (template: any) => {
    setTitle(template.title);
    setItems(template.items);
    setType(template.type);
    setEditingTemplateId(template.id);
  };

  const handleDeleteTemplate = (id: string) => {
    const newTemplates = templates.filter(t => t.id !== id);
    setTemplates(newTemplates);
    localStorage.setItem('planner_templates', JSON.stringify(newTemplates));
  };

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
      items: items.filter(i => i.title.trim()),
      selectedWeekDays,
      selectedMonthDays
    });
    onClose();
    setStep(1);
    setTitle('');
    setItems([{ title: '', priority: 0, timing: 'both', description: '', details: '', showDetails: false, attachments: [] }]);
    setSelectedWeekDays([]);
    setSelectedMonthDays([]);
    setEditingTemplateId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-bg-card border border-border rounded-3xl p-8 w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
            <Plus className="text-emerald-500" />
            Yeni Plan Oluştur
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-app rounded-xl text-text-secondary"><X size={20} /></button>
        </div>

        <div className="mb-8 shrink-0">
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

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex gap-4">
                  <button onClick={() => setMode('new')} className={`flex-1 p-4 rounded-xl font-bold ${mode === 'new' ? 'bg-emerald-500 text-white' : 'bg-bg-app border border-border'}`}>Yeni Plan</button>
                  <button onClick={() => setMode('template')} className={`flex-1 p-4 rounded-xl font-bold ${mode === 'template' ? 'bg-emerald-500 text-white' : 'bg-bg-app border border-border'}`}>Şablon Kullan</button>
                </div>

                {mode === 'new' && (
                  <div className="grid grid-cols-3 gap-4">
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
                  </div>
                )}
                
                {mode === 'template' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {templates.map((t) => (
                        <motion.div 
                          key={t.id} 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { handleLoadTemplate(t); setStep(2); }}
                          className={`group relative bg-bg-app border-2 rounded-2xl p-5 transition-all cursor-pointer ${editingTemplateId === t.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-emerald-500/50'}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg ${editingTemplateId === t.id ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              <Star size={18} className={editingTemplateId === t.id ? 'fill-white' : 'fill-emerald-500'} />
                            </div>
                            {!t.id.startsWith('def-') && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }}
                                className="p-2 text-text-secondary hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                          <h3 className="font-bold text-text-primary mb-1">{t.title}</h3>
                          <p className="text-xs text-text-secondary font-medium">
                            {t.items.length} Madde • {t.type === 'daily' ? 'Günlük' : t.type === 'weekly' ? 'Haftalık' : 'Aylık'}
                          </p>
                          
                          {editingTemplateId === t.id && (
                            <div className="absolute top-3 right-3">
                              <div className="bg-emerald-500 text-white p-1 rounded-full">
                                <Check size={12} />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {templates.length === 0 && (
                      <div className="text-center py-12 bg-bg-app rounded-3xl border-2 border-dashed border-border">
                        <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star size={32} className="text-text-secondary" />
                        </div>
                        <h3 className="font-bold text-text-primary">Henüz Şablonunuz Yok</h3>
                        <p className="text-sm text-text-secondary mt-2 max-w-xs mx-auto">
                          Planlarınızı oluştururken "Şablon Olarak Kaydet" butonunu kullanarak buraya ekleyebilirsiniz.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-3">Plan Tipi</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'daily', label: 'Günlük', icon: Calendar },
                      { id: 'weekly', label: 'Haftalık', icon: List },
                      { id: 'monthly', label: 'Aylık', icon: Calendar }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id as any)}
                        className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${type === t.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-border text-text-secondary hover:border-emerald-500/50'}`}
                      >
                        <t.icon size={16} />
                        <span className="font-bold text-xs">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-bold text-text-secondary mb-2">Başlangıç Tarihi</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-4 bg-bg-app border border-border rounded-xl outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
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
                className="space-y-4 pb-32"
              >
                <div className="space-y-4">
                  {items.map((item, i) => {
                    const matchingTasks = savedTasks.filter(t => t.toLowerCase().includes(item.title.toLowerCase()) && item.title.length > 0 && t !== item.title);
                    const isNewTask = item.title.length > 0 && !savedTasks.includes(item.title);

                    return (
                      <div key={i} className="bg-bg-app border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3 relative">
                          <span className="text-text-secondary font-mono text-sm w-6">{i + 1}.</span>
                          <div className="flex-1 relative">
                            <input 
                              value={item.title}
                              onChange={(e) => handleItemChange(i, 'title', e.target.value)}
                              onFocus={() => setFocusedIndex(i)}
                              onBlur={() => setTimeout(() => setFocusedIndex(null), 200)}
                              placeholder="Madde..."
                              className="w-full p-3 bg-bg-card border border-border rounded-xl outline-none focus:border-emerald-500 font-bold text-sm"
                              autoFocus={i === items.length - 1}
                            />
                            
                            {/* Autocomplete Dropdown */}
                            <AnimatePresence>
                              {focusedIndex === i && matchingTasks.length > 0 && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
                                >
                                  {matchingTasks.map((t, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleItemChange(i, 'title', t)}
                                      className="w-full text-left px-4 py-3 hover:bg-bg-app text-sm font-medium border-b border-border/50 last:border-0"
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {isNewTask && (
                            <button 
                              onClick={() => handleSaveTaskTemplate(item.title)}
                              className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                              title="Bu görevi listeye kaydet"
                            >
                              <Save size={16} />
                              <span className="hidden sm:inline">Kaydet</span>
                            </button>
                          )}
                        </div>

                        {/* Item Controls */}
                        <div className="flex flex-wrap items-center gap-4 pl-9">
                          {/* Priority */}
                          <div className="flex items-center gap-1 bg-bg-card px-3 py-1.5 rounded-lg border border-border">
                            <span className="text-xs font-bold text-text-secondary mr-2">Aciliyet:</span>
                            {[1, 2, 3].map(star => (
                              <button 
                                key={star} 
                                onClick={() => handleItemChange(i, 'priority', item.priority === star ? 0 : star)}
                                className="p-1 hover:bg-bg-app rounded"
                              >
                                <Star size={14} className={star <= item.priority ? 'fill-amber-500 text-amber-500' : 'text-border'} />
                              </button>
                            ))}
                          </div>

                          {/* Timing */}
                          <div className="flex items-center gap-1 bg-bg-card p-1 rounded-lg border border-border">
                            <button 
                              onClick={() => handleItemChange(i, 'timing', 'morning')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${item.timing === 'morning' ? 'bg-amber-500/20 text-amber-500' : 'text-text-secondary hover:bg-bg-app'}`}
                            >
                              <Sun size={14} /> Sabah
                            </button>
                            <button 
                              onClick={() => handleItemChange(i, 'timing', 'evening')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${item.timing === 'evening' ? 'bg-indigo-500/20 text-indigo-500' : 'text-text-secondary hover:bg-bg-app'}`}
                            >
                              <Moon size={14} /> Akşam
                            </button>
                            <button 
                              onClick={() => handleItemChange(i, 'timing', 'both')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${item.timing === 'both' ? 'bg-emerald-500/20 text-emerald-500' : 'text-text-secondary hover:bg-bg-app'}`}
                            >
                              Tümü
                            </button>
                          </div>

                          {/* Details Toggle */}
                          <button 
                            onClick={() => handleItemChange(i, 'showDetails', !item.showDetails)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${item.showDetails ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-border text-text-secondary hover:bg-bg-card'}`}
                          >
                            <AlignLeft size={14} /> Detay
                          </button>
                          
                          {/* Remove Item */}
                          {items.length > 1 && (
                            <button 
                              onClick={() => {
                                const newItems = [...items];
                                newItems.splice(i, 1);
                                setItems(newItems);
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg ml-auto"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Details Input */}
                        <AnimatePresence>
                          {item.showDetails && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-9 overflow-hidden"
                            >
                              <textarea 
                                value={item.description}
                                onChange={(e) => handleItemChange(i, 'description', e.target.value)}
                                placeholder="Kısa açıklama..."
                                className="w-full p-3 bg-bg-card border border-border rounded-xl outline-none focus:border-emerald-500 text-sm min-h-[60px] resize-y custom-scrollbar mb-2"
                              />
                              <textarea 
                                value={item.details}
                                onChange={(e) => handleItemChange(i, 'details', e.target.value)}
                                placeholder="Detaylar, notlar veya alt görevler..."
                                className="w-full p-3 bg-bg-card border border-border rounded-xl outline-none focus:border-emerald-500 text-sm min-h-[80px] resize-y custom-scrollbar"
                              />
                              <div className="flex items-center gap-2 mt-2">
                                <Paperclip size={16} className="text-text-secondary" />
                                <span className="text-xs font-bold text-text-secondary">Dosya Yükle:</span>
                                <input type="file" onChange={(e) => {
                                  // Handle file upload
                                }} className="text-xs" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleAddItem} className="w-full py-4 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-emerald-500 hover:text-emerald-500 font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <Plus size={18} /> Yeni Madde Ekle
                </button>
                <button 
                  onClick={handleSaveTemplate} 
                  className={`w-full py-4 border rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${showSavedFeedback ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-bg-app border-border text-text-secondary hover:border-emerald-500 hover:text-emerald-500'}`}
                >
                  {showSavedFeedback ? (
                    <>
                      <Check size={18} /> Şablon Kaydedildi!
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Planı Şablon Olarak Kaydet
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-6 pt-6 border-t border-border shrink-0">
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
