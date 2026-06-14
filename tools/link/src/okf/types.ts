export type OkfFrontmatterValue =
  | null
  | string
  | number
  | boolean
  | OkfFrontmatterValue[]
  | { [key: string]: OkfFrontmatterValue };

export type OkfFrontmatter = Record<string, OkfFrontmatterValue>;

export interface OkfConceptLink {
  label: string;
  href: string;
  external: boolean;
  targetPath?: string;
  targetConceptId?: string;
  broken?: boolean;
}

export interface OkfConcept {
  id: string;
  path: string;
  type: string;
  title: string;
  description?: string;
  resource?: string;
  tags: string[];
  timestamp?: string;
  frontmatter: OkfFrontmatter;
  body: string;
  links: OkfConceptLink[];
  citations: OkfConceptLink[];
}

export interface OkfBundleSummary {
  conceptCount: number;
  typeCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  linkedConceptCount: number;
  brokenLinkCount: number;
}

export interface OkfBundleValidation {
  rootPath: string;
  concepts: OkfConcept[];
  indexes: string[];
  logs: string[];
  warnings: string[];
  errors: string[];
  summary: OkfBundleSummary;
}
