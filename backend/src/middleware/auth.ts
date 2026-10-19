import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { sql } from '../db'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_snackshop_jwt_token_key_2026'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: missing or invalid Authorization header' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256') as { id: number; email: string; role: 'user' | 'admin' }
    
    // Fetch fresh user from DB
    const users = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${payload.id} LIMIT 1;
    `
    if (users.length === 0) {
      return c.json({ error: 'Unauthorized: user no longer exists' }, 401)
    }

    c.set('user', users[0] as AuthUser)
    await next()
  } catch (err) {
    return c.json({ error: 'Unauthorized: invalid or expired token' }, 401)
  }
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const payload = await verify(token, JWT_SECRET, 'HS256') as { id: number }
      const users = await sql`
        SELECT id, name, email, role FROM users WHERE id = ${payload.id} LIMIT 1;
      `
      if (users.length > 0) {
        c.set('user', users[0] as AuthUser)
      }
    } catch {
      // Ignore invalid token in optional auth
    }
  }
  await next()
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden: admin access required' }, 403)
  }
  await next()
}
