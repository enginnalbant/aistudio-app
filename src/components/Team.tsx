import React from 'react';
import { Users, UserPlus, Mail, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export const Team = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black tracking-tight text-text-primary uppercase">
          Ekip Yönetimi
        </h1>
        <button className="px-4 py-2 bg-ai-bright text-pure-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-ai-royal transition-all">
          <UserPlus size={16} />
          Üye Davet Et
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { name: 'Engin Nalbant', role: 'Admin', email: 'engin@apex.os', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Engin' },
          { name: 'Selin Yılmaz', role: 'Tasarımcı', email: 'selin@apex.os', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Selin' },
          { name: 'Can Demir', role: 'Geliştirici', email: 'can@apex.os', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Can' },
        ].map((member, i) => (
          <motion.div 
            key={member.email}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bento-card p-4 flex items-center justify-between group hover:bg-skel-matte/5 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-skel-metal/10">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="font-display font-bold text-text-primary">{member.name}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-60 flex items-center gap-1">
                    <Shield size={10} /> {member.role}
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-60 flex items-center gap-1">
                    <Mail size={10} /> {member.email}
                  </span>
                </div>
              </div>
            </div>
            
            <button className="px-3 py-1.5 rounded-lg border border-skel-metal/10 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-focus-neon hover:border-focus-neon/30 transition-all">
              Düzenle
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
