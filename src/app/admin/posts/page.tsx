import { Plus } from "lucide-react";
import { getAllPosts } from "@/lib/supabase/queries/admin";
import { ButtonLink } from "@/components/ui/button-link";
import { PostsTable } from "@/components/admin/posts-table";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const { posts, total } = await getAllPosts({ status, limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Posts</h1>
        <ButtonLink href="/admin/posts/new">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </ButtonLink>
      </div>

      <PostsTable posts={posts} total={total} />
    </div>
  );
}
