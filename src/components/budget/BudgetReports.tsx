import { motion } from 'motion/react';
import { PieChart, Download } from 'lucide-react';

export function BudgetReports() {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
            <PieChart className="text-blue-400" size={32} />
            Bütçe Raporları
          </h1>
          <p className="text-skel-glass mt-1">Finansal analizler ve grafikler</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download size={18} />
          Dışa Aktar
        </button>
      </div>

      <div className="bento-card flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-skel-metal">
          <PieChart size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-display text-lg">Rapor oluşturulacak yeterli veri yok</p>
        </div>
      </div>
    </div>
  );
}
