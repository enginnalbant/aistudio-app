import { useState, useEffect } from 'react';
import { MessageSquare, Save, History, Sparkles, Copy, Check } from 'lucide-react';

interface ParsedData {
  name: string;
  phone: string;
  email: string;
  taxInfo: string;
  address: string;
}

export function Templates() {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Firebase logic removed for database rebuild
  }, []);

  const parseText = (text: string) => {
    const result: ParsedData = {
      name: '',
      phone: '',
      email: '',
      taxInfo: '',
      address: ''
    };

    // Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.email = emailMatch[0];

    // Phone (Turkish formats roughly)
    const phoneMatch = text.match(/(?:\+?90|0)?\s*[2-5]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/);
    if (phoneMatch) result.phone = phoneMatch[0];

    // Tax Info (VD / VNO)
    const taxMatch = text.match(/(?:V\.?D\.?|Vergi Dairesi)[\s:]*([^\n,]+)[\s,]+(?:V\.?N\.?|Vergi No)[\s:]*(\d{10,11})/i) || 
                     text.match(/(?:V\.?D\.?|Vergi Dairesi)[\s:]*([^\n]+)/i) || 
                     text.match(/(?:V\.?N\.?|Vergi No|TCKN|TC)[\s:]*(\d{10,11})/i);
    if (taxMatch) result.taxInfo = taxMatch[0].trim();

    // Address (Look for keywords like Mah, Sok, Cad, Bulvar, No:, Kat:, Daire:)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const addressLines = lines.filter(line => /mah|sok|cad|bulvar|no:|kat:|daire:|apt|ilçe|il/i.test(line));
    if (addressLines.length > 0) {
      result.address = addressLines.join(' ').trim();
    }

    // Name (Look for Sayın, Ad Soyad, İsim, Firma)
    const nameMatch = text.match(/(?:Sayın|Ad Soyad|İsim|Firma|Müşteri)[\s:]*([^\n]+)/i);
    if (nameMatch) {
      result.name = nameMatch[1].trim();
    } else if (lines.length > 0) {
      // Fallback: first line might be name/company if it's short and not an address or email
      const firstLine = lines[0];
      if (firstLine.length < 50 && !addressLines.includes(firstLine) && !emailMatch?.includes(firstLine) && !phoneMatch?.includes(firstLine)) {
        result.name = firstLine;
      }
    }

    setParsedData(result);
  };

  const handleParse = () => {
    parseText(input);
  };

  const handleSave = async () => {
    // Firebase logic removed for database rebuild
    console.log('Save triggered (database rebuild in progress)');
  };

  const getFormattedOutput = () => {
    if (!parsedData) return '';
    const lines = [];
    if (parsedData.name) lines.push(`İsim/Firma: ${parsedData.name}`);
    if (parsedData.phone) lines.push(`Telefon: ${parsedData.phone}`);
    if (parsedData.email) lines.push(`E-Posta: ${parsedData.email}`);
    if (parsedData.taxInfo) lines.push(`VD/VNO: ${parsedData.taxInfo}`);
    if (parsedData.address) lines.push(`Adres: ${parsedData.address}`);
    return lines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-3xl font-display font-black tracking-tight text-pure-white flex items-center gap-3">
        <Sparkles className="text-focus-neon" size={32} />
        Akıllı Şablon Motoru
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card p-6 flex flex-col gap-4">
          <label className="text-sm font-bold text-skel-metal">Karmaşık Metin Girişi</label>
          <textarea 
            className="w-full h-64 bg-skel-matte/10 rounded-xl p-4 text-pure-white focus:outline-none focus:ring-1 focus:ring-focus-neon/50" 
            placeholder="Müşteri bilgilerini, adres, telefon, e-posta vb. içeren karmaşık metni buraya yapıştırın..."
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
          />
          <button 
            className="bg-focus-main text-pure-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-focus-main/80 transition-colors" 
            onClick={handleParse}
          >
            <Sparkles size={18} /> Metni Çözümle
          </button>
        </div>
        
        <div className="bento-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-skel-metal">Ayrıştırılmış Sonuç</label>
            {parsedData && (
              <button 
                onClick={handleCopy}
                className="text-skel-metal hover:text-pure-white transition-colors flex items-center gap-1 text-xs"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            )}
          </div>
          <textarea 
            className="w-full h-64 bg-skel-matte/10 rounded-xl p-4 text-pure-white focus:outline-none" 
            value={getFormattedOutput()} 
            readOnly
            placeholder="Çözümlenen bilgiler burada satır satır görünecektir..."
          />
          <button 
            className="bg-emerald-600 text-pure-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50" 
            onClick={handleSave}
            disabled={!parsedData}
          >
            <Save size={18} /> Arşive Kaydet
          </button>
        </div>
      </div>

      <div className="bento-card p-6">
        <h2 className="text-xl font-bold text-pure-white mb-4 flex items-center gap-2"><History /> Geçmiş Çözümlemeler</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
          {history.length === 0 ? (
            <div className="text-skel-metal text-sm">Henüz kaydedilmiş bir çözümleme bulunmuyor.</div>
          ) : (
            history.map(h => (
              <div key={h.id} className="bg-skel-matte/10 p-4 rounded-xl text-sm text-skel-metal flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-pure-white">{h.name || 'İsimsiz Kayıt'}</div>
                  <div className="text-[10px] opacity-50">{h.timestamp?.toDate?.().toLocaleString('tr-TR')}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {h.phone && <div><span className="opacity-50">Tel:</span> {h.phone}</div>}
                  {h.email && <div><span className="opacity-50">E-Posta:</span> {h.email}</div>}
                  {h.taxInfo && <div className="col-span-2"><span className="opacity-50">VD/VNO:</span> {h.taxInfo}</div>}
                  {h.address && <div className="col-span-2"><span className="opacity-50">Adres:</span> {h.address}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
