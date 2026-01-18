"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
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

interface SemanticSearchProps {
  className?: string;
  onResultClick?: () => void;
}

export function SemanticSearch({ className, onResultClick }: SemanticSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

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
      setIsOpen(true);

      // Debounce search
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
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleResultClick = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    onResultClick?.();
  }, [onResultClick]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const showDropdown = isOpen && (query.length >= 3 || isLoading);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ask a question here..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[400px] overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
          >
            {isLoading && (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            )}

            {error && !isLoading && (
              <div className="p-4 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && results.length === 0 && query.length >= 3 && (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No articles found for "{query}"
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Try different keywords or browse our categories
                </p>
              </div>
            )}

            {!isLoading && !error && results.length > 0 && (
              <div className="p-2">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/${result.slug}`}
                    onClick={handleResultClick}
                    className="flex gap-3 rounded-md p-2 hover:bg-muted transition-colors"
                  >
                    {result.featured_image && (
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded">
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
                      <h4 className="font-medium text-sm line-clamp-1 text-foreground">
                        {result.title}
                      </h4>
                      {result.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {result.excerpt}
                        </p>
                      )}
                      {result.published_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(result.published_at)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
