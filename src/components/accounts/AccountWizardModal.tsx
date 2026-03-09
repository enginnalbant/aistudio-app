import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  UserPlus, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText,
  Building2,
  User,
  CreditCard,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AccountWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accounts: any[]) => void;
  initialScenario?: 'MANUAL' | 'BULK' | null;
  editingAccount?: any | null;
}

interface AccountItem {
  id?: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  series: string;
  address: string;
  tax_office: string;
  tax_number: string;
  authorized_person: string;
  website: string;
  description: string;
  status: string;
  payment_term_days: number;
}

export function AccountWizardModal({ isOpen, onClose, onSave, initialScenario, editingAccount }: AccountWizardModalProps) {
  const [scenario, setScenario] = useState<'MANUAL' | 'BULK' | null>(null);
  const [step, setStep] = useState(0);
  const [manualStep, setManualStep] = useState(1);
  const [manualAccount, setManualAccount] = useState<Partial<AccountItem>>({});
  const [bulkAccounts, setBulkAccounts] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetManualAccount = () => {
    setManualAccount({
      name: '',
      type: 'Müşteri',
      phone: '',
      email: '',
      series: '',
      address: '',
      tax_office: '',
      tax_number: '',
      authorized_person: '',
      website: '',
      description: '',
      status: 'Aktif',
      payment_term_days: 0
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (editingAccount) {
        setScenario('MANUAL');
        setStep(1);
        setManualAccount({
          id: editingAccount.id,
          name: editingAccount.name,
          type: editingAccount.type,
          phone: editingAccount.phone || '',
          email: editingAccount.email || '',
          series: editingAccount.series || '',
          address: editingAccount.address || '',
          tax_office: editingAccount.tax_office || '',
          tax_number: editingAccount.tax_number || '',
          authorized_person: editingAccount.authorized_person || '',
          website: editingAccount.website || '',
          description: editingAccount.description || '',
          status: editingAccount.status || 'Aktif',
          payment_term_days: editingAccount.payment_term_days || 0
        });
      } else if (initialScenario) {
        setScenario(initialScenario);
        setStep(1);
        resetManualAccount();
      } else {
        setScenario(null);
        setStep(0);
        resetManualAccount();
      }
      setManualStep(1);
    }
  }, [isOpen, initialScenario, editingAccount]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const mappedData = data.map((item: any) => ({
        name: item['Cari Adı'] || item['Name'] || '',
        type: item['Tip'] || item['Type'] || 'Müşteri',
        phone: item['Telefon'] || item['Phone'] || '',
        email: item['E-posta'] || item['Email'] || '',
        series: item['Seri'] || item['Series'] || '',
        address: item['Adres'] || item['Address'] || '',
        tax_office: item['Vergi Dairesi'] || item['Tax Office'] || '',
        tax_number: item['Vergi No'] || item['Tax Number'] || '',
        authorized_person: item['Yetkili'] || item['Authorized'] || '',
        website: item['Web'] || item['Website'] || '',
        description: item['Açıklama'] || item['Description'] || '',
        payment_term_days: parseInt(item['Vade (Gün)']) || parseInt(item['Payment Term']) || 0
      }));

      setBulkAccounts(mappedData);
      setIsProcessing(false);
      setStep(2);
    };
    reader.readAsBinaryString(file);
  };

  const handleManualSave = async () => {
    if (manualAccount.name && manualAccount.type) {
      setIsProcessing(true);
      try {
        const url = editingAccount ? `/api/accounts/${editingAccount.id}` : '/api/accounts';
        const method = editingAccount ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(manualAccount)
        });
        
        if (response.ok) {
          onSave([]); 
          onClose();
        } else {
          const errorData = await response.json();
          console.error('Error saving account:', errorData);
        }
      } catch (error) {
        console.error('Error saving account:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBulkSave = () => {
    onSave(bulkAccounts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-skel-dark/80 backdrop-blur-3xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl layer-3d rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-skel-metal/10 flex justify-between items-center shrink-0 bg-skel-matte/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-focus-neon/10 text-focus-neon flex items-center justify-center shadow-lg shadow-focus-neon/5">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-text-primary tracking-tighter">
                {editingAccount ? 'Cari Düzenle' : 'Cari Sihirbazı'}
              </h2>
              <p className="label-mono text-[10px] mt-0.5">
                {scenario === 'MANUAL' ? 'Manuel Giriş' : scenario === 'BULK' ? 'Toplu İçe Aktar' : 'Yöntem Seçimi'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-skel-matte/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10"
              >
                <button 
                  onClick={() => { setScenario('MANUAL'); setStep(1); }}
                  className="group p-10 rounded-3xl border border-skel-metal/10 bg-skel-matte/5 hover:bg-skel-matte/10 hover:border-focus-neon/30 transition-all text-left space-y-6 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-2xl bg-focus-neon/10 flex items-center justify-center text-focus-neon group-hover:scale-110 transition-transform shadow-lg shadow-focus-neon/5">
                    <UserPlus size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-black text-text-primary mb-2 tracking-tight">Manuel Giriş</h3>
                    <p className="label-mono text-[10px] opacity-60 leading-relaxed">
                      Tek bir cari kartını tüm detaylarıyla birlikte manuel olarak oluşturun.
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => { setScenario('BULK'); setStep(1); }}
                  className="group p-10 rounded-3xl border border-skel-metal/10 bg-skel-matte/5 hover:bg-skel-matte/10 hover:border-grow-main/30 transition-all text-left space-y-6 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-2xl bg-grow-main/10 flex items-center justify-center text-grow-main group-hover:scale-110 transition-transform shadow-lg shadow-grow-main/5">
                    <Upload size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-black text-text-primary mb-2 tracking-tight">Toplu İçe Aktar</h3>
                    <p className="label-mono text-[10px] opacity-60 leading-relaxed">
                      Excel veya CSV dosyanızdaki tüm cari listesini saniyeler içinde sisteme aktarın.
                    </p>
                  </div>
                </button>
              </motion.div>
            )}

            {step === 1 && scenario === 'MANUAL' && (
              <motion.div 
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Manual Steps Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        manualStep === s ? 'bg-focus-neon border-focus-neon text-skel-dark' : 
                        manualStep > s ? 'bg-grow-main border-grow-main text-skel-glass' : 'border-skel-matte/20 text-skel-metal'
                      }`}>
                        {manualStep > s ? <Check size={14} /> : s}
                      </div>
                      {s < 3 && <div className={`w-12 h-[2px] mx-2 ${manualStep > s ? 'bg-grow-main' : 'bg-skel-matte/30'}`} />}
                    </div>
                  ))}
                </div>

                {manualStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Cari Adı *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="text" 
                          value={manualAccount.name}
                          onChange={(e) => setManualAccount({...manualAccount, name: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="Örn: Metal İş A.Ş."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Cari Tipi</label>
                      <select 
                        value={manualAccount.type}
                        onChange={(e) => setManualAccount({...manualAccount, type: e.target.value})}
                        className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all appearance-none"
                      >
                        <option value="Müşteri">Müşteri</option>
                        <option value="Tedarikçi">Tedarikçi</option>
                        <option value="Fason">Fason</option>
                        <option value="Hizmet">Hizmet</option>
                        <option value="Personel">Personel</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Cari Seri/Kodu</label>
                      <input 
                        type="text" 
                        value={manualAccount.series}
                        onChange={(e) => setManualAccount({...manualAccount, series: e.target.value})}
                        className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl px-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                        placeholder="Örn: MTL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Yetkili Kişi</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="text" 
                          value={manualAccount.authorized_person}
                          onChange={(e) => setManualAccount({...manualAccount, authorized_person: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="Örn: Ahmet Yılmaz"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {manualStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Telefon</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="text" 
                          value={manualAccount.phone}
                          onChange={(e) => setManualAccount({...manualAccount, phone: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="0xxx xxx xx xx"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">E-posta</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="email" 
                          value={manualAccount.email}
                          onChange={(e) => setManualAccount({...manualAccount, email: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="info@sirket.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Web Sitesi</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="text" 
                          value={manualAccount.website}
                          onChange={(e) => setManualAccount({...manualAccount, website: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="www.sirket.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Adres</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <textarea 
                          value={manualAccount.address}
                          onChange={(e) => setManualAccount({...manualAccount, address: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all min-h-[100px]"
                          placeholder="Tam adres bilgisi..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {manualStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Vergi Dairesi</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="text" 
                          value={manualAccount.tax_office}
                          onChange={(e) => setManualAccount({...manualAccount, tax_office: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="Örn: Zincirlikuyu V.D."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Vergi No / T.C.</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="text" 
                          value={manualAccount.tax_number}
                          onChange={(e) => setManualAccount({...manualAccount, tax_number: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="10 veya 11 haneli numara"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Açıklama / Notlar</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <textarea 
                          value={manualAccount.description}
                          onChange={(e) => setManualAccount({...manualAccount, description: e.target.value})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all min-h-[100px]"
                          placeholder="Cari ile ilgili özel notlar..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Vade (Gün)</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-skel-matte" size={18} />
                        <input 
                          type="number" 
                          value={manualAccount.payment_term_days}
                          onChange={(e) => setManualAccount({...manualAccount, payment_term_days: parseInt(e.target.value) || 0})}
                          className="w-full bg-skel-space/50 border border-skel-matte/20 rounded-xl pl-10 pr-4 py-3 text-skel-glass focus:outline-none focus:border-focus-neon transition-all"
                          placeholder="Örn: 30"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 1 && scenario === 'BULK' && (
              <motion.div 
                key="bulk"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center justify-center py-10 space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-grow-main/10 flex items-center justify-center text-grow-main">
                  <Upload size={40} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-skel-glass">Dosya Seçin</h3>
                  <p className="text-sm text-skel-metal max-w-xs">
                    Excel (.xlsx, .xls) veya CSV dosyanızı buraya sürükleyin veya seçin.
                  </p>
                </div>
                <label className="os-btn os-btn-primary cursor-pointer">
                  <Upload size={16} />
                  Dosya Yükle
                  <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                </label>
                <div className="p-4 bg-skel-matte/20 rounded-2xl border border-skel-matte/20 flex items-start gap-3 max-w-md">
                  <Info size={18} className="text-focus-neon shrink-0 mt-0.5" />
                  <p className="text-xs text-skel-metal leading-relaxed">
                    Dosyanızda 'Cari Adı', 'Tip', 'Telefon', 'E-posta' gibi başlıklar bulunmalıdır. Sistem bu başlıkları otomatik olarak eşleştirecektir.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && scenario === 'BULK' && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-skel-glass">İçe Aktarma Önizleme</h3>
                  <span className="text-xs font-bold text-grow-main bg-grow-main/10 px-2 py-1 rounded-lg border border-grow-main/20">
                    {bulkAccounts.length} Kayıt Bulundu
                  </span>
                </div>
                <div className="border border-skel-matte/20 rounded-2xl overflow-hidden bg-skel-matte/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-skel-matte/20 text-skel-metal uppercase font-bold tracking-widest">
                      <tr>
                        <th className="p-3">Cari Adı</th>
                        <th className="p-3">Tip</th>
                        <th className="p-3">Telefon</th>
                        <th className="p-3">E-posta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-skel-glass">
                      {bulkAccounts.slice(0, 10).map((item, i) => (
                        <tr key={i}>
                          <td className="p-3 font-bold">{item.name}</td>
                          <td className="p-3">{item.type}</td>
                          <td className="p-3">{item.phone}</td>
                          <td className="p-3">{item.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bulkAccounts.length > 10 && (
                    <div className="p-3 text-center text-[10px] text-skel-metal border-t border-skel-matte/20 italic">
                      ...ve {bulkAccounts.length - 10} kayıt daha
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-skel-metal/10 flex justify-between items-center shrink-0 bg-skel-matte/5">
          <button 
            onClick={() => {
              if (step === 0) onClose();
              else if (step === 1) { setStep(0); setScenario(null); }
              else if (step === 2) setStep(1);
            }}
            className="os-btn os-btn-secondary"
          >
            <ChevronLeft size={18} />
            {step === 0 ? 'İptal' : 'Geri'}
          </button>

          <div className="flex gap-3">
            {scenario === 'MANUAL' && manualStep > 1 && (
              <button 
                onClick={() => setManualStep(manualStep - 1)}
                className="os-btn os-btn-secondary"
              >
                Önceki Adım
              </button>
            )}
            
            {scenario === 'MANUAL' && manualStep < 3 && (
              <button 
                onClick={() => setManualStep(manualStep + 1)}
                className="os-btn os-btn-primary px-10"
                disabled={manualStep === 1 && !manualAccount.name}
              >
                Sonraki Adım
                <ChevronRight size={18} />
              </button>
            )}

            {((scenario === 'MANUAL' && (manualStep === 3 || editingAccount)) || (step === 2 && scenario === 'BULK')) && (
              <button 
                onClick={scenario === 'MANUAL' ? handleManualSave : handleBulkSave}
                disabled={isProcessing || (scenario === 'MANUAL' && !manualAccount.name)}
                className="os-btn bg-grow-main text-pure-white hover:bg-grow-main/90 px-10 shadow-lg shadow-grow-main/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-pure-white/20 border-t-pure-white rounded-full animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                {editingAccount ? 'Güncelle' : 'Kaydet ve Bitir'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
