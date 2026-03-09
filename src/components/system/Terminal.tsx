import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal as TerminalIcon, Zap, ShieldCheck, Globe, Cpu } from 'lucide-react';

export function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    "APEX OS [Version 4.2.0-Apex]",
    "(c) 2026 Apex Neural Systems. Tüm hakları saklıdır.",
    "",
    "Çekirdek yükleniyor...",
    "Nöral ağlar senkronize edildi.",
    "Sistem durumu: CONNECTED",
    "Komut girmek için bekleyin...",
    ""
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `engin@apex:~$ ${input}`];

    // Simple command processing
    let response = "";
    if (cmd === 'help') {
      response = "Mevcut komutlar: help, clear, status, build, whoami, sysinfo";
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'status') {
      response = "Sistem Durumu: NOMİNAL | Bağlantı: GÜVENLİ | Gecikme: 2ms";
    } else if (cmd === 'build') {
      response = "Build Render Start... CONNECTED... Build Render End.";
    } else if (cmd === 'whoami') {
      response = "enginnalbant9@gmail.com [Sistem Yöneticisi]";
    } else if (cmd === 'sysinfo') {
      response = "Apex Core v4.2.0 | CPU: %12 | RAM: 4.2GB | Disk: %64";
    } else {
      response = `Komut bulunamadı: ${cmd}. Yardım için 'help' yazın.`;
    }

    setHistory([...newHistory, response, ""]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-black/90 rounded-3xl border border-focus-neon/20 overflow-hidden shadow-2xl shadow-focus-neon/5">
      {/* Terminal Header */}
      <div className="bg-skel-matte/50 px-6 py-3 border-b border-skel-metal/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TerminalIcon size={16} className="text-focus-neon" />
          <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-widest">Apex Kernel Console</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-crit-blood/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-nrg-sun/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-grow-phosphor/40" />
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 p-8 font-mono text-sm text-focus-neon overflow-y-auto custom-scrollbar"
      >
        {history.map((line, i) => (
          <div key={i} className={line.startsWith('engin@apex') ? 'text-grow-phosphor' : ''}>
            {line}
          </div>
        ))}
        <form onSubmit={handleCommand} className="flex items-center gap-2 mt-2">
          <span className="text-grow-phosphor">engin@apex:~$</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-focus-neon caret-focus-neon"
            autoFocus
          />
        </form>
      </div>

      {/* Terminal Footer */}
      <div className="bg-skel-matte/30 px-6 py-3 border-t border-skel-metal/10 flex items-center gap-8">
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary">
          <Cpu size={12} /> CPU: %12
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary">
          <Globe size={12} /> P2P: AKTİF
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary">
          <ShieldCheck size={12} /> SECURE: YES
        </div>
      </div>
    </div>
  );
}
