import { couple, siteContent } from "@/lib/content";
import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  return (
    <footer className="py-10">
      <Container className="text-center text-sm text-muted">
        {siteContent.footerNote}, {couple.first} &amp; {couple.second}
      </Container>
    </footer>
  );
}
