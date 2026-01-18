"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface ThemeLogoProps {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function ThemeLogo({ width, height, className, priority }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width, height }} />;
  }

  return (
    <Image
      src={resolvedTheme === "dark" ? "/full-logo-dark.png" : "/full-logo.png"}
      alt="Remaster Your Mind"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
