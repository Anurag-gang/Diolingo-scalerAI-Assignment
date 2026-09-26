import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = body.username || (body.email ? body.email.split("@")[0] : "alex_guest");
    const user = {
      ...FALLBACK_USER,
      username: username || "alex_guest",
      email: body.email || `${username}@diolingo.edu`,
      display_name: username === "alex_guest" ? "Alex Rivera (Guest Learner)" : username,
      is_guest: false,
    };
    const token = "diolingo_registered_session_" + Date.now();
    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user,
    });
  } catch {
    return NextResponse.json({
      access_token: "diolingo_registered_session_" + Date.now(),
      token_type: "bearer",
      user: FALLBACK_USER,
    });
  }
}
