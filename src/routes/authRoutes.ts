import { Router } from 'express'
import {
  getMe,
  loginFirebase,
  loginEmail,
  refreshToken,
  logoutUser,
} from '../controllers/authController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.post('/login-firebase', loginFirebase)
router.post('/login-email', loginEmail)
router.post('/refresh', refreshToken)
router.post('/logout', logoutUser)
router.get('/me', protect, getMe) // Protect middleware ensures user is authenticated

export default router
