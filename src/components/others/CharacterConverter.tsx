import { useState, useEffect } from 'react';
import { Terminal, Save, Trash2, History, Plus, X, Settings2 } from 'lucide-react';

const defaultFormats = [
  { id: 'uppercase', label: 'BÜYÜK HARF' },
  { id: 'lowercase', label: 'küçük harf' },
  { id: 'capitalize', label: 'Baş Harfler Büyük' },
  { id: 'base64', label: 'Base64 Encode' },
  { id: 'url', label: 'URL Encode' },
];

export function CharacterConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState(defaultFormats[0].id);
  const [history, setHistory] = useState<any[]>([]);
  
  // Custom Templates State
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [operations, setOperations] = useState([{ find: '', replace: '' }]);

  useEffect(() => {
    // Firebase logic removed for database rebuild
  }, []);

  const handleConvert = () => {
    let result = input;
    
    // Check if it's a default format
    switch (format) {
      case 'uppercase': result = input.toUpperCase(); break;
      case 'lowercase': result = input.toLowerCase(); break;
      case 'capitalize': result = input.replace(/\b\w/g, c => c.toUpperCase()); break;
      case 'base64': result = btoa(input); break;
      case 'url': result = encodeURIComponent(input); break;
      default:
        // Check if it's a custom template
        const customTemplate = customTemplates.find(t => t.id === format);
        if (customTemplate && customTemplate.operations) {
          customTemplate.operations.forEach((op: any) => {
            if (op.find) {
              // Global replace
              result = result.split(op.find).join(op.replace);
            }
          });
        }
        break;
    }
    setOutput(result);
  };

  const handleSave = async () => {
    // Firebase logic removed for database rebuild
    console.log('Save triggered (database rebuild in progress)');
  };

  const handleAddOperation = () => {
    setOperations([...operations, { find: '', replace: '' }]);
  };

  const handleRemoveOperation = (index: number) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  const handleOperationChange = (index: number, field: 'find' | 'replace', value: string) => {
    const newOps = [...operations];
    newOps[index][field] = value;
    setOperations(newOps);
  };

  const handleSaveTemplate = async () => {
    // Firebase logic removed for database rebuild
    setShowWizard(false);
    setNewTemplateName('');
    setOperations([{ find: '', replace: '' }]);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (format === id) setFormat(defaultFormats[0].id);
    // Firebase logic removed for database rebuild
  };

  const allFormats = [
    ...defaultFormats,
    ...customTemplates.map(t => ({ id: t.id, label: `🌟 ${t.name}` }))
  ];

  return (
    <div className="h-full flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
          <Terminal className="text-focus-neon" size={32} />
          Akıllı Harf Çevirici
        </h1>
        <button 
          onClick={() => setShowWizard(true)}
          className="os-btn os-btn-primary flex items-center gap-2"
        >
          <Settings2 size={16} /> Şablon Sihirbazı
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card p-6 flex flex-col gap-4">
          <label className="text-sm font-bold text-skel-metal">Girdi</label>
          <textarea className="w-full h-40 bg-skel-matte/10 rounded-xl p-4 text-pure-white focus:outline-none focus:ring-1 focus:ring-focus-neon/50" value={input} onChange={(e) => setInput(e.target.value)} />
          
          <div className="flex gap-2">
            <select className="flex-1 bg-skel-matte/10 text-pure-white p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-focus-neon/50" value={format} onChange={(e) => setFormat(e.target.value)}>
              <optgroup label="Standart Formatlar">
                {defaultFormats.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </optgroup>
              {customTemplates.length > 0 && (
                <optgroup label="Özel Şablonlarım">
                  {customTemplates.map(t => <option key={t.id} value={t.id}>🌟 {t.name}</option>)}
                </optgroup>
              )}
            </select>
            
            {customTemplates.find(t => t.id === format) && (
              <button 
                onClick={() => handleDeleteTemplate(format)}
                className="bg-red-500/20 text-red-400 p-3 rounded-xl hover:bg-red-500/30 transition-colors"
                title="Bu şablonu sil"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <button className="bg-focus-main text-pure-white p-3 rounded-xl font-bold hover:bg-focus-main/80 transition-colors" onClick={handleConvert}>Çevir</button>
        </div>
        
        <div className="bento-card p-6 flex flex-col gap-4">
          <label className="text-sm font-bold text-skel-metal">Çıktı</label>
          <textarea className="w-full h-40 bg-skel-matte/10 rounded-xl p-4 text-pure-white focus:outline-none" value={output} onChange={(e) => setOutput(e.target.value)} />
          <button className="bg-emerald-600 text-pure-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors" onClick={handleSave}>
            <Save size={18} /> Kaydet
          </button>
        </div>
      </div>

      <div className="bento-card p-6">
        <h2 className="text-xl font-bold text-pure-white mb-4 flex items-center gap-2"><History /> Geçmiş</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
          {history.length === 0 ? (
            <div className="text-skel-metal text-sm">Henüz bir çeviri geçmişi yok.</div>
          ) : (
            history.map(h => (
              <div key={h.id} className="bg-skel-matte/10 p-3 rounded-lg text-sm text-skel-metal flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-focus-neon text-xs uppercase tracking-wider">{h.format}</span>
                  <span className="text-pure-white">{h.input.substring(0, 30)}{h.input.length > 30 ? '...' : ''} &gt; {h.output.substring(0, 30)}{h.output.length > 30 ? '...' : ''}</span>
                </div>
                <span className="text-[10px] opacity-50">{h.timestamp?.toDate?.().toLocaleString('tr-TR')}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-skel-dark border border-skel-matte rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-skel-matte flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pure-white flex items-center gap-2">
                <Settings2 className="text-focus-neon" />
                Şablon Sihirbazı
              </h2>
              <button onClick={() => setShowWizard(false)} className="text-skel-metal hover:text-pure-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-skel-metal mb-2">Şablon Adı</label>
                <input 
                  type="text" 
                  className="w-full bg-skel-matte/20 border border-skel-matte rounded-xl p-3 text-pure-white focus:outline-none focus:border-focus-neon"
                  placeholder="Örn: Türkçe Karakterleri Temizle"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-skel-metal">Çeviri Kuralları</label>
                  <button 
                    onClick={handleAddOperation}
                    className="text-xs bg-focus-neon/10 text-focus-neon px-3 py-1.5 rounded-full font-bold hover:bg-focus-neon/20 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Kural Ekle
                  </button>
                </div>
                
                <div className="space-y-3">
                  {operations.map((op, index) => (
                    <div key={index} className="flex items-center gap-3 bg-skel-matte/10 p-3 rounded-xl border border-skel-matte/50">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Bulunacak Metin (Örn: ş)" 
                          className="w-full bg-transparent border-b border-skel-matte p-2 text-pure-white focus:outline-none focus:border-focus-neon text-sm"
                          value={op.find}
                          onChange={(e) => handleOperationChange(index, 'find', e.target.value)}
                        />
                      </div>
                      <div className="text-skel-metal font-bold">&rarr;</div>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Yerine Yazılacak (Örn: s)" 
                          className="w-full bg-transparent border-b border-skel-matte p-2 text-pure-white focus:outline-none focus:border-focus-neon text-sm"
                          value={op.replace}
                          onChange={(e) => handleOperationChange(index, 'replace', e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveOperation(index)}
                        className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                        disabled={operations.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-skel-matte flex justify-end gap-3">
              <button 
                onClick={() => setShowWizard(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-skel-metal hover:bg-skel-matte/20 transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim() || operations.every(op => !op.find.trim())}
                className="bg-focus-main text-pure-white px-6 py-2.5 rounded-xl font-bold hover:bg-focus-main/80 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} /> Şablonu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
