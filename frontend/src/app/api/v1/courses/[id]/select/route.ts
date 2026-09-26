import { NextResponse } from "next/server";
import { FALLBACK_COURSES, FALLBACK_USER } from "@/lib/fallbackData";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const courseId = parseInt(params.id, 10) || 1;
  const course =
    FALLBACK_COURSES.find((c) => c.id === courseId) || FALLBACK_COURSES[0];
  const user = {
    ...FALLBACK_USER,
    active_course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      flag_emoji: course.flag_emoji,
      target_language: course.target_language,
    },
  };
  return NextResponse.json({
    message: `Active course switched to ${course.title}`,
    user,
  });
}
