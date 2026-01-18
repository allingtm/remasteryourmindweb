"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { BlogPostWithRelations } from "@/types";

interface FeaturedPostsProps {
  posts: BlogPostWithRelations[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null;

  const [mainPost, ...secondaryPosts] = posts;

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Featured Post - Takes 2/3 on desktop */}
        {mainPost && (
          <Link
            href={`/${mainPost.slug}`}
            className="lg:col-span-2 group block"
          >
            <article className="relative h-full min-h-[400px] lg:min-h-[500px] overflow-hidden rounded-2xl">
              {mainPost.featured_image ? (
                <Image
                  src={mainPost.featured_image}
                  alt={mainPost.featured_image_alt || mainPost.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <Badge
                  className="mb-3"
                  style={{
                    backgroundColor: mainPost.category.color || undefined,
                    color: "white",
                  }}
                >
                  {mainPost.category.name}
                </Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white mb-3 group-hover:text-blue-300 dark:group-hover:text-primary [text-shadow:0_0_0_transparent] group-hover:[text-shadow:-1px_-1px_0_#1e40af,1px_-1px_0_#1e40af,-1px_1px_0_#1e40af,1px_1px_0_#1e40af] transition-all duration-300">
                  {mainPost.title}
                </h2>
                {mainPost.excerpt && (
                  <p className="text-white/80 text-sm lg:text-base line-clamp-2 mb-4 max-w-2xl">
                    {mainPost.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-white/70">
                  {mainPost.author.avatar_url && (
                    <Image
                      src={mainPost.author.avatar_url}
                      alt={mainPost.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span>{mainPost.author.name}</span>
                  <span>·</span>
                  {mainPost.published_at && (
                    <time dateTime={mainPost.published_at}>
                      {formatDate(mainPost.published_at)}
                    </time>
                  )}
                  {mainPost.read_time_minutes && (
                    <>
                      <span>·</span>
                      <span>{mainPost.read_time_minutes} min read</span>
                    </>
                  )}
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Secondary Featured Posts - Stacked on right */}
        {secondaryPosts.length > 0 && (
          <div className="flex flex-col gap-4 lg:gap-6">
            {secondaryPosts.slice(0, 2).map((post) => (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                className="group flex-1 block"
              >
                <article className="relative h-full min-h-[180px] lg:min-h-0 overflow-hidden rounded-xl">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.featured_image_alt || post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Badge
                      variant="secondary"
                      className="mb-2 text-xs"
                      style={{
                        backgroundColor: post.category.color || undefined,
                        color: "white",
                      }}
                    >
                      {post.category.name}
                    </Badge>
                    <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-blue-300 dark:group-hover:text-primary [text-shadow:0_0_0_transparent] group-hover:[text-shadow:-1px_-1px_0_#1e40af,1px_-1px_0_#1e40af,-1px_1px_0_#1e40af,1px_1px_0_#1e40af] transition-all duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
                      {post.published_at && (
                        <time dateTime={post.published_at}>
                          {formatDate(post.published_at)}
                        </time>
                      )}
                      {post.read_time_minutes && (
                        <>
                          <span>·</span>
                          <span>{post.read_time_minutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
