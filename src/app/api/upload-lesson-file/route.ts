import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const lessonId = form.get("lessonId") as string | null;

  if (!file || !lessonId) {
    return NextResponse.json({ error: "Missing file or lessonId" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `lesson-files/${lessonId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadToR2(key, buffer, file.type || "application/octet-stream");
    return NextResponse.json({ url, fileName: file.name, fileSize: file.size });
  } catch (err) {
    console.error("[upload-lesson-file] R2 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
