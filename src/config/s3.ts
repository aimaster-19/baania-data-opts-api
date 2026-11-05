import { S3Client } from '@aws-sdk/client-s3'

/**
 * Shared S3 client instance (AWS SDK v3).
 *
 * Required env vars:
 *   S3_REGION      - e.g. ap-southeast-1
 *   S3_KEY         - IAM access key id
 *   S3_SECRET      - IAM secret access key
 *   S3_BUCKET      - target bucket name (e.g. new-cdn.baania.com)
 *
 * Optional env vars:
 *   S3_FOLDER      - key prefix/folder, e.g. "b20/project/main" (default: "uploads")
 *   S3_PUBLIC_URL  - CDN/custom base URL for building public links
 *                    (default: https://<bucket>.s3.<region>.amazonaws.com)
 */
export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_KEY as string,
    secretAccessKey: process.env.S3_SECRET as string
  }
})

export const S3_BUCKET = process.env.S3_BUCKET as string
export const S3_FOLDER = process.env.S3_FOLDER || 'uploads'

/**
 * Build the public URL for an uploaded object key.
 */
export const buildPublicUrl = (key: string): string => {
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL.replace(/\/+$/, '')}/${key}`
  }
  return `https://${S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
}
