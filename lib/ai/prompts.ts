export const ANALYSIS_PROMPT = (paperText: string) => `
You are a research reading assistant. Your job is to EXTRACT the most important information from an academic paper — not to summarize or paraphrase. Be specific and concrete. Every claim must come directly from the paper. Never pad to fill space.

PAPER TEXT:
---
${paperText}
---

Return ONLY valid JSON (no markdown fences, no commentary) with this exact structure:

{
  "title": "exact paper title",
  "field": "specific subfield, e.g. 'Computer Science / Transformer Architecture'",

  "plainAbstract": "3-5 sentences. State: (1) the specific problem this paper addresses, (2) what is wrong or missing with current approaches, (3) what this paper proposes, (4) the strongest concrete result. No jargon. No vague claims like 'significantly improves' — give the actual number or comparison if one exists.",

  "contributions": [
    "One specific thing this paper contributes that did not exist before. Use concrete language — name the method, dataset, metric, or claim.",
    "Another specific contribution — be precise"
  ],

  "methodology": "What they actually did, step by step. Name the dataset, model architecture, algorithm, or experimental setup. Include specific choices the authors made and why. Do not describe what they 'aim to' or 'seek to' do — only what they did.",

  "findings": "The actual results. Include specific numbers, comparisons to baselines, and what conditions produced them. If the paper reports accuracy of 94.2% vs a baseline of 89.1%, say that. State what the results prove and what they do not prove.",

  "limitations": [
    "A specific limitation: what assumption does the method rely on, what data is missing, what setting does it fail in, or what does the paper not test?",
    "Another concrete limitation"
  ],

  "futureWork": "What the authors say is unresolved, or what obvious gaps remain from the methodology. Be specific about what would need to change.",

  "keywords": ["keyword1", "keyword2"],

  "sections": [
    {
      "title": "section title as it appears",
      "summary": "2-4 sentences on what this section establishes. Focus on the key claim or evidence it provides, not just what topics it covers.",
      "keyPoints": [
        "A specific fact, result, definition, or claim from this section — concrete, not generic",
        "Another specific point"
      ]
    }
  ],

  "concepts": [
    {
      "id": "concept-as-slug",
      "type": "core | method | result | finding",
      "description": "What this concept specifically means in this paper and why it matters here. If it is a technique, say what problem it solves. If it is a result, say what it shows."
    }
  ],

  "relationships": [
    {
      "source": "concept-id",
      "target": "concept-id",
      "label": "verb: enables / produces / validates / extends / replaces"
    }
  ]
}

Critical rules:
- Never write "the authors show that X is important" — write what X actually is and what the evidence is
- Never use the phrase "the paper discusses" — say what the paper actually says
- If the paper has specific numbers (accuracy, F1, speed, parameters), include them in findings and keyPoints
- contributions must be things that are new — not "the paper proposes a method" but "a new attention mechanism that reduces quadratic complexity to linear"
- limitations must name specific constraints, not just say "more research is needed"
- keywords: 5-10 items
- concepts: 8-15 nodes; all relationship ids must match existing concept ids
`;
