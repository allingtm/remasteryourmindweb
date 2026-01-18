"use client";

import { useState } from "react";
import { Search, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Survey, BlogPost } from "@/types";

interface EnquiryFiltersProps {
  surveys: Survey[];
  onFilterChange: (filters: {
    surveyId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  onExport: () => void;
}

export function EnquiryFilters({
  surveys,
  onFilterChange,
  onExport,
}: EnquiryFiltersProps) {
  const [filters, setFilters] = useState({
    surveyId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange({
      surveyId: newFilters.surveyId || undefined,
      status: newFilters.status || undefined,
      dateFrom: newFilters.dateFrom || undefined,
      dateTo: newFilters.dateTo || undefined,
    });
  };

  const handleClear = () => {
    const clearedFilters = {
      surveyId: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(clearedFilters);
    onFilterChange({});
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Survey Filter */}
      <div className="flex-1 min-w-[180px]">
        <select
          value={filters.surveyId}
          onChange={(e) => handleChange("surveyId", e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Surveys</option>
          {surveys.map((survey) => (
            <option key={survey.id} value={survey.id}>
              {survey.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="min-w-[140px]">
        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleChange("dateFrom", e.target.value)}
          className="h-9 w-36"
          placeholder="From"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleChange("dateTo", e.target.value)}
          className="h-9 w-36"
          placeholder="To"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
