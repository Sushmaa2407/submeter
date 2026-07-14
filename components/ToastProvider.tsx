"use client";

// ============================================================
// A small, self-contained toast system — no external library.
// Keeping this in plain React state avoids adding another
// dependency (and another potential version-mismatch headache)
// for something this contained.
//
// Usage from any client component:
//   const { showToast } = useToast();
//   showToast({ message: "Plan created", type: "success" });
//   showToast({ message: "Cancelled", type: "success", action: { label: "Undo", onClick: async () => {...} } });
// ============================================================
import { createContext, useCallback, useContext, useState } from "react";

interface ToastAction {
  label: string;
  onClick: () => void | Promise<void>;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
  action?: ToastAction;
}

interface ToastInput {
  message: string;
  type?: "success" | "error";
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Success toasts auto-dismiss quickly (per the brief: "~4s
// auto-dismiss on success"). Errors stay until the person
// dismisses them manually — an error you didn't get to read
// because it vanished isn't helpful.
const SUCCESS_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, type = "success", action }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, type, action }]);

      if (type === "success") {
        setTimeout(() => dismiss(id), SUCCESS_DISMISS_MS);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg ${
              toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-neutral-900 text-white"
            }`}
          >
            <span>{toast.message}</span>
            {toast.action && (
              <button
                onClick={async () => {
                  await toast.action!.onClick();
                  dismiss(toast.id);
                }}
                className="font-medium underline underline-offset-2"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="ml-1 text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}
