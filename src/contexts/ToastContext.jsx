import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Check, Heart, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: Check,
  error: TriangleAlert,
  info: Info,
  love: Heart,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    (message, type = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-3), { id, message, type }]);
      const timer = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        timers.current.delete(id);
      }, 4200);
      timers.current.set(id, timer);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-20 z-[120] flex flex-col items-end gap-2 sm:left-auto sm:right-5 sm:w-[360px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex w-full animate-fade-up items-start gap-3 rounded-2xl border border-ink/10 bg-paper/95 px-4 py-3.5 shadow-lift backdrop-blur"
            >
              <span
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                  toast.type === 'error'
                    ? 'bg-rose/10 text-rose'
                    : toast.type === 'info'
                      ? 'bg-gold/15 text-[#9a6c26]'
                      : 'bg-sage text-[#536448]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <p className="flex-1 text-sm leading-snug text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-full p-1 text-mauve transition hover:bg-ink/5 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
