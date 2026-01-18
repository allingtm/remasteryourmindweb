"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Survey } from "@/types";

interface SurveysTableProps {
  surveys: Survey[];
}

export function SurveysTable({ surveys }: SurveysTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/surveys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete survey");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting survey:", error);
      alert("Failed to delete survey");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (survey: Survey) => {
    const newStatus = survey.status === "active" ? "inactive" : "active";

    try {
      const response = await fetch(`/api/admin/surveys/${survey.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to update survey status");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating survey status:", error);
      alert("Failed to update survey status");
    }
  };

  if (surveys.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground mb-4">No surveys found</p>
        <Link href="/admin/surveys/new">
          <Button>Create Your First Survey</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Name
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Slug
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Created
            </th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey) => (
            <tr
              key={survey.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-3 px-4">
                <Link
                  href={`/admin/surveys/${survey.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {survey.name}
                </Link>
                {survey.description && (
                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                    {survey.description}
                  </p>
                )}
              </td>
              <td className="py-3 px-4 text-muted-foreground font-mono text-sm">
                {survey.slug}
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleToggleStatus(survey)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    survey.status === "active"
                      ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {survey.status === "active" ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                  {survey.status}
                </button>
              </td>
              <td className="py-3 px-4 text-muted-foreground text-sm">
                {new Date(survey.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/surveys/${survey.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(survey.id)}
                    disabled={deletingId === survey.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
