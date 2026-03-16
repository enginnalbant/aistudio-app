import { Languages, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function Translation() {
  const [input, setInput] = useState('');
  
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <Languages className="text-skel-metal" size={32} />
        Çeviri
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="bento-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-skel-metal uppercase tracking-widest">Türkçe</span>
            <ArrowRight size={14} className="text-skel-metal opacity-50" />
          </div>
          <textarea 
            className="flex-1 bg-skel-matte/10 border border-skel-metal/20 rounded-2xl p-4 text-pure-white focus:outline-none focus:border-focus-neon/50 transition-colors resize-none"
            placeholder="Metni buraya girin..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="bento-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-skel-metal uppercase tracking-widest">İngilizce</span>
          </div>
          <div className="flex-1 bg-skel-matte/5 border border-skel-metal/10 rounded-2xl p-4 text-pure-white/80 italic">
            Çeviri sonucu burada görünecek...
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="os-btn os-btn-primary px-12">Çevir</button>
      </div>
    </div>
  );
}
