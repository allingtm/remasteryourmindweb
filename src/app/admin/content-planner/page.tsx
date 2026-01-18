import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentPlannerWizard } from "@/components/admin/content-planner";

export const metadata = {
  title: "Content Planner | Admin",
  description: "Plan your content with AI-powered research and outlining",
};

export default async function ContentPlannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Planner</h1>
        <p className="text-muted-foreground mt-2">
          Get AI-powered research and planning to help you write better content.
        </p>
      </div>

      <ContentPlannerWizard />
    </div>
  );
}
