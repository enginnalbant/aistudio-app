import { motion } from 'motion/react';
import { Newspaper, Plus } from 'lucide-react';

export function NewsMagazines() {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
            <Newspaper className="text-blue-400" size={32} />
            Haber ve Dergi
          </h1>
          <p className="text-skel-glass mt-1">Güncel haberler ve dergi abonelikleriniz</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Kaynak Ekle
        </button>
      </div>

      <div className="bento-card flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-skel-metal">
          <Newspaper size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-display text-lg">Henüz haber kaynağı eklenmemiş</p>
        </div>
      </div>
    </div>
  );
}
