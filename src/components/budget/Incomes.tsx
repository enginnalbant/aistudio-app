import { motion } from 'motion/react';
import { TrendingUp, Plus } from 'lucide-react';

export function Incomes() {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={32} />
            Gelirler
          </h1>
          <p className="text-skel-glass mt-1">Aylık gelir kalemleriniz</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Yeni Gelir Ekle
        </button>
      </div>

      <div className="bento-card flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-skel-metal">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-display text-lg">Henüz gelir kaydı bulunmuyor</p>
        </div>
      </div>
    </div>
  );
}
