import { redirect } from "next/navigation";
import { getCurrentAuthor } from "@/lib/supabase/auth";
import { getAllCategories, getAllTags } from "@/lib/supabase/queries/admin";
import { PostForm } from "@/components/admin/post-form";

export default async function NewPostPage() {
  const author = await getCurrentAuthor();

  if (!author) {
    redirect("/login");
  }

  const [categories, tags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ]);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          No Categories Available
        </h1>
        <p className="text-muted-foreground mb-4">
          You need to create at least one category before creating a post.
        </p>
        <a
          href="/admin/categories"
          className="text-primary hover:underline"
        >
          Create a category
        </a>
      </div>
    );
  }

  return <PostForm categories={categories} tags={tags} authorId={author.id} />;
}
