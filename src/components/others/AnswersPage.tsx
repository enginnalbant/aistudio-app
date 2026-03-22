import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit2, 
  Trash2, 
  MessageSquare, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { AnswerWizardModal } from './AnswerWizardModal';

interface AnswerTemplate {
  id: string;
  title: string; // Group Title
  name: string;  // Specific Template Name
  content: string;
  category: string;
  createdAt: string;
}

export default function AnswersPage() {
  const [templates, setTemplates] = useState<AnswerTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AnswerTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_answer_templates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    } else {
      // Default templates
      const defaults: AnswerTemplate[] = [
        {
          id: '1',
          title: 'Müşteri Karşılama',
          name: 'Resmi Karşılama',
          category: 'Genel',
          content: 'Merhaba [İSİM], ApexOS sistemine hoş geldiniz. Size nasıl yardımcı olabilirim?',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Teknik Destek Talebi',
          name: 'Standart Yanıt',
          category: 'Destek',
          content: 'Talebiniz alınmıştır. Teknik ekibimiz en kısa sürede inceleyip size dönüş yapacaktır. Takip numaranız: [NO]',
          createdAt: new Date().toISOString()
        }
      ];
      setTemplates(defaults);
      localStorage.setItem('nexus_answer_templates', JSON.stringify(defaults));
    }
  }, []);

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('nexus_answer_templates', JSON.stringify(templates));
    }
  }, [templates]);

  const handleSaveTemplate = (template: AnswerTemplate) => {
    setTemplates(prev => {
      const index = prev.findIndex(t => t.id === template.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = template;
        return updated;
      }
      return [template, ...prev];
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setTemplateToDelete(null);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category, then by title
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = {};
    }
    if (!acc[template.category][template.title]) {
      acc[template.category][template.title] = [];
    }
    acc[template.category][template.title].push(template);
    return acc;
  }, {} as Record<string, Record<string, AnswerTemplate[]>>);

  const sortedCategories = Object.keys(groupedTemplates).sort();

  return (
    <div className="space-y-12 pb-20 h-full overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5">
              <MessageSquare size={12} /> Cevap Kütüphanesi
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              HAZIR <span className="text-focus-neon">CEVAPLAR</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70">
              Sık kullanılan cevap şablonlarını yönetin ve hızla kopyalayın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setEditingTemplate(null);
              setIsWizardOpen(true);
            }}
            className="os-btn os-btn-primary group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>Yeni Şablon Ekle</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-skel-metal group-focus-within:text-focus-neon transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="os-input w-full pl-12"
            placeholder="Şablonlarda ara..."
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              !selectedCategory 
                ? "bg-focus-main text-pure-white shadow-lg shadow-focus-neon/20" 
                : "bg-skel-matte/5 text-skel-metal hover:bg-skel-matte/10"
            )}
          >
            Tümü
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedCategory === cat 
                  ? "bg-focus-main text-pure-white shadow-lg shadow-focus-neon/20" 
                  : "bg-skel-matte/5 text-skel-metal hover:bg-skel-matte/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Rows by Category */}
      <div className="space-y-16">
        {sortedCategories.map(category => (
          <div key={category} className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-mono font-bold text-focus-neon uppercase tracking-[0.3em] px-4 py-1.5 rounded-lg bg-focus-neon/5 border border-focus-neon/10 backdrop-blur-sm">
                {category}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-focus-neon/20 to-transparent" />
            </div>
            
            <div className="space-y-10">
              {Object.keys(groupedTemplates[category]).sort().map(title => (
                <div key={title} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-focus-neon shadow-[0_0_8px_rgba(112,161,255,0.5)]" />
                    <h3 className="text-sm font-display font-black text-text-primary tracking-tight uppercase">
                      {title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {groupedTemplates[category][title].map((template) => (
                        <motion.div
                          key={template.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bento-card p-6 flex flex-col gap-4 group hover:border-focus-neon/30 transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sparkles size={48} className="text-focus-neon" />
                          </div>

                          <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-mono font-bold text-focus-neon uppercase tracking-widest">
                                {template.name}
                              </h4>
                              <span className="text-[9px] text-skel-metal font-mono font-bold">
                                {new Date(template.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setTemplateToDelete(template.id)}
                                className="w-8 h-8 rounded-lg hover:bg-crit-blood/10 text-skel-metal hover:text-crit-vivid flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                title="Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 bg-skel-matte/5 rounded-2xl p-4 border border-skel-metal/5 relative group/content">
                            <p className="text-sm text-text-secondary font-medium leading-relaxed italic line-clamp-4">
                              "{template.content}"
                            </p>
                            
                            {/* Action Shortcuts in Bottom Right */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setIsWizardOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-skel-space/80 backdrop-blur-md border border-skel-metal/10 text-skel-metal hover:text-focus-neon hover:border-focus-neon/30 flex items-center justify-center transition-all shadow-sm"
                                title="Düzenle"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleCopy(template.content, template.id)}
                                className={clsx(
                                  "w-8 h-8 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all shadow-sm",
                                  copiedId === template.id
                                    ? "bg-grow-mint/80 border-grow-phosphor/30 text-grow-phosphor"
                                    : "bg-skel-space/80 border-skel-metal/10 text-skel-metal hover:text-focus-neon hover:border-focus-neon/30"
                                )}
                                title="Kopyala"
                              >
                                {copiedId === template.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-skel-matte/5 flex items-center justify-center text-skel-metal opacity-20">
              <MessageSquare size={40} />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-text-primary">Şablon Bulunamadı</p>
              <p className="text-sm text-text-secondary font-medium mt-1">
                Arama kriterlerinize uygun şablon bulunmuyor.
              </p>
            </div>
            <button 
              onClick={() => {
                setEditingTemplate(null);
                setIsWizardOpen(true);
              }}
              className="os-btn os-btn-secondary"
            >
              Yeni Şablon Oluştur
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isWizardOpen && (
          <AnswerWizardModal 
            isOpen={isWizardOpen}
            onClose={() => {
              setIsWizardOpen(false);
              setEditingTemplate(null);
            }}
            onSave={handleSaveTemplate}
            editTemplate={editingTemplate}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {templateToDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTemplateToDelete(null)}
              className="absolute inset-0 bg-void-black/80 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-skel-space/40 backdrop-blur-3xl border border-crit-vivid/20 rounded-[32px] shadow-[0_0_50px_rgba(255,68,68,0.1)] overflow-hidden"
            >
              <div className="p-8 flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-crit-vivid/10 text-crit-vivid flex items-center justify-center shadow-[0_0_30px_rgba(255,68,68,0.1)]">
                  <AlertTriangle size={40} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-text-primary uppercase tracking-tight">Emin misiniz?</h3>
                  <p className="text-sm text-skel-metal font-mono font-bold uppercase tracking-widest leading-relaxed">
                    Bu şablon kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full mt-4">
                  <button
                    onClick={() => setTemplateToDelete(null)}
                    className="flex-1 px-6 py-4 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest text-skel-metal hover:text-text-primary hover:bg-white/5 transition-all"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(templateToDelete)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-crit-vivid text-pure-white font-display font-black uppercase tracking-widest text-xs shadow-[0_8px_25px_rgba(255,68,68,0.3)] hover:shadow-[0_12px_35px_rgba(255,68,68,0.4)] hover:-translate-y-1 transition-all active:scale-95"
                  >
                    Evet, Sil
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setTemplateToDelete(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-crit-vivid/30 flex items-center justify-center text-skel-metal hover:text-crit-vivid transition-all group"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
