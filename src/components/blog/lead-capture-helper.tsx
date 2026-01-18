"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { MovingBorder } from "@/components/ui/moving-border";
import { Container } from "@/components/ui/container";
import type { HelpOptionWithPost } from "@/types";

interface LeadCaptureHelperProps {
  helpOptions: HelpOptionWithPost[];
  title?: string;
  subtitle?: string;
}

export function LeadCaptureHelper({
  helpOptions,
  title = "Hi, how can we help you today?",
  subtitle = "Select an option below to learn more",
}: LeadCaptureHelperProps) {
  if (helpOptions.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <Container>
        <MovingBorder
          duration={4000}
          borderRadius="1.5rem"
          containerClassName="w-full max-w-5xl mx-auto"
          className="p-8 md:p-12"
        >
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            {helpOptions.map((option) => (
              <CardContainer key={option.id} className="w-auto">
                <CardBody
                  className={cn(
                    "group relative rounded-2xl border-2 transition-colors duration-200",
                    "bg-background hover:bg-primary/5",
                    "shadow-sm hover:shadow-lg",
                    "min-w-50 md:min-w-55"
                  )}
                  style={{
                    borderColor: option.color || undefined,
                  }}
                >
                  <Link
                    href={`/${option.post.slug}`}
                    className="block px-6 py-4 md:px-8 md:py-5 text-center"
                  >
                    <CardItem
                      translateZ={40}
                      className="w-full"
                    >
                      <span className="font-medium text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                        {option.text}
                      </span>
                    </CardItem>
                    {option.description && (
                      <CardItem
                        translateZ={20}
                        className="w-full mt-2"
                      >
                        <span className="block text-xs md:text-sm text-muted-foreground opacity-75 group-hover:opacity-100 transition-opacity">
                          {option.description}
                        </span>
                      </CardItem>
                    )}
                  </Link>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </MovingBorder>
      </Container>
    </section>
  );
}
