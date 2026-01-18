"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category_name: string | null;
  similarity: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset state when modal closes
      setQuery("");
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
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

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/blog/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        search(value);
      }, 500);
    },
    [search]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    inputRef.current?.focus();
  }, []);

  const handleResultClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm"
        >
          <div className="flex flex-col h-full max-w-2xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center gap-3 py-4 border-b border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask a question like 'I need a mobile app'"
                  value={query}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                <span className="sr-only">Close search</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">
                    Searching...
                  </span>
                </div>
              )}

              {/* Error */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-destructive">{error}</p>
                </div>
              )}

              {/* No results */}
              {!isLoading && !error && hasSearched && results.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No articles found for "{query}"
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try different keywords or browse our categories
                  </p>
                </div>
              )}

              {/* Prompt */}
              {!isLoading && !hasSearched && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    What are you looking for?
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Type at least 3 characters to search
                  </p>
                </div>
              )}

              {/* Results list */}
              {!isLoading && !error && results.length > 0 && (
                <div className="space-y-3">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/${result.slug}`}
                      onClick={handleResultClick}
                      className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
                    >
                      {result.featured_image && (
                        <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={result.featured_image}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {result.category_name && (
                            <Badge variant="secondary" className="text-xs">
                              {result.category_name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {Math.round(result.similarity * 100)}% match
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {result.title}
                        </h3>
                        {result.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {result.excerpt}
                          </p>
                        )}
                        {result.published_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(result.published_at)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="py-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">ESC</kbd> to close
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
