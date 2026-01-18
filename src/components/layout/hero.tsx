"use client";

import { Container } from "@/components/ui/container";
import { ThemeLogo } from "@/components/ui/theme-logo";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="pt-16 pb-4">
      <Container>
        <div className="text-center">
          <ThemeLogo
            width={250}
            height={268}
            className="mx-auto mb-6"
            priority
          />
          <TextGenerateEffect
            words={title}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
            duration={0.5}
          />
          <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </Container>
    </section>
  );
}
