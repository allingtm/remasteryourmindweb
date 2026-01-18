import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpOptionsTable } from "@/components/admin/help-options";
import { getAllHelpOptions, getHelpOptionCounts } from "@/lib/supabase/queries/help-options";

export const metadata = {
  title: "Help Options - Admin",
};

export default async function HelpOptionsPage() {
  const [helpOptions, counts] = await Promise.all([
    getAllHelpOptions(),
    getHelpOptionCounts(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Help Options</h1>
          <p className="text-muted-foreground">
            Manage the lead capture helper options shown on the homepage
          </p>
        </div>
        <Link href="/admin/help-options/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Help Option
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Options</p>
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

      {/* Info box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Help options link to lead articles, which are hidden from regular blog listings.
          When creating a new article for a help option, make sure to mark it as a &quot;Lead article&quot; in the post editor.
        </p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <HelpOptionsTable helpOptions={helpOptions} />
      </div>
    </div>
  );
}
