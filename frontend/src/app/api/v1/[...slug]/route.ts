import { NextResponse } from "next/server";
import { getFallbackResponse } from "@/lib/fallbackData";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const path = "/api/v1/" + (params.slug?.join("/") || "");
  const fallback = getFallbackResponse(path);
  return NextResponse.json(fallback ?? { success: true, message: "OK" });
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const path = "/api/v1/" + (params.slug?.join("/") || "");
  const fallback = getFallbackResponse(path);
  return NextResponse.json(fallback ?? { success: true, message: "OK" });
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const path = "/api/v1/" + (params.slug?.join("/") || "");
  const fallback = getFallbackResponse(path);
  return NextResponse.json(fallback ?? { success: true, message: "OK" });
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const path = "/api/v1/" + (params.slug?.join("/") || "");
  const fallback = getFallbackResponse(path);
  return NextResponse.json(fallback ?? { success: true, message: "OK" });
}
