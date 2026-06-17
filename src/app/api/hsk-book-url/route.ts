import { NextRequest, NextResponse } from "next/server";
import { HSK_BOOKS } from "@/lib/hsk-books";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level")?.toUpperCase();
  const type = searchParams.get("type") as "textbook" | "workbook";

  if (!level || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const url = HSK_BOOKS[level]?.[type];
  if (!url) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ url });
}
