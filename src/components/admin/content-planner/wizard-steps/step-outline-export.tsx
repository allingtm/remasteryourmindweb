"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpSheetOutline, OutlineSection } from "@/types/content-planner";
import {
  ArrowLeft,
  List,
  Copy,
  Download,
  CheckCircle,
  Plus,
  X,
  GripVertical,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";

interface StepOutlineExportProps {
  outline: HelpSheetOutline | null;
  compiledHelpSheet: string;
  onOutlineChange: (outline: HelpSheetOutline) => void;
  onCompile: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onBack: () => void;
  onStartNew: () => void;
  onRegenerate?: () => void;
  isLoading: boolean;
}

export function StepOutlineExport({
  outline,
  compiledHelpSheet,
  onOutlineChange,
  onCompile,
  onCopy,
  onDownload,
  onBack,
  onStartNew,
  onRegenerate,
  isLoading,
}: StepOutlineExportProps) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [newKeyPoint, setNewKeyPoint] = useState("");

  // Auto-calculate total word count from sections
  const calculatedTotalWordCount = useMemo(() => {
    if (!outline) return 0;
    return outline.sections.reduce((sum, s) => sum + s.suggestedWordCount, 0);
  }, [outline]);

  if (!outline) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const handleCopy = async () => {
    await onCopy();
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const updateSection = (id: string, updates: Partial<OutlineSection>) => {
    onOutlineChange({
      ...outline,
      sections: outline.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const removeSection = (id: string) => {
    const newSections = outline.sections.filter((s) => s.id !== id);
    onOutlineChange({
      ...outline,
      sections: newSections,
      totalWordCount: newSections.reduce((sum, s) => sum + s.suggestedWordCount, 0),
    });
  };

  const addSection = () => {
    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      heading: "New Section",
      purpose: "",
      keyPoints: [],
      evidencePlacement: "",
      suggestedWordCount: 300,
    };
    const newSections = [...outline.sections, newSection];
    onOutlineChange({
      ...outline,
      sections: newSections,
      totalWordCount: newSections.reduce((sum, s) => sum + s.suggestedWordCount, 0),
    });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= outline.sections.length) return;

    const newSections = [...outline.sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    onOutlineChange({
      ...outline,
      sections: newSections,
    });
  };

  const addKeyPoint = (sectionId: string) => {
    if (newKeyPoint.trim()) {
      const section = outline.sections.find((s) => s.id === sectionId);
      if (section) {
        updateSection(sectionId, {
          keyPoints: [...section.keyPoints, newKeyPoint.trim()],
        });
      }
      setNewKeyPoint("");
    }
  };

  const removeKeyPoint = (sectionId: string, index: number) => {
    const section = outline.sections.find((s) => s.id === sectionId);
    if (section) {
      updateSection(sectionId, {
        keyPoints: section.keyPoints.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <List className="h-5 w-5" />
            Article Outline & Export
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
          Review the outline, make adjustments, then export your complete help sheet.
        </p>
      </div>

      {/* Outline Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <span className="text-sm text-muted-foreground">Sections:</span>
          <span className="ml-2 font-medium">{outline.sections.length}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Target Words:</span>
          <span className="ml-2 font-medium">~{calculatedTotalWordCount}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Est. Read Time:</span>
          <span className="ml-2 font-medium">{Math.ceil(calculatedTotalWordCount / 200)} min</span>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {outline.sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => moveSection(index, "up")}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => moveSection(index, "down")}
                    disabled={index === outline.sections.length - 1}
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <Input
                      value={section.heading}
                      onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                      className="font-medium"
                    />
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      ~{section.suggestedWordCount} words
                    </Badge>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remove section"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === section.id ? null : section.id)
                }
                className="text-sm text-blue-600 hover:underline"
              >
                {expandedSection === section.id ? "Hide details" : "Show details"}
              </button>

              {expandedSection === section.id && (
                <div className="space-y-3 pt-2">
                  {/* Purpose */}
                  <div className="space-y-1">
                    <Label className="text-xs">Purpose</Label>
                    <Textarea
                      value={section.purpose}
                      onChange={(e) => updateSection(section.id, { purpose: e.target.value })}
                      className="text-sm min-h-[60px]"
                    />
                  </div>

                  {/* Key Points */}
                  <div className="space-y-1">
                    <Label className="text-xs">Key Points</Label>
                    <ul className="space-y-1">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="flex-1">• {point}</span>
                          <button
                            onClick={() => removeKeyPoint(section.id, i)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add key point..."
                        value={expandedSection === section.id ? newKeyPoint : ""}
                        onChange={(e) => setNewKeyPoint(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addKeyPoint(section.id)}
                        className="text-sm"
                      />
                      <Button size="sm" variant="outline" onClick={() => addKeyPoint(section.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Evidence Placement */}
                  <div className="space-y-1">
                    <Label className="text-xs">Evidence Placement</Label>
                    <Input
                      value={section.evidencePlacement}
                      onChange={(e) =>
                        updateSection(section.id, { evidencePlacement: e.target.value })
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* Word Count */}
                  <div className="space-y-1">
                    <Label className="text-xs">Suggested Word Count</Label>
                    <Input
                      type="number"
                      value={section.suggestedWordCount}
                      onChange={(e) =>
                        updateSection(section.id, {
                          suggestedWordCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-sm w-32"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addSection} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Export Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Export Help Sheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onCompile} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Compile Help Sheet
          </Button>

          {compiledHelpSheet && (
            <>
              <div className="relative">
                <Textarea
                  value={compiledHelpSheet}
                  readOnly
                  className="min-h-[200px] font-mono text-xs"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCopy} variant="outline" className="flex-1">
                  {copiedToClipboard ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button onClick={onDownload} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download .md
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onStartNew} variant="default" size="lg">
          Start New Plan
        </Button>
      </div>
    </div>
  );
}
