import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Bot, 
  Palette, 
  LayoutDashboard, 
  Monitor, 
  ChevronRight,
  Zap,
  Check,
  Moon,
  Sun,
  Monitor as MonitorIcon,
  Layout,
  Cpu,
  Volume2,
  User,
  LayoutGrid,
  ShieldCheck,
  Lock,
  Database,
  Calendar,
  Link
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { clsx } from 'clsx';
import { Switch } from './ui/switch';
import { CalendarPage } from './CalendarPage';
import { IntegrationsSettings } from './settings/IntegrationsSettings';

const tabs = [
  { id: 'user', label: 'Kullanıcı', icon: User },
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'calendar', label: 'Takvim', icon: Calendar },
  { id: 'app', label: 'Uygulama', icon: LayoutGrid },
  { id: 'integrations', label: 'Entegrasyonlar', icon: Link },
  { id: 'security', label: 'Güvenlik', icon: ShieldCheck },
  { id: 'admin', label: 'Admin', icon: Lock },
];

export function SettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const { settings, updateSetting } = useSettings();
  const position = settings['ui.settings_panel_position']?.value || 'right';

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  const getPanelStyles = () => {
    return "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl max-h-[80vh] rounded-3xl border border-skel-metal/10";
  };

  const renderToggle = (key: string, label: string, icon: React.ReactNode) => {
    const isActive = settings[key]?.value;
    return (
      <div className="flex items-center justify-between p-4 bento-card hover:bg-skel-matte/10 transition-all duration-300 group">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isActive ? "bg-focus-neon/10 text-focus-neon" : "bg-skel-matte/20 text-text-secondary"
          )}>
            {icon}
          </div>
          <span className="font-display font-bold text-sm text-text-primary">{label}</span>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => updateSetting(key, checked)}
        />
      </div>
    );
  };

  const renderInput = (key: string, label: string) => {
    const value = settings[key]?.value;
    return (
      <div className="p-4 bento-card space-y-2">
        <label className="text-xs font-bold text-text-secondary uppercase">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => updateSetting(key, e.target.value)}
          className="w-full bg-skel-matte/20 border border-skel-metal/10 rounded-xl p-3 text-sm text-text-primary focus:border-focus-neon outline-none"
        />
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-pure-black/40 backdrop-blur-md z-[1000]"
          />

          {/* Settings Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={panelVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={clsx(
              "fixed z-[1001] bg-skel-space/90 backdrop-blur-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden",
              getPanelStyles()
            )}
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-skel-metal/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-focus-main flex items-center justify-center shadow-lg shadow-focus-main/20">
                  <Settings className="text-pure-white animate-spin-slow" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black tracking-tighter text-text-primary">
                    SİSTEM<span className="text-focus-neon">AYARLARI</span>
                  </h2>
                  <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-60">ApexOS v2.4.0 Configuration</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-crit-blood/10 text-text-secondary hover:text-crit-vivid transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-20 sm:w-28 border-r border-skel-metal/10 p-4 flex flex-col gap-4">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-500 group relative",
                      activeTab === tab.id 
                        ? "bg-focus-neon/10 text-focus-neon shadow-lg shadow-focus-neon/5" 
                        : "text-text-secondary hover:bg-skel-matte/10"
                    )}
                  >
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="active-tab-pill"
                        className="absolute inset-0 border-2 border-focus-neon/30 rounded-2xl"
                      />
                    )}
                    <tab.icon size={24} className={clsx("transition-transform duration-500", activeTab === tab.id && "scale-110")} />
                    <span className="text-[10px] font-black font-display uppercase tracking-tighter">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-skel-matte/5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Tab Header */}
                    <div>
                      <h3 className="text-sm font-black text-text-secondary uppercase tracking-[0.2em] mb-1">
                        {tabs.find(t => t.id === activeTab)?.label}
                      </h3>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'user' && (
                      <div className="space-y-4">
                        {renderInput('user.profile.full_name', 'Ad Soyad')}
                        {renderInput('user.account.email', 'E-posta')}
                        {renderInput('user.account.plan', 'Plan')}
                      </div>
                    )}

                    {activeTab === 'appearance' && (
                      <div className="space-y-4">
                        {renderToggle('theme.mode', 'Karanlık Mod', <Moon size={20} />)}
                        {renderInput('theme.accent_color', 'Vurgu Rengi')}
                      </div>
                    )}

                    {activeTab === 'calendar' && (
                      <div className="h-[500px]">
                        <CalendarPage hideHeader />
                      </div>
                    )}

                    {activeTab === 'app' && (
                      <div className="space-y-4">
                        {renderInput('app.language', 'Dil')}
                        {renderToggle('app.notifications.enabled', 'Bildirimler', <Zap size={20} />)}
                      </div>
                    )}

                    {activeTab === 'integrations' && (
                      <IntegrationsSettings />
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-4">
                        {renderToggle('security.2fa.enabled', '2FA', <Lock size={20} />)}
                        {renderToggle('security.backup.auto_enabled', 'Otomatik Yedekleme', <Database size={20} />)}
                      </div>
                    )}

                    {activeTab === 'admin' && (
                      <div className="space-y-4">
                        {renderToggle('admin.maintenance_mode', 'Bakım Modu', <Settings size={20} />)}
                        {renderInput('admin.access_level', 'Erişim Seviyesi')}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-skel-metal/10 bg-skel-matte/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-focus-neon animate-pulse" />
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Sistem Durumu: Optimal</span>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-focus-main text-pure-white rounded-xl font-display font-black text-xs uppercase tracking-widest hover:bg-focus-neon transition-all duration-300 shadow-lg shadow-focus-main/20"
              >
                Kaydet ve Kapat
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
