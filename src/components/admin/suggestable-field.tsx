"use client";

import { useState } from "react";
import { FieldSuggestionButton } from "./field-suggestion-button";
import { FieldSuggestionModal } from "./field-suggestion-modal";
import { getFieldConfig } from "@/lib/ai/field-configs";
import type { SuggestableFieldName } from "@/lib/ai/types";

interface SuggestableFieldProps {
  fieldName: SuggestableFieldName;
  currentValue: string;
  blogTitle: string;
  blogContent: string;
  onSuggestionSelect: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SuggestableField({
  fieldName,
  currentValue,
  blogTitle,
  blogContent,
  onSuggestionSelect,
  disabled,
  className,
}: SuggestableFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fieldConfig = getFieldConfig(fieldName);

  return (
    <>
      <FieldSuggestionButton
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || blogContent.length < 50}
        className={className}
      />
      <FieldSuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fieldConfig={fieldConfig}
        currentValue={currentValue}
        blogTitle={blogTitle}
        blogContent={blogContent}
        onSelect={onSuggestionSelect}
      />
    </>
  );
}
