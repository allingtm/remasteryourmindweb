"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "./post-card";
import type { BlogTag, BlogPostWithRelations } from "@/types";

interface TagListingProps {
  tag: BlogTag;
  posts: BlogPostWithRelations[];
}

export function TagListing({ tag, posts }: TagListingProps) {
  return (
    <div className="py-8">
      <Container>
        {/* Tag Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Tags</span>
            <span>/</span>
            <span className="text-foreground">{tag.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            #{tag.name}
          </h1>

          {tag.description && (
            <p className="text-muted-foreground text-lg max-w-2xl">
              {tag.description}
            </p>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            {posts.length} {posts.length === 1 ? "article" : "articles"} tagged with &quot;{tag.name}&quot;
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No posts with this tag yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
