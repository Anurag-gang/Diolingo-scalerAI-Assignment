import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const user = {
    ...FALLBACK_USER,
    email: body.email || "google_learner@diolingo.org",
    display_name: body.display_name || "Google Learner",
  };
  return NextResponse.json({
    access_token: "diolingo_oauth_session_" + Date.now(),
    token_type: "bearer",
    user,
  });
}
