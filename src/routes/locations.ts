import { Router } from 'express'
import ProvincesController from '../controllers/provinces'
import DistrictsController from '../controllers/districts'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.get('/provinces', ProvincesController.getProvinces)

router.get('/districts', DistrictsController.getDistricts)

export default router
