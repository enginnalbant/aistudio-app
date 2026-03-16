import { FileText } from 'lucide-react';

export function PurchasingQuotes() {
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <FileText className="text-skel-metal" size={32} />
        Fiyat Teklifleri
      </h1>
      <div className="bento-card p-6">
        <p className="text-skel-metal">Tedarikçilerden gelen fiyat teklifleri burada görüntülenecek.</p>
      </div>
    </div>
  );
}
