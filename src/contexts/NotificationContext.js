import { createContext, useContext } from 'react';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/NotificationContainer';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const notification = useNotification();

  return (
    <NotificationContext.Provider value={notification}>
      {children}
      <NotificationContainer 
        notifications={notification.notifications} 
        onRemove={notification.removeNotification} 
      />
    </NotificationContext.Provider>
  );
};