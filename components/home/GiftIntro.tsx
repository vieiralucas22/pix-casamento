import { siteContent } from "@/lib/content";
import { Heading } from "@/components/ui/Heading";

export function GiftIntro() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Heading as="h2">{siteContent.giftHeading} ❤️</Heading>
      <p className="max-w-md text-base leading-7 text-muted">
        {siteContent.giftIntro}
      </p>
    </div>
  );
}
