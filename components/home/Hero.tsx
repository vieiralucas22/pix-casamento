import { couple, siteContent } from "@/lib/content";
import { Heading } from "@/components/ui/Heading";

export function Hero() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">
        {siteContent.heroEyebrow}
      </p>
      <Heading as="h1">
        {couple.first} &amp; {couple.second}
      </Heading>
      <p className="max-w-md text-lg leading-8 text-muted">
        {siteContent.heroMessage}
      </p>
    </div>
  );
}
