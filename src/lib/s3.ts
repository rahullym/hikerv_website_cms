import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let cachedClient: S3Client | null = null;

function client(): S3Client {
  if (cachedClient) return cachedClient;
  const region = import.meta.env.S3_REGION;
  const accessKeyId = import.meta.env.S3_ACCESS_KEY;
  const secretAccessKey = import.meta.env.S3_SECRET_KEY;
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error('S3 credentials are not configured (see .env.example).');
  }
  cachedClient = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

function bucket(): string {
  const b = import.meta.env.S3_BUCKET;
  if (!b) throw new Error('S3_BUCKET is not set (see .env.example).');
  return b;
}

function publicHost(): string {
  // CloudFront preferred; falls back to the regional S3 URL if not set.
  const cf = import.meta.env.CLOUDFRONT_URL;
  if (cf) return cf.replace(/\/$/, '');
  return `https://${bucket()}.s3.${import.meta.env.S3_REGION}.amazonaws.com`;
}

export interface PresignResult {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

/**
 * Generate a pre-signed PUT URL the admin can use to upload a file directly
 * to S3 from the browser. Returns the key + the final public URL that should
 * be stored in Mongo.
 */
export async function presignUpload({
  filename,
  contentType,
}: {
  filename: string;
  contentType: string;
}): Promise<PresignResult> {
  // Bucket layout: cms/yyyy/mm/<timestamp>-<safe-filename>
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const key = `cms/${yyyy}/${mm}/${Date.now()}-${safe}`;

  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client(), cmd, { expiresIn: 60 * 5 });
  const publicUrl = `${publicHost()}/${key}`;
  return { key, uploadUrl, publicUrl };
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
