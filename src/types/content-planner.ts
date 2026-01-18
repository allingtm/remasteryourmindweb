// Content Planner Types
// Generates research help sheets for human authors

// ============================================
// Input Types
// ============================================

export interface ContentPlannerInput {
  workingTitle: string;
  sourceContent: string; // transcript or written brief
  targetAudience?: string;
  seoImportant: boolean;
}

// ============================================
// Step 2: Brief Analysis
// ============================================

export interface BriefAnalysis {
  coreMessage: string;
  inScope: string[];
  outOfScope: string[];
  desiredOutcome: string;
  formatRecommendation: string;
}

// ============================================
// Step 3: Keywords & Audience
// ============================================

export type SearchIntent = "informational" | "transactional" | "navigational" | "commercial";

export interface KeywordResearch {
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntent;
  intentExplanation: string;
}

export type KnowledgeLevel = "beginner" | "intermediate" | "expert";

export interface AudienceAnalysis {
  personaDescription: string;
  knowledgeLevel: KnowledgeLevel;
  problemsToSolve: string[];
  motivations: string[];
}

// ============================================
// Step 4: Competitive Analysis
// ============================================

export interface CompetitorResult {
  title: string;
  url: string;
  snippet: string;
}

export interface CompetitiveAnalysis {
  searchResults: CompetitorResult[];
  commonAngles: string[];
  contentGaps: string[];
  workingPatterns: string[];
  uniqueAngleRecommendation: string;
}

// ============================================
// Step 5: Sources & Research
// ============================================

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface ResearchItemFindings {
  summary: string;
  sources: ResearchSource[];
}

export interface ResearchItem {
  id: string;
  description: string;
  found: boolean;
  notes?: string;
  // AI-found data from web search
  aiFindings?: ResearchItemFindings;
}

export interface SourcesResearch {
  statsToFind: ResearchItem[];
  expertTypesNeeded: ResearchItem[];
  credibilityBoosters: ResearchItem[];
  researchQuestions: ResearchItem[];
}

// ============================================
// Step 6: Outline
// ============================================

export interface OutlineSection {
  id: string;
  heading: string;
  purpose: string;
  keyPoints: string[];
  evidencePlacement: string;
  suggestedWordCount: number;
}

export interface HelpSheetOutline {
  sections: OutlineSection[];
  totalWordCount: number;
}

// ============================================
// Complete Help Sheet
// ============================================

export interface AuthorHelpSheet {
  input: ContentPlannerInput;
  brief: BriefAnalysis;
  keywords: KeywordResearch;
  audience: AudienceAnalysis;
  competitors: CompetitiveAnalysis;
  sources: SourcesResearch;
  outline: HelpSheetOutline;
}

// ============================================
// Wizard State
// ============================================

export interface ContentPlannerWizardState {
  currentStep: number;
  isLoading: boolean;
  error: string | null;

  // Step 1: Input
  input: ContentPlannerInput;

  // Step 2: Brief
  brief: BriefAnalysis | null;

  // Step 3: Keywords & Audience
  keywords: KeywordResearch | null;
  audience: AudienceAnalysis | null;

  // Step 4: Competitors
  competitors: CompetitiveAnalysis | null;
  customCompetitorUrls: string[]; // User-provided competitor URLs

  // Step 5: Sources
  sources: SourcesResearch | null;

  // Step 6: Outline
  outline: HelpSheetOutline | null;

  // Final compiled content
  compiledHelpSheet: string;
}

export const INITIAL_CONTENT_PLANNER_STATE: ContentPlannerWizardState = {
  currentStep: 1,
  isLoading: false,
  error: null,

  input: {
    workingTitle: "",
    sourceContent: "",
    targetAudience: "",
    seoImportant: true,
  },

  brief: null,
  keywords: null,
  audience: null,
  competitors: null,
  customCompetitorUrls: [],
  sources: null,
  outline: null,
  compiledHelpSheet: "",
};

// ============================================
// Step Labels
// ============================================

export const CONTENT_PLANNER_STEP_LABELS = [
  "Input",
  "Brief",
  "Keywords & Audience",
  "Competitors",
  "Sources",
  "Outline & Export",
] as const;

// ============================================
// Helper Functions
// ============================================

export function generateResearchItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function compileHelpSheet(state: ContentPlannerWizardState): string {
  const { input, brief, keywords, audience, competitors, sources, outline } = state;

  if (!brief || !keywords || !audience || !competitors || !sources || !outline) {
    return "";
  }

  const lines: string[] = [];

  // Header
  lines.push(`# Author Help Sheet: ${input.workingTitle}`);
  lines.push("");
  lines.push(`*Generated on ${new Date().toLocaleDateString()}*`);
  lines.push("");

  // Brief Analysis
  lines.push("## Brief Analysis");
  lines.push("");
  lines.push(`**Core Message:** ${brief.coreMessage}`);
  lines.push("");
  lines.push("**In Scope:**");
  brief.inScope.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("**Out of Scope:**");
  brief.outOfScope.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push(`**Desired Outcome:** ${brief.desiredOutcome}`);
  lines.push("");
  lines.push(`**Format Recommendation:** ${brief.formatRecommendation}`);
  lines.push("");

  // Keywords & Search Intent
  lines.push("## Keywords & Search Intent");
  lines.push("");
  lines.push(`**Primary Keyword:** ${keywords.primaryKeyword}`);
  lines.push("");
  lines.push("**Secondary Keywords:**");
  keywords.secondaryKeywords.forEach((kw) => lines.push(`- ${kw}`));
  lines.push("");
  lines.push(`**Search Intent:** ${keywords.searchIntent} - ${keywords.intentExplanation}`);
  lines.push("");

  // Target Audience
  lines.push("## Target Audience");
  lines.push("");
  lines.push(`**Persona:** ${audience.personaDescription}`);
  lines.push("");
  lines.push(`**Knowledge Level:** ${audience.knowledgeLevel}`);
  lines.push("");
  lines.push("**Problems to Solve:**");
  audience.problemsToSolve.forEach((p) => lines.push(`- ${p}`));
  lines.push("");
  lines.push("**Motivations:**");
  audience.motivations.forEach((m) => lines.push(`- ${m}`));
  lines.push("");

  // Content Gaps & Opportunities
  lines.push("## Content Gaps & Opportunities");
  lines.push("");
  lines.push("**Common Angles (avoid rehashing):**");
  competitors.commonAngles.forEach((a) => lines.push(`- ${a}`));
  lines.push("");
  lines.push("**Gaps to Fill:**");
  competitors.contentGaps.forEach((g) => lines.push(`- ${g}`));
  lines.push("");
  lines.push("**Working Patterns:**");
  competitors.workingPatterns.forEach((p) => lines.push(`- ${p}`));
  lines.push("");
  lines.push(`**Recommended Unique Angle:** ${competitors.uniqueAngleRecommendation}`);
  lines.push("");

  // Research Needed
  lines.push("## Research Needed");
  lines.push("");

  // Helper to format research items with AI findings
  const formatResearchItem = (item: ResearchItem): string[] => {
    const itemLines: string[] = [];
    const checkbox = item.found ? "[x]" : "[ ]";
    const notes = item.notes ? ` *(${item.notes})*` : "";
    itemLines.push(`- ${checkbox} ${item.description}${notes}`);

    // Include AI findings if available
    if (item.aiFindings) {
      itemLines.push(`  - **AI Summary:** ${item.aiFindings.summary}`);
      if (item.aiFindings.sources.length > 0) {
        itemLines.push(`  - **Sources:**`);
        item.aiFindings.sources.forEach((src) => {
          itemLines.push(`    - [${src.title}](${src.url})`);
        });
      }
    }
    return itemLines;
  };

  lines.push("**Statistics to Find:**");
  sources.statsToFind.forEach((s) => {
    lines.push(...formatResearchItem(s));
  });
  lines.push("");
  lines.push("**Expert Sources:**");
  sources.expertTypesNeeded.forEach((e) => {
    lines.push(...formatResearchItem(e));
  });
  lines.push("");
  lines.push("**Credibility Boosters:**");
  sources.credibilityBoosters.forEach((c) => {
    lines.push(...formatResearchItem(c));
  });
  lines.push("");
  lines.push("**Research Questions:**");
  sources.researchQuestions.forEach((r) => {
    lines.push(...formatResearchItem(r));
  });
  lines.push("");

  // Article Outline
  lines.push("## Article Outline");
  lines.push("");
  lines.push(`**Total Target:** ~${outline.totalWordCount} words`);
  lines.push("");
  outline.sections.forEach((section, index) => {
    lines.push(`### ${index + 1}. ${section.heading} (~${section.suggestedWordCount} words)`);
    lines.push("");
    lines.push(`**Purpose:** ${section.purpose}`);
    lines.push("");
    lines.push("**Key Points:**");
    section.keyPoints.forEach((kp) => lines.push(`- ${kp}`));
    lines.push("");
    lines.push(`**Evidence:** ${section.evidencePlacement}`);
    lines.push("");
  });

  return lines.join("\n");
}
