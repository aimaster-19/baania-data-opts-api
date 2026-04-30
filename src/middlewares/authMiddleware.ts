import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { IUser } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Make sure token exists
  if (!token) {
    res
      .status(401)
      .json({ status: 401, message: 'Not authorized to access this route' })
    return
  }

  try {
    // Verify token and extract full user payload directly
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'JWT_SECRETKEY'
    ) as IUser

    // Attach decoded user directly to req.user (avoids extra database roundtrips)
    req.user = decoded

    next()
  } catch (err) {
    res
      .status(401)
      .json({ status: 401, message: 'Not authorized to access this route' })
  }
}
