type AlertProps = {
  variant?: "error" | "success" | "warning" | "info";
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
};

const variants = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export function Alert({
  variant = "info",
  children,
  onDismiss,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${variants[variant]} ${className}`}
      role="alert"
    >
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
