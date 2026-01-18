import { notFound } from "next/navigation";
import { getTagById } from "@/lib/supabase/queries/admin";
import { TagForm } from "@/components/admin/tag-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTagPage({ params }: PageProps) {
  const { id } = await params;

  const tag = await getTagById(id);

  if (!tag) {
    notFound();
  }

  return <TagForm tag={tag} />;
}
