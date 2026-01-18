"use client";

import type { Components } from "react-markdown";
import { MarkdownTable } from "./markdown-table";

// Table component wrapper for ReactMarkdown
export const markdownTableComponents = {
  table: MarkdownTable,
} as Partial<Components>;
