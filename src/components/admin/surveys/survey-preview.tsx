"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { getSurveyTheme } from "@/lib/surveyjs/theme";

interface SurveyPreviewProps {
  jsonDefinition: Record<string, unknown>;
}

export function SurveyPreview({ jsonDefinition }: SurveyPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [SurveyComponent, setSurveyComponent] = useState<React.ComponentType<{ model: unknown }> | null>(null);
  const [surveyModel, setSurveyModel] = useState<unknown>(null);

  useEffect(() => {
    async function loadSurvey() {
      try {
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
        model.mode = "display"; // Read-only preview

        setSurveyComponent(() => Survey);
        setSurveyModel(model);
      } catch (err) {
        console.error("SurveyJS error:", err);
        setError(err instanceof Error ? err.message : "Failed to load survey preview");
      }
    }

    if (jsonDefinition && Object.keys(jsonDefinition).length > 0) {
      loadSurvey();
    } else {
      setSurveyModel(null);
      setError(null);
    }
  }, [jsonDefinition]);

  if (!jsonDefinition || Object.keys(jsonDefinition).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">
          Add a survey JSON definition to see the preview
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Invalid Survey JSON</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (!SurveyComponent || !surveyModel) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
        <div className="animate-pulse text-muted-foreground">
          Loading preview...
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <SurveyComponent model={surveyModel} />
    </div>
  );
}
