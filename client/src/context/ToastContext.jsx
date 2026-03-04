import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
   const [toasts, setToasts] = useState([]);

   const showToast = useCallback((message, type = 'info') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
         setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
   }, []);

   const removeToast = (id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
   };

   return (
      <ToastContext.Provider value={{ showToast }}>
         {children}
         {/* Toast container */}
         <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999]">
            {toasts.map((toast) => (
               <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
         </div>
      </ToastContext.Provider>
   );
};

const ToastItem = ({ toast, onClose }) => {
   const colorMap = {
      success: { bg: 'bg-[#1dc071]', icon: '✅' },
      error: { bg: 'bg-[#e74c3c]', icon: '❌' },
      info: { bg: 'bg-[#8c6dfd]', icon: 'ℹ️' },
      warning: { bg: 'bg-[#f39c12]', icon: '⚠️' },
   };

   const style = colorMap[toast.type] || colorMap.info;

   return (
      <div
         className={`flex items-center gap-3 px-5 py-3 rounded-[12px] shadow-lg min-w-[260px] max-w-[360px] text-white font-epilogue text-[14px] font-medium animate-slide-in ${style.bg}`}
         style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
         <span className="text-[18px]">{style.icon}</span>
         <p className="flex-1 leading-[20px]">{toast.message}</p>
         <button
            onClick={onClose}
            className="ml-2 text-white opacity-70 hover:opacity-100 text-[18px] leading-none"
         >
            ×
         </button>
      </div>
   );
};

export const useToast = () => useContext(ToastContext);
