import { Files, Plus, Search, FileText, FileImage, FileCode } from 'lucide-react';
import { useState } from 'react';

export function Documents() {
  const [search, setSearch] = useState('');
  
  const docs: any[] = [];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
          <Files className="text-skel-metal" size={32} />
          Belge ve Dökümanlar
        </h1>
        <button className="os-btn os-btn-primary"><Plus size={16} /> Dosya Yükle</button>
      </div>
      <div className="bento-card p-4 flex items-center gap-4">
        <Search size={18} className="text-skel-metal" />
        <input 
          type="text" 
          placeholder="Belge ara..." 
          className="flex-1 bg-transparent border-none text-pure-white focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {docs.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
            <Files size={80} className="text-skel-metal mb-4" />
            <p className="text-xl font-display font-bold text-skel-metal uppercase tracking-widest">Belge Bulunmuyor</p>
          </div>
        )}
        {docs.map(d => (
          <div key={d.id} className="bento-card p-6 hover:border-focus-neon/30 transition-all cursor-pointer group flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-skel-matte/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {d.type === 'pdf' ? <FileText size={32} className="text-crit-vivid" /> : 
               d.type === 'image' ? <FileImage size={32} className="text-emerald-400" /> :
               <FileCode size={32} className="text-focus-neon" />}
            </div>
            <h3 className="text-sm font-bold text-pure-white mb-1 truncate w-full">{d.title}</h3>
            <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">{d.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
