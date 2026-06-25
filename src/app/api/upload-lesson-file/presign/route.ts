import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@/lib/supabase/server";
import { R2_PUBLIC_BASE } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, fileName, fileType } = await req.json();
  if (!lessonId || !fileName || !fileType) {
    return NextResponse.json({ error: "Missing lessonId, fileName or fileType" }, { status: 400 });
  }

  console.log("R2 presign config:", {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID ? "SET" : "MISSING",
    accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? "SET" : "MISSING",
    secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? "SET" : "MISSING",
    bucket: process.env.CLOUDFLARE_R2_BUCKET ?? "MISSING",
  });

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `lesson-files/${lessonId}/${Date.now()}-${safeName}`;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET ?? "hsk-books";

  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  const presignedUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: fileType }),
    { expiresIn: 300 }
  );

  const publicUrl = `${R2_PUBLIC_BASE}/${key}`;
  return NextResponse.json({ presignedUrl, publicUrl, key });
}
