export type DepartmentId = "health" | "agriculture";

export type UserRole = "admin" | "viewer";

export type DepartmentConfig = {
  id: DepartmentId;
  shortName: string;
  name: string;
  description: string;
  heroMetric: string;
  sourceLabel: string;
  color: string;
  softColor: string;
  metrics: string[];
  programs: string[];
};

export type AnalyticsRow = {
  id: string;
  department: DepartmentId;
  ministry: string;
  state: string;
  district: string;
  year: number;
  metric: string;
  program: string;
  value: number;
  change: number;
  status: "On track" | "Watch" | "Critical";
  source: string;
};

export type DatasetSourceMode = "live" | "fallback";

export type DatasetSummary = {
  totalValue: number;
  averageValue: number;
  bestState: string;
  bestStateValue: number;
};

export type DepartmentDatasetPage = {
  rows: AnalyticsRow[];
  mode: DatasetSourceMode;
  sourceLabel: string;
  totalRows: number;
  totalPages: number;
  page: number;
  pageSize: number;
  stateOptions: string[];
  yearOptions: string[];
  summary: DatasetSummary;
};
