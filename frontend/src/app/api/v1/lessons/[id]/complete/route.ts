import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function POST() {
  return NextResponse.json({
    accuracy: 100,
    xp_breakdown: {
      base_xp: 15,
      accuracy_bonus: 5,
      legendary_bonus: 0,
      multiplier: 1,
      total_xp: 20,
      gems_earned: 5,
    },
    streak: {
      streak_count: 6,
      streak_incremented: true,
      freeze_used: false,
    },
    newly_unlocked_achievements: [],
    user: {
      ...FALLBACK_USER,
      stats: {
        ...FALLBACK_USER.stats,
        xp_total: FALLBACK_USER.stats.xp_total + 20,
        xp_today: FALLBACK_USER.stats.xp_today + 20,
        streak_count: FALLBACK_USER.stats.streak_count + 1,
        lessons_completed_count: FALLBACK_USER.stats.lessons_completed_count + 1,
        gems: FALLBACK_USER.stats.gems + 5,
      },
    },
  });
}
