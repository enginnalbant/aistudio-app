import React, { createContext, useContext, useState, useCallback } from 'react';

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

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'comment',
    user: {
      name: "Amélie",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Amélie",
      fallback: "A",
    },
    action: "commented in",
    target: "Dashboard 2.0",
    content: "Really love this approach. I think this is the best solution for the document sync UX issue.",
    timestamp: "Friday 3:12 PM",
    timeAgo: "2 hours ago",
    isRead: false,
  },
  {
    id: '2',
    type: 'follow',
    user: {
      name: "Sienna",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sienna",
      fallback: "S",
    },
    action: "followed you",
    timestamp: "Friday 3:04 PM",
    timeAgo: "2 hours ago",
    isRead: false,
  },
  {
    id: '3',
    type: 'invitation',
    user: {
      name: "Ammar",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ammar",
      fallback: "A",
    },
    action: "invited you to",
    target: "Blog design",
    timestamp: "Friday 2:22 PM",
    timeAgo: "3 hours ago",
    isRead: false,
    hasActions: true,
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    mentionAlerts: true,
    followAlerts: true,
  });

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
