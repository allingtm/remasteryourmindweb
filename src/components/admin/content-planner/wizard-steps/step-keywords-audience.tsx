"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeywordResearch, AudienceAnalysis, SearchIntent, KnowledgeLevel } from "@/types/content-planner";
import { ArrowLeft, ArrowRight, Search, Users, Plus, X, RefreshCw } from "lucide-react";
import { useState } from "react";

interface StepKeywordsAudienceProps {
  keywords: KeywordResearch | null;
  audience: AudienceAnalysis | null;
  onKeywordsChange: (keywords: KeywordResearch) => void;
  onAudienceChange: (audience: AudienceAnalysis) => void;
  onBack: () => void;
  onNext: () => void;
  onRegenerate?: () => void;
  isLoading: boolean;
}

export function StepKeywordsAudience({
  keywords,
  audience,
  onKeywordsChange,
  onAudienceChange,
  onBack,
  onNext,
  onRegenerate,
  isLoading,
}: StepKeywordsAudienceProps) {
  const [newSecondaryKeyword, setNewSecondaryKeyword] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [newMotivation, setNewMotivation] = useState("");

  if (!keywords || !audience) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const addSecondaryKeyword = () => {
    if (newSecondaryKeyword.trim()) {
      onKeywordsChange({
        ...keywords,
        secondaryKeywords: [...keywords.secondaryKeywords, newSecondaryKeyword.trim()],
      });
      setNewSecondaryKeyword("");
    }
  };

  const removeSecondaryKeyword = (index: number) => {
    onKeywordsChange({
      ...keywords,
      secondaryKeywords: keywords.secondaryKeywords.filter((_, i) => i !== index),
    });
  };

  const addProblem = () => {
    if (newProblem.trim()) {
      onAudienceChange({
        ...audience,
        problemsToSolve: [...audience.problemsToSolve, newProblem.trim()],
      });
      setNewProblem("");
    }
  };

  const removeProblem = (index: number) => {
    onAudienceChange({
      ...audience,
      problemsToSolve: audience.problemsToSolve.filter((_, i) => i !== index),
    });
  };

  const addMotivation = () => {
    if (newMotivation.trim()) {
      onAudienceChange({
        ...audience,
        motivations: [...audience.motivations, newMotivation.trim()],
      });
      setNewMotivation("");
    }
  };

  const removeMotivation = (index: number) => {
    onAudienceChange({
      ...audience,
      motivations: audience.motivations.filter((_, i) => i !== index),
    });
  };

  const intentColors: Record<SearchIntent, string> = {
    informational: "bg-blue-100 text-blue-800",
    transactional: "bg-green-100 text-green-800",
    navigational: "bg-purple-100 text-purple-800",
    commercial: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Search className="h-5 w-5" />
            Keywords & Audience
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
          Review the keyword research and audience analysis. Adjust as needed.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Keywords Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-4 w-4" />
              Keyword Research
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Keyword */}
            <div className="space-y-2">
              <Label htmlFor="primaryKeyword">Primary Keyword</Label>
              <Input
                id="primaryKeyword"
                value={keywords.primaryKeyword}
                onChange={(e) => onKeywordsChange({ ...keywords, primaryKeyword: e.target.value })}
              />
            </div>

            {/* Secondary Keywords */}
            <div className="space-y-2">
              <Label>Secondary Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {keywords.secondaryKeywords.map((kw, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {kw}
                    <button onClick={() => removeSecondaryKeyword(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword..."
                  value={newSecondaryKeyword}
                  onChange={(e) => setNewSecondaryKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSecondaryKeyword()}
                  className="text-sm"
                />
                <Button size="sm" variant="outline" onClick={addSecondaryKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Intent */}
            <div className="space-y-2">
              <Label>Search Intent</Label>
              <Select
                value={keywords.searchIntent}
                onValueChange={(value) =>
                  onKeywordsChange({ ...keywords, searchIntent: value as SearchIntent })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informational">Informational</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="navigational">Navigational</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={intentColors[keywords.searchIntent]}>
                {keywords.searchIntent}
              </Badge>
              <p className="text-xs text-muted-foreground">{keywords.intentExplanation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Audience Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Persona */}
            <div className="space-y-2">
              <Label htmlFor="persona">Reader Persona</Label>
              <Textarea
                id="persona"
                value={audience.personaDescription}
                onChange={(e) =>
                  onAudienceChange({ ...audience, personaDescription: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>

            {/* Knowledge Level */}
            <div className="space-y-2">
              <Label>Knowledge Level</Label>
              <Select
                value={audience.knowledgeLevel}
                onValueChange={(value) =>
                  onAudienceChange({ ...audience, knowledgeLevel: value as KnowledgeLevel })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Problems to Solve */}
            <div className="space-y-2">
              <Label>Problems to Solve</Label>
              <ul className="space-y-1">
                {audience.problemsToSolve.map((problem, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">• {problem}</span>
                    <button
                      onClick={() => removeProblem(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input
                  placeholder="Add problem..."
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addProblem()}
                  className="text-sm"
                />
                <Button size="sm" variant="outline" onClick={addProblem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Motivations */}
            <div className="space-y-2">
              <Label>Motivations</Label>
              <ul className="space-y-1">
                {audience.motivations.map((motivation, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">• {motivation}</span>
                    <button
                      onClick={() => removeMotivation(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input
                  placeholder="Add motivation..."
                  value={newMotivation}
                  onChange={(e) => setNewMotivation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMotivation()}
                  className="text-sm"
                />
                <Button size="sm" variant="outline" onClick={addMotivation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading} size="lg">
          {isLoading ? "Analyzing..." : "Analyze Competition"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
