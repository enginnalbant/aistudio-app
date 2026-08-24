import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { VaultCredential } from '../KnowledgeWorkspace';

interface PasswordVaultTabProps {
  credentials: VaultCredential[];
  setCredentials: (creds: VaultCredential[] | ((prev: VaultCredential[]) => VaultCredential[])) => void;
}

export const PasswordVaultTab: React.FC<PasswordVaultTabProps> = ({
  credentials,
  setCredentials
}) => {
  const [maskedSecrets, setMaskedSecrets] = useState<Record<string, boolean>>({});
  const [copiedVaultId, setCopiedVaultId] = useState<string | null>(null);

  const [newService, setNewService] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [newCategory, setNewCategory] = useState<'Login' | 'API Key' | 'Secure Note' | 'SSH Key'>('API Key');

  const copyCredential = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVaultId(id);
    setTimeout(() => setCopiedVaultId(null), 2000);
  };

  const handleAdd = () => {
    if (!newService.trim() || !newSecret.trim()) return;
    const newCred: VaultCredential = {
      id: `v-${Date.now()}`,
      service: newService.trim(),
      username: newUsername.trim() || 'user',
      secret: newSecret.trim(),
      category: newCategory,
      updatedAt: 'Just now'
    };
    setCredentials(prev => [newCred, ...prev]);
    setNewService('');
    setNewUsername('');
    setNewSecret('');
  };

  const handleDelete = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="text-emerald-400" /> Encrypted Vault & Passwords
          </h2>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500/30 font-bold">
            AES-256 Encrypted
          </span>
        </div>

        {/* Add Credential Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
          <input
            type="text"
            placeholder="Service / App Name..."
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
          />
          <input
            type="text"
            placeholder="Username / Email..."
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
          />
          <input
            type="password"
            placeholder="Secret / Key / Password..."
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 font-mono"
          />
          <button
            onClick={handleAdd}
            disabled={!newService.trim() || !newSecret.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Add Key
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {credentials.map(c => {
            const isMasked = maskedSecrets[c.id] !== false; // default masked
            return (
              <div key={c.id} className="bg-slate-950/80 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-md group">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white block">{c.service}</span>
                    <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      {c.category}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{c.username}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="font-mono text-indigo-300 select-all">
                    {isMasked ? '••••••••••••••••' : c.secret}
                  </span>
                  <button 
                    onClick={() => setMaskedSecrets(prev => ({ ...prev, [c.id]: !isMasked }))}
                    className="p-1 hover:text-white text-slate-400 cursor-pointer"
                    title={isMasked ? "Show" : "Hide"}
                  >
                    {isMasked ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button 
                    onClick={() => copyCredential(c.id, c.secret)}
                    className="p-1 hover:text-white text-slate-400 cursor-pointer"
                    title="Copy Secret"
                  >
                    {copiedVaultId === c.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 hover:text-red-400 text-slate-500 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
