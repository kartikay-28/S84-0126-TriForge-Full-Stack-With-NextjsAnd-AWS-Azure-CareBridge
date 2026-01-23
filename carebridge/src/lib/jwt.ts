import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'

export interface JWTPayload {
  userId: string
  role: Role
}

export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  return jwt.sign(payload, secret, { expiresIn: '1d' })
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  
  try {
    // Clean the token - remove any extra whitespace or invalid characters
    const cleanToken = token.trim()
    
    if (!cleanToken) {
      throw new Error('Token is empty')
    }
    
    return jwt.verify(cleanToken, secret) as JWTPayload
  } catch (error) {
    console.error('JWT verification error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token format')
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired')
    } else {
      throw new Error('Token verification failed')
    }
  }
}