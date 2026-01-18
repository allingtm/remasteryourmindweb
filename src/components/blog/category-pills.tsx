"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types";

interface CategoryPillsProps {
  categories: BlogCategory[];
  showAllArticles?: boolean;
}

export function CategoryPills({ categories, showAllArticles = true }: CategoryPillsProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {showAllArticles && (
        <Link
          href="/"
          className={cn(
            "px-6 py-3 rounded-full border text-sm font-medium transition-colors",
            pathname === "/"
              ? "bg-foreground text-background border-foreground"
              : "border-border text-foreground hover:bg-muted"
          )}
        >
          Latest
        </Link>
      )}
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${category.slug}`}
          className={cn(
            "px-6 py-3 rounded-full border text-sm font-medium transition-colors",
            pathname === `/${category.slug}`
              ? "bg-foreground text-background border-foreground"
              : "border-border text-foreground hover:bg-muted"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
