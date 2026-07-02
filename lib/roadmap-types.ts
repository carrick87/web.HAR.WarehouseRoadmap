export type DeliverableStatus =
  | "Backlog"
  | "Ready"
  | "In Progress"
  | "User Testing"
  | "Done";

export type MoscowLevel = "Must Have" | "Should Have" | "Could Have";

export interface Deliverable {
  id: string;
  name: string;
  status: DeliverableStatus;
  moscow: MoscowLevel;
}

export interface Phase {
  id: string;
  number: number;
  name: string;
  weeks: string;
  color: string;
  themeColor?: string;
  goal: string;
  milestone: string;
  deliverables: Deliverable[];
}

export interface Metric {
  id: string;
  name: string;
  initial: string;
  current: string;
  target: string;
  progress: number;
  unit?: string;
}

export interface Dependency {
  id: string;
  text: string;
  checked: boolean;
}

export interface ProjectData {
  projectTitle: string;
  projectObjective: string;
  phases: Phase[];
  metrics: Metric[];
  dependencies: Dependency[];
}

export interface RoadmapProjectRow {
  slug: string;
  title: string;
  data: ProjectData;
  created_at: string;
  updated_at: string;
}

export function isValidProjectData(data: unknown): data is ProjectData {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return Array.isArray(record.phases) && Array.isArray(record.metrics);
}

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
