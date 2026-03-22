import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  MessageSquare, 
  Tag, 
  Type, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface AnswerTemplate {
  id: string;
  title: string; // Group Title
  name: string;  // Specific Template Name
  content: string;
  category: string;
  createdAt: string;
}

interface AnswerWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: AnswerTemplate) => void;
  editTemplate?: AnswerTemplate | null;
}

export function AnswerWizardModal({ isOpen, onClose, onSave, editTemplate }: AnswerWizardModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    category: '',
    content: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTemplate) {
      setFormData({
        title: editTemplate.title,
        name: editTemplate.name || '',
        category: editTemplate.category,
        content: editTemplate.content
      });
      setStep(1);
    } else {
      setFormData({ title: '', name: '', category: '', content: '' });
      setStep(1);
    }
  }, [editTemplate, isOpen]);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Grup başlığı gereklidir';
      if (!formData.name.trim()) newErrors.name = 'Şablon ismi gereklidir';
      if (!formData.category.trim()) newErrors.category = 'Kategori gereklidir';
    } else if (currentStep === 2) {
      if (!formData.content.trim()) newErrors.content = 'Cevap içeriği gereklidir';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSave = () => {
    if (validateStep(step)) {
      const template: AnswerTemplate = {
        id: editTemplate?.id || `ans-${Date.now()}`,
        ...formData,
        createdAt: editTemplate?.createdAt || new Date().toISOString()
      };
      onSave(template);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-void-black/80 backdrop-blur-2xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-skel-space/40 backdrop-blur-3xl border border-focus-neon/20 rounded-[40px] shadow-[0_0_50px_rgba(112,161,255,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Hardware Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-focus-neon/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-focus-neon/30 to-transparent" />
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between relative">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-2 bg-focus-neon/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-skel-matte/20 border border-focus-neon/30 text-focus-neon flex items-center justify-center relative shadow-inner">
                <MessageSquare size={28} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-display font-black tracking-tighter text-text-primary uppercase">
                {editTemplate ? 'Şablonu Düzenle' : 'Yeni Şablon Sihirbazı'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={clsx(
                        "w-4 h-1 rounded-full transition-all duration-500",
                        step >= i ? "bg-focus-neon shadow-[0_0_8px_rgba(112,161,255,0.5)]" : "bg-white/10"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-[10px] text-skel-metal font-mono font-bold uppercase tracking-widest">
                  Aşama {step}/3
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-focus-neon/30 flex items-center justify-center text-skel-metal hover:text-focus-neon transition-all group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          {/* Background Detail */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-focus-neon/5 blur-[100px] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="label-mono flex items-center gap-2 text-focus-neon/70">
                      <Type size={12} /> Grup Başlığı
                    </label>
                    <div className="relative group">
                      <input 
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={clsx(
                          "os-input w-full bg-skel-matte/10 border-white/10 focus:border-focus-neon/50 transition-all pl-4 py-4 rounded-2xl",
                          errors.title && "border-crit-vivid/50 shadow-[0_0_15px_rgba(255,68,68,0.1)]"
                        )}
                        placeholder="Örn: Müşteri Karşılama"
                      />
                    </div>
                    {errors.title && (
                      <p className="text-[10px] font-bold text-crit-vivid flex items-center gap-1 uppercase tracking-wider">
                        <AlertCircle size={10} /> {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="label-mono flex items-center gap-2 text-focus-neon/70">
                      <Sparkles size={12} /> Şablon İsmi
                    </label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={clsx(
                        "os-input w-full bg-skel-matte/10 border-white/10 focus:border-focus-neon/50 transition-all pl-4 py-4 rounded-2xl",
                        errors.name && "border-crit-vivid/50 shadow-[0_0_15px_rgba(255,68,68,0.1)]"
                      )}
                      placeholder="Örn: Resmi Karşılama"
                    />
                    {errors.name && (
                      <p className="text-[10px] font-bold text-crit-vivid flex items-center gap-1 uppercase tracking-wider">
                        <AlertCircle size={10} /> {errors.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="label-mono flex items-center gap-2 text-focus-neon/70">
                    <Tag size={12} /> Kategori
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={clsx(
                        "os-input w-full bg-skel-matte/10 border-white/10 focus:border-focus-neon/50 transition-all pl-4 py-4 rounded-2xl",
                        errors.category && "border-crit-vivid/50 shadow-[0_0_15px_rgba(255,68,68,0.1)]"
                      )}
                      placeholder="Örn: Satış, Destek, Genel"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
                      {['Genel', 'Destek', 'Satış', 'Teknik', 'İade'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={clsx(
                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                            formData.category === cat 
                              ? "bg-focus-neon/20 border-focus-neon text-focus-neon shadow-[0_0_15px_rgba(112,161,255,0.2)]" 
                              : "bg-white/5 border-white/10 text-skel-metal hover:border-focus-neon/30 hover:text-focus-neon"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.category && (
                    <p className="text-[10px] font-bold text-crit-vivid flex items-center gap-1 uppercase tracking-wider">
                      <AlertCircle size={10} /> {errors.category}
                    </p>
                  )}
                </div>
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
                <div className="space-y-3">
                  <label className="label-mono flex items-center gap-2 text-focus-neon/70">
                    <MessageSquare size={12} /> Cevap İçeriği
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-focus-neon/20 to-transparent rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <textarea 
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      className={clsx(
                        "os-input w-full bg-skel-matte/10 border-white/10 focus:border-focus-neon/50 transition-all p-6 rounded-3xl resize-none custom-scrollbar relative z-10",
                        errors.content && "border-crit-vivid/50 shadow-[0_0_15px_rgba(255,68,68,0.1)]"
                      )}
                      placeholder="Hazır cevap metnini buraya yazın..."
                    />
                  </div>
                  {errors.content && (
                    <p className="text-[10px] font-bold text-crit-vivid flex items-center gap-1 uppercase tracking-wider">
                      <AlertCircle size={10} /> {errors.content}
                    </p>
                  )}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-focus-neon/5 border border-focus-neon/10">
                    <AlertCircle size={14} className="text-focus-neon" />
                    <p className="text-[10px] text-skel-metal font-mono font-bold uppercase tracking-wider">
                      İpucu: Değişkenler için <span className="text-focus-neon">[İSİM]</span>, <span className="text-focus-neon">[TARİH]</span> gibi etiketler kullanabilirsiniz.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-grow-mint/5 rounded-[40px] blur-2xl opacity-50" />
                  <div className="relative p-8 rounded-[32px] bg-grow-mint/5 border border-grow-phosphor/20 flex flex-col items-center text-center gap-6 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CheckCircle2 size={120} />
                    </div>
                    <div className="w-20 h-20 rounded-3xl bg-grow-phosphor/20 text-grow-phosphor flex items-center justify-center shadow-[0_0_30px_rgba(0,255,127,0.2)]">
                      <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-display font-black text-text-primary uppercase tracking-tight">Sistem Onayı</h3>
                      <p className="text-xs text-skel-metal font-mono font-bold uppercase tracking-widest">Şablonunuz veri tabanına kaydedilmeye hazır.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="label-mono text-[9px] text-focus-neon/70 mb-2 uppercase tracking-widest">Grup / Şablon</p>
                    <p className="font-display font-black text-text-primary text-lg leading-tight">
                      {formData.title} <span className="text-focus-neon opacity-50">/</span> {formData.name}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="label-mono text-[9px] text-focus-neon/70 mb-2 uppercase tracking-widest">Kategori</p>
                    <p className="font-display font-black text-text-primary text-lg uppercase tracking-wider">{formData.category}</p>
                  </div>
                  <div className="col-span-full p-6 rounded-2xl bg-white/5 border border-white/10 relative group">
                    <p className="label-mono text-[9px] text-focus-neon/70 mb-3 uppercase tracking-widest">İçerik Önizleme</p>
                    <div className="text-sm text-text-secondary font-medium italic leading-relaxed line-clamp-4 relative z-10">
                      "{formData.content}"
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <MessageSquare size={40} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-skel-space/20 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-4 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest text-crit-vivid/70 hover:text-crit-vivid hover:bg-crit-vivid/5 transition-all"
            >
              Vazgeç
            </button>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-4 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest text-skel-metal hover:text-text-primary hover:bg-white/5 transition-all"
              >
                Geri Dön
              </button>
            )}
          </div>
          
          <button
            onClick={step === 3 ? handleSave : handleNext}
            className="group relative px-10 py-4 rounded-2xl bg-focus-main text-pure-white font-display font-black uppercase tracking-widest text-xs shadow-[0_8px_25px_rgba(30,144,255,0.3)] hover:shadow-[0_12px_35px_rgba(30,144,255,0.4)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              {step === 3 ? (
                <>
                  <Save size={18} />
                  <span>Sisteme Kaydet</span>
                </>
              ) : (
                <>
                  <span>Sonraki Aşama</span>
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
