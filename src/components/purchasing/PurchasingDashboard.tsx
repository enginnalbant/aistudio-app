import { ShoppingCart } from 'lucide-react';

export function PurchasingDashboard() {
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <ShoppingCart className="text-skel-metal" size={32} />
        Satınalma Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bento-card p-6">
          <h3 className="text-lg font-bold text-pure-white mb-2">Bekleyen Talepler</h3>
          <p className="text-skel-metal text-sm">Onay bekleyen 5 satınalma talebi var.</p>
        </div>
      </div>
    </div>
  );
}
