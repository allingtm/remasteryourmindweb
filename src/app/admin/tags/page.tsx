import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { getAllTags } from "@/lib/supabase/queries/admin";
import { ButtonLink } from "@/components/ui/button-link";

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tags</h1>
        <ButtonLink href="/admin/tags/new">
          <Plus className="h-4 w-4 mr-2" />
          New Tag
        </ButtonLink>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        {tags.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No tags yet</p>
            <ButtonLink href="/admin/tags/new" variant="link" className="mt-2">
              Create your first tag
            </ButtonLink>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tags/${tag.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {tag.name}
                      </Link>
                      <p className="text-sm text-muted-foreground sm:hidden">
                        {tag.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {tag.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell max-w-xs truncate">
                      {tag.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ButtonLink href={`/tag/${tag.slug}`} variant="ghost" size="icon" external>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </ButtonLink>
                        <ButtonLink href={`/admin/tags/${tag.id}`} variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </ButtonLink>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
