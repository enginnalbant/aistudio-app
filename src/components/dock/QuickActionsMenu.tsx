import React from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Mic,
  QrCode,
  FileUp,
  Maximize2,
  Trash2,
  X
} from 'lucide-react';
import { triggerHaptic } from './DockItem';

interface QuickActionsMenuProps {
  moduleId: string;
  slotIndex: number;
  onClose: () => void;
  onOpenApp: (id: string) => void;
  onCustomizeSlot: (slotIdx: number) => void;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  moduleId,
  slotIndex,
  onClose,
  onOpenApp,
  onCustomizeSlot
}) => {

  const handleAction = (action: () => void) => {
    triggerHaptic('medium');
    action();
    onClose();
  };

  // Generate specific action entries based on module context
  const getContextActions = () => {
    if (moduleId.startsWith('notes-')) {
      return [
        { label: 'Yeni Hızlı Not', icon: <Plus size={14} />, action: () => onOpenApp('notes-quick') },
        { label: 'Ses Kaydı Al', icon: <Mic size={14} />, action: () => onOpenApp('notes-dashboard') },
        { label: 'Yapılacak Ekle', icon: <Plus size={14} />, action: () => onOpenApp('notes-todo') },
      ];
    }
    if (moduleId.startsWith('stocks-')) {
      return [
        { label: 'QR Barkod Tara', icon: <QrCode size={14} />, action: () => onOpenApp('stocks-dashboard') },
        { label: 'Yeni Ürün Ekle', icon: <Plus size={14} />, action: () => onOpenApp('stocks-dashboard') },
        { label: 'Raporları İçe Aktar', icon: <FileUp size={14} />, action: () => onOpenApp('stocks-reports') },
      ];
    }
    if (moduleId.startsWith('finance-')) {
      return [
        { label: 'Gelir Girişi Yap', icon: <Plus size={14} />, action: () => onOpenApp('finance-incomes') },
        { label: 'Yeni Gider Gir', icon: <Plus size={14} />, action: () => onOpenApp('finance-expenses') },
      ];
    }
    return [
      { label: 'Uygulamayı Aç', icon: <Maximize2 size={14} />, action: () => onOpenApp(moduleId) }
    ];
  };

  return (
    <div className="fixed inset-0 z-[180] flex flex-col justify-end lg:justify-center lg:items-center">
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Menu Box */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="relative bg-neutral-950/98 border border-white/10 rounded-t-[32px] lg:rounded-3xl p-5 w-full lg:max-w-xs shadow-2xl flex flex-col gap-4 pb-8 lg:pb-5"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex flex-col">
            <span className="text-xs font-black text-focus-neon tracking-wider uppercase">Hızlı Eylemler</span>
            <span className="text-[10px] text-text-secondary">Slot #{slotIndex + 1} İçeriği</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons List */}
        <div className="flex flex-col gap-1.5">
          {getContextActions().map((act, idx) => (
            <button
              key={`act-${idx}`}
              onClick={() => handleAction(act.action)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-focus-neon/40 text-left text-xs font-bold text-white active:scale-95 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-focus-neon/10 text-focus-neon">
                {act.icon}
              </div>
              <span>{act.label}</span>
            </button>
          ))}

          {/* Customize / Edit Assignment Link */}
          <button
            onClick={() => handleAction(() => onCustomizeSlot(slotIndex))}
            className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-left text-xs font-bold text-indigo-300 active:scale-95 transition-all mt-2"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Plus size={14} />
            </div>
            <span>Yuvayı Sık Kullanılanla Değiştir</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
