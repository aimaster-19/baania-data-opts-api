import { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback, MulterError } from 'multer'

// Allowed image types (extension + mimetype must both match)
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']

// Max file size: 5 MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024
// Max number of files per request
export const MAX_FILES = 10

/**
 * Reject any file that is not an allowed image type.
 * Both the file extension and the reported mimetype must be in the allow-list.
 */
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = '.' + (file.originalname.split('.').pop() || '').toLowerCase()
  const mime = file.mimetype.toLowerCase()

  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mime)) {
    cb(null, true)
  } else {
    cb(new Error('INVALID_FILE_TYPE'))
  }
}

// Store file in memory as a Buffer so we can stream it straight to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },
  fileFilter: imageFileFilter
})

/**
 * Multi-image upload middleware for field name `images`.
 * Wraps multer to translate its errors into consistent JSON responses.
 *
 * Usage (form-data): field `images` (repeat for multiple files)
 */
export const uploadImages = (req: Request, res: Response, next: NextFunction): void => {
  const handler = upload.array('images', MAX_FILES)

  handler(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(422).json({
          status: 422,
          message: 'ไฟล์มีขนาดเกิน 5 MB กรุณาอัปโหลดไฟล์ที่เล็กกว่านี้'
        })
        return
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        res.status(422).json({
          status: 422,
          message: `อัปโหลดได้สูงสุด ${MAX_FILES} ไฟล์ต่อครั้ง`
        })
        return
      }
      res.status(422).json({ status: 422, message: err.message })
      return
    }

    if (err instanceof Error) {
      if (err.message === 'INVALID_FILE_TYPE') {
        res.status(422).json({
          status: 422,
          message: 'รองรับเฉพาะไฟล์รูปภาพ .png .jpg .jpeg .webp เท่านั้น'
        })
        return
      }
      res.status(500).json({ status: 500, message: err.message })
      return
    }

    next()
  })
}
