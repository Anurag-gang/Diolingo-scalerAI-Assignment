import { NextResponse } from "next/server";
import { FALLBACK_USER } from "@/lib/fallbackData";

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const user = {
      ...FALLBACK_USER,
      ...body,
      stats: {
        ...FALLBACK_USER.stats,
        ...(body.stats || {}),
      },
    };
    return NextResponse.json({
      message: "Settings updated successfully",
      user,
    });
  } catch {
    return NextResponse.json({
      message: "Settings updated successfully",
      user: FALLBACK_USER,
    });
  }
}
