"use client";

import { useEffect, useState } from "react";
import { getSurveyTheme } from "@/lib/surveyjs/theme";
import { Loader2 } from "lucide-react";

interface SurveyWrapperProps {
  jsonDefinition: Record<string, unknown>;
  onComplete: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

export function SurveyWrapper({ jsonDefinition, onComplete, onError }: SurveyWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [SurveyComponent, setSurveyComponent] = useState<React.ComponentType<{ model: unknown }> | null>(null);
  const [surveyModel, setSurveyModel] = useState<unknown>(null);

  useEffect(() => {
    async function loadSurvey() {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import SurveyJS
        const [{ Model }, { Survey }] = await Promise.all([
          import("survey-core"),
          import("survey-react-ui"),
        ]);

        // Import default styles
        await import("survey-core/survey-core.min.css");

        // Detect dark mode
        const isDarkMode = document.documentElement.classList.contains("dark");

        // Create model and apply theme
        const model = new Model(jsonDefinition);
        model.applyTheme(getSurveyTheme(isDarkMode));

        // Hide survey title since modal has its own header
        model.showTitle = false;

        // Handle completion
        model.onComplete.add((sender: { data: Record<string, unknown> }) => {
          onComplete(sender.data);
        });

        setSurveyComponent(() => Survey);
        setSurveyModel(model);
        setIsLoading(false);
      } catch (err) {
        console.error("SurveyJS error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load survey";
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
      }
    }

    if (jsonDefinition && Object.keys(jsonDefinition).length > 0) {
      loadSurvey();
    }
  }, [jsonDefinition, onComplete, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Failed to load the form. Please try again later.</p>
      </div>
    );
  }

  if (!SurveyComponent || !surveyModel) {
    return null;
  }

  return (
    <div className="survey-container">
      <SurveyComponent model={surveyModel} />
    </div>
  );
}
