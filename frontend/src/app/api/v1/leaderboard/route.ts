import { NextResponse } from "next/server";
import { FALLBACK_LEADERBOARD } from "@/lib/fallbackData";

export async function GET() {
  return NextResponse.json({
    standings: FALLBACK_LEADERBOARD,
    tier: "Silver",
  });
}
