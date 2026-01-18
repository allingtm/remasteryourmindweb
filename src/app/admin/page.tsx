import Link from "next/link";
import { FileText, FolderOpen, Tags, Plus, Eye } from "lucide-react";
import { getPostCounts, getRecentPosts, getAllCategories, getAllTags } from "@/lib/supabase/queries/admin";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function AdminDashboardPage() {
  const [postCounts, recentPosts, categories, tags] = await Promise.all([
    getPostCounts(),
    getRecentPosts(5),
    getAllCategories(),
    getAllTags(),
  ]);

  const stats = [
    {
      name: "Total Posts",
      value: postCounts.total,
      icon: FileText,
      href: "/admin/posts",
    },
    {
      name: "Published",
      value: postCounts.published,
      icon: Eye,
      href: "/admin/posts?status=published",
    },
    {
      name: "Categories",
      value: categories.length,
      icon: FolderOpen,
      href: "/admin/categories",
    },
    {
      name: "Tags",
      value: tags.length,
      icon: Tags,
      href: "/admin/tags",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <ButtonLink href="/admin/posts/new">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </ButtonLink>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-background rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Post Status Breakdown */}
      <div className="bg-background rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Posts by Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/admin/posts?status=draft"
            className="text-center p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {postCounts.draft}
            </p>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </Link>
          <Link
            href="/admin/posts?status=published"
            className="text-center p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {postCounts.published}
            </p>
            <p className="text-sm text-muted-foreground">Published</p>
          </Link>
          <Link
            href="/admin/posts?status=scheduled"
            className="text-center p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {postCounts.scheduled}
            </p>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </Link>
          <Link
            href="/admin/posts?status=archived"
            className="text-center p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
              {postCounts.archived}
            </p>
            <p className="text-sm text-muted-foreground">Archived</p>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-background rounded-lg border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Posts
          </h2>
          <ButtonLink href="/admin/posts" variant="ghost" size="sm">
            View all
          </ButtonLink>
        </div>
        <div className="divide-y divide-border">
          {recentPosts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No posts yet</p>
              <ButtonLink href="/admin/posts/new" variant="link" className="mt-2">
                Create your first post
              </ButtonLink>
            </div>
          ) : (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {post.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {post.category?.name} &middot;{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={post.status} className="ml-4" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
