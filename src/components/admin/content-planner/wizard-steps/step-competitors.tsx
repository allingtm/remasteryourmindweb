"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitiveAnalysis, CompetitorResult } from "@/types/content-planner";
import { ArrowLeft, ArrowRight, Globe, Lightbulb, AlertTriangle, CheckCircle, Plus, X, ExternalLink, RefreshCw, Link } from "lucide-react";
import { useState } from "react";

interface StepCompetitorsProps {
  competitors: CompetitiveAnalysis | null;
  customUrls: string[];
  onCompetitorsChange: (competitors: CompetitiveAnalysis) => void;
  onCustomUrlsChange: (urls: string[]) => void;
  onBack: () => void;
  onNext: () => void;
  onRegenerate?: () => void;
  isLoading: boolean;
}

export function StepCompetitors({
  competitors,
  customUrls,
  onCompetitorsChange,
  onCustomUrlsChange,
  onBack,
  onNext,
  onRegenerate,
  isLoading,
}: StepCompetitorsProps) {
  const [newCommonAngle, setNewCommonAngle] = useState("");
  const [newContentGap, setNewContentGap] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [newCustomUrl, setNewCustomUrl] = useState("");

  // Ensure customUrls is always an array (for backwards compatibility with saved state)
  const safeCustomUrls = customUrls || [];

  if (!competitors) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-52 w-full" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const addCustomUrl = () => {
    const trimmed = newCustomUrl.trim();
    if (trimmed && !safeCustomUrls.includes(trimmed)) {
      onCustomUrlsChange([...safeCustomUrls, trimmed]);
      setNewCustomUrl("");
    }
  };

  const removeCustomUrl = (index: number) => {
    onCustomUrlsChange(safeCustomUrls.filter((_, i) => i !== index));
  };

  const addCommonAngle = () => {
    if (newCommonAngle.trim()) {
      onCompetitorsChange({
        ...competitors,
        commonAngles: [...competitors.commonAngles, newCommonAngle.trim()],
      });
      setNewCommonAngle("");
    }
  };

  const removeCommonAngle = (index: number) => {
    onCompetitorsChange({
      ...competitors,
      commonAngles: competitors.commonAngles.filter((_, i) => i !== index),
    });
  };

  const addContentGap = () => {
    if (newContentGap.trim()) {
      onCompetitorsChange({
        ...competitors,
        contentGaps: [...competitors.contentGaps, newContentGap.trim()],
      });
      setNewContentGap("");
    }
  };

  const removeContentGap = (index: number) => {
    onCompetitorsChange({
      ...competitors,
      contentGaps: competitors.contentGaps.filter((_, i) => i !== index),
    });
  };

  const addPattern = () => {
    if (newPattern.trim()) {
      onCompetitorsChange({
        ...competitors,
        workingPatterns: [...competitors.workingPatterns, newPattern.trim()],
      });
      setNewPattern("");
    }
  };

  const removePattern = (index: number) => {
    onCompetitorsChange({
      ...competitors,
      workingPatterns: competitors.workingPatterns.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Competitive Analysis
          </h2>
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Review what&apos;s already out there and identify your unique angle.
        </p>
      </div>

      {/* Custom URLs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link className="h-4 w-4" />
            Add Competitor URLs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {safeCustomUrls.length > 0 && (
            <ul className="space-y-2">
              {safeCustomUrls.map((url, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-blue-600 hover:underline truncate"
                  >
                    {url}
                  </a>
                  <button
                    onClick={() => removeCustomUrl(index)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Remove URL"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/competitor-article"
              value={newCustomUrl}
              onChange={(e) => setNewCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomUrl()}
              className="text-sm"
            />
            <Button size="sm" variant="outline" onClick={addCustomUrl} type="button" title="Add URL">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add specific competitor URLs you want analyzed. These will be included in the next regeneration.
          </p>
        </CardContent>
      </Card>

      {/* Search Results */}
      {competitors.searchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-50 overflow-y-auto">
              {competitors.searchResults.map((result, index) => (
                <div key={index} className="text-sm border-b pb-2 last:border-0">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {result.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-muted-foreground text-xs mt-1">{result.snippet}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Common Angles (to avoid) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Common Angles (Avoid Rehashing)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              {competitors.commonAngles.map((angle, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="flex-1">• {angle}</span>
                  <button
                    onClick={() => removeCommonAngle(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                placeholder="Add common angle..."
                value={newCommonAngle}
                onChange={(e) => setNewCommonAngle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCommonAngle()}
                className="text-sm"
              />
              <Button size="sm" variant="outline" onClick={addCommonAngle} type="button" title="Add common angle">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Gaps (opportunities) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              Content Gaps (Opportunities)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              {competitors.contentGaps.map((gap, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="flex-1">• {gap}</span>
                  <button
                    onClick={() => removeContentGap(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                placeholder="Add content gap..."
                value={newContentGap}
                onChange={(e) => setNewContentGap(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addContentGap()}
                className="text-sm"
              />
              <Button size="sm" variant="outline" onClick={addContentGap} type="button" title="Add content gap">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Working Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Working Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {competitors.workingPatterns.map((pattern, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="flex-1">• {pattern}</span>
                <button
                  onClick={() => removePattern(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              placeholder="Add pattern..."
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPattern()}
              className="text-sm"
            />
            <Button size="sm" variant="outline" onClick={addPattern} type="button" title="Add pattern">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unique Angle Recommendation */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            Recommended Unique Angle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={competitors.uniqueAngleRecommendation}
            onChange={(e) =>
              onCompetitorsChange({ ...competitors, uniqueAngleRecommendation: e.target.value })
            }
            placeholder="Your unique perspective or angle..."
            className="min-h-20"
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading} size="lg">
          {isLoading ? "Gathering..." : "Gather Sources"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
