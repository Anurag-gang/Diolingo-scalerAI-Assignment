import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const full = url.searchParams.get("full") === "true";
  const hearts = 5;
  const user = {
    ...FALLBACK_USER,
    stats: {
      ...FALLBACK_USER.stats,
      hearts,
    },
  };
  return NextResponse.json({
    message: full ? "Refilled all 5 Hearts!" : "Practiced & recovered +1 Heart!",
    hearts,
    max_hearts: 5,
    gems: user.stats.gems,
    user,
  });
}
