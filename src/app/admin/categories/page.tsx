import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, Home } from "lucide-react";
import { getAllCategories } from "@/lib/supabase/queries/admin";
import { ButtonLink } from "@/components/ui/button-link";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <ButtonLink href="/admin/categories/new">
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </ButtonLink>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No categories yet</p>
            <ButtonLink href="/admin/categories/new" variant="link" className="mt-2">
              Create your first category
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
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Order
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Visibility
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || "#3b82f6" }}
                        />
                        <div>
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {category.name}
                          </Link>
                          <p className="text-sm text-muted-foreground sm:hidden">
                            /{category.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      /{category.slug}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground hidden md:table-cell">
                      {category.display_order}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        {category.show_in_nav ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Eye className="h-3 w-3" /> Nav
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <EyeOff className="h-3 w-3" /> Nav
                          </span>
                        )}
                        {category.show_on_homepage ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Home className="h-3 w-3" /> Home
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Home className="h-3 w-3" /> Home
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ButtonLink href={`/${category.slug}`} variant="ghost" size="icon" external>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </ButtonLink>
                        <ButtonLink href={`/admin/categories/${category.id}`} variant="ghost" size="icon">
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
