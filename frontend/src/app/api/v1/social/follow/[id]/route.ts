import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    action: "followed",
    is_following: true,
    message: `Now following learner ${params.id}`,
    followers_count: 3,
  });
}
