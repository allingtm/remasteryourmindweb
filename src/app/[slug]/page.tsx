import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PostContent, CategoryListing } from "@/components/blog";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getNavCategories,
  getCategoryBySlug,
  getPostBySlug,
  getPostsByCategorySlug,
  getPostsByCategory,
} from "@/lib/supabase/queries";
import { generateMetadata as generateSiteMetadata } from "@/lib/seo/metadata";
import {
  generateArticleSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/seo/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Check if it's a category first
  const category = await getCategoryBySlug(slug);
  if (category) {
    return generateSiteMetadata({
      title: `${category.name} - Articles & Insights`,
      description: category.description || `Explore our ${category.name} articles and insights.`,
      path: `/${slug}`,
    });
  }

  // Check if it's a post
  const post = await getPostBySlug(slug);
  if (post) {
    return generateSiteMetadata({
      title: post.meta_title || post.title,
      description: post.meta_description || post.subtitle || post.ai_summary || "",
      path: `/${slug}`,
      image: post.featured_image || undefined,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: [post.author.name],
      section: post.category.name,
      tags: post.tags.map((t) => t.name),
    });
  }

  return generateSiteMetadata({
    title: "Not Found",
    description: "The page you're looking for doesn't exist.",
    path: `/${slug}`,
  });
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;
  const navCategories = await getNavCategories();

  // Check if it's a category first
  const category = await getCategoryBySlug(slug);
  if (category) {
    const posts = await getPostsByCategorySlug(slug, 24);

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", url: siteConfig.url },
      { name: category.name, url: `${siteConfig.url}/${category.slug}` },
    ]);

    const collectionSchema = generateCollectionPageSchema(category, posts);

    return (
      <>
        <JsonLd data={breadcrumbSchema} id={`breadcrumb-${slug}`} />
        <JsonLd data={collectionSchema} id={`collection-${slug}`} />
        <Header categories={navCategories} />
        <main className="min-h-screen">
          <CategoryListing category={category} posts={posts} allCategories={navCategories} />
        </main>
        <Footer categories={navCategories} />
      </>
    );
  }

  // Check if it's a post
  const post = await getPostBySlug(slug);
  if (post) {
    // Fetch related posts from the same category (excluding current post)
    const categoryPosts = await getPostsByCategory(post.category.id, 11);
    const relatedPosts = categoryPosts.filter(p => p.id !== post.id).slice(0, 10);

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", url: siteConfig.url },
      { name: post.category.name, url: `${siteConfig.url}/${post.category.slug}` },
      { name: post.title, url: `${siteConfig.url}/${post.slug}` },
    ]);

    const articleSchema = generateArticleSchema(post);
    const faqSchema = generateFAQSchema(post);

    return (
      <>
        <JsonLd data={breadcrumbSchema} id={`breadcrumb-${slug}`} />
        <JsonLd data={articleSchema} id={`article-${slug}`} />
        {faqSchema && <JsonLd data={faqSchema} id={`faq-${slug}`} />}
        <Header categories={navCategories} />
        <main className="min-h-screen">
          <PostContent post={post} relatedPosts={relatedPosts} />
        </main>
        <Footer categories={navCategories} />
      </>
    );
  }

  // Neither category nor post found
  notFound();
}
