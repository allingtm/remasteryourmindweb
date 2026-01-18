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
    if (!date) return new Date().toISOString();
    return new Date(date).toISOString();
  };

  const atomEntries = posts
    .map((post) => {
      const postUrl = `${siteConfig.url}/${post.slug}`;
      const categories = [post.category.name, ...post.tags.map((t) => t.name)];

      // Use excerpt or AI summary - full content available via direct page crawl
      const summary = post.excerpt || post.ai_summary || post.subtitle || "";

      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html"/>
    <id>${postUrl}</id>
    <published>${formatDate(post.published_at)}</published>
    <updated>${formatDate(post.updated_at || post.published_at)}</updated>
    <author>
      <name>${escapeXml(post.author.name)}</name>
      <email>${siteConfig.email}</email>
    </author>
    <summary type="text">${escapeXml(summary)}</summary>
    <content type="html"><![CDATA[${escapeXml(summary)}]]></content>
${categories.map((cat) => `    <category term="${escapeXml(cat)}"/>`).join("\n")}
  </entry>`;
    })
    .join("\n");

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.name)}</title>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <link href="${siteConfig.url}/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${siteConfig.url}" rel="alternate" type="text/html"/>
  <id>${siteConfig.url}/</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>${escapeXml(siteConfig.name)}</name>
    <email>${siteConfig.email}</email>
  </author>
  <rights>Copyright ${new Date().getFullYear()} ${escapeXml(siteConfig.name)}</rights>
  <icon>${siteConfig.url}/favicon.png</icon>
  <logo>${siteConfig.url}/logo.png</logo>
${atomEntries}
</feed>`;

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
