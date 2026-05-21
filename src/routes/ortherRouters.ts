import { Router } from 'express'
import { getDevelopersController } from '../controllers/developers'
import getPropertyTypes from '../controllers/propertyTypeController'

const router = Router()

router.get('/developers', getDevelopersController)
router.get('/property-types', getPropertyTypes)

export default router
