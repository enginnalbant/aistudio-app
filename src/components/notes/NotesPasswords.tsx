import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Search, RefreshCw, Check, ShieldAlert, ChevronRight, ChevronLeft, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface PasswordEntry {
  id: string;
  siteName: string;
  username: string;
  password: string;
  url: string;
  createdAt: number;
  lastChanged: number;
}

export const NotesPasswords = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useLocalStorage<PasswordEntry[]>('apex_passwords', []);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newPasswordData, setNewPasswordData] = useState({
    siteName: '',
    username: '',
    password: '',
    url: '',
  });
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPasswordId, setSelectedPasswordId] = useState<string | null>(null);



  const addPassword = async () => {
    if (!newPasswordData.siteName || !newPasswordData.password) return;
    const newEntry = {
      id: crypto.randomUUID(),
      ...newPasswordData,
      createdAt: Date.now(),
      lastChanged: Date.now()
    };
    setPasswords(prev => [newEntry, ...prev]);
    setNewPasswordData({ siteName: '', username: '', password: '', url: '' });
    setShowWizard(false);
    setWizardStep(1);
  };

  const deletePassword = async (id: string) => {
    setPasswords(prev => prev.filter(p => p.id !== id));
    if (selectedPasswordId === id) setSelectedPasswordId(null);
  };

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let retVal = '';
    for (let i = 0; i < 16; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPasswordData(prev => ({ ...prev, password: retVal }));
  };

  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, color: 'bg-white/10', label: '' };
    if (pwd.length < 8) return { level: 1, color: 'bg-rose-500', label: 'Zayıf' };
    if (pwd.length < 12) return { level: 2, color: 'bg-amber-500', label: 'Orta' };
    return { level: 3, color: 'bg-emerald-500', label: 'Güçlü' };
  };

  const strength = getStrength(newPasswordData.password);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isOld = (lastChanged: number) => {
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    return Date.now() - lastChanged > ninetyDays;
  };

  const filteredPasswords = passwords.filter(pw => 
    pw.siteName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pw.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPassword = passwords.find(p => p.id === selectedPasswordId);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-text-primary p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-3xl font-display font-black text-pure-white flex items-center gap-3">
          <Key className="text-focus-neon" /> Parolalar
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowWizard(true)} className="bg-focus-neon text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-focus-neon/90 transition-all text-sm">
            <Plus size={16} /> Yeni Parola
          </button>
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-black border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 max-w-lg w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Yeni Parola Sihirbazı (Adım {wizardStep}/3)</h3>
              <button onClick={() => setShowWizard(false)} className="text-text-secondary hover:text-pure-white">Kapat</button>
            </div>
            {wizardStep === 1 && (
              <div className="space-y-4">
                <input placeholder="Site Adı" value={newPasswordData.siteName} onChange={e => setNewPasswordData(prev => ({...prev, siteName: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
                <input placeholder="URL" value={newPasswordData.url} onChange={e => setNewPasswordData(prev => ({...prev, url: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
              </div>
            )}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <input placeholder="Kullanıcı Adı" value={newPasswordData.username} onChange={e => setNewPasswordData(prev => ({...prev, username: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
                <div className="flex gap-2">
                  <input placeholder="Parola" value={newPasswordData.password} onChange={e => setNewPasswordData(prev => ({...prev, password: e.target.value}))} className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3" />
                  <button onClick={generatePassword} className="bg-white/10 px-4 rounded-xl text-text-secondary hover:text-focus-neon"><RefreshCw size={20} /></button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-grow flex gap-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    {[1, 2, 3].map(i => <div key={i} className={`flex-1 transition-all ${i <= strength.level ? strength.color : 'bg-white/10'}`} />)}
                  </div>
                  <span className="text-xs font-mono">{strength.label}</span>
                </div>
              </div>
            )}
            {wizardStep === 3 && <div className="text-center p-6 bg-black/20 rounded-xl">Kaydetmeye hazırsınız!</div>}
            <div className="flex justify-between mt-6">
              <button disabled={wizardStep === 1} onClick={() => setWizardStep(prev => prev - 1)} className="px-4 py-2 bg-white/10 rounded-lg flex items-center gap-2"><ChevronLeft size={16} /> Geri</button>
              {wizardStep < 3 ? (
                <button onClick={() => setWizardStep(prev => prev + 1)} className="px-4 py-2 bg-focus-main rounded-lg flex items-center gap-2">İleri <ChevronRight size={16} /></button>
              ) : (
                <button onClick={addPassword} className="px-4 py-2 bg-emerald-600 rounded-lg flex items-center gap-2"><Save size={16} /> Kaydet</button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left: List */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              placeholder="Ara..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-pure-white outline-none focus:border-focus-neon" 
            />
          </div>
          <div className="space-y-2">
            {filteredPasswords.map(pw => (
              <button
                key={pw.id}
                onClick={() => setSelectedPasswordId(pw.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedPasswordId === pw.id ? 'bg-focus-neon/10 border border-focus-neon/20' : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'}`}
              >
                <div className='flex flex-col items-start'>
                  <span className="font-bold text-sm text-pure-white">{pw.siteName}</span>
                  <span className="text-xs text-text-secondary font-mono">{pw.username}</span>
                </div>
                {isOld(pw.lastChanged) && <ShieldAlert className="text-amber-500" size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Details */}
        <div className="xl:col-span-6 bento-card p-6 overflow-y-auto">
          {selectedPassword ? (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-pure-white">{selectedPassword.siteName}</h3>
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                <label className="text-xs text-text-secondary font-mono">Kullanıcı Adı</label>
                <p className="text-sm font-mono text-pure-white">{selectedPassword.username}</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-2">
                <input type={showPassword[selectedPassword.id] ? "text" : "password"} value={selectedPassword.password} readOnly className="bg-transparent font-mono text-sm w-full outline-none text-pure-white" />
                <button onClick={() => setShowPassword(prev => ({ ...prev, [selectedPassword.id]: !prev[selectedPassword.id] }))} className="text-text-secondary hover:text-pure-white">
                  {showPassword[selectedPassword.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={() => copyToClipboard(selectedPassword.password, selectedPassword.id)} className="text-text-secondary hover:text-focus-neon">
                  {copiedId === selectedPassword.id ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              {selectedPassword.url && <a href={selectedPassword.url} target="_blank" rel="noreferrer" className="text-sm text-focus-neon underline">Siteye git</a>}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary">Seçili parola yok</div>
          )}
        </div>

        {/* Right: Tools */}
        <div className="xl:col-span-3 bento-card p-6 space-y-6">
          <h4 className="text-sm font-bold text-pure-white">Araçlar</h4>
          <button onClick={() => setShowWizard(true)} className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl text-left transition-all">
            <span className="font-bold text-sm block">Yeni Kayıt</span>
            <span className="text-xs text-text-secondary">Sihirbazı başlat</span>
          </button>
          {selectedPassword && (
            <button onClick={() => deletePassword(selectedPassword.id)} className="w-full bg-rose-500/10 hover:bg-rose-500/20 p-4 rounded-xl text-left text-rose-500 transition-all">
              <span className="font-bold text-sm block">Parolayı Sil</span>
              <span className="text-xs">Bu işlem geri alınamaz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
