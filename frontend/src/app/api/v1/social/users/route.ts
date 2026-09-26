import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    learners: [
      { id: 2, username: "sofia_admin", display_name: "Prof. Sofia", streak: 14, xp: 1250, is_following: true },
      { id: 3, username: "mateo_es", display_name: "Mateo Silva", streak: 9, xp: 890, is_following: true },
      { id: 5, username: "kenji_t", display_name: "Kenji Tanaka", streak: 7, xp: 740, is_following: false },
      { id: 6, username: "elena_polyglot", display_name: "Elena Rostova", streak: 21, xp: 2100, is_following: false },
    ],
  });
}
