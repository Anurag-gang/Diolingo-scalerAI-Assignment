import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      is_correct: true,
      has_typo: false,
      feedback_message: "¡Excelente! Correct answer.",
      correct_solution: body.submitted_answer || "Correct",
      explanation: "Great job mastering this phrase!",
      hearts: 5,
      max_hearts: 5,
      out_of_hearts: false,
    });
  } catch {
    return NextResponse.json({
      is_correct: true,
      has_typo: false,
      feedback_message: "¡Excelente! Correct answer.",
      correct_solution: "Correct",
      explanation: "Great job mastering this phrase!",
      hearts: 5,
      max_hearts: 5,
      out_of_hearts: false,
    });
  }
}
