import type { AnalyticsRow, DepartmentId } from "@/lib/types";
import { DEPARTMENT_CONFIG } from "@/lib/departments";

const TOTAL_ROWS = 12000;

const REGIONS = [
  { state: "Maharashtra", districts: ["Mumbai", "Pune", "Nagpur"] },
  { state: "Karnataka", districts: ["Bengaluru", "Mysuru", "Belagavi"] },
  { state: "Tamil Nadu", districts: ["Chennai", "Coimbatore", "Madurai"] },
  { state: "Gujarat", districts: ["Ahmedabad", "Surat", "Vadodara"] },
  { state: "Rajasthan", districts: ["Jaipur", "Jodhpur", "Udaipur"] },
  { state: "Uttar Pradesh", districts: ["Lucknow", "Kanpur", "Varanasi"] },
  { state: "Madhya Pradesh", districts: ["Bhopal", "Indore", "Jabalpur"] },
  { state: "West Bengal", districts: ["Kolkata", "Howrah", "Siliguri"] },
  { state: "Odisha", districts: ["Bhubaneswar", "Cuttack", "Sambalpur"] },
  { state: "Bihar", districts: ["Patna", "Gaya", "Muzaffarpur"] },
  { state: "Punjab", districts: ["Ludhiana", "Amritsar", "Patiala"] },
  { state: "Assam", districts: ["Guwahati", "Silchar", "Jorhat"] },
];

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
const cache = new Map<DepartmentId, AnalyticsRow[]>();

function seededValue(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function createRow(department: DepartmentId, index: number): AnalyticsRow {
  const config = DEPARTMENT_CONFIG[department];
  const region = REGIONS[index % REGIONS.length];
  const district =
    region.districts[Math.floor(index / REGIONS.length) % region.districts.length];
  const year =
    YEARS[Math.floor(index / (REGIONS.length * region.districts.length)) % YEARS.length];
  const metric = config.metrics[index % config.metrics.length];
  const program =
    config.programs[Math.floor(index / config.metrics.length) % config.programs.length];
  const variance = seededValue(index + (department === "health" ? 7 : 17));
  const multiplier = department === "health" ? 780 : 1120;
  const seasonalBoost = department === "health" ? year - 2017 : year - 2016;
  const value = Math.round(
    multiplier +
      (index % 250) * 9 +
      seasonalBoost * 64 +
      variance * (department === "health" ? 390 : 470)
  );
  const change = Math.round((seededValue(index * 2 + 4) - 0.38) * 20);
  const status: AnalyticsRow["status"] =
    change >= 7 ? "On track" : change >= -2 ? "Watch" : "Critical";

  return {
    id: `${department}-${index}`,
    department,
    ministry: config.name,
    state: region.state,
    district,
    year,
    metric,
    program,
    value,
    change,
    status,
    source: config.sourceLabel,
  };
}

function buildDepartmentRows(department: DepartmentId) {
  const rows: AnalyticsRow[] = [];

  for (let index = 0; index < TOTAL_ROWS; index += 1) {
    rows.push(createRow(department, index));
  }

  return rows;
}

export function getMockDepartmentRows(department: DepartmentId): AnalyticsRow[] {
  if (!cache.has(department)) {
    cache.set(department, buildDepartmentRows(department));
  }

  return cache.get(department) ?? [];
}

export async function fetchDepartmentRows(
  department: DepartmentId
): Promise<AnalyticsRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  return getMockDepartmentRows(department);
}
