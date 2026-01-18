"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Archive, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnquiryDetailModal } from "./enquiry-detail-modal";
import type { EnquiryWithRelations, Survey } from "@/types";

interface EnquiriesTableProps {
  enquiries: EnquiryWithRelations[];
  onRefresh: () => void;
}

const statusColors = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  read: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  archived: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusIcons = {
  new: Circle,
  read: CheckCircle,
  archived: Archive,
};

export function EnquiriesTable({ enquiries, onRefresh }: EnquiriesTableProps) {
  const router = useRouter();
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryWithRelations | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === enquiries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(enquiries.map((e) => e.id)));
    }
  };

  const handleBulkStatusChange = async (status: "new" | "read" | "archived") => {
    if (selectedIds.size === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update enquiries");
      }

      setSelectedIds(new Set());
      onRefresh();
    } catch (error) {
      console.error("Error updating enquiries:", error);
      alert("Failed to update enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Delete ${selectedIds.size} enquiries? This cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete enquiries");
      }

      setSelectedIds(new Set());
      onRefresh();
    } catch (error) {
      console.error("Error deleting enquiries:", error);
      alert("Failed to delete enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: "new" | "read" | "archived") => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update enquiry status");
      }

      onRefresh();
    } catch (error) {
      console.error("Error updating enquiry:", error);
      alert("Failed to update enquiry status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete enquiry");
      }

      setSelectedEnquiry(null);
      onRefresh();
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      alert("Failed to delete enquiry");
    }
  };

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No enquiries found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Enquiries will appear here when visitors submit forms
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg mb-4">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusChange("read")}
            disabled={isLoading}
          >
            Mark as Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusChange("archived")}
            disabled={isLoading}
          >
            Archive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-12 py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedIds.size === enquiries.length}
                  onChange={toggleSelectAll}
                  className="rounded border-input"
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Survey
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Respondent
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Post
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Date
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => {
              const StatusIcon = statusIcons[enquiry.status];
              return (
                <tr
                  key={enquiry.id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    enquiry.status === "new" ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(enquiry.id)}
                      onChange={() => toggleSelect(enquiry.id)}
                      className="rounded border-input"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">
                      {enquiry.survey?.name || "Unknown"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      {enquiry.respondent_name && (
                        <p className="font-medium">{enquiry.respondent_name}</p>
                      )}
                      {enquiry.respondent_email && (
                        <p className="text-sm text-muted-foreground">
                          {enquiry.respondent_email}
                        </p>
                      )}
                      {!enquiry.respondent_name && !enquiry.respondent_email && (
                        <span className="text-muted-foreground">Anonymous</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {enquiry.post ? (
                      <span className="text-sm truncate max-w-[200px] block">
                        {enquiry.post.title}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusColors[enquiry.status]
                      }`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedEnquiry(enquiry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onStatusChange={(status) => {
            handleStatusChange(selectedEnquiry.id, status);
            setSelectedEnquiry({ ...selectedEnquiry, status });
          }}
          onDelete={() => handleDelete(selectedEnquiry.id)}
        />
      )}
    </>
  );
}
