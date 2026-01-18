import { notFound } from "next/navigation";
import { HelpOptionForm } from "@/components/admin/help-options";
import { getHelpOptionById, getAllPublishedPosts } from "@/lib/supabase/queries/help-options";

export const metadata = {
  title: "Edit Help Option - Admin",
};

interface EditHelpOptionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHelpOptionPage({ params }: EditHelpOptionPageProps) {
  const { id } = await params;

  const [helpOption, posts] = await Promise.all([
    getHelpOptionById(id),
    getAllPublishedPosts(),
  ]);

  if (!helpOption) {
    notFound();
  }

  return <HelpOptionForm helpOption={helpOption} posts={posts} />;
}
