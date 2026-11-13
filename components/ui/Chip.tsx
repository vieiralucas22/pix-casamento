import { cn } from "@/lib/utils";

export function Chip({
  selected = false,
  className,
  children,
  ...props
}: {
  selected?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
        selected
          ? "border-accent bg-accent/15 text-accent-foreground shadow-sm"
          : "border-border bg-surface text-foreground hover:border-accent hover:text-accent-strong",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
