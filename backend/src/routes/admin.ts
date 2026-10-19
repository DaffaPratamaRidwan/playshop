import { Hono } from 'hono'
import { sql } from '../db'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const adminRoutes = new Hono()

adminRoutes.use('*', authMiddleware, adminMiddleware)

// GET /api/admin/orders
adminRoutes.get('/orders', async (c) => {
  try {
    const status = c.req.query('status')
    const paymentStatus = c.req.query('payment_status')

    let query = sql`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `

    if (status && status !== 'all') {
      query = sql`${query} AND o.status = ${status}`
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query = sql`${query} AND o.payment_status = ${paymentStatus}`
    }

    query = sql`${query} ORDER BY o.id DESC`

    const orders = await query

    if (orders.length === 0) {
      return c.json({ orders: [] })
    }

    const orderIds = orders.map(o => o.id)
    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ANY(${orderIds});
    `

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id)
    }))

    return c.json({ orders: ordersWithItems })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch admin orders' }, 500)
  }
})

// PATCH /api/admin/orders/:id/status
adminRoutes.patch('/orders/:id/status', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    const { status } = await c.req.json()

    const validStatuses = ['pending', 'preparing', 'ready_for_pickup', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400)
    }

    const [currentOrder] = await sql`SELECT status FROM orders WHERE id = ${id} LIMIT 1;`
    if (!currentOrder) {
      return c.json({ error: 'Order not found' }, 404)
    }

    // If transitioning to cancelled, restore stock
    if (currentOrder.status !== 'cancelled' && status === 'cancelled') {
      const orderItems = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${id};`
      for (const item of orderItems) {
        if (item.product_id) {
          await sql`
            UPDATE products
            SET stock = stock + ${item.quantity}
            WHERE id = ${item.product_id};
          `
        }
      }
    }

    // If un-cancelling, re-deduct stock
    if (currentOrder.status === 'cancelled' && status !== 'cancelled') {
      const orderItems = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${id};`
      for (const item of orderItems) {
        if (item.product_id) {
          await sql`
            UPDATE products
            SET stock = GREATEST(0, stock - ${item.quantity})
            WHERE id = ${item.product_id};
          `
        }
      }
    }

    const [updated] = await sql`
      UPDATE orders
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `

    return c.json({ message: 'Order status updated', order: updated })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update order status' }, 500)
  }
})

// PATCH /api/admin/orders/:id/payment
adminRoutes.patch('/orders/:id/payment', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    const { payment_status } = await c.req.json()

    const validStatuses = ['unpaid', 'paid', 'failed', 'refunded']
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return c.json({ error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` }, 400)
    }

    const [updated] = await sql`
      UPDATE orders
      SET payment_status = ${payment_status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `

    if (!updated) {
      return c.json({ error: 'Order not found' }, 404)
    }

    return c.json({ message: 'Payment status updated', order: updated })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update payment status' }, 500)
  }
})

// GET /api/admin/analytics
adminRoutes.get('/analytics', async (c) => {
  try {
    // Total Revenue (from paid orders)
    const [rev] = await sql`
      SELECT COALESCE(SUM(total), 0)::numeric(10,2) as total_revenue
      FROM orders
      WHERE payment_status = 'paid';
    `

    // Total Orders count
    const [ordersCount] = await sql`
      SELECT COUNT(*)::int as total_orders FROM orders;
    `

    // Pending Orders count
    const [pendingCount] = await sql`
      SELECT COUNT(*)::int as pending_orders FROM orders WHERE status = 'pending';
    `

    // True total count of low stock products (stock <= 25)
    const [lowStockCountRes] = await sql`
      SELECT COUNT(*)::int as count FROM products WHERE stock <= 25;
    `

    // Top low stock products list (up to 10 for dashboard widget)
    const lowStockProducts = await sql`
      SELECT id, name, stock, price, image_url 
      FROM products 
      WHERE stock <= 25 
      ORDER BY stock ASC 
      LIMIT 10;
    `

    // Recent 5 orders
    const recentOrders = await sql`
      SELECT o.id, o.order_number, o.total, o.status, o.payment_status, o.created_at, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
      LIMIT 5;
    `

    // Total Users
    const [usersCount] = await sql`
      SELECT COUNT(*)::int as total_users FROM users WHERE role = 'user';
    `

    // Category Sales breakdown (strictly confirmed paid orders)
    const categoryStats = await sql`
      SELECT 
        c.name as category_name,
        COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0)::int as total_sold,
        COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.total_price ELSE 0 END), 0)::numeric(10,2) as total_sales
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC;
    `

    return c.json({
      total_revenue: Number(rev.total_revenue),
      total_orders: ordersCount.total_orders,
      pending_orders: pendingCount.pending_orders,
      total_users: usersCount.total_users,
      low_stock_count: lowStockCountRes.count,
      low_stock_products: lowStockProducts,
      recent_orders: recentOrders,
      category_stats: categoryStats
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch analytics' }, 500)
  }
})

// GET /api/admin/profile
adminRoutes.get('/profile', async (c) => {
  try {
    const adminUser = c.get('user')
    const [user] = await sql`
      SELECT id, name, email, role, department, phone, bio, avatar_url, created_at
      FROM users
      WHERE id = ${adminUser.id}
      LIMIT 1;
    `

    const settings = await sql`
      SELECT key, value, updated_at FROM store_settings 
      WHERE key IN ('qris_image_url', 'qris_merchant_name', 'qris_nmid');
    `
    const qrisMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

    return c.json({
      admin: user || adminUser,
      qris: {
        image_url: qrisMap.qris_image_url || '',
        merchant_name: qrisMap.qris_merchant_name || 'SnackVault Express Counter',
        nmid: qrisMap.qris_nmid || 'ID102026SNACK998',
        updated_at: settings[0]?.updated_at || new Date().toISOString()
      }
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch admin profile' }, 500)
  }
})

// PUT /api/admin/profile
adminRoutes.put('/profile', async (c) => {
  try {
    const adminUser = c.get('user')
    const body = await c.req.json()
    const { name, department, phone, bio, avatar_url, new_password } = body

    if (new_password && new_password.length < 6) {
      return c.json({ error: 'New password must be at least 6 characters' }, 400)
    }

    if (new_password) {
      const passwordHash = await Bun.password.hash(new_password)
      await sql`
        UPDATE users
        SET 
          name = COALESCE(${name?.trim() || null}, name),
          department = COALESCE(${department?.trim() || null}, department),
          phone = COALESCE(${phone?.trim() || null}, phone),
          bio = COALESCE(${bio?.trim() || null}, bio),
          avatar_url = COALESCE(${avatar_url?.trim() || null}, avatar_url),
          password_hash = ${passwordHash}
        WHERE id = ${adminUser.id};
      `
    } else {
      await sql`
        UPDATE users
        SET 
          name = COALESCE(${name?.trim() || null}, name),
          department = COALESCE(${department?.trim() || null}, department),
          phone = COALESCE(${phone?.trim() || null}, phone),
          bio = COALESCE(${bio?.trim() || null}, bio),
          avatar_url = COALESCE(${avatar_url?.trim() || null}, avatar_url)
        WHERE id = ${adminUser.id};
      `
    }

    const [updated] = await sql`
      SELECT id, name, email, role, department, phone, bio, avatar_url, created_at
      FROM users
      WHERE id = ${adminUser.id}
      LIMIT 1;
    `

    return c.json({ message: 'Admin profile updated successfully', admin: updated })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update admin profile' }, 500)
  }
})

// GET /api/admin/qris
adminRoutes.get('/qris', async (c) => {
  try {
    const settings = await sql`
      SELECT key, value, updated_at FROM store_settings 
      WHERE key IN ('qris_image_url', 'qris_merchant_name', 'qris_nmid');
    `
    const qrisMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
    return c.json({
      image_url: qrisMap.qris_image_url || '',
      merchant_name: qrisMap.qris_merchant_name || 'SnackVault Express Counter',
      nmid: qrisMap.qris_nmid || 'ID102026SNACK998',
      updated_at: settings[0]?.updated_at || new Date().toISOString()
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch QRIS settings' }, 500)
  }
})

// PUT /api/admin/qris (Change QRIS Image and configuration)
adminRoutes.put('/qris', async (c) => {
  try {
    const body = await c.req.json()
    const { image_url, merchant_name, nmid } = body

    if (!image_url || typeof image_url !== 'string') {
      return c.json({ error: 'Valid QRIS image (URL or data URL) is required' }, 400)
    }

    // Upsert the values
    await sql`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES 
        ('qris_image_url', ${image_url}, CURRENT_TIMESTAMP),
        ('qris_merchant_name', ${merchant_name?.trim() || 'SnackVault Express Counter'}, CURRENT_TIMESTAMP),
        ('qris_nmid', ${nmid?.trim() || 'ID102026SNACK998'}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
    `

    return c.json({
      message: 'QRIS image & gateway details updated successfully',
      qris: {
        image_url,
        merchant_name: merchant_name?.trim() || 'SnackVault Express Counter',
        nmid: nmid?.trim() || 'ID102026SNACK998',
        updated_at: new Date().toISOString()
      }
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update QRIS settings' }, 500)
  }
})

export default adminRoutes
