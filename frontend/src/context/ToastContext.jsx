import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-xs transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'error'
                ? 'bg-[#FDF2F2] border-[#F8D7DA] text-[#933737]'
                : toast.type === 'info'
                ? 'bg-[#EAF2FA] border-[#D0E2F5] text-[#2563A6]'
                : 'bg-[#EDF5F0] border-[#D1E7D9] text-[#2F6144]'
            }`}
          >
            <div className="flex items-center space-x-3">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-[#B84C4C] flex-shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-[#2563A6] flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#3F7D5A] flex-shrink-0" />
              )}
              <span className="text-xs font-semibold leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 text-[#667085] hover:text-[#263238] ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};