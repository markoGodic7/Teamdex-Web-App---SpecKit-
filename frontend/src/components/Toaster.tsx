import React, { createContext, useCallback, useContext, useState } from 'react';

type Toast = { id: string; message: string; actionLabel?: string; onAction?: () => void };

const ToastsContext = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, ...t };
    setToasts((s) => [...s, toast]);
    // auto-dismiss
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 5000);
  }, []);

  const remove = useCallback((id: string) => setToasts((s) => s.filter((t) => t.id !== id)), []);

  return (
    <ToastsContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-white border p-3 rounded shadow flex items-center gap-3">
            <div className="flex-1">{t.message}</div>
            {t.actionLabel && (
              <button
                className="px-2 py-1 border rounded bg-slate-100"
                onClick={() => { t.onAction?.(); remove(t.id); }}
              >{t.actionLabel}</button>
            )}
            <button className="ml-2 text-sm text-slate-500" onClick={() => remove(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastsContext.Provider>
  );
}

export function useToasts() {
  const ctx = useContext(ToastsContext);
  if (!ctx) throw new Error('useToasts must be used within ToasterProvider');
  return ctx;
}

export default ToasterProvider;
