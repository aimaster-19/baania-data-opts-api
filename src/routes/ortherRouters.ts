import { Router } from 'express'
import { getDevelopersController } from '../controllers/developers'

const router = Router()

router.get('/developers', getDevelopersController)

export default router
