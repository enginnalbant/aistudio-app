import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type NotificationType = 'comment' | 'follow' | 'invitation' | 'file_share' | 'mention' | 'like';

export interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
    fallback: string;
  };
  action: string;
  target?: string;
  content?: string;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  hasActions?: boolean;
  file?: {
    name: string;
    size: string;
    type: string;
  };
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  mentionAlerts: boolean;
  followAlerts: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  handleAction: (id: string, action: 'accept' | 'decline') => void;
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    mentionAlerts: true,
    followAlerts: true,
  });

  useEffect(() => {
    const checkFinancialAlerts = () => {
      const subscriptions = JSON.parse(localStorage.getItem('finance_subscriptions') || '[]');
      const debts = JSON.parse(localStorage.getItem('finance_debts') || '[]');
      
      const newNotifications: Notification[] = [];
      const today = new Date();

      subscriptions.forEach((sub: any) => {
        if (sub.status === 'Aktif') {
          const billingDate = new Date(sub.nextBillingDate);
          const diffTime = billingDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays <= 3) {
            newNotifications.push({
              id: `sub-${sub.id}`,
              type: 'comment', // Using comment as a generic alert type for now
              user: { name: "Finans Sistemi", avatar: "", fallback: "FS" },
              action: `Ödeme zamanı yaklaştı: ${sub.title}`,
              content: `${sub.title} aboneliğiniz için ${diffDays === 0 ? 'bugün' : diffDays + ' gün'} sonra ${sub.amount} TL ödemeniz var.`,
              timestamp: sub.nextBillingDate,
              timeAgo: diffDays === 0 ? 'Bugün' : `${diffDays} gün sonra`,
              isRead: false,
            });
          }
        }
      });

      debts.forEach((debt: any) => {
        if (debt.status === 'Devam Ediyor') {
          const paymentDate = new Date(debt.nextPaymentDate);
          const diffTime = paymentDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays <= 3) {
            newNotifications.push({
              id: `debt-${debt.id}`,
              type: 'comment',
              user: { name: "Finans Sistemi", avatar: "", fallback: "FS" },
              action: `Borç ödemesi yaklaştı: ${debt.title}`,
              content: `${debt.title} için ${diffDays === 0 ? 'bugün' : diffDays + ' gün'} sonra ${debt.paymentAmount} TL ödemeniz var.`,
              timestamp: debt.nextPaymentDate,
              timeAgo: diffDays === 0 ? 'Bugün' : `${diffDays} gün sonra`,
              isRead: false,
            });
          }
        }
      });

      setNotifications(newNotifications);
    };

    checkFinancialAlerts();
    // In a real app, you might want to run this periodically or listen to localStorage changes
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleAction = useCallback((id: string, action: 'accept' | 'decline') => {
    console.log(`Notification ${id} ${action}ed`);
    // In a real app, you'd call an API here
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, hasActions: false, action: `${n.action} (${action === 'accept' ? 'Kabul Edildi' : 'Reddedildi'})`, isRead: true } : n
    ));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      handleAction,
      settings,
      updateSettings
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
