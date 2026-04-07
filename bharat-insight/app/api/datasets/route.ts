import { NextRequest } from "next/server";
import { getDepartmentDatasetPage } from"../../../lib/data-gov";
import type { DepartmentId } from"../../../lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const department = searchParams.get("department");

  if (department !== "health" && department !== "agriculture") {
    return Response.json(
      { error: "Department must be either health or agriculture." },
      { status: 400 }
    );
  }

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "100");
  const state = searchParams.get("state") ?? "all";
  const year = searchParams.get("year") ?? "all";
  const query = searchParams.get("query") ?? "";
  const dataset = await getDepartmentDatasetPage({
    department: department as DepartmentId,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 100,
    state,
    year,
    query,
  });

  return Response.json(dataset);
}
