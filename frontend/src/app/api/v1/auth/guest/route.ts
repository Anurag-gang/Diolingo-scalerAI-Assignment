import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function POST() {
  const token = "diolingo_guest_session_" + Date.now();
  return NextResponse.json({
    access_token: token,
    token_type: "bearer",
    user: FALLBACK_USER,
  });
}
