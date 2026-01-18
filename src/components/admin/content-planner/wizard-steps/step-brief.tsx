"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BriefAnalysis } from "@/types/content-planner";
import { ArrowLeft, ArrowRight, FileSearch, Plus, X, RefreshCw } from "lucide-react";
import { useState } from "react";

interface StepBriefProps {
  brief: BriefAnalysis | null;
  onBriefChange: (brief: BriefAnalysis) => void;
  onBack: () => void;
  onNext: () => void;
  onRegenerate?: () => void;
  isLoading: boolean;
}

export function StepBrief({ brief, onBriefChange, onBack, onNext, onRegenerate, isLoading }: StepBriefProps) {
  const [newInScope, setNewInScope] = useState("");
  const [newOutOfScope, setNewOutOfScope] = useState("");

  if (!brief) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  const addInScope = () => {
    if (newInScope.trim()) {
      onBriefChange({ ...brief, inScope: [...brief.inScope, newInScope.trim()] });
      setNewInScope("");
    }
  };

  const removeInScope = (index: number) => {
    onBriefChange({ ...brief, inScope: brief.inScope.filter((_, i) => i !== index) });
  };

  const addOutOfScope = () => {
    if (newOutOfScope.trim()) {
      onBriefChange({ ...brief, outOfScope: [...brief.outOfScope, newOutOfScope.trim()] });
      setNewOutOfScope("");
    }
  };

  const removeOutOfScope = (index: number) => {
    onBriefChange({ ...brief, outOfScope: brief.outOfScope.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Brief Analysis
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
          Review and refine the analysis of your content. Edit any field to adjust the direction.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Core Message */}
        <div className="space-y-2">
          <Label htmlFor="coreMessage">Core Message</Label>
          <Textarea
            id="coreMessage"
            value={brief.coreMessage}
            onChange={(e) => onBriefChange({ ...brief, coreMessage: e.target.value })}
            placeholder="The single most important point of this content..."
            className="min-h-[80px]"
          />
        </div>

        {/* In Scope / Out of Scope */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">In Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {brief.inScope.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{item}</span>
                    <button
                      onClick={() => removeInScope(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input
                  placeholder="Add topic..."
                  value={newInScope}
                  onChange={(e) => setNewInScope(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addInScope()}
                  className="text-sm"
                />
                <Button size="sm" variant="outline" onClick={addInScope}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700">Out of Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {brief.outOfScope.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{item}</span>
                    <button
                      onClick={() => removeOutOfScope(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input
                  placeholder="Add exclusion..."
                  value={newOutOfScope}
                  onChange={(e) => setNewOutOfScope(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addOutOfScope()}
                  className="text-sm"
                />
                <Button size="sm" variant="outline" onClick={addOutOfScope}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desired Outcome */}
        <div className="space-y-2">
          <Label htmlFor="desiredOutcome">Desired Outcome</Label>
          <Textarea
            id="desiredOutcome"
            value={brief.desiredOutcome}
            onChange={(e) => onBriefChange({ ...brief, desiredOutcome: e.target.value })}
            placeholder="What should readers think, feel, or do after reading?"
          />
        </div>

        {/* Format Recommendation */}
        <div className="space-y-2">
          <Label htmlFor="format">Format Recommendation</Label>
          <Input
            id="format"
            value={brief.formatRecommendation}
            onChange={(e) => onBriefChange({ ...brief, formatRecommendation: e.target.value })}
            placeholder="e.g., How-to guide, Listicle, Opinion piece..."
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading} size="lg">
          {isLoading ? "Researching..." : "Research Keywords & Audience"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
