import { Router, Request, Response } from 'express'

const router = Router()

// @desc    Get API version & server status
// @route   GET /api/version
// @access  Public
router.get('/', (req: Request, res: Response): void => {
  try {
    res.status(200).json({
      status: 200,
      message: 'Server is running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
})

export default router
