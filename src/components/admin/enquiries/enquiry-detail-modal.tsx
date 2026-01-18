"use client";

import { useState } from "react";
import { X, Mail, Calendar, Globe, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnquiryWithRelations } from "@/types";

interface EnquiryDetailModalProps {
  enquiry: EnquiryWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: "new" | "read" | "archived") => void;
  onDelete: () => void;
}

export function EnquiryDetailModal({
  enquiry,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: EnquiryDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this enquiry?")) {
      return;
    }
    setIsDeleting(true);
    onDelete();
  };

  const formatValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") {
      return (
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Enquiry Details</h2>
            <p className="text-sm text-muted-foreground">
              {enquiry.survey?.name || "Unknown Survey"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {enquiry.respondent_name && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{enquiry.respondent_name}</span>
              </div>
            )}
            {enquiry.respondent_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${enquiry.respondent_email}`}
                  className="text-primary hover:underline"
                >
                  {enquiry.respondent_email}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(enquiry.created_at).toLocaleString()}</span>
            </div>
            {enquiry.post && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{enquiry.post.title}</span>
              </div>
            )}
            {enquiry.source_url && (
              <div className="flex items-center gap-2 col-span-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate text-muted-foreground">
                  {enquiry.source_url}
                </span>
              </div>
            )}
          </div>

          {/* Response data */}
          <div>
            <h3 className="font-medium mb-3">Response Data</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(enquiry.response_data).map(([key, value]) => (
                    <tr key={key} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 bg-muted/50 font-medium text-sm w-1/3">
                        {key}
                      </td>
                      <td className="px-4 py-2 text-sm">{formatValue(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <select
              value={enquiry.status}
              onChange={(e) =>
                onStatusChange(e.target.value as "new" | "read" | "archived")
              }
              className="h-8 px-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
