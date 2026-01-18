import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/supabase/queries/admin";
import { CategoryForm } from "@/components/admin/category-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;

  // Handle "new" route
  if (id === "new") {
    return <CategoryForm />;
  }

  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return <CategoryForm category={category} />;
}
