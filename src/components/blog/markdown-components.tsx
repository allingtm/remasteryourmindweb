"use client";

import type { Components } from "react-markdown";
import { MediaImage, MediaGallery, MediaVideo, MediaAudio } from "./media";
import { markdownTableComponents } from "./markdown-table-components";
import { CalendlyShortcode } from "./calendly-trigger";
import { LiveChatShortcode } from "./live-chat-shortcode";

// Custom component wrapper types
interface MediaImageComponentProps {
  id?: string;
  className?: string;
  sizes?: string;
  showcaption?: string;
}

interface MediaGalleryComponentProps {
  ids?: string;
  columns?: string;
  gap?: string;
  showcaptions?: string;
}

interface MediaVideoComponentProps {
  id?: string;
  autoplay?: string;
  controls?: string;
  loop?: string;
  muted?: string;
  className?: string;
}

interface MediaAudioComponentProps {
  id?: string;
  showwaveform?: string;
  className?: string;
}

interface CalendlyComponentProps {
  title?: string;
  description?: string;
  variant?: string;
  size?: string;
  className?: string;
}

interface LiveChatComponentProps {
  className?: string;
  title?: string;
  description?: string;
}

// Component wrapper for MediaImage that handles string props from HTML
function MediaImageWrapper({ id, className, sizes, showcaption }: MediaImageComponentProps) {
  if (!id) return null;
  return (
    <MediaImage
      id={id}
      className={className}
      sizes={sizes}
      showCaption={showcaption !== "false"}
    />
  );
}

// Component wrapper for MediaGallery
function MediaGalleryWrapper({ ids, columns, gap, showcaptions }: MediaGalleryComponentProps) {
  if (!ids) return null;
  return (
    <MediaGallery
      ids={ids}
      columns={columns ? (parseInt(columns, 10) as 2 | 3 | 4) : 3}
      gap={gap as "sm" | "md" | "lg" | undefined}
      showCaptions={showcaptions === "true"}
    />
  );
}

// Component wrapper for MediaVideo
function MediaVideoWrapper({
  id,
  autoplay,
  controls,
  loop,
  muted,
  className,
}: MediaVideoComponentProps) {
  if (!id) return null;
  return (
    <MediaVideo
      id={id}
      autoplay={autoplay === "true"}
      controls={controls !== "false"}
      loop={loop === "true"}
      muted={muted === "true"}
      className={className}
    />
  );
}

// Component wrapper for MediaAudio
function MediaAudioWrapper({ id, className }: MediaAudioComponentProps) {
  if (!id) return null;
  return <MediaAudio id={id} className={className} />;
}

// Component wrapper for Calendly booking trigger
function CalendlyWrapper({ title, description, variant, size, className }: CalendlyComponentProps) {
  return (
    <CalendlyShortcode
      title={title}
      description={description}
      variant={variant}
      size={size}
      className={className}
    />
  );
}

// Component wrapper for LiveChat widget
function LiveChatWrapper({ className, title, description }: LiveChatComponentProps) {
  return (
    <LiveChatShortcode
      className={className}
      title={title}
      description={description}
    />
  );
}

// Custom paragraph component that unwraps block elements
// This prevents hydration errors when block elements (figure, div) end up inside <p>
function ParagraphWrapper({ children, node }: { children?: React.ReactNode; node?: { children?: Array<{ tagName?: string }> } }) {
  // Check if any child is a block-level element that shouldn't be in a <p>
  const hasBlockChild = node?.children?.some((child) => {
    const tagName = child.tagName?.toLowerCase();
    return tagName && ['figure', 'div', 'mediaimage', 'mediagallery', 'mediavideo', 'mediaaudio', 'calendly', 'livechat', 'table'].includes(tagName);
  });

  // If there's a block child, render as a div instead of p
  if (hasBlockChild) {
    return <div className="my-4">{children}</div>;
  }

  return <p>{children}</p>;
}

// Components map for ReactMarkdown
// These match HTML tag names that can be used in markdown
// Cast to Components since these are custom elements not in the standard HTML spec
export const markdownMediaComponents = {
  // Override paragraph to handle block elements
  p: ParagraphWrapper,
  // PascalCase versions (for JSX-style usage in MDX)
  MediaImage: MediaImageWrapper,
  MediaGallery: MediaGalleryWrapper,
  MediaVideo: MediaVideoWrapper,
  MediaAudio: MediaAudioWrapper,
  // lowercase versions (for HTML-style usage in markdown with rehype-raw)
  mediaimage: MediaImageWrapper,
  mediagallery: MediaGalleryWrapper,
  mediavideo: MediaVideoWrapper,
  mediaaudio: MediaAudioWrapper,
  // Calendly booking trigger shortcode
  Calendly: CalendlyWrapper,
  calendly: CalendlyWrapper,
  // LiveChat widget shortcode
  LiveChat: LiveChatWrapper,
  livechat: LiveChatWrapper,
  // Table components for responsive tables
  ...markdownTableComponents,
} as Partial<Components>;
