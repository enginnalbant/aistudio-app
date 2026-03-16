import { Package } from 'lucide-react';

export function AllOrders() {
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <Package className="text-skel-metal" size={32} />
        Tüm Siparişler
      </h1>
      <div className="bento-card p-6">
        <p className="text-skel-metal">Tüm siparişlerin geçmişi burada görüntülenecek.</p>
      </div>
    </div>
  );
}
