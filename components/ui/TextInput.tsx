import { cn } from "@/lib/utils";

export function TextInput({
  label,
  hideLabel = false,
  error,
  className,
  id,
  ...props
}: {
  label: string;
  hideLabel?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn("text-sm font-medium text-muted", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent",
          error && "border-red-400 focus:border-red-400",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
