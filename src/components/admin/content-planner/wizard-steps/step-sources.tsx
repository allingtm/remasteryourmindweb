"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SourcesResearch, ResearchItem, generateResearchItemId } from "@/types/content-planner";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BarChart3,
  Users,
  Award,
  HelpCircle,
  Plus,
  X,
  Check,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import { useState } from "react";

interface StepSourcesProps {
  sources: SourcesResearch | null;
  onSourcesChange: (sources: SourcesResearch) => void;
  onBack: () => void;
  onNext: () => void;
  onRegenerate?: () => void;
  isLoading: boolean;
}

function ResearchChecklist({
  title,
  icon: Icon,
  items,
  onToggle,
  onRemove,
  onAdd,
  onNotesChange,
  placeholder,
}: {
  title: string;
  icon: React.ElementType;
  items: ResearchItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (description: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem("");
    }
  };

  const copyToNotes = (id: string, summary: string) => {
    onNotesChange(id, summary);
    onToggle(id); // Also mark as found
  };

  // Count items with AI findings
  const aiFoundCount = items.filter((item) => item.aiFindings?.sources?.length).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
          {aiFoundCount > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {aiFoundCount} AI results
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-2">
              {/* Main item row */}
              <div className="flex items-start gap-2">
                <button
                  onClick={() => onToggle(item.id)}
                  className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center ${
                    item.found
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {item.found && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1">
                  <span
                    className={`text-sm cursor-pointer ${item.found ? "line-through text-muted-foreground" : ""}`}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    {item.description}
                  </span>
                  {/* AI findings indicator */}
                  {item.aiFindings && item.aiFindings.sources.length > 0 && (
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="ml-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    >
                      {expandedId === item.id ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      <Sparkles className="h-3 w-3 ml-1" />
                      AI found {item.aiFindings.sources.length} source{item.aiFindings.sources.length !== 1 ? "s" : ""}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Expanded section with AI findings and notes */}
              {expandedId === item.id && (
                <div className="ml-7 space-y-3">
                  {/* AI Findings */}
                  {item.aiFindings && item.aiFindings.sources.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-800">
                          <Sparkles className="h-3 w-3" />
                          AI Research Summary
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => copyToNotes(item.id, item.aiFindings!.summary)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Use this
                        </Button>
                      </div>
                      <p className="text-sm text-blue-900">{item.aiFindings.summary}</p>

                      {/* Source links */}
                      <div className="pt-2 border-t border-blue-200">
                        <div className="text-xs font-medium text-blue-700 mb-1">Sources:</div>
                        <ul className="space-y-1">
                          {item.aiFindings.sources.map((source, idx) => (
                            <li key={idx} className="text-xs">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {source.title.length > 60 ? source.title.substring(0, 60) + "..." : source.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Notes input */}
                  <Input
                    placeholder="Add your own notes..."
                    value={item.notes || ""}
                    onChange={(e) => onNotesChange(item.id, e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="text-sm"
          />
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function StepSources({
  sources,
  onSourcesChange,
  onBack,
  onNext,
  onRegenerate,
  isLoading,
}: StepSourcesProps) {
  if (!sources) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">AI is researching your topic...</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Searching for statistics, expert sources, and answers to research questions.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    );
  }

  const updateItems = (
    field: keyof SourcesResearch,
    updater: (items: ResearchItem[]) => ResearchItem[]
  ) => {
    onSourcesChange({
      ...sources,
      [field]: updater(sources[field] as ResearchItem[]),
    });
  };

  const toggleItem = (field: keyof SourcesResearch, id: string) => {
    updateItems(field, (items) =>
      items.map((item) => (item.id === id ? { ...item, found: !item.found } : item))
    );
  };

  const removeItem = (field: keyof SourcesResearch, id: string) => {
    updateItems(field, (items) => items.filter((item) => item.id !== id));
  };

  const addItem = (field: keyof SourcesResearch, description: string) => {
    updateItems(field, (items) => [
      ...items,
      { id: generateResearchItemId(), description, found: false },
    ]);
  };

  const updateNotes = (field: keyof SourcesResearch, id: string, notes: string) => {
    updateItems(field, (items) =>
      items.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  // Calculate completion stats
  const allItems = [
    ...sources.statsToFind,
    ...sources.expertTypesNeeded,
    ...sources.credibilityBoosters,
    ...sources.researchQuestions,
  ];
  const completedCount = allItems.filter((item) => item.found).length;
  const totalCount = allItems.length;
  const aiFoundCount = allItems.filter((item) => item.aiFindings?.sources?.length).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sources & Research
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
          AI has searched for relevant data. Expand items to see findings and sources.
        </p>
        <div className="flex items-center gap-4 text-sm">
          {totalCount > 0 && (
            <div>
              <span className="font-medium">{completedCount}</span>
              <span className="text-muted-foreground"> of {totalCount} verified</span>
            </div>
          )}
          {aiFoundCount > 0 && (
            <div className="flex items-center gap-1 text-blue-600">
              <Sparkles className="h-3 w-3" />
              <span>{aiFoundCount} with AI findings</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ResearchChecklist
          title="Statistics to Find"
          icon={BarChart3}
          items={sources.statsToFind}
          onToggle={(id) => toggleItem("statsToFind", id)}
          onRemove={(id) => removeItem("statsToFind", id)}
          onAdd={(desc) => addItem("statsToFind", desc)}
          onNotesChange={(id, notes) => updateNotes("statsToFind", id, notes)}
          placeholder="Add statistic to find..."
        />

        <ResearchChecklist
          title="Expert Sources"
          icon={Users}
          items={sources.expertTypesNeeded}
          onToggle={(id) => toggleItem("expertTypesNeeded", id)}
          onRemove={(id) => removeItem("expertTypesNeeded", id)}
          onAdd={(desc) => addItem("expertTypesNeeded", desc)}
          onNotesChange={(id, notes) => updateNotes("expertTypesNeeded", id, notes)}
          placeholder="Add expert source type..."
        />

        <ResearchChecklist
          title="Credibility Boosters"
          icon={Award}
          items={sources.credibilityBoosters}
          onToggle={(id) => toggleItem("credibilityBoosters", id)}
          onRemove={(id) => removeItem("credibilityBoosters", id)}
          onAdd={(desc) => addItem("credibilityBoosters", desc)}
          onNotesChange={(id, notes) => updateNotes("credibilityBoosters", id, notes)}
          placeholder="Add credibility booster..."
        />

        <ResearchChecklist
          title="Research Questions"
          icon={HelpCircle}
          items={sources.researchQuestions}
          onToggle={(id) => toggleItem("researchQuestions", id)}
          onRemove={(id) => removeItem("researchQuestions", id)}
          onAdd={(desc) => addItem("researchQuestions", desc)}
          onNotesChange={(id, notes) => updateNotes("researchQuestions", id, notes)}
          placeholder="Add research question..."
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading} size="lg">
          {isLoading ? "Generating..." : "Generate Outline"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
