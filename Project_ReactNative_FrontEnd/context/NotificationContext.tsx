import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationService, NotificationCounts } from '../service/notificationService';

interface NotificationContextType {
  counts: NotificationCounts;
  refreshCounts: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  counts: {
    friendRequestCount: 0,
    unreadMessageCount: 0,
  },
  refreshCounts: async () => {},
  isLoading: false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counts, setCounts] = useState<NotificationCounts>({
    friendRequestCount: 0,
    unreadMessageCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshCounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const newCounts = await NotificationService.getNotificationCounts();
      setCounts(newCounts);
    } catch (error) {
      console.error('Error refreshing notification counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh counts on mount and periodically
  useEffect(() => {
    refreshCounts();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      refreshCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshCounts]);

  return (
    <NotificationContext.Provider value={{ counts, refreshCounts, isLoading }}>
      {children}
    </NotificationContext.Provider>
  );
};

