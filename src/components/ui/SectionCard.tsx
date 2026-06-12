type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlight";
};

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  variant = "default",
}: SectionCardProps) {
  const variants = {
    default: "border-slate-200/80 bg-white shadow-card",
    highlight: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white shadow-card",
  };

  return (
    <section
      className={`rounded-2xl border p-4 sm:p-5 ${variants[variant]} ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
