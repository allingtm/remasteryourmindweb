"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import GithubSlugger from "github-slugger";
import { markdownMediaComponents } from "./markdown-components";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { formatDate } from "@/lib/utils";
import { EnquiryCTAInline } from "./enquiry-cta-inline";
import { CalendlyProvider } from "./calendly-context";
import { CalendlyBookingModal } from "./calendly-booking-modal";
import { LiveChatProvider } from "./live-chat-context";
import { useChatPresence } from "@/hooks/use-chat-presence";
import type { BlogPostWithRelations } from "@/types";
import { RelatedPosts } from "./related-posts";

// Lazy-load live chat floating button
const LiveChatFloatingButton = dynamic(
  () => import("./live-chat-widget").then((mod) => mod.LiveChatFloatingButton),
  { ssr: false }
);

// Lazy-load enquiry components - only loaded when post has enquiry configured
const EnquiryCTAFloating = dynamic(
  () => import("./enquiry-cta-floating").then((mod) => mod.EnquiryCTAFloating),
  { ssr: false }
);
const EnquiryModal = dynamic(
  () => import("./enquiry-modal").then((mod) => mod.EnquiryModal),
  { ssr: false }
);

interface PostContentProps {
  post: BlogPostWithRelations;
  relatedPosts?: BlogPostWithRelations[];
}

interface Heading {
  title: string;
  href: string;
  level: number;
}

function extractHeadings(markdown: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  const slugger = new GithubSlugger();
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const slug = slugger.slug(title);

    headings.push({
      title,
      href: `#${slug}`,
      level,
    });
  }

  return headings;
}

function TableOfContents({ headings, contentEndRef }: { headings: Heading[]; contentEndRef: React.RefObject<HTMLDivElement | null> }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const id = heading.href.slice(1); // Remove the # prefix
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Track when content area ends to hide TOC
  useEffect(() => {
    if (!contentEndRef.current) return;

    const handleScroll = () => {
      const marker = contentEndRef.current;
      if (!marker) return;

      const markerRect = marker.getBoundingClientRect();
      // Hide TOC when the marker is at or above the TOC's top position (160px from top)
      setIsVisible(markerRect.top > 160);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentEndRef]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop TOC - uses position:fixed for reliable sticky behavior */}
      <nav className="hidden md:block w-64 shrink-0">
        <div
          className={`fixed top-40 w-56 max-h-[calc(100vh-12rem)] overflow-y-auto pr-4 transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <p className="mb-4 text-sm font-semibold text-foreground">On this page</p>
          {headings.map((heading, index) => {
            const isActive = activeId === heading.href;
            return (
              <Link
                className={`group/toc-link relative block rounded-lg px-2 py-1 text-sm transition-colors ${
                  heading.level === 3 ? "pl-6" : ""
                } ${isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                key={`${heading.href}-${index}`}
                href={heading.href}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {(hovered === index || isActive) && (
                  <motion.span
                    layoutId="toc-indicator"
                    className="absolute top-0 left-0 h-full w-1 rounded-tr-full rounded-br-full bg-primary"
                  />
                )}
                <span className="inline-block transition duration-200 group-hover/toc-link:translate-x-1">
                  {heading.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile TOC */}
      <div className="sticky top-20 right-2 flex w-full flex-col items-end justify-end self-start md:hidden z-40">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border shadow-sm"
          aria-label="Table of contents"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex flex-col items-end rounded-xl border border-border bg-background p-4 shadow-lg"
            >
              <p className="mb-2 text-xs font-semibold text-muted-foreground">On this page</p>
              {headings.map((heading, index) => {
                const isActive = activeId === heading.href;
                return (
                  <Link
                    className={`group/toc-link relative rounded-lg px-2 py-1 text-right text-sm transition-colors ${
                      heading.level === 3 ? "pr-6" : ""
                    } ${isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    key={`mobile-${heading.href}-${index}`}
                    href={heading.href}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {(hovered === index || isActive) && (
                      <motion.span
                        layoutId="toc-indicator-mobile"
                        className="absolute top-0 right-0 h-full w-1 rounded-tl-full rounded-bl-full bg-primary"
                      />
                    )}
                    <span className="inline-block transition duration-200 group-hover/toc-link:-translate-x-1">
                      {heading.title}
                    </span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export function PostContent({ post, relatedPosts }: PostContentProps) {
  const headings = extractHeadings(post.content);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const { isAdminOnline, isBlocked, isLoading: isChatLoading } = useChatPresence();
  const contentEndRef = useRef<HTMLDivElement>(null);

  // Check if post has an enquiry form configured
  const hasEnquiry = post.survey && post.enquiry_cta_title;

  // Chat is live if admin is online and user is not blocked
  const isChatLive = isAdminOnline && !isBlocked;

  // Show enquiry only if chat is not live (or still loading - show enquiry as fallback)
  const showEnquiry = hasEnquiry && (isChatLoading || !isChatLive);

  // Show chat floating button only when chat is live
  const showChatButton = !isChatLoading && isChatLive;

  // Calendly config for the provider
  const calendlyConfig =
    post.calendly_enabled && post.calendly_scheduling_url && post.calendly_event_type_uri
      ? {
          eventTypeUri: post.calendly_event_type_uri,
          schedulingUrl: post.calendly_scheduling_url,
          postId: post.id,
          ctaTitle: post.calendly_cta_title || "Schedule a Meeting",
          ctaDescription: post.calendly_cta_description,
        }
      : null;

  // LiveChat config for the provider
  const liveChatConfig = {
    postId: post.id,
  };

  return (
    <CalendlyProvider config={calendlyConfig}>
    <LiveChatProvider config={liveChatConfig}>
    <article className="py-8">
      {/* Floating CTA - show enquiry if chat is offline, show chat if live */}
      {showEnquiry && (
        <EnquiryCTAFloating
          ctaTitle={post.enquiry_cta_title!}
          onOpenModal={() => setIsEnquiryModalOpen(true)}
        />
      )}
      {showChatButton && (
        <LiveChatFloatingButton
          postId={post.id}
          title="Chat with us"
          description={post.enquiry_cta_title || undefined}
        />
      )}

      <Container className="max-w-7xl">
        {/* Breadcrumb - Full width above the flex layout */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/${post.category.slug}`}
            className="hover:text-foreground transition-colors"
          >
            {post.category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate">{post.title}</span>
        </nav>

        {/* Main layout with TOC and Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* TOC Sidebar */}
          <TableOfContents headings={headings} contentEndRef={contentEndRef} />

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {/* Header */}
            <header className="mb-8">
              <Badge
                className="mb-4"
                style={{
                  backgroundColor: post.category.color || undefined,
                  color: "white",
                }}
              >
                {post.category.name}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {post.title}
              </h1>

              {post.subtitle && (
                <p className="text-xl text-muted-foreground mb-6">{post.subtitle}</p>
              )}

              {/* Author and meta */}
              <div className="flex items-center gap-4">
                {post.author.avatar_url && (
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {formatDate(post.published_at)}
                      </time>
                    )}
                    {post.read_time_minutes && (
                      <>
                        <span>·</span>
                        <span>{post.read_time_minutes} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
                <Image
                  src={post.featured_image}
                  alt={post.featured_image_alt || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* AI Summary / TL;DR */}
            {post.ai_summary && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-2">TL;DR</h2>
                <p className="text-muted-foreground">{post.ai_summary}</p>
              </div>
            )}

            {/* Key Takeaways */}
            {post.key_takeaways && post.key_takeaways.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Key Takeaways</h2>
                <ul className="space-y-2">
                  {post.key_takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Content */}
            <div className="prose dark:prose-invert max-w-none mb-8 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeRaw]}
                components={markdownMediaComponents}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Inline Enquiry CTA - only show when chat is offline */}
            {showEnquiry && (
              <EnquiryCTAInline
                ctaTitle={post.enquiry_cta_title!}
                onOpenModal={() => setIsEnquiryModalOpen(true)}
              />
            )}

            {/* Marker for TOC visibility - hides TOC when this enters viewport */}
            <div ref={contentEndRef} aria-hidden="true" />

            {/* FAQs */}
            {post.faqs && post.faqs.length > 0 && (
              <section className="border-t border-border pt-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {post.faqs.map((faq) => (
                    <div key={faq.id}>
                      <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}>
                    <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Sources */}
            {post.sources && post.sources.length > 0 && (
              <section className="border-t border-border pt-8 mb-8">
                <h2 className="text-lg font-semibold mb-4">Sources & References</h2>
                <ul className="space-y-2">
                  {post.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Author Bio */}
            {post.author.bio && (
              <section className="bg-muted/50 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  {post.author.avatar_url && (
                    <Image
                      src={post.author.avatar_url}
                      alt={post.author.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1">About {post.author.name}</h3>
                    <p className="text-muted-foreground text-sm">{post.author.bio}</p>
                    {post.author.expertise && post.author.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.author.expertise.map((exp, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <RelatedPosts category={post.category} posts={relatedPosts} />
            )}
          </div>
        </div>
      </Container>

      {/* Enquiry Modal */}
      {hasEnquiry && (
        <EnquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          survey={post.survey!}
          postId={post.id}
          ctaTitle={post.enquiry_cta_title!}
        />
      )}

      {/* Calendly Booking Modal */}
      <CalendlyBookingModal />
    </article>
    </LiveChatProvider>
    </CalendlyProvider>
  );
}
