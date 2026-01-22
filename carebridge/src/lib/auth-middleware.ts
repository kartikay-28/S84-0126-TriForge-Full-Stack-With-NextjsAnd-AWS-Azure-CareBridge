import { NextRequest } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Authorization token required' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)

      // Add user to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = payload

      return handler(authenticatedRequest)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

export function requireRole(role: 'PATIENT' | 'DOCTOR') {
  return function(handler: (req: AuthenticatedRequest) => Promise<Response>) {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (req.user.role !== role) {
        return new Response(
          JSON.stringify({ error: `Access denied. ${role} role required.` }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      return handler(req)
    })
  }
}