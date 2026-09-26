import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const accountType = body.account_type || "guest";
    const user =
      accountType === "admin"
        ? {
            ...FALLBACK_USER,
            id: 2,
            username: "sofia_admin",
            email: "sofia@diolingo.edu",
            display_name: "Prof. Sofia (Staff Admin)",
            role: "admin" as const,
            is_guest: false,
          }
        : {
            ...FALLBACK_USER,
            id: 1,
            username: "alex_guest",
            email: "guest@diolingo.edu",
            display_name: "Alex Rivera (Guest Learner)",
            role: "learner" as const,
            is_guest: true,
          };

    return NextResponse.json({
      access_token: `diolingo_${accountType}_session_` + Date.now(),
      token_type: "bearer",
      user,
    });
  } catch {
    return NextResponse.json({
      access_token: "diolingo_guest_session_" + Date.now(),
      token_type: "bearer",
      user: FALLBACK_USER,
    });
  }
}
