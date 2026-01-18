"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { CategoryPills } from "./category-pills";
import { PostCard } from "./post-card";
import type { BlogCategory, BlogPostWithRelations } from "@/types";

interface CategoryListingProps {
  category: BlogCategory;
  posts: BlogPostWithRelations[];
  allCategories: BlogCategory[];
}

export function CategoryListing({ category, posts, allCategories }: CategoryListingProps) {
  const [featuredPost, ...remainingPosts] = posts;
  const sidebarPosts = remainingPosts.slice(0, 3);
  const gridPosts = remainingPosts.slice(3);

  return (
    <div className="py-8">
      <Container>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-foreground transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name.toUpperCase()}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            {category.name}
          </h1>
          {(category.subtitle || category.description) && (
            <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl">
              {category.subtitle || category.description}
            </p>
          )}
        </div>

        {/* Category Pills */}
        <div className="mb-12">
          <CategoryPills categories={allCategories} showAllArticles={true} />
        </div>

        {/* Featured Layout - Hims style */}
        {posts.length > 0 ? (
          <>
            {/* Main Featured Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Main Featured Post - Left 2/3 */}
              {featuredPost && (
                <Link
                  href={`/${featuredPost.slug}`}
                  className="lg:col-span-2 group block"
                >
                  <article className="h-full">
                    {featuredPost.featured_image && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
                        <Image
                          src={featuredPost.featured_image}
                          alt={featuredPost.featured_image_alt || featuredPost.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          priority
                        />
                      </div>
                    )}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>{featuredPost.author.name}</span>
                      <span>in</span>
                      <span className="text-foreground">{featuredPost.category.name}</span>
                    </div>
                    {featuredPost.excerpt && (
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    {featuredPost.tags && featuredPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {featuredPost.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
              )}

              {/* Sidebar Posts - Right 1/3 */}
              {sidebarPosts.length > 0 && (
                <div className="space-y-6">
                  {sidebarPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/${post.slug}`}
                      className="group flex gap-4"
                    >
                      <article className="flex gap-4 flex-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{post.author.name}</span>
                            <span>in</span>
                            <span className="text-foreground">{post.category.name}</span>
                          </div>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-xs">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {post.featured_image && (
                          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={post.featured_image}
                              alt={post.featured_image_alt || post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* More Posts Grid */}
            {gridPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No posts in this category yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
