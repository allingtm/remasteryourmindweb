"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "./post-card";
import type { BlogCategory, BlogPostWithRelations } from "@/types";

interface CategorySectionProps {
  category: BlogCategory;
  posts: BlogPostWithRelations[];
}

export function CategorySection({ category, posts }: CategorySectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{category.name}</h2>
        <Link
          href={`/${category.slug}`}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          See all...
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="relative">
        {/* Mobile: Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:hidden">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex-none w-[280px] snap-start"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>

        {/* Desktop: 3x2 Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {posts.slice(0, 6).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
