

import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  id: string
  email: string
  username: string
  iat?: number
  exp?: number
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization') || req.header('auth-token')

  if (!authHeader) {
    res.status(401).json({ error: 'Access denied' })
    return
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as AuthPayload
    ;(req as any).user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}