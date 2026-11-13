import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3";

const sizeByTag: Record<HeadingTag, string> = {
  h1: "text-4xl sm:text-5xl md:text-6xl",
  h2: "text-3xl sm:text-4xl",
  h3: "text-xl sm:text-2xl",
};

export function Heading({
  as = "h2",
  className,
  children,
}: {
  as?: HeadingTag;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = as;

  return (
    <Tag
      className={cn(
        "font-serif font-medium leading-tight text-foreground",
        sizeByTag[as],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
