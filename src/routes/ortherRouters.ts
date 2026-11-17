import { Router } from 'express'
import {
  getDevelopersController,
  createDeveloperController,
  updateDeveloperController
} from '../controllers/developers'
import getPropertyTypes from '../controllers/propertyTypeController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.get('/developers', getDevelopersController)
router.post('/developers', protect, createDeveloperController)
router.put('/developers/:id', protect, updateDeveloperController)
router.get('/property-types', getPropertyTypes)

export default router
