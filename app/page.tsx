import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/home/Hero";
import { GiftIntro } from "@/components/home/GiftIntro";
import { AmountSelector } from "@/components/gift/AmountSelector";

export default function Home() {
  return (
    <Section className="flex flex-col gap-10" containerClassName="max-w-xl">
      <Hero />
      <GiftIntro />
      <hr className="my-4 border-border" />
      <AmountSelector />
    </Section>
  );
}
