import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-accent-strong disabled:bg-border disabled:text-muted",
  outline:
    "border border-border text-foreground hover:border-accent hover:text-accent-strong disabled:border-border disabled:text-muted",
};

const baseClassNames =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors disabled:cursor-not-allowed";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: ButtonProps &
  (
    | ({ href: string } & React.ComponentPropsWithoutRef<typeof Link>)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classNames = cn(baseClassNames, variantClassNames[variant], className);

  if (href) {
    return (
      <Link
        className={classNames}
        {...(props as React.ComponentPropsWithoutRef<typeof Link>)}
        href={href}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classNames}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
