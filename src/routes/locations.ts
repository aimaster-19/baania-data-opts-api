import { Router } from 'express'
import ProvincesController from '../controllers/provinces'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.get('/provinces', ProvincesController.getProvinces)

export default router
