"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./progress-indicator";
import { StepInput } from "./wizard-steps/step-input";
import { StepBrief } from "./wizard-steps/step-brief";
import { StepKeywordsAudience } from "./wizard-steps/step-keywords-audience";
import { StepCompetitors } from "./wizard-steps/step-competitors";
import { StepSources } from "./wizard-steps/step-sources";
import { StepOutlineExport } from "./wizard-steps/step-outline-export";
import {
  ContentPlannerWizardState,
  INITIAL_CONTENT_PLANNER_STATE,
  ContentPlannerInput,
  BriefAnalysis,
  KeywordResearch,
  AudienceAnalysis,
  CompetitiveAnalysis,
  SourcesResearch,
  HelpSheetOutline,
  compileHelpSheet,
} from "@/types/content-planner";
import { Trash2 } from "lucide-react";

const STORAGE_KEY = "content-planner-wizard-state";

export function ContentPlannerWizard() {
  const [state, setState] = useState<ContentPlannerWizardState>(INITIAL_CONTENT_PLANNER_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore state but reset loading and error
        setState({
          ...parsed,
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error("Failed to restore content planner state:", err);
    }
    setIsHydrated(true);
  }, []);

  // Save state to localStorage on change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        // Don't persist loading/error state
        const toSave = {
          ...state,
          isLoading: false,
          error: null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (err) {
        console.error("Failed to save content planner state:", err);
      }
    }
  }, [state, isHydrated]);

  // Auto-compile when reaching step 6 with all data
  useEffect(() => {
    if (
      state.currentStep === 6 &&
      state.brief &&
      state.keywords &&
      state.audience &&
      state.competitors &&
      state.sources &&
      state.outline &&
      !state.compiledHelpSheet
    ) {
      const compiled = compileHelpSheet(state);
      setState((prev) => ({ ...prev, compiledHelpSheet: compiled }));
    }
  }, [state.currentStep, state.brief, state.keywords, state.audience, state.competitors, state.sources, state.outline, state.compiledHelpSheet]);

  // Clear saved progress
  const clearSavedProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_CONTENT_PLANNER_STATE);
  }, []);

  // Navigation
  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
  }, []);

  // Step 1: Input
  const updateInput = useCallback((input: ContentPlannerInput) => {
    setState((prev) => ({ ...prev, input }));
  }, []);

  // Step 1 -> Step 2: Analyze brief
  const analyzeBrief = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/admin/content-planner/analyze-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent: state.input.sourceContent,
          workingTitle: state.input.workingTitle,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze brief");
      }

      setState((prev) => ({
        ...prev,
        brief: result.brief,
        isLoading: false,
      }));

      nextStep();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to analyze brief",
      }));
    }
  }, [state.input.sourceContent, state.input.workingTitle, nextStep]);

  // Step 2: Update brief
  const updateBrief = useCallback((brief: BriefAnalysis) => {
    setState((prev) => ({ ...prev, brief }));
  }, []);

  // Step 2 -> Step 3: Research keywords and analyze audience
  const researchKeywordsAndAudience = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Brief not available" }));
      return;
    }

    try {
      // Run both requests in parallel
      const [keywordsResponse, audienceResponse] = await Promise.all([
        fetch("/api/admin/content-planner/research-keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: {
              coreMessage: state.brief.coreMessage,
              inScope: state.brief.inScope,
              desiredOutcome: state.brief.desiredOutcome,
            },
            workingTitle: state.input.workingTitle,
            seoImportant: state.input.seoImportant,
          }),
        }),
        fetch("/api/admin/content-planner/analyze-audience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: {
              coreMessage: state.brief.coreMessage,
              inScope: state.brief.inScope,
              desiredOutcome: state.brief.desiredOutcome,
            },
            workingTitle: state.input.workingTitle,
            targetAudience: state.input.targetAudience,
          }),
        }),
      ]);

      const keywordsResult = await keywordsResponse.json();
      const audienceResult = await audienceResponse.json();

      if (!keywordsResponse.ok) {
        throw new Error(keywordsResult.error || "Failed to research keywords");
      }
      if (!audienceResponse.ok) {
        throw new Error(audienceResult.error || "Failed to analyze audience");
      }

      setState((prev) => ({
        ...prev,
        keywords: keywordsResult.keywords,
        audience: audienceResult.audience,
        isLoading: false,
      }));

      nextStep();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to research keywords and audience",
      }));
    }
  }, [state.brief, state.input.workingTitle, state.input.seoImportant, state.input.targetAudience, nextStep]);

  // Step 3: Update keywords and audience
  const updateKeywords = useCallback((keywords: KeywordResearch) => {
    setState((prev) => ({ ...prev, keywords }));
  }, []);

  const updateAudience = useCallback((audience: AudienceAnalysis) => {
    setState((prev) => ({ ...prev, audience }));
  }, []);

  // Step 3 -> Step 4: Analyze competitors
  const analyzeCompetitors = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief || !state.keywords) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Brief or keywords not available" }));
      return;
    }

    try {
      const response = await fetch("/api/admin/content-planner/analyze-competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: {
            coreMessage: state.brief.coreMessage,
            inScope: state.brief.inScope,
          },
          keywords: {
            primaryKeyword: state.keywords.primaryKeyword,
            secondaryKeywords: state.keywords.secondaryKeywords,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze competitors");
      }

      setState((prev) => ({
        ...prev,
        competitors: result.competitors,
        isLoading: false,
      }));

      nextStep();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to analyze competitors",
      }));
    }
  }, [state.brief, state.keywords, nextStep]);

  // Step 4: Update competitors
  const updateCompetitors = useCallback((competitors: CompetitiveAnalysis) => {
    setState((prev) => ({ ...prev, competitors }));
  }, []);

  // Step 4: Update custom URLs
  const updateCustomUrls = useCallback((urls: string[]) => {
    setState((prev) => ({ ...prev, customCompetitorUrls: urls }));
  }, []);

  // Regenerate functions (call the same API but don't advance step)
  const regenerateBrief = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/admin/content-planner/analyze-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent: state.input.sourceContent,
          workingTitle: state.input.workingTitle,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze brief");
      }

      setState((prev) => ({
        ...prev,
        brief: result.brief,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to regenerate brief",
      }));
    }
  }, [state.input.sourceContent, state.input.workingTitle]);

  const regenerateKeywordsAndAudience = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Brief not available" }));
      return;
    }

    try {
      const [keywordsResponse, audienceResponse] = await Promise.all([
        fetch("/api/admin/content-planner/research-keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: {
              coreMessage: state.brief.coreMessage,
              inScope: state.brief.inScope,
              desiredOutcome: state.brief.desiredOutcome,
            },
            workingTitle: state.input.workingTitle,
            seoImportant: state.input.seoImportant,
          }),
        }),
        fetch("/api/admin/content-planner/analyze-audience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: {
              coreMessage: state.brief.coreMessage,
              inScope: state.brief.inScope,
              desiredOutcome: state.brief.desiredOutcome,
            },
            workingTitle: state.input.workingTitle,
            targetAudience: state.input.targetAudience,
          }),
        }),
      ]);

      const keywordsResult = await keywordsResponse.json();
      const audienceResult = await audienceResponse.json();

      if (!keywordsResponse.ok) {
        throw new Error(keywordsResult.error || "Failed to research keywords");
      }
      if (!audienceResponse.ok) {
        throw new Error(audienceResult.error || "Failed to analyze audience");
      }

      setState((prev) => ({
        ...prev,
        keywords: keywordsResult.keywords,
        audience: audienceResult.audience,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to regenerate keywords and audience",
      }));
    }
  }, [state.brief, state.input.workingTitle, state.input.seoImportant, state.input.targetAudience]);

  const regenerateCompetitors = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief || !state.keywords) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Brief or keywords not available" }));
      return;
    }

    try {
      const response = await fetch("/api/admin/content-planner/analyze-competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: {
            coreMessage: state.brief.coreMessage,
            inScope: state.brief.inScope,
          },
          keywords: {
            primaryKeyword: state.keywords.primaryKeyword,
            secondaryKeywords: state.keywords.secondaryKeywords,
          },
          customUrls: state.customCompetitorUrls,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze competitors");
      }

      setState((prev) => ({
        ...prev,
        competitors: result.competitors,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to regenerate competitors",
      }));
    }
  }, [state.brief, state.keywords, state.customCompetitorUrls]);

  const regenerateSources = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief || !state.audience || !state.competitors) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Brief, audience, or competitors not available",
      }));
      return;
    }

    try {
      const response = await fetch("/api/admin/content-planner/gather-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: {
            coreMessage: state.brief.coreMessage,
            inScope: state.brief.inScope,
          },
          audience: {
            personaDescription: state.audience.personaDescription,
            problemsToSolve: state.audience.problemsToSolve,
          },
          competitors: {
            contentGaps: state.competitors.contentGaps,
            uniqueAngleRecommendation: state.competitors.uniqueAngleRecommendation,
          },
          primaryKeyword: state.keywords?.primaryKeyword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to gather sources");
      }

      setState((prev) => ({
        ...prev,
        sources: result.sources,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to regenerate sources",
      }));
    }
  }, [state.brief, state.audience, state.competitors, state.keywords]);

  const regenerateOutline = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief || !state.keywords || !state.audience || !state.competitors || !state.sources) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Missing required data",
      }));
      return;
    }

    try {
      const response = await fetch("/api/admin/content-planner/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workingTitle: state.input.workingTitle,
          brief: {
            coreMessage: state.brief.coreMessage,
            inScope: state.brief.inScope,
            formatRecommendation: state.brief.formatRecommendation,
          },
          keywords: {
            primaryKeyword: state.keywords.primaryKeyword,
            searchIntent: state.keywords.searchIntent,
          },
          audience: {
            personaDescription: state.audience.personaDescription,
            knowledgeLevel: state.audience.knowledgeLevel,
            problemsToSolve: state.audience.problemsToSolve,
          },
          competitors: {
            uniqueAngleRecommendation: state.competitors.uniqueAngleRecommendation,
            workingPatterns: state.competitors.workingPatterns,
          },
          sources: {
            statsToFind: state.sources.statsToFind.map((s) => ({
              description: s.description,
              aiSummary: s.aiFindings?.summary,
              sources: s.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
            researchQuestions: state.sources.researchQuestions.map((q) => ({
              description: q.description,
              aiSummary: q.aiFindings?.summary,
              sources: q.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
            expertTypesNeeded: state.sources.expertTypesNeeded.map((e) => ({
              description: e.description,
              aiSummary: e.aiFindings?.summary,
              sources: e.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
            credibilityBoosters: state.sources.credibilityBoosters.map((c) => ({
              description: c.description,
              aiSummary: c.aiFindings?.summary,
              sources: c.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate outline");
      }

      setState((prev) => ({
        ...prev,
        outline: result.outline,
        compiledHelpSheet: "", // Reset compiled so it auto-compiles again
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to regenerate outline",
      }));
    }
  }, [
    state.input.workingTitle,
    state.brief,
    state.keywords,
    state.audience,
    state.competitors,
    state.sources,
  ]);

  // Step 4 -> Step 5: Gather sources
  const gatherSources = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief || !state.audience || !state.competitors) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Brief, audience, or competitors not available",
      }));
      return;
    }

    try {
      const response = await fetch("/api/admin/content-planner/gather-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: {
            coreMessage: state.brief.coreMessage,
            inScope: state.brief.inScope,
          },
          audience: {
            personaDescription: state.audience.personaDescription,
            problemsToSolve: state.audience.problemsToSolve,
          },
          competitors: {
            contentGaps: state.competitors.contentGaps,
            uniqueAngleRecommendation: state.competitors.uniqueAngleRecommendation,
          },
          primaryKeyword: state.keywords?.primaryKeyword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to gather sources");
      }

      setState((prev) => ({
        ...prev,
        sources: result.sources,
        isLoading: false,
      }));

      nextStep();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to gather sources",
      }));
    }
  }, [state.brief, state.audience, state.competitors, state.keywords, nextStep]);

  // Step 5: Update sources
  const updateSources = useCallback((sources: SourcesResearch) => {
    setState((prev) => ({ ...prev, sources }));
  }, []);

  // Step 5 -> Step 6: Generate outline
  const generateOutline = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.brief || !state.keywords || !state.audience || !state.competitors || !state.sources) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Missing required data",
      }));
      return;
    }

    try {
      const response = await fetch("/api/admin/content-planner/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workingTitle: state.input.workingTitle,
          brief: {
            coreMessage: state.brief.coreMessage,
            inScope: state.brief.inScope,
            formatRecommendation: state.brief.formatRecommendation,
          },
          keywords: {
            primaryKeyword: state.keywords.primaryKeyword,
            searchIntent: state.keywords.searchIntent,
          },
          audience: {
            personaDescription: state.audience.personaDescription,
            knowledgeLevel: state.audience.knowledgeLevel,
            problemsToSolve: state.audience.problemsToSolve,
          },
          competitors: {
            uniqueAngleRecommendation: state.competitors.uniqueAngleRecommendation,
            workingPatterns: state.competitors.workingPatterns,
          },
          sources: {
            statsToFind: state.sources.statsToFind.map((s) => ({
              description: s.description,
              aiSummary: s.aiFindings?.summary,
              sources: s.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
            researchQuestions: state.sources.researchQuestions.map((q) => ({
              description: q.description,
              aiSummary: q.aiFindings?.summary,
              sources: q.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
            expertTypesNeeded: state.sources.expertTypesNeeded.map((e) => ({
              description: e.description,
              aiSummary: e.aiFindings?.summary,
              sources: e.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
            credibilityBoosters: state.sources.credibilityBoosters.map((c) => ({
              description: c.description,
              aiSummary: c.aiFindings?.summary,
              sources: c.aiFindings?.sources?.map((src) => ({ title: src.title, url: src.url })),
            })),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate outline");
      }

      setState((prev) => ({
        ...prev,
        outline: result.outline,
        isLoading: false,
      }));

      nextStep();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to generate outline",
      }));
    }
  }, [
    state.input.workingTitle,
    state.brief,
    state.keywords,
    state.audience,
    state.competitors,
    state.sources,
    nextStep,
  ]);

  // Step 6: Update outline
  const updateOutline = useCallback((outline: HelpSheetOutline) => {
    setState((prev) => ({ ...prev, outline }));
  }, []);

  // Compile help sheet
  const compile = useCallback(() => {
    const compiled = compileHelpSheet(state);
    setState((prev) => ({ ...prev, compiledHelpSheet: compiled }));
  }, [state]);

  // Export functions
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(state.compiledHelpSheet);
  }, [state.compiledHelpSheet]);

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([state.compiledHelpSheet], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.input.workingTitle.toLowerCase().replace(/\s+/g, "-")}-help-sheet.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.compiledHelpSheet, state.input.workingTitle]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setState(INITIAL_CONTENT_PLANNER_STATE);
  }, []);

  // Check if there's saved progress to show clear button
  const hasSavedProgress = state.currentStep > 1 || state.input.workingTitle || state.input.sourceContent;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ProgressIndicator currentStep={state.currentStep} onStepClick={goToStep} />
            </div>
            {hasSavedProgress && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSavedProgress}
                className="text-muted-foreground hover:text-destructive"
                title="Clear saved progress"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {state.error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {state.currentStep === 1 && (
            <StepInput
              input={state.input}
              onInputChange={updateInput}
              onNext={analyzeBrief}
              isLoading={state.isLoading}
            />
          )}

          {state.currentStep === 2 && (
            <StepBrief
              brief={state.brief}
              onBriefChange={updateBrief}
              onBack={prevStep}
              onNext={researchKeywordsAndAudience}
              onRegenerate={regenerateBrief}
              isLoading={state.isLoading}
            />
          )}

          {state.currentStep === 3 && (
            <StepKeywordsAudience
              keywords={state.keywords}
              audience={state.audience}
              onKeywordsChange={updateKeywords}
              onAudienceChange={updateAudience}
              onBack={prevStep}
              onNext={analyzeCompetitors}
              onRegenerate={regenerateKeywordsAndAudience}
              isLoading={state.isLoading}
            />
          )}

          {state.currentStep === 4 && (
            <StepCompetitors
              competitors={state.competitors}
              customUrls={state.customCompetitorUrls}
              onCompetitorsChange={updateCompetitors}
              onCustomUrlsChange={updateCustomUrls}
              onBack={prevStep}
              onNext={gatherSources}
              onRegenerate={regenerateCompetitors}
              isLoading={state.isLoading}
            />
          )}

          {state.currentStep === 5 && (
            <StepSources
              sources={state.sources}
              onSourcesChange={updateSources}
              onBack={prevStep}
              onNext={generateOutline}
              onRegenerate={regenerateSources}
              isLoading={state.isLoading}
            />
          )}

          {state.currentStep === 6 && (
            <StepOutlineExport
              outline={state.outline}
              compiledHelpSheet={state.compiledHelpSheet}
              onOutlineChange={updateOutline}
              onCompile={compile}
              onCopy={copyToClipboard}
              onDownload={downloadMarkdown}
              onBack={prevStep}
              onStartNew={resetWizard}
              onRegenerate={regenerateOutline}
              isLoading={state.isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
