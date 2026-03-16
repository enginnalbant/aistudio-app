import { BarChart3 } from 'lucide-react';

export function PurchasingReports() {
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <BarChart3 className="text-skel-metal" size={32} />
        Raporlar
      </h1>
      <div className="bento-card p-6">
        <p className="text-skel-metal">Satınalma performans raporları burada görüntülenecek.</p>
      </div>
    </div>
  );
}
