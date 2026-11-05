import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { s3Client, S3_BUCKET, S3_FOLDER, buildPublicUrl } from '../config/s3'

export interface UploadedImage {
  url: string
  key: string
  originalName: string
  size: number
  mimeType: string
}

export class UploadService {
  /**
   * Convert a filename into a URL-safe slug, matching the Baania CDN
   * convention, e.g. "Gravitia Rama 2 Thakam.jpg" -> "Gravitia-Rama-2-Thakam".
   * The extension is dropped here (appended separately by the caller).
   * Falls back to a UUID when the name has no usable characters.
   */
  private static slugify(originalName: string): string {
    const baseName = originalName.replace(/\.[^.]+$/, '') // strip extension
    const slug = baseName
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-') // any run of non-letter/number -> dash
      .replace(/^-+|-+$/g, '') // trim leading/trailing dashes
    return slug || uuidv4()
  }

  /**
   * Upload a single in-memory file buffer to S3 and return its public URL.
   */
  private static async uploadOne(
    file: Express.Multer.File,
    folder: string
  ): Promise<UploadedImage> {
    const ext = (file.originalname.split('.').pop() || '').toLowerCase()
    const key = `${folder}/${Date.now()}-${this.slugify(file.originalname)}.${ext}`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    )

    return {
      url: buildPublicUrl(key),
      key,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    }
  }

  /**
   * Upload multiple image files to S3 in parallel.
   *
   * @param files  Array of multer in-memory files (validated upstream).
   * @param folder Optional sub-folder override (defaults to AWS_S3_FOLDER).
   */
  public static async uploadImages(
    files: Express.Multer.File[],
    folder: string = S3_FOLDER
  ): Promise<UploadedImage[]> {
    return Promise.all(files.map((file) => this.uploadOne(file, folder)))
  }
}
