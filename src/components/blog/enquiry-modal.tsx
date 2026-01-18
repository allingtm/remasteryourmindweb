"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SurveyWrapper } from "./survey-wrapper";
import type { Survey } from "@/types";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey;
  postId: string;
  ctaTitle: string;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export function EnquiryModal({
  isOpen,
  onClose,
  survey,
  postId,
  ctaTitle,
}: EnquiryModalProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(async (data: Record<string, unknown>) => {
    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: survey.id,
          post_id: postId,
          response_data: data,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to submit enquiry");
      }

      setSubmitState("success");
    } catch (error) {
      console.error("Enquiry submission error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit. Please try again.");
      setSubmitState("error");
    }
  }, [survey.id, postId]);

  const handleClose = () => {
    // Reset state when closing
    setSubmitState("idle");
    setErrorMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold">{ctaTitle}</h2>
              {survey.description && (
                <p className="text-sm text-muted-foreground">
                  {survey.description}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {submitState === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-6">
                  We've received your enquiry and will be in touch soon.
                </p>
                <Button onClick={handleClose}>Close</Button>
              </motion.div>
            ) : submitState === "submitting" ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Submitting your enquiry...</p>
              </div>
            ) : (
              <>
                {submitState === "error" && errorMessage && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <SurveyWrapper
                  jsonDefinition={survey.json_definition}
                  onComplete={handleSubmit}
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
