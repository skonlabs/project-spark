import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
)
const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRY = '7d'

export interface JWTPayload {
  sub: string       // userId
  email: string
  workspaceId?: string
  iat?: number
  exp?: number
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as unknown as JWTPayload
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = req.headers.get('authorization')
    const cookieToken = req.cookies.get('auth_token')?.value

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookieToken

    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAuth(req: NextRequest): Promise<JWTPayload> {
  const user = await getAuthUser(req)
  if (!user) {
    throw new AuthError('Unauthorized')
  }
  return user
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export function authErrorResponse(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 })
}
