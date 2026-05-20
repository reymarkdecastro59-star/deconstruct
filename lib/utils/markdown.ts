import { PaperAnalysis } from "@/lib/schemas/analysis";

export function analysisToMarkdown(analysis: PaperAnalysis): string {
  const lines: string[] = [
    `# ${analysis.title}`,
    ``,
    `**Field:** ${analysis.field}`,
    `**Analyzed:** ${new Date(analysis.createdAt).toLocaleDateString()}`,
    ``,
    `---`,
    ``,
    `## Plain-Language Summary`,
    ``,
    analysis.plainAbstract,
    ``,
    `## Key Contributions`,
    ``,
    ...analysis.contributions.map((c) => `- ${c}`),
    ``,
    `## Methodology`,
    ``,
    analysis.methodology,
    ``,
    `## Key Findings & Results`,
    ``,
    analysis.findings,
    ``,
    `## Limitations`,
    ``,
    ...analysis.limitations.map((l) => `- ${l}`),
    ``,
    `## Future Work`,
    ``,
    analysis.futureWork,
    ``,
    `## Keywords`,
    ``,
    analysis.keywords.map((k) => `\`${k}\``).join(" · "),
    ``,
    `---`,
    ``,
    `## Section Summaries`,
    ``,
  ];

  for (const section of analysis.sections) {
    lines.push(`### ${section.title}`, ``, section.summary, ``);
    for (const point of section.keyPoints) {
      lines.push(`- ${point}`);
    }
    lines.push(``);
  }

  lines.push(`---`, ``, `## Concepts`, ``);
  for (const concept of analysis.concepts) {
    lines.push(`**${concept.id.replace(/-/g, " ")}** _(${concept.type})_: ${concept.description}`, ``);
  }

  return lines.join("\n");
}
