"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, CircleDot, CheckCircle, Archive } from "lucide-react";
import { EnquiriesTable } from "@/components/admin/enquiries/enquiries-table";
import { EnquiryFilters } from "@/components/admin/enquiries/enquiry-filters";
import type { EnquiryWithRelations, Survey } from "@/types";

interface EnquiryCounts {
  total: number;
  new: number;
  read: number;
  archived: number;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryWithRelations[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [counts, setCounts] = useState<EnquiryCounts>({
    total: 0,
    new: 0,
    read: 0,
    archived: 0,
  });
  const [filters, setFilters] = useState<{
    surveyId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.surveyId) params.set("surveyId", filters.surveyId);
      if (filters.status) params.set("status", filters.status);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const [enquiriesRes, surveysRes] = await Promise.all([
        fetch(`/api/admin/enquiries?${params.toString()}`),
        fetch("/api/admin/surveys"),
      ]);

      if (enquiriesRes.ok) {
        const data = await enquiriesRes.json();
        setEnquiries(data.enquiries);
        setCounts(data.counts);
      }

      if (surveysRes.ok) {
        const data = await surveysRes.json();
        setSurveys(data.surveys);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/enquiries/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: filters.surveyId,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to export enquiries");
        return;
      }

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enquiries-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export enquiries");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">
          View and manage form submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <CircleDot className="h-4 w-4" />
            <span className="text-sm">New</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{counts.new}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Read</span>
          </div>
          <p className="text-2xl font-bold">{counts.read}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Archive className="h-4 w-4" />
            <span className="text-sm">Archived</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{counts.archived}</p>
        </div>
      </div>

      {/* Filters */}
      <EnquiryFilters
        surveys={surveys}
        onFilterChange={setFilters}
        onExport={handleExport}
      />

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <EnquiriesTable enquiries={enquiries} onRefresh={fetchData} />
        )}
      </div>
    </div>
  );
}
