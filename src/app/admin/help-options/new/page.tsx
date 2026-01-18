import { HelpOptionForm } from "@/components/admin/help-options";
import { getAllPublishedPosts } from "@/lib/supabase/queries/help-options";

export const metadata = {
  title: "New Help Option - Admin",
};

export default async function NewHelpOptionPage() {
  const posts = await getAllPublishedPosts();

  return <HelpOptionForm posts={posts} />;
}
