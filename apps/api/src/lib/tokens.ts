import { createHash, randomBytes } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '../config/env.js'

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET)

export function randomToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(accessSecret)
}

export async function verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, accessSecret)
  if (!payload.sub) {
    throw new Error('Token sem sujeito')
  }
  return payload.sub
}
