import { NextResponse } from "next/server";
import { FALLBACK_COURSES, FALLBACK_UNITS } from "@/lib/fallbackData";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const courseId = parseInt(params.id, 10) || 1;
  const course = FALLBACK_COURSES.find((c) => c.id === courseId) || FALLBACK_COURSES[0];
  return NextResponse.json({
    course,
    units: FALLBACK_UNITS,
  });
}
