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
 * Whitelisted upload targets -> S3 key prefix. Clients pick a target by name
 * (e.g. `type=unittype`) instead of passing a raw folder path, so uploads can
 * only ever land in a known, approved prefix of the bucket.
 */
export const S3_FOLDERS: Record<string, string> = {
  project: process.env.S3_FOLDER_PROJECT || 'b20/project/main',
  unittype: process.env.S3_FOLDER_UNITTYPE || 'b20/unittype/main'
}

/**
 * Resolve a client-supplied upload `type` to a safe, whitelisted folder.
 * Unknown/missing types fall back to the default S3_FOLDER.
 */
export const resolveUploadFolder = (type?: string): string => {
  if (type && Object.prototype.hasOwnProperty.call(S3_FOLDERS, type)) {
    return S3_FOLDERS[type]
  }
  return S3_FOLDER
}

/**
 * Build the public URL for an uploaded object key.
 */
export const buildPublicUrl = (key: string): string => {
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL.replace(/\/+$/, '')}/${key}`
  }
  return `https://${S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
}
