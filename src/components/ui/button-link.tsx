"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "./button";

interface ButtonLinkProps extends Omit<ButtonProps, "asChild"> {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

export function ButtonLink({ href, children, external, ...props }: ButtonLinkProps) {
  if (external) {
    return (
      <Button asChild {...props}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
