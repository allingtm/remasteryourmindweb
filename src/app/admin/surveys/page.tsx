import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurveysTable } from "@/components/admin/surveys/surveys-table";
import { getAllSurveys, getSurveyCounts } from "@/lib/supabase/queries/surveys";

export const metadata = {
  title: "Surveys - Admin",
};

export default async function SurveysPage() {
  const [{ surveys }, counts] = await Promise.all([
    getAllSurveys(),
    getSurveyCounts(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surveys</h1>
          <p className="text-muted-foreground">
            Manage your SurveyJS form definitions
          </p>
        </div>
        <Link href="/admin/surveys/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Survey
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Surveys</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{counts.active}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold text-gray-500">{counts.inactive}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <SurveysTable surveys={surveys} />
      </div>
    </div>
  );
}
