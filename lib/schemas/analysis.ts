import { z } from "zod";

export const SectionSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  keyPoints: z.array(z.string()).min(2).max(8),
});

export const ConceptSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["core", "method", "result", "finding"]),
  description: z.string().min(1),
});

export const RelationshipSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().min(1),
});

export const PaperAnalysisSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  field: z.string().min(1),
  plainAbstract: z.string().min(1),
  contributions: z.array(z.string()).min(2).max(8),
  methodology: z.string().min(1),
  findings: z.string().min(1),
  limitations: z.array(z.string()).min(1).max(8),
  futureWork: z.string().min(1),
  keywords: z.array(z.string()).min(5).max(10),
  sections: z.array(SectionSchema).min(1),
  concepts: z.array(ConceptSchema).min(1).max(15),
  relationships: z.array(RelationshipSchema),
  createdAt: z.string().datetime(),
});

export type Section = z.infer<typeof SectionSchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type PaperAnalysis = z.infer<typeof PaperAnalysisSchema>;
