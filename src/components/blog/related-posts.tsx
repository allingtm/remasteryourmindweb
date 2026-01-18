"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "./post-card";
import type { BlogCategory, BlogPostWithRelations } from "@/types";

interface RelatedPostsProps {
  category: BlogCategory;
  posts: BlogPostWithRelations[];
}

export function RelatedPosts({ category, posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border pt-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">More in {category.name}</h2>
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

        {/* Desktop: 3-column Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
