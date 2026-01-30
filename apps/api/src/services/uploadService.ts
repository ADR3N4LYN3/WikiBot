import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3/R2 configuration from environment
const S3_ENDPOINT = process.env.S3_ENDPOINT; // For R2: https://<account_id>.r2.cloudflarestorage.com
const S3_BUCKET = process.env.S3_BUCKET || 'wikibot-uploads';
const S3_REGION = process.env.S3_REGION || 'auto';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL; // CDN or public bucket URL

// Check if S3/R2 is configured
export function isStorageConfigured(): boolean {
  return !!(S3_ENDPOINT && S3_ACCESS_KEY && S3_SECRET_KEY);
}

// Create S3 client
function getS3Client(): S3Client | null {
  if (!isStorageConfigured()) {
    return null;
  }

  return new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY!,
      secretAccessKey: S3_SECRET_KEY!,
    },
    forcePathStyle: true, // Required for R2
  });
}

// Allowed file types for logos
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Max file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Validate content type
export function validateContentType(contentType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(contentType);
}

// Generate a unique key for the file
function generateFileKey(serverId: string, filename: string): string {
  const ext = filename.split('.').pop() || 'png';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `logos/${serverId}/${timestamp}-${random}.${ext}`;
}

// Generate a presigned URL for uploading
export async function generateUploadUrl(
  serverId: string,
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string } | null> {
  const client = getS3Client();

  if (!client) {
    console.warn('S3/R2 storage not configured');
    return null;
  }

  if (!validateContentType(contentType)) {
    throw new Error(`Invalid content type: ${contentType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  const key = generateFileKey(serverId, filename);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    // Set max content length
    ContentLength: MAX_FILE_SIZE,
    // Add metadata
    Metadata: {
      'server-id': serverId,
      'original-filename': filename,
    },
  });

  // Generate presigned URL valid for 15 minutes
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });

  // Construct public URL
  const publicUrl = S3_PUBLIC_URL
    ? `${S3_PUBLIC_URL}/${key}`
    : `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;

  return { uploadUrl, publicUrl, key };
}

// Delete a file from S3/R2
export async function deleteFile(key: string): Promise<boolean> {
  const client = getS3Client();

  if (!client) {
    console.warn('S3/R2 storage not configured');
    return false;
  }

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

// Check if a file exists
export async function fileExists(key: string): Promise<boolean> {
  const client = getS3Client();

  if (!client) {
    return false;
  }

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

// Extract key from public URL
export function extractKeyFromUrl(url: string): string | null {
  if (!url) return null;

  // Try to extract the key from various URL formats
  const patterns = [
    // CDN URL: https://cdn.example.com/logos/serverId/file.png
    /logos\/[^/]+\/[^/]+$/,
    // S3 URL: https://bucket.s3.region.amazonaws.com/logos/serverId/file.png
    /logos\/[^/]+\/[^/]+$/,
    // R2 URL: https://account.r2.cloudflarestorage.com/bucket/logos/serverId/file.png
    /logos\/[^/]+\/[^/]+$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

// Delete logo by URL
export async function deleteLogoByUrl(url: string): Promise<boolean> {
  const key = extractKeyFromUrl(url);
  if (!key) {
    return false;
  }
  return deleteFile(key);
}
