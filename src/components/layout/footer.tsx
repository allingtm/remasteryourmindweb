"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ThemeLogo } from "@/components/ui/theme-logo";
import { CookiePreferencesButton } from "@/components/cookies";
import type { BlogCategory } from "@/types";

interface FooterProps {
  categories: BlogCategory[];
}

const navigation = {
  company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookie-policy" },
  ],
  social: [
    {
      name: "LinkedIn",
      href: "#",
    },
    {
      name: "TikTok",
      href: "#",
    },
    {
      name: "YouTube",
      href: "#",
    },
  ],
};

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="bg-muted/50 border-t border-border" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <Container className="pb-8 pt-16 sm:pt-24">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center">
              <ThemeLogo
                width={71}
                height={80}
                className="h-20 w-auto"
              />
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              Expert guidance on trauma recovery, hypnotherapy, and emotional healing. Compassionate support for those ready to release the past and reclaim their lives.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-sm">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Categories
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/${category.slug}`}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <CookiePreferencesButton />
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">
                  Contact
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a
                      href="tel:0712345678"
                      className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      0712345678
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:hello@remasteryourmind.co.uk"
                      className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      hello@remasteryourmind.co.uk
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 flex flex-col sm:flex-row sm:justify-between gap-2">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; {new Date().getFullYear()} Remaster Your Mind Ltd. All rights
            reserved.
          </p>
          <a
            href="https://solvewithsoftware.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs leading-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            Website Designed by Solve With Software Ltd.
          </a>
        </div>
      </Container>
    </footer>
  );
}
