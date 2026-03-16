import { Calendar } from 'lucide-react';

export function PurchasingPlanning() {
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <Calendar className="text-skel-metal" size={32} />
        Satınalma Planlaması
      </h1>
      <div className="bento-card p-6">
        <p className="text-skel-metal">Satınalma planlama takvimi ve süreçleri burada görüntülenecek.</p>
      </div>
    </div>
  );
}
