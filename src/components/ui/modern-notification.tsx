import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ModernNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const ModernNotification: React.FC<ModernNotificationProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out animate-slideInRight`}>
      <div className={`${getStyles()} border rounded-xl p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold">{title}</h3>
            {message && (
              <p className="mt-1 text-xs opacity-90">{message}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook pour utiliser les notifications
export const useNotification = () => {
  const [notifications, setNotifications] = React.useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>>([]);

  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <ModernNotification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );

  return {
    addNotification,
    removeNotification,
    NotificationContainer
  };
};
