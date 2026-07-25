import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link as LinkIcon, Plus, Trash2, X, Search, Sparkles, Zap, BookOpen, 
  FileText, Check, ArrowRight, Shield, Layers
} from 'lucide-react';
import { Memo, Notebook, CustomGraphLink } from './types';

interface LinkManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  memos: Memo[];
  notebooks: Notebook[];
  customLinks: CustomGraphLink[];
  onSaveLinks: (updatedLinks: CustomGraphLink[]) => void;
  initialSourceId?: string;
  initialSourceType?: 'memo' | 'notebook' | 'page';
}

export const LinkManagerModal: React.FC<LinkManagerModalProps> = ({
  isOpen,
  onClose,
  memos,
  notebooks,
  customLinks,
  onSaveLinks,
  initialSourceId,
  initialSourceType
}) => {
  // All selectable items flattened
  const allSelectableItems = useMemo(() => {
    const items: Array<{ id: string; label: string; type: 'memo' | 'notebook' | 'page'; category?: string; parentTitle?: string }> = [];
    const seenIds = new Set<string>();

    const normalizeId = (type: string, id: string) => {
      if (!id) return `${type}-unknown`;
      if (id.startsWith(`${type}-`)) return id;
      return `${type}-${id}`;
    };

    const addItem = (item: { id: string; label: string; type: 'memo' | 'notebook' | 'page'; category?: string; parentTitle?: string }) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        items.push(item);
      }
    };

    // Memos
    memos.forEach(m => {
      const shortTitle = m.content.replace(/[#*`]/g, '').trim().substring(0, 36) + (m.content.length > 36 ? '...' : '');
      addItem({
        id: normalizeId('memo', m.id),
        label: shortTitle || 'Not',
        type: 'memo',
        category: m.category
      });
    });

    // Notebooks & Pages
    notebooks.forEach(nb => {
      const nbId = normalizeId('nb', nb.id);
      addItem({
        id: nbId,
        label: nb.title,
        type: 'notebook',
        category: nb.category
      });

      nb.pages.forEach(pg => {
        addItem({
          id: normalizeId('page', pg.id),
          label: pg.title,
          type: 'page',
          parentTitle: nb.title,
          category: nb.category
        });
      });
    });

    return items;
  }, [memos, notebooks]);

  // Form State
  const [sourceId, setSourceId] = useState<string>(() => {
    if (initialSourceId && initialSourceType) {
      const typePrefix = initialSourceType === 'notebook' ? 'nb' : initialSourceType;
      if (initialSourceId.startsWith(`${typePrefix}-`)) return initialSourceId;
      return `${typePrefix}-${initialSourceId}`;
    }
    return allSelectableItems[0]?.id || '';
  });

  const [targetId, setTargetId] = useState<string>(() => {
    return allSelectableItems[1]?.id || allSelectableItems[0]?.id || '';
  });

  const [relationLabel, setRelationLabel] = useState<string>('İlişkili Not/Defter');
  const [searchFilter, setSearchFilter] = useState('');

  // Handlers
  const handleCreateLink = () => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const sourceItem = allSelectableItems.find(i => i.id === sourceId);
    const targetItem = allSelectableItems.find(i => i.id === targetId);

    if (!sourceItem || !targetItem) return;

    const newLink: CustomGraphLink = {
      id: `cl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceId,
      targetId,
      sourceType: sourceItem.type,
      targetType: targetItem.type,
      relation: relationLabel.trim() || 'İlişkili Bağlantı',
      createdAt: new Date().toISOString()
    };

    onSaveLinks([newLink, ...customLinks]);
  };

  const handleDeleteLink = (linkId: string) => {
    onSaveLinks(customLinks.filter(l => l.id !== linkId));
  };

  const filteredLinks = useMemo(() => {
    if (!searchFilter.trim()) return customLinks;
    const q = searchFilter.toLowerCase();
    return customLinks.filter(l => {
      const src = allSelectableItems.find(i => i.id === l.sourceId)?.label.toLowerCase() || '';
      const tgt = allSelectableItems.find(i => i.id === l.targetId)?.label.toLowerCase() || '';
      const rel = l.relation.toLowerCase();
      return src.includes(q) || tgt.includes(q) || rel.includes(q);
    });
  }, [customLinks, searchFilter, allSelectableItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="link-manager-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[250] flex items-center justify-center p-3 sm:p-5 overflow-hidden"
        >
          <motion.div 
            key="link-manager-modal-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-neutral-950/98 border border-purple-500/30 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative"
          >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <LinkIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-display font-black text-white flex items-center gap-2">
                  Not & Defter Bağlantı Yapılandırması
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {customLinks.length} Özel Bağ
                  </span>
                </h3>
                <p className="text-xs text-text-secondary">Notları ve defterleri birbirine bağlayın, zihin haritasında dinamik ilişki ağları oluşturun.</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar flex-1">
            {/* LINK CREATION FORM SECTION */}
            <div className="bg-white/5 border border-purple-500/25 rounded-2xl p-4 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase font-mono">
                <Plus size={14} className="text-purple-400" />
                <span>Yeni Bağlantı Tanımla</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Source Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary block font-bold">1. Kaynak Eleman Seç</label>
                  <select
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {allSelectableItems.map(item => (
                      <option key={`src-${item.id}`} value={item.id}>
                        [{item.type === 'memo' ? 'Not' : item.type === 'notebook' ? 'Defter' : 'Sayfa'}] {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relation Label Input & Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary block font-bold">2. İlişki Tanımı / Etiketi</label>
                  <input 
                    type="text"
                    value={relationLabel}
                    onChange={(e) => setRelationLabel(e.target.value)}
                    placeholder="Örn: Referans Not, İlişkili Defter..."
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-purple-500"
                  />
                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['İlişkili Defter', 'Referans Not', 'Detay / Ayrıntı', 'Ön Koşul'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRelationLabel(preset)}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/5 hover:bg-purple-500/20 text-purple-300 border border-white/5 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-text-secondary block font-bold">3. Hedef Eleman Seç</label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {allSelectableItems.map(item => (
                      <option key={`tgt-${item.id}`} value={item.id}>
                        [{item.type === 'memo' ? 'Not' : item.type === 'notebook' ? 'Defter' : 'Sayfa'}] {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateLink}
                disabled={!sourceId || !targetId || sourceId === targetId}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap size={14} /> Bağlantıyı Kaydet & Grafta Göster
              </button>
            </div>

            {/* EXISTING CUSTOM LINKS LIST */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase">
                  <Layers size={14} className="text-purple-400" />
                  Tanımlı Özel Bağlantılar ({filteredLinks.length})
                </h4>

                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Bağlantılarda ara..."
                    className="bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-1 text-[11px] text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-purple-500 w-44"
                  />
                </div>
              </div>

              {filteredLinks.length === 0 ? (
                <div className="text-center py-8 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <LinkIcon size={28} className="mx-auto text-text-secondary/40 mb-2" />
                  <p className="text-xs text-text-secondary font-mono">Henüz tanımlanmış özel bağlantı bulunmuyor.</p>
                  <p className="text-[10px] text-text-secondary/70 mt-1">Yukarıdaki form ile notlarınızı ve defterlerinizi birbirine bağlayabilirsiniz.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLinks.map((link) => {
                    const srcItem = allSelectableItems.find(i => i.id === link.sourceId);
                    const tgtItem = allSelectableItems.find(i => i.id === link.targetId);

                    return (
                      <div 
                        key={`custom-link-${link.id}-${link.sourceId}-${link.targetId}`}
                        className="bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Source */}
                          <div className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0 max-w-[42%]">
                            <span className="text-[9px] font-mono text-text-secondary uppercase block">
                              {srcItem?.type === 'memo' ? 'Not' : srcItem?.type === 'notebook' ? 'Defter' : 'Sayfa'}
                            </span>
                            <span className="text-xs font-bold text-white truncate block">
                              {srcItem?.label || link.sourceId}
                            </span>
                          </div>

                          {/* Relation Badge */}
                          <div className="flex items-center gap-1 text-purple-300 shrink-0">
                            <ArrowRight size={14} className="text-purple-400" />
                            <span className="text-[10px] font-mono font-bold bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                              {link.relation}
                            </span>
                            <ArrowRight size={14} className="text-purple-400" />
                          </div>

                          {/* Target */}
                          <div className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0 max-w-[42%]">
                            <span className="text-[9px] font-mono text-text-secondary uppercase block">
                              {tgtItem?.type === 'memo' ? 'Not' : tgtItem?.type === 'notebook' ? 'Defter' : 'Sayfa'}
                            </span>
                            <span className="text-xs font-bold text-white truncate block">
                              {tgtItem?.label || link.targetId}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-1.5 text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Bağlantıyı Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
