import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  addToast: (item: Omit<ToastItem, "id">) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Styles per variant ───────────────────────────────────────────────────────

interface VariantStyle {
  wrapper: string;
  accent: string;
  iconBg: string;
  iconColor: string;
}

const VARIANT_STYLES: Record<ToastVariant, VariantStyle> = {
  success: {
    wrapper: "border-emerald-200 bg-white shadow-emerald-100/60",
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  error: {
    wrapper: "border-rose-200 bg-white shadow-rose-100/60",
    accent: "bg-rose-500",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  warning: {
    wrapper: "border-amber-200 bg-white shadow-amber-100/60",
    accent: "bg-amber-400",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  info: {
    wrapper: "border-sky-200 bg-white shadow-sky-100/60",
    accent: "bg-sky-500",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IconX() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconWarn() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const ICONS: Record<ToastVariant, ReactNode> = {
  success: <IconCheck />,
  error: <IconX />,
  warning: <IconWarn />,
  info: <IconInfo />,
};

const DURATION_MS = 4500;

// ─── Single Toast Card ────────────────────────────────────────────────────────

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const styles = VARIANT_STYLES[item.variant];

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(item.id), 340);
  }, [item.id, onDismiss]);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 12);
    const t2 = setTimeout(dismiss, DURATION_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [dismiss]);

  return (
    <div
      style={{ transition: "transform 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease" }}
      className={`flex w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border shadow-xl ${styles.wrapper} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
      }`}
    >
      {/* Left accent stripe */}
      <div className={`w-1 shrink-0 ${styles.accent}`} />

      <div className="flex flex-1 items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor}`}
        >
          {ICONS[item.variant]}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
          {item.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{item.description}</p>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={dismiss}
          className="ml-1 shrink-0 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed right-4 top-4 z-9999 flex flex-col items-end gap-2.5 sm:right-6 sm:top-6"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} item={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return {
    success: (title: string, description?: string) =>
      ctx.addToast({ variant: "success", title, description }),
    error: (title: string, description?: string) =>
      ctx.addToast({ variant: "error", title, description }),
    warning: (title: string, description?: string) =>
      ctx.addToast({ variant: "warning", title, description }),
    info: (title: string, description?: string) =>
      ctx.addToast({ variant: "info", title, description }),
  };
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-9998 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        {/* Coloured top strip */}
        <div
          className={`h-1.5 w-full ${isDanger ? "bg-linear-to-r from-rose-500 to-red-500" : "bg-linear-to-r from-amber-400 to-orange-400"}`}
        />

        <div className="px-6 pb-2 pt-6 text-center">
          {/* Icon circle */}
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${isDanger ? "bg-rose-100" : "bg-amber-100"}`}
          >
            {isDanger ? (
              <svg
                className="h-7 w-7 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ) : (
              <svg
                className="h-7 w-7 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <h2 className="mt-4 text-lg font-bold text-zinc-900">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
