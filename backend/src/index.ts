import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { initDatabase, sql } from './db'
import { seedDatabase } from './seed'
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import adminRoutes from './routes/admin'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true
}))

// Root & Healthcheck
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Welcome to Snack Shop API 🍿',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/products',
      '/api/cart',
      '/api/orders',
      '/api/admin',
      '/api/qris-info'
    ]
  })
})

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public QRIS image & info for customer checkout and take away payment
app.get('/api/qris-info', async (c) => {
  try {
    const settings = await sql`
      SELECT key, value FROM store_settings 
      WHERE key IN ('qris_image_url', 'qris_merchant_name', 'qris_nmid');
    `
    const qrisMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
    return c.json({
      image_url: qrisMap.qris_image_url || '',
      merchant_name: qrisMap.qris_merchant_name || 'SnackVault Express Counter',
      nmid: qrisMap.qris_nmid || 'ID102026SNACK998'
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch QRIS info' }, 500)
  }
})

// Mount API routes
app.route('/api/auth', authRoutes)
app.route('/api/products', productRoutes)
app.route('/api/cart', cartRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/admin', adminRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Unhandled API Error:', err)
  return c.json({ error: err.message || 'Internal Server Error' }, 500)
})

// Auto-run schema migrations and seeding on start
async function startServer() {
  try {
    await initDatabase()
    await seedDatabase()
    console.log('🚀 Snack Shop backend server running on http://localhost:' + (process.env.PORT || 4000))
  } catch (err) {
    console.error('Failed to initialize database:', err)
  }
}

startServer()

export default {
  port: Number(process.env.PORT) || 4000,
  fetch: app.fetch
}
