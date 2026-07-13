import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HardDrive, BookOpen, Table, Mail, Calendar, CheckSquare, Contact } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const integrations = [
  { id: 'drive', name: 'Google Drive', icon: HardDrive, description: 'Dosyalarınızı eşitleyin' },
  { id: 'docs', name: 'Google Docs', icon: BookOpen, description: 'Dökümanlarınızı yönetin' },
  { id: 'sheets', name: 'Google Sheets', icon: Table, description: 'Tablolarınızı yönetin' },
  { id: 'gmail', name: 'Gmail', icon: Mail, description: 'E-postalarınızı görüntüleyin' },
  { id: 'calendar', name: 'Google Calendar', icon: Calendar, description: 'Takviminizi senkronize edin' },
  { id: 'tasks', name: 'Google Tasks', icon: CheckSquare, description: 'Görevlerinizi yönetin' },
  { id: 'contacts', name: 'Google Contacts', icon: Contact, description: 'Kişilerinizi yönetin' },
];

export const IntegrationsSettings = () => {
  const { accessToken } = useAuth();
  // Here we would typically manage the connection state per service,
  // but since we request all scopes via one OAuth popup for now,
  // we'll show them as 'Bağlı' if there's an accessToken.
  
  const [enabledServices, setEnabledServices] = useState<Record<string, boolean>>(
    integrations.reduce((acc, int) => ({ ...acc, [int.id]: !!accessToken }), {})
  );

  const toggleService = (id: string) => {
    setEnabledServices(prev => ({ ...prev, [id]: !prev[id] }));
    // In a real implementation, this might trigger specific OAuth flows 
    // or revoke specific tokens, or just enable/disable syncing logic.
  };

  return (
    <div className="space-y-4">
      {integrations.map((int) => (
        <div key={int.id} className="flex items-center justify-between p-4 bento-card hover:bg-skel-matte/10 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-skel-matte/20 text-focus-neon flex items-center justify-center">
              <int.icon size={20} />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-text-primary block">{int.name}</span>
              <span className="text-xs text-text-secondary">{int.description}</span>
            </div>
          </div>
          <button 
            onClick={() => toggleService(int.id)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              enabledServices[int.id] 
                ? 'bg-focus-main text-pure-white hover:bg-focus-neon' 
                : 'bg-skel-matte/30 text-text-secondary hover:text-pure-white'
            }`}
          >
            {enabledServices[int.id] ? 'Bağlı' : 'Bağlan'}
          </button>
        </div>
      ))}
    </div>
  );
};
