import { NextResponse } from "next/server";
import { FALLBACK_LESSON } from "@/lib/fallbackData";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const lessonId = parseInt(params.id, 10) || 1;
  return NextResponse.json({
    lesson: {
      ...FALLBACK_LESSON,
      id: lessonId,
    },
    exercises: FALLBACK_LESSON.exercises,
    hearts: 5,
    max_hearts: 5,
  });
}
