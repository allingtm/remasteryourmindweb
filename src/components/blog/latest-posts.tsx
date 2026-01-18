"use client";

import { PostCard } from "./post-card";
import type { BlogPostWithRelations } from "@/types";

interface LatestPostsProps {
  posts: BlogPostWithRelations[];
  title?: string;
}

export function LatestPosts({ posts, title = "Latest" }: LatestPostsProps) {
  if (posts.length === 0) {
    return (
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
