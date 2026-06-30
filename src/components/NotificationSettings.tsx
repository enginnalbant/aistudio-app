import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Users, 
  MessageSquare, 
  AtSign,
  ArrowLeft,
  Save,
  ShieldCheck
} from 'lucide-react';

export const NotificationSettings = () => {
  const { settings, updateSettings } = useNotifications();

  const handleBack = () => {
    if ((window as any).setActiveModule) {
      (window as any).setActiveModule('main-dashboard');
    }
  };

  const sections = [
    {
      title: "Genel Bildirimler",
      description: "Sistem genelindeki bildirim kanallarını yönetin",
      icon: <Bell className="text-focus-neon" size={20} />,
      items: [
        {
          id: 'pushEnabled',
          label: "Anlık Bildirimler",
          description: "Tarayıcı ve masaüstü üzerinden anlık uyarılar alın",
          icon: <Smartphone size={18} />,
          value: settings.pushEnabled
        },
        {
          id: 'emailEnabled',
          label: "E-posta Bildirimleri",
          description: "Önemli güncellemeleri e-posta adresinize gönderelim",
          icon: <Mail size={18} />,
          value: settings.emailEnabled
        }
      ]
    },
    {
      title: "Etkileşim Ayarları",
      description: "Diğer kullanıcılarla olan etkileşim bildirimlerini özelleştirin",
      icon: <Users className="text-ai-bright" size={20} />,
      items: [
        {
          id: 'mentionAlerts',
          label: "Bahsetme Uyarıları",
          description: "Birisi sizden bahsettiğinde bildirim alın",
          icon: <AtSign size={18} />,
          value: settings.mentionAlerts
        },
        {
          id: 'followAlerts',
          label: "Takip Bildirimleri",
          description: "Yeni bir takipçi kazandığınızda haberdar olun",
          icon: <Users size={18} />,
          value: settings.followAlerts
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col gap-8 p-4 lg:p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="w-10 h-10 rounded-xl bg-skel-matte/5 hover:bg-skel-matte/10 flex items-center justify-center text-text-secondary transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tight text-text-primary uppercase">
              Bildirim Ayarları
            </h1>
            <p className="text-xs text-text-secondary opacity-60 font-mono uppercase tracking-widest">
              Bildirim tercihlerinizi özelleştirin
            </p>
          </div>
        </div>
        <Button className="h-10 px-6 rounded-xl bg-focus-neon hover:bg-focus-main text-pure-white font-bold text-xs gap-2 shadow-lg shadow-focus-neon/20">
          <Save size={16} />
          Kaydet
        </Button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.1 }}
            className="bento-card border-skel-metal/10 overflow-hidden"
          >
            <div className="p-6 border-b border-skel-metal/5 bg-skel-matte/5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-skel-space flex items-center justify-center shadow-sm">
                {section.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">
                  {section.title}
                </h3>
                <p className="text-xs text-text-secondary opacity-60 mt-0.5">
                  {section.description}
                </p>
              </div>
            </div>
            
            <div className="p-2">
              {section.items.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-skel-matte/5 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-text-secondary opacity-40 group-hover:text-focus-neon group-hover:opacity-100 transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{item.label}</p>
                      <p className="text-[11px] text-text-secondary opacity-60">{item.description}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={item.value}
                    onCheckedChange={(checked) => updateSettings({ [item.id]: checked })}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Security / Privacy Note */}
        <div className="p-6 rounded-2xl bg-ai-royal/5 border border-ai-royal/10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-ai-royal/10 flex items-center justify-center text-ai-royal shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ai-royal uppercase tracking-wider">Veri Gizliliği</h4>
            <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
              Bildirim tercihleriniz cihazlar arasında senkronize edilir. Verileriniz uçtan uca şifrelenmiş olarak saklanır ve üçüncü taraflarla paylaşılmaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
