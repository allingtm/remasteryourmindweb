import { getLatestPosts } from "@/lib/supabase/queries";
import { siteConfig } from "@/lib/seo/constants";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const posts = await getLatestPosts(50);

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const formatDate = (date: string | null): string => {
    if (!date) return new Date().toUTCString();
    return new Date(date).toUTCString();
  };

  const rssItems = posts
    .map((post) => {
      const postUrl = `${siteConfig.url}/${post.slug}`;
      const categories = [post.category.name, ...post.tags.map((t) => t.name)];

      // Build content with AI-friendly structure
      let fullContent = "";

      // Add AI summary if available (great for AI citation)
      if (post.ai_summary) {
        fullContent += `<p><strong>Summary:</strong> ${escapeXml(post.ai_summary)}</p>\n`;
      }

      // Add key takeaways if available
      if (post.key_takeaways && post.key_takeaways.length > 0) {
        fullContent += `<p><strong>Key Takeaways:</strong></p>\n<ul>\n`;
        post.key_takeaways.forEach((takeaway) => {
          fullContent += `<li>${escapeXml(takeaway)}</li>\n`;
        });
        fullContent += `</ul>\n`;
      }

      // Add main content
      if (post.content) {
        fullContent += `<div>${escapeXml(post.content)}</div>`;
      }

      // Add FAQs if available (structured Q&A for AI)
      if (post.faqs && post.faqs.length > 0) {
        fullContent += `\n<h2>Frequently Asked Questions</h2>\n`;
        post.faqs.forEach((faq) => {
          fullContent += `<p><strong>Q: ${escapeXml(faq.question)}</strong></p>\n`;
          fullContent += `<p>A: ${escapeXml(faq.answer)}</p>\n`;
        });
      }

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.meta_description || post.excerpt || post.subtitle || "")}</description>
      <content:encoded><![CDATA[${fullContent}]]></content:encoded>
      <pubDate>${formatDate(post.published_at)}</pubDate>
      <author>${siteConfig.email} (${escapeXml(post.author.name)})</author>
${categories.map((cat) => `      <category>${escapeXml(cat)}</category>`).join("\n")}
      ${post.featured_image ? `<enclosure url="${escapeXml(post.featured_image)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteConfig.url}/logo.png</url>
      <title>${escapeXml(siteConfig.name)}</title>
      <link>${siteConfig.url}</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} ${escapeXml(siteConfig.name)}</copyright>
    <managingEditor>${siteConfig.email} (${escapeXml(siteConfig.name)})</managingEditor>
    <webMaster>${siteConfig.email} (${escapeXml(siteConfig.name)})</webMaster>
    <ttl>60</ttl>
${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
