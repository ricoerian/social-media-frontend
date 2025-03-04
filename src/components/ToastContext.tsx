import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'info' | 'warning' | 'danger';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    show: boolean;
  }>({
    message: '',
    type: 'info',
    show: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, show: true });
    // Menghilangkan toast setelah 3 detik
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.show && (
        <div
          className={`
            fixed top-4 z-50 p-2 rounded shadow-lg text-white text-center
            left-4 right-4 sm:left-4 sm:right-4 md:left-1/2 md:max-w-md md:-translate-x-1/2
            ${toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'info'
              ? 'bg-blue-500'
              : toast.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-red-500'}
          `}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus digunakan dalam ToastProvider');
  }
  return context;
};
