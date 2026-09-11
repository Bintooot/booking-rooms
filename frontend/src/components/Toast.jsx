import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 animate-slide-in ${
              toast.type === "success"
                ? "bg-slate-900 text-white border-green-500/30"
                : toast.type === "error"
                  ? "bg-red-900 text-white border-red-500/30"
                  : "bg-slate-900 text-white border-blue-500/30"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 size={18} className="text-green-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle size={18} className="text-red-400 shrink-0" />}
            {toast.type === "info" && <Info size={18} className="text-blue-400 shrink-0" />}
            <span className="flex-1 text-xs">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: (msg) => console.log("Toast:", msg) };
  }
  return context;
}

