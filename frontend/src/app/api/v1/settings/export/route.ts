import { NextResponse } from "next/server";
import { FALLBACK_USER, FALLBACK_COURSES } from "@/lib/fallbackData";

export async function GET() {
  return NextResponse.json({
    user: FALLBACK_USER,
    courses: FALLBACK_COURSES,
    exported_at: new Date().toISOString(),
  });
}
