import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export interface AuthenticatedUser {
  userId: string
  role: 'PATIENT' | 'DOCTOR'
  profileLevel: number
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization token required')
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = verifyToken(token)
    
    // Get user's current profile level
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { profileLevel: true, role: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      userId: payload.userId,
      role: payload.role,
      profileLevel: user.profileLevel
    }
  } catch (error) {
    throw new Error('Invalid or expired token. Please login again.')
  }
}

/**
 * Middleware to require specific profile level
 */
export function requireProfileLevel(requiredLevel: number) {
  return async (request: NextRequest): Promise<AuthenticatedUser> => {
    const user = await requireAuth(request)
    
    if (user.profileLevel < requiredLevel) {
      throw new Error('Please complete your profile to access this feature')
    }
    
    return user
  }
}

/**
 * Helper to create error responses
 */
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Helper to handle middleware errors
 */
export function handleMiddlewareError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  
  if (message.includes('token') || message.includes('login')) {
    return createErrorResponse(message, 401)
  }
  
  if (message.includes('profile')) {
    return createErrorResponse(message, 403)
  }
  
  return createErrorResponse(message, 400)
}