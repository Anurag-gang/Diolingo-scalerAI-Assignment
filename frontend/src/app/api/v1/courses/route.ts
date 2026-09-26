import { NextResponse } from "next/server";
import { FALLBACK_COURSES } from "@/lib/fallbackData";

export async function GET() {
  return NextResponse.json({ courses: FALLBACK_COURSES });
}
