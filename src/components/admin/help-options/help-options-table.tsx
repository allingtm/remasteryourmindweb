"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HelpOptionWithPost } from "@/types";

interface HelpOptionsTableProps {
  helpOptions: HelpOptionWithPost[];
}

export function HelpOptionsTable({ helpOptions }: HelpOptionsTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this help option?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/help-options/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete help option");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting help option:", error);
      alert("Failed to delete help option");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (option: HelpOptionWithPost) => {
    setTogglingId(option.id);
    try {
      const response = await fetch("/api/admin/help-options/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: option.id, is_active: !option.is_active }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to update help option status");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating help option status:", error);
      alert("Failed to update help option status");
    } finally {
      setTogglingId(null);
    }
  };

  if (helpOptions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground mb-4">No help options found</p>
        <Link href="/admin/help-options/new">
          <Button>Create Your First Help Option</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground w-8">
              #
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Text
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Linked Article
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {helpOptions.map((option, index) => (
            <tr
              key={option.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-3 px-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  {index + 1}
                </div>
              </td>
              <td className="py-3 px-4">
                <Link
                  href={`/admin/help-options/${option.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {option.text}
                </Link>
                {option.description && (
                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                    {option.description}
                  </p>
                )}
                {option.color && (
                  <div className="flex items-center gap-1 mt-1">
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {option.color}
                    </span>
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{option.post?.title || "Unknown"}</span>
                  {option.post?.slug && (
                    <Link
                      href={`/${option.post.slug}`}
                      target="_blank"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleToggleStatus(option)}
                  disabled={togglingId === option.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    option.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {option.is_active ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                  {option.is_active ? "active" : "inactive"}
                </button>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/help-options/${option.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(option.id)}
                    disabled={deletingId === option.id}
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
