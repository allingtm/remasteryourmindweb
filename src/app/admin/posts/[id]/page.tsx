import { redirect, notFound } from "next/navigation";
import { getCurrentAuthor } from "@/lib/supabase/auth";
import { getPostById, getAllCategories, getAllTags } from "@/lib/supabase/queries/admin";
import { PostForm } from "@/components/admin/post-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const author = await getCurrentAuthor();

  if (!author) {
    redirect("/login");
  }

  const [post, categories, tags] = await Promise.all([
    getPostById(id),
    getAllCategories(),
    getAllTags(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <PostForm
      post={post}
      categories={categories}
      tags={tags}
      authorId={author.id}
    />
  );
}
