import { Request, Response } from 'express'
import { UploadService } from '../services/uploadService'

/**
 * POST /upload/images
 *
 * Multi-image upload to S3.
 * Content-Type: multipart/form-data
 * Field: `images` (one or more files)
 *
 * Validation (handled by uploadMiddleware):
 *   - allowed types: .png .jpg .jpeg .webp
 *   - max size: 5 MB per file
 *
 * Optional query/body:
 *   folder - override the S3 sub-folder (e.g. "projects")
 */
export const uploadImagesController = async (req: Request, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[]) || []

    if (files.length === 0) {
      return res.status(422).json({
        status: 422,
        message: 'กรุณาเลือกไฟล์รูปภาพอย่างน้อย 1 ไฟล์ (field: images)'
      })
    }

    const folder = (req.body?.folder || req.query?.folder) as string | undefined
    const results = await UploadService.uploadImages(files, folder || undefined)

    res.status(201).json({
      status: 201,
      message: 'อัปโหลดรูปภาพสำเร็จ',
      data: results
    })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

export default uploadImagesController
