import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../middlewares/authMiddleware'
import { Admin } from '../entities/postgres/Admin'
import BaaniaService from '../services/baaniaService'
import AuthenticateService from '../services/authenticate'

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user is already populated from the token by AuthMiddleware
    res.status(200).json({ status: 200, user: req.user })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

// @desc    Auth user via Firebase
// @route   POST /api/auth/login-firebase
// @access  Public
export const loginFirebase = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { decodedToken } = req.body

    if (!decodedToken) {
      res.status(400).json({ status: 400, message: 'decodedToken is required' })
      return
    }

    const admin = await Admin.findOne({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!admin) {
      res.status(404).json({ status: 404, message: 'Admin not found' })
      return
    }

    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'JWT_SECRETKEY',
      { expiresIn: '15m' },
    )

    const refreshToken = jwt.sign(
      { id: admin.id },
      process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRETKEY',
      { expiresIn: '7d' },
    )

    admin.refreshTokens = refreshToken
    await admin.save()

    res.status(200).json({
      status: 200,
      token: accessToken,
      refreshToken,
      payload: { id: admin.id, email: admin.email },
    })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

// @desc    Auth user via Email & SSO
// @route   POST /api/auth/login-email
// @access  Public
export const loginEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body

    // 1. Authenticate with external Baania SSO API
    let baaniaUser
    try {
      baaniaUser = await BaaniaService.loginSso({ email, password })
    } catch (ssoError: any) {
      res
        .status(401)
        .json({ status: 401, message: `SSO Error: ${ssoError.message}` })
      return
    }

    if (!baaniaUser || !baaniaUser.email) {
      res
        .status(401)
        .json({ status: 401, message: 'Invalid response from SSO provider' })
      return
    }

    // 2. Lookup the admin in PostgreSQL using AuthenticateService
    let admin: any
    try {
      admin = await AuthenticateService.loginEmail(baaniaUser.email)
    } catch (dbError: any) {
      let errorMessage =
        dbError.message || 'Admin not registered locally or not active'
      res.status(401).json({
        status: 401,
        message: errorMessage,
      })
      return
    }

    if (!admin) {
      res
        .status(401)
        .json({ status: 401, message: 'Admin not registered locally' })
      return
    }

    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'JWT_SECRETKEY',
      { expiresIn: '15m' },
    )

    const refreshToken = jwt.sign(
      { id: admin.id },
      process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRETKEY',
      { expiresIn: '7d' },
    )

    admin.refreshTokens = refreshToken
    await admin.save()

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      status: 200,
      token: accessToken,
      payload: { id: admin.id, email: admin.email },
    })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (but requires valid refresh token in cookie)
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log('Cookies received:', req.cookies)
    console.log('Refresh token from cookie:', req)

    const token = req.cookies.refreshToken

    if (!token) {
      res.status(401).json({
        status: 401,
        message: 'Refresh token not provided',
      })
      return
    }

    let decoded: any

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRETKEY',
      )
    } catch {
      res.status(401).json({
        status: 401,
        message: 'Invalid or expired refresh token',
      })
      return
    }

    const admin = await Admin.findOne({
      where: { id: decoded.id },
    })

    if (!admin || admin.refreshTokens !== token) {
      res.status(401).json({
        status: 401,
        message: 'Invalid refresh token',
      })
      return
    }

    const newAccessToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'JWT_SECRETKEY',
      { expiresIn: '15m' },
    )

    const newRefreshToken = jwt.sign(
      { id: admin.id },
      process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRETKEY',
      { expiresIn: '7d' },
    )

    admin.refreshTokens = newRefreshToken
    await admin.save()

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      status: 200,
      token: newAccessToken,
    })
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Get admin ID from the authenticated request
    const adminId = req.user?.id

    if (!adminId) {
      res.status(401).json({ status: 401, message: 'Admin not authenticated' })
      return
    }

    // Find and clear refresh token for this admin
    const admin = await Admin.findOneBy({ id: adminId })

    if (admin) {
      admin.refreshTokens = null
      await admin.save()
    }

    // Clear cookie
    res.clearCookie('refreshToken')
    res.status(200).json({ status: 200, message: 'Logged out successfully' })
  } catch (error: any) {
    res.status(500).json({ status: 500, message: error.message })
  }
}
