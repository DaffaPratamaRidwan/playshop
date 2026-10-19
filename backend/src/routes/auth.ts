import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { sql } from '../db'
import { authMiddleware } from '../middleware/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_snackshop_jwt_token_key_2026'

const authRoutes = new Hono()

// POST /api/auth/register
authRoutes.post('/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json()

    if (!name || !email || !password) {
      return c.json({ error: 'Name, email, and password are required' }, 400)
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }

    const cleanEmail = email.trim().toLowerCase()

    // Check if email already registered
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
    `
    if (existing.length > 0) {
      return c.json({ error: 'Email is already registered' }, 409)
    }

    const passwordHash = await Bun.password.hash(password)

    const [newUser] = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name.trim()}, ${cleanEmail}, ${passwordHash}, 'user')
      RETURNING id, name, email, role, created_at;
    `

    const token = await sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
      },
      JWT_SECRET,
      'HS256'
    )

    return c.json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, 201)
  } catch (err: any) {
    console.error('Registration error:', err)
    return c.json({ error: err.message || 'Failed to register' }, 500)
  }
})

// POST /api/auth/register-admin (Dedicated Admin Registration)
authRoutes.post('/register-admin', async (c) => {
  try {
    const { name, email, password, admin_secret, department } = await c.req.json()

    if (!name || !email || !password || !admin_secret) {
      return c.json({ error: 'Name, email, password, and admin authorization key are required' }, 400)
    }

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'SNACK-ADMIN-2026'
    if (admin_secret.trim() !== expectedSecret.trim()) {
      return c.json({ error: 'Invalid admin authorization secret key. Access denied.' }, 403)
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }

    const cleanEmail = email.trim().toLowerCase()

    // Check if email already registered
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
    `
    if (existing.length > 0) {
      return c.json({ error: 'Email is already registered' }, 409)
    }

    const passwordHash = await Bun.password.hash(password)

    const [newAdmin] = await sql`
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES (${name.trim()}, ${cleanEmail}, ${passwordHash}, 'admin', ${department || 'Store Operations'})
      RETURNING id, name, email, role, department, created_at;
    `

    const token = await sign(
      {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
      },
      JWT_SECRET,
      'HS256'
    )

    return c.json({
      message: 'Admin account created successfully',
      token,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        department: newAdmin.department || 'Store Operations'
      }
    }, 201)
  } catch (err: any) {
    console.error('Admin registration error:', err)
    return c.json({ error: err.message || 'Failed to register admin' }, 500)
  }
})

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const cleanEmail = email.trim().toLowerCase()

    const users = await sql`
      SELECT id, name, email, password_hash, role FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
    `

    if (users.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const user = users[0]
    const isMatch = await Bun.password.verify(password, user.password_hash)

    if (!isMatch) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
      },
      JWT_SECRET,
      'HS256'
    )

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err: any) {
    console.error('Login error:', err)
    return c.json({ error: err.message || 'Failed to login' }, 500)
  }
})

// GET /api/auth/me
authRoutes.get('/me', authMiddleware, async (c) => {
  const tokenUser = c.get('user')
  const [user] = await sql`
    SELECT id, name, email, role, department, phone, bio, avatar_url, created_at
    FROM users
    WHERE id = ${tokenUser.id}
    LIMIT 1;
  `
  return c.json({ user: user || tokenUser })
})

export default authRoutes
