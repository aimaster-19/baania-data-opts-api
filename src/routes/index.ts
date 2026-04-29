import { Router } from 'express'
import authRoutes from './authRoutes'
import versionRoutes from './versionRoutes'
import projectReadRoutes from './projectReadRoutes'
import { protect } from '../middlewares/authMiddleware'
import { getMe } from '../controllers/authController'

const router = Router()

// Mount individual routes here for clear separation
const apiVersion = process.env.API_VERSION || 'v1'
// app.ts already mounts this router at `/api`, so avoid repeating `/api` prefix
router.use(`/${apiVersion}/version`, versionRoutes)
router.use(`/${apiVersion}/auth`, authRoutes)

// Add /me endpoint for user verification
router.get(`/${apiVersion}/me`, protect, getMe)

// You can easily add more routes here, e.g.:
router.use(`/${apiVersion}/projectread`, projectReadRoutes)
// router.use('/users', userRoutes);
// router.use('/data', dataRoutes);

export default router
