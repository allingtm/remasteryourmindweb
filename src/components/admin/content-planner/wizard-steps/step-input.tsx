"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContentPlannerInput } from "@/types/content-planner";
import { ArrowRight, FileText, Target } from "lucide-react";

interface StepInputProps {
  input: ContentPlannerInput;
  onInputChange: (input: ContentPlannerInput) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function StepInput({ input, onInputChange, onNext, isLoading }: StepInputProps) {
  const canProceed = input.workingTitle.trim().length > 0 && input.sourceContent.trim().length >= 50;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Input
        </h2>
        <p className="text-sm text-muted-foreground">
          Provide your source material - either a transcript or written brief - and we&apos;ll help
          you plan your content.
        </p>
      </div>

      <div className="space-y-4">
        {/* Working Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Working Title / Topic</Label>
          <Input
            id="title"
            placeholder="e.g., How to Create Content Efficiently as a Busy Business Owner"
            value={input.workingTitle}
            onChange={(e) => onInputChange({ ...input, workingTitle: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            This can be refined later - just give us a starting point.
          </p>
        </div>

        {/* Source Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Source Content (Transcript or Brief)</Label>
          <Textarea
            id="content"
            placeholder="Paste your transcript or write a brief description of what you want to cover..."
            value={input.sourceContent}
            onChange={(e) => onInputChange({ ...input, sourceContent: e.target.value })}
            className="min-h-[200px]"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimum 50 characters</span>
            <span>{input.sourceContent.length} characters</span>
          </div>
        </div>

        {/* Target Audience (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="audience" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Target Audience (Optional)
          </Label>
          <Input
            id="audience"
            placeholder="e.g., Small business owners with limited time for content creation"
            value={input.targetAudience || ""}
            onChange={(e) => onInputChange({ ...input, targetAudience: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            If you have a specific audience in mind, mention them here.
          </p>
        </div>

        {/* SEO Toggle */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <input
            type="checkbox"
            id="seo"
            checked={input.seoImportant}
            onChange={(e) => onInputChange({ ...input, seoImportant: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <div>
            <Label htmlFor="seo" className="cursor-pointer">
              SEO is important for this content
            </Label>
            <p className="text-xs text-muted-foreground">
              We&apos;ll focus on searchable keywords and optimize for search intent.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onNext} disabled={!canProceed || isLoading} size="lg">
          {isLoading ? "Analyzing..." : "Analyze Brief"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
