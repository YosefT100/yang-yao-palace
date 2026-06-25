import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const R2_PUBLIC_BASE = "https://pub-ca8d0c789adf4d67b96a188f11302208.r2.dev";
const BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "hsk-books";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await getR2Client().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return `${R2_PUBLIC_BASE}/${key}`;
}
