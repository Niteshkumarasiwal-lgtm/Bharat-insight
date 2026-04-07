import type { DepartmentConfig } from "@/lib/types";

export const DEPARTMENT_CONFIG: Record<string, DepartmentConfig> = {
  health: {
    id: "health",
    shortName: "MoHFW",
    name: "Ministry of Health",
    description:
      "Tracks public health delivery, vaccination, rural healthcare access, and hospital capacity across Indian states.",
    heroMetric: "Population coverage readiness",
    sourceLabel:
      "National Health Mission and health indicators style public datasets",
    color: "#7dd3fc",
    softColor: "rgba(14, 165, 233, 0.14)",
    metrics: [
      "Vaccination Coverage",
      "Primary Care Reach",
      "Maternal Care Index",
      "Disease Surveillance Score",
      "Hospital Bed Availability",
    ],
    programs: [
      "Ayushman Bharat",
      "National Immunization Mission",
      "Rural Health Infra",
      "Maternal Safety Drive",
    ],
  },
  agriculture: {
    id: "agriculture",
    shortName: "MoA&FW",
    name: "Ministry of Agriculture",
    description:
      "Monitors crop productivity, irrigation intensity, soil resilience, and farmer program delivery through a ministry-specific lens.",
    heroMetric: "Yield resilience index",
    sourceLabel:
      "Agricultural statistics and irrigation style public datasets",
    color: "#86efac",
    softColor: "rgba(34, 197, 94, 0.14)",
    metrics: [
      "Crop Yield Index",
      "Irrigation Coverage",
      "Soil Health Score",
      "Procurement Readiness",
      "Farmer Scheme Reach",
    ],
    programs: [
      "PM-KISAN",
      "National Irrigation Grid",
      "Crop Insurance Push",
      "Soil Health Mission",
    ],
  },
};
