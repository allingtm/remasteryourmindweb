"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SurveyPreview } from "./survey-preview";
import type { Survey } from "@/types";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" /> }
);

interface SurveyFormProps {
  survey?: Survey;
}

const DEFAULT_SURVEY_JSON = {
  title: "Contact Form",
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "text",
          name: "name",
          title: "Your Name",
          isRequired: true,
        },
        {
          type: "text",
          name: "email",
          title: "Email Address",
          isRequired: true,
          inputType: "email",
        },
        {
          type: "comment",
          name: "message",
          title: "Your Message",
          isRequired: true,
        },
      ],
    },
  ],
  showQuestionNumbers: false,
  completeText: "Submit",
};

export function SurveyForm({ survey }: SurveyFormProps) {
  const router = useRouter();
  const isEditing = !!survey;

  const [formData, setFormData] = useState({
    name: survey?.name || "",
    slug: survey?.slug || "",
    description: survey?.description || "",
    status: survey?.status || "active",
  });

  const [jsonDefinition, setJsonDefinition] = useState<Record<string, unknown>>(
    survey?.json_definition || DEFAULT_SURVEY_JSON
  );
  const [jsonString, setJsonString] = useState(
    JSON.stringify(survey?.json_definition || DEFAULT_SURVEY_JSON, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleJsonChange = useCallback((value: string | undefined) => {
    const newValue = value || "";
    setJsonString(newValue);

    try {
      const parsed = JSON.parse(newValue);
      setJsonDefinition(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (jsonError) {
      alert("Please fix the JSON errors before saving");
      return;
    }

    if (!formData.name || !formData.slug) {
      alert("Name and slug are required");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        json_definition: jsonDefinition,
      };

      const url = isEditing
        ? `/api/admin/surveys/${survey.id}`
        : "/api/admin/surveys";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save survey");
      }

      router.push("/admin/surveys");
      router.refresh();
    } catch (error) {
      console.error("Error saving survey:", error);
      alert(error instanceof Error ? error.message : "Failed to save survey");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!survey) return;

    if (!confirm("Are you sure you want to delete this survey? This cannot be undone.")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/surveys/${survey.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete survey");
      }

      router.push("/admin/surveys");
      router.refresh();
    } catch (error) {
      console.error("Error deleting survey:", error);
      alert(error instanceof Error ? error.message : "Failed to delete survey");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Survey" : "New Survey"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your survey configuration"
              : "Create a new SurveyJS form"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !!jsonError}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Survey"}
          </Button>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-card rounded-lg border border-border">
        <div className="space-y-2">
          <Label htmlFor="name">Survey Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Contact Form"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            placeholder="contact-form"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="A brief description of this survey..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as "active" | "inactive",
              }))
            }
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* JSON Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Survey JSON Definition</Label>
            <a
              href="https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              SurveyJS Documentation
            </a>
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <MonacoEditor
              height="500px"
              language="json"
              value={jsonString}
              onChange={handleJsonChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: "on",
                wordWrap: "on",
                formatOnPaste: true,
                automaticLayout: true,
              }}
              theme="vs-dark"
            />
          </div>
          {jsonError && (
            <p className="text-sm text-destructive">JSON Error: {jsonError}</p>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Preview</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>
          {showPreview && <SurveyPreview jsonDefinition={jsonDefinition} />}
        </div>
      </div>
    </form>
  );
}
