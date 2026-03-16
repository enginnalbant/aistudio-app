import { LayoutDashboard } from 'lucide-react';

export function OthersDashboard() {
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <LayoutDashboard className="text-skel-metal" size={32} />
        Diğer İşler Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bento-card p-6">
          <h3 className="text-lg font-bold text-pure-white mb-2">Hızlı Erişim</h3>
          <p className="text-skel-metal text-sm">Sık kullanılan araçlara buradan ulaşabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}
