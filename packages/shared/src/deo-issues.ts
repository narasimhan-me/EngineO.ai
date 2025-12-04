export type DeoIssueSeverity = 'critical' | 'warning' | 'info';

export interface DeoIssue {
  id: string;
  title: string;
  description: string;
  severity: DeoIssueSeverity;
  count: number;
  affectedPages?: string[];
  affectedProducts?: string[];
}

export interface DeoIssuesResponse {
  projectId: string;
  generatedAt: string; // ISO timestamp
  issues: DeoIssue[];
}
