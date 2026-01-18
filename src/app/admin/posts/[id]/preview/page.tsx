import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getPostById } from "@/lib/supabase/queries/admin";
import { PostContent } from "@/components/blog/post-content";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-yellow-500 text-yellow-900 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">Preview Mode</span>
          <span className="text-sm opacity-75">
            This post is not published yet
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="bg-white/90">
            <Link href={`/admin/posts/${id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="bg-white/90">
            <Link href="/admin/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <PostContent post={post} />
    </div>
  );
}
