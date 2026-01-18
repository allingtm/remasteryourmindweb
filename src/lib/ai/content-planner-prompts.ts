// Content Planner AI Prompts
// Prompts for generating author help sheets

// ============================================
// Step 2: Brief Analysis
// ============================================

export const ANALYZE_BRIEF_SYSTEM_PROMPT = `You are an expert content strategist helping authors plan their articles.

Analyze the provided content (transcript or brief) and extract:
1. The core message - what's the single most important point?
2. What should be IN scope for this article
3. What should be OUT of scope (to keep focused)
4. The desired outcome for the reader
5. A format recommendation (how-to, listicle, narrative, opinion piece, etc.)

Return JSON in this exact format:
{
  "coreMessage": "Single sentence capturing the main point",
  "inScope": ["topic 1", "topic 2", "topic 3"],
  "outOfScope": ["topic to avoid 1", "topic to avoid 2"],
  "desiredOutcome": "What the reader should think, feel, or do after reading",
  "formatRecommendation": "Recommended article format with brief explanation"
}`;

export function buildAnalyzeBriefPrompt(
  sourceContent: string,
  workingTitle: string
): string {
  return `Working Title: ${workingTitle}

Source Content:
${sourceContent}

Analyze this content and provide the brief analysis.`;
}

// ============================================
// Step 3: Keyword Research
// ============================================

export const RESEARCH_KEYWORDS_SYSTEM_PROMPT = `You are an SEO specialist helping authors optimize their content for search.

Based on the brief analysis, suggest:
1. A primary keyword (the main search term to target)
2. 3-5 secondary keywords (related terms and long-tail variations)
3. The search intent (informational, transactional, navigational, or commercial)
4. An explanation of what searchers want when using these terms

Return JSON in this exact format:
{
  "primaryKeyword": "main keyword phrase",
  "secondaryKeywords": ["keyword 1", "keyword 2", "keyword 3"],
  "searchIntent": "informational",
  "intentExplanation": "Why people search for this and what they expect to find"
}`;

export function buildResearchKeywordsPrompt(
  brief: { coreMessage: string; inScope: string[]; desiredOutcome: string },
  workingTitle: string,
  seoImportant: boolean
): string {
  const seoContext = seoImportant
    ? "SEO is important for this content - focus on searchable terms with good volume."
    : "SEO is less important - focus on clarity and topic relevance over search volume.";

  return `Working Title: ${workingTitle}

Core Message: ${brief.coreMessage}

Topics in Scope:
${brief.inScope.map((t) => `- ${t}`).join("\n")}

Desired Outcome: ${brief.desiredOutcome}

${seoContext}

Suggest keywords for this content.`;
}

// ============================================
// Step 3: Audience Analysis
// ============================================

export const ANALYZE_AUDIENCE_SYSTEM_PROMPT = `You are a content strategist helping authors understand their target readers.

Based on the brief and any audience hints provided, define:
1. A reader persona - who exactly is reading this?
2. Their knowledge level (beginner, intermediate, expert)
3. Problems they're trying to solve
4. What motivates them to read this content

Return JSON in this exact format:
{
  "personaDescription": "Detailed description of the typical reader",
  "knowledgeLevel": "intermediate",
  "problemsToSolve": ["problem 1", "problem 2", "problem 3"],
  "motivations": ["motivation 1", "motivation 2"]
}`;

export function buildAnalyzeAudiencePrompt(
  brief: { coreMessage: string; inScope: string[]; desiredOutcome: string },
  workingTitle: string,
  targetAudience?: string
): string {
  const audienceHint = targetAudience
    ? `Target Audience Hint: ${targetAudience}`
    : "No specific audience hint provided - infer from the content.";

  return `Working Title: ${workingTitle}

Core Message: ${brief.coreMessage}

Topics in Scope:
${brief.inScope.map((t) => `- ${t}`).join("\n")}

Desired Outcome: ${brief.desiredOutcome}

${audienceHint}

Define the target audience for this content.`;
}

// ============================================
// Step 4: Competitive Analysis
// ============================================

export const ANALYZE_COMPETITORS_SYSTEM_PROMPT = `You are a content analyst helping authors find unique angles.

Based on the search results for competing content, analyze:
1. Common angles that are already well-covered
2. Content gaps - topics or perspectives NOT adequately covered
3. Patterns that work well (formats, structures, approaches)
4. A recommended unique angle for this author

Return JSON in this exact format:
{
  "commonAngles": ["angle 1", "angle 2", "angle 3"],
  "contentGaps": ["gap 1", "gap 2", "gap 3"],
  "workingPatterns": ["pattern 1", "pattern 2"],
  "uniqueAngleRecommendation": "Specific angle that differentiates this content"
}`;

export function buildAnalyzeCompetitorsPrompt(
  brief: { coreMessage: string; inScope: string[] },
  keywords: { primaryKeyword: string; secondaryKeywords: string[] },
  searchResults: { title: string; url: string; snippet: string }[]
): string {
  const resultsText = searchResults
    .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`)
    .join("\n\n");

  return `Topic: ${brief.coreMessage}

Primary Keyword: ${keywords.primaryKeyword}
Secondary Keywords: ${keywords.secondaryKeywords.join(", ")}

Search Results for Competing Content:
${resultsText}

Analyze these competitors and identify opportunities for differentiation.`;
}

// ============================================
// Step 5: Sources & Research
// ============================================

export const GATHER_SOURCES_SYSTEM_PROMPT = `You are a research specialist helping authors build credible content.

Based on the content plan so far, suggest:
1. Statistics or data points the author should find and cite
2. Types of expert sources that would add credibility
3. Credibility boosters (case studies, examples, original research ideas)
4. Research questions the author should answer

Return JSON in this exact format:
{
  "statsToFind": ["stat description 1", "stat description 2"],
  "expertTypesNeeded": ["expert type 1", "expert type 2"],
  "credibilityBoosters": ["booster 1", "booster 2"],
  "researchQuestions": ["question 1", "question 2", "question 3"]
}`;

export function buildGatherSourcesPrompt(
  brief: { coreMessage: string; inScope: string[] },
  audience: { personaDescription: string; problemsToSolve: string[] },
  competitors: { contentGaps: string[]; uniqueAngleRecommendation: string }
): string {
  return `Core Message: ${brief.coreMessage}

Topics in Scope:
${brief.inScope.map((t) => `- ${t}`).join("\n")}

Target Audience: ${audience.personaDescription}

Problems to Address:
${audience.problemsToSolve.map((p) => `- ${p}`).join("\n")}

Content Gaps to Fill:
${competitors.contentGaps.map((g) => `- ${g}`).join("\n")}

Unique Angle: ${competitors.uniqueAngleRecommendation}

Suggest research and sources needed for this content.`;
}

// ============================================
// Step 6: Outline Generation
// ============================================

export const GENERATE_OUTLINE_SYSTEM_PROMPT = `You are a content architect helping authors structure their articles.

Based on all the research gathered, create a detailed article outline with:
1. Section headings that flow logically
2. The purpose of each section
3. Key points to cover in each section
4. Where evidence/examples should appear - BE SPECIFIC about which stats or findings to use
5. Suggested word count per section

IMPORTANT: When AI research findings are provided, incorporate them directly into the outline:
- Reference specific statistics and data points in the key points
- Suggest where to cite specific sources
- Use the AI-found information to make the outline actionable

Return JSON in this exact format:
{
  "sections": [
    {
      "heading": "Section Title",
      "purpose": "What this section accomplishes",
      "keyPoints": ["point 1", "point 2", "point 3"],
      "evidencePlacement": "Where to put stats, quotes, examples - reference specific findings",
      "suggestedWordCount": 300
    }
  ],
  "totalWordCount": 1500
}`;

// Type for research items with optional AI findings
interface ResearchItemForOutline {
  description: string;
  aiSummary?: string;
  sources?: { title: string; url: string }[];
}

export function buildGenerateOutlinePrompt(
  workingTitle: string,
  brief: { coreMessage: string; inScope: string[]; formatRecommendation: string },
  keywords: { primaryKeyword: string; searchIntent: string },
  audience: { personaDescription: string; knowledgeLevel: string; problemsToSolve: string[] },
  competitors: { uniqueAngleRecommendation: string; workingPatterns: string[] },
  sources: {
    statsToFind: ResearchItemForOutline[];
    researchQuestions: ResearchItemForOutline[];
    expertTypesNeeded?: ResearchItemForOutline[];
    credibilityBoosters?: ResearchItemForOutline[];
  }
): string {
  // Format research items with their AI findings
  const formatResearchItems = (items: ResearchItemForOutline[]): string => {
    return items.map((item) => {
      let text = `- ${item.description}`;
      if (item.aiSummary) {
        text += `\n  AI Found: ${item.aiSummary}`;
        if (item.sources && item.sources.length > 0) {
          text += `\n  Sources: ${item.sources.map(s => `[${s.title}](${s.url})`).join(", ")}`;
        }
      }
      return text;
    }).join("\n");
  };

  // Build the stats section with AI findings
  const statsSection = sources.statsToFind.length > 0
    ? `Key Stats/Data (with AI research findings):
${formatResearchItems(sources.statsToFind)}`
    : "No specific statistics identified.";

  // Build the research questions section with AI findings
  const questionsSection = sources.researchQuestions.length > 0
    ? `Research Questions (with AI answers where available):
${formatResearchItems(sources.researchQuestions)}`
    : "No specific research questions identified.";

  // Build expert sources section if available
  const expertsSection = sources.expertTypesNeeded && sources.expertTypesNeeded.length > 0
    ? `\nExpert Sources (with AI findings):
${formatResearchItems(sources.expertTypesNeeded)}`
    : "";

  // Build credibility boosters section if available
  const credibilitySection = sources.credibilityBoosters && sources.credibilityBoosters.length > 0
    ? `\nCredibility Boosters (with AI findings):
${formatResearchItems(sources.credibilityBoosters)}`
    : "";

  return `Article Title: ${workingTitle}

Core Message: ${brief.coreMessage}
Format: ${brief.formatRecommendation}

Topics to Cover:
${brief.inScope.map((t) => `- ${t}`).join("\n")}

Primary Keyword: ${keywords.primaryKeyword}
Search Intent: ${keywords.searchIntent}

Target Reader: ${audience.personaDescription}
Knowledge Level: ${audience.knowledgeLevel}

Problems to Solve:
${audience.problemsToSolve.map((p) => `- ${p}`).join("\n")}

Unique Angle: ${competitors.uniqueAngleRecommendation}

Working Patterns from Competitors:
${competitors.workingPatterns.map((p) => `- ${p}`).join("\n")}

${statsSection}

${questionsSection}
${expertsSection}
${credibilitySection}

Create a detailed article outline that:
1. Follows the recommended format
2. Addresses the audience's knowledge level
3. Incorporates the unique angle
4. USES THE AI RESEARCH FINDINGS - reference specific stats, data, and sources in your key points and evidence placement. IMPORTANT: Include the source links (in markdown format) when referencing sources in evidence placement fields so writers can access them directly.
5. Flows logically from introduction to conclusion

When AI research findings are available, incorporate them into specific sections where they fit best.`;
}
