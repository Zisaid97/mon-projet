import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export const ModernModal: React.FC<ModernModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className = ""
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-lg';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'border-t-4 border-green-500';
      case 'error':
        return 'border-t-4 border-red-500';
      case 'warning':
        return 'border-t-4 border-yellow-500';
      case 'info':
        return 'border-t-4 border-blue-500';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${getSizeClasses()} transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`bg-white rounded-2xl shadow-2xl ${getTypeClasses()} ${className}`}>
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {getTypeIcon()}
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook pour gérer les modals
export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal
  };
};

// Composant de confirmation
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = 'danger',
  loading = false
}) => {
  const getConfirmButtonClasses = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <button
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClasses()}`}
      >
        {loading ? 'Chargement...' : confirmText}
      </button>
    </div>
  );

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      type={type === 'danger' ? 'error' : type}
      footer={footer}
      closeOnOverlayClick={!loading}
    >
      <p className="text-gray-600">{message}</p>
    </ModernModal>
  );
};

// Composant de modal de formulaire
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Enregistrer",
  cancelText = "Annuler",
  loading = false,
  size = 'md'
}) => {
  const footer = onSubmit ? (
    <div className="flex items-center justify-end space-x-3">
      <button
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Chargement...' : submitText}
      </button>
    </div>
  ) : undefined;

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
      closeOnOverlayClick={!loading}
    >
      {children}
    </ModernModal>
  );
};
