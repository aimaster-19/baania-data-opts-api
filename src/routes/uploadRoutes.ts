import { Router } from 'express'
import { uploadImagesController } from '../controllers/uploadController'
import { uploadImages } from '../middlewares/uploadMiddleware'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

// POST /upload/images — multi image upload to S3 (field: images)
router.post('/images', protect, uploadImages, uploadImagesController)

export default router
