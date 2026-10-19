import { Hono } from 'hono'
import { sql } from '../db'
import { authMiddleware } from '../middleware/auth'

const orderRoutes = new Hono()

orderRoutes.use('*', authMiddleware)

// Helper to generate unique order number
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `SNK-${dateStr}-${randomSuffix}`
}

// POST /api/orders/checkout
orderRoutes.post('/checkout', async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()

    const {
      pickup_name,
      pickup_phone,
      pickup_time = 'Ready in 10-15 minutes',
      pickup_notes = '',
      payment_method = 'qris',
      // backward-compatible fallbacks if old keys sent
      shipping_name,
      shipping_phone
    } = body

    const customerName = (pickup_name || shipping_name || user.name || '').trim()
    const customerPhone = (pickup_phone || shipping_phone || '').trim()

    if (!customerName || !customerPhone) {
      return c.json({ error: 'Please provide customer name and phone number for take away pickup' }, 400)
    }

    if (payment_method !== 'qris') {
      return c.json({ error: 'Only QRIS payment gateway is supported' }, 400)
    }

    // Fetch user's cart items from DB
    let cartItems = await sql`
      SELECT 
        c.product_id,
        c.quantity,
        p.name,
        p.price,
        p.stock,
        p.image_url
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ${user.id};
    `

    // Fallback: If DB cart is empty, support items sent in request body (e.g. guest cart conversion)
    if (cartItems.length === 0 && Array.isArray(body.items) && body.items.length > 0) {
      const productIds = body.items.map((i: any) => Number(i.product_id)).filter((id: number) => !isNaN(id) && id > 0)
      if (productIds.length > 0) {
        const prods = await sql`
          SELECT id as product_id, name, price, stock, image_url
          FROM products
          WHERE id = ANY(${productIds});
        `
        const prodsMap = new Map(prods.map(p => [p.product_id, p]))
        const resolvedItems: any[] = []
        for (const rawItem of body.items) {
          const p = prodsMap.get(Number(rawItem.product_id))
          if (p) {
            resolvedItems.push({
              product_id: p.product_id,
              quantity: Math.max(1, Number(rawItem.quantity) || 1),
              name: p.name,
              price: p.price,
              stock: p.stock,
              image_url: p.image_url
            })
          }
        }
        cartItems = resolvedItems as any
      }
    }

    if (cartItems.length === 0) {
      return c.json({ error: 'Your cart is empty' }, 400)
    }

    // Check stock for all items
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return c.json({
          error: `Insufficient stock for "${item.name}". Available: ${item.stock}, requested: ${item.quantity}`
        }, 400)
      }
    }

    // Calculate financials in Rupiah (Take Away: Rp 0 shipping fee!)
    const rawSubtotal = Math.round(cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0))
    
    // Support promo code (e.g. SNACK10 = 10% discount)
    const promoCode = (body.promo_code || '').trim().toUpperCase()
    const discount = promoCode === 'SNACK10' ? Math.round(rawSubtotal * 0.10) : 0
    const subtotal = Math.max(0, rawSubtotal - discount)

    const shippingFee = 0 // No shipping fee for Take Away!
    const tax = Math.round(subtotal * 0.08) // 8% tax
    const total = subtotal + tax

    const orderNumber = generateOrderNumber()
    const pickupCode = 'TKW-' + Math.floor(1000 + Math.random() * 9000)

    // Determine initial payment and order status (Take Away + QRIS)
    const paymentStatus = 'unpaid'
    const orderStatus = 'pending'
    const paymentDetails: Record<string, any> = {
      method: 'qris',
      order_type: 'take_away',
      pickup_code: pickupCode,
      pickup_name: customerName,
      pickup_phone: customerPhone,
      pickup_time: pickup_time,
      pickup_notes: pickup_notes,
      pickup_location: 'SnackVault Express Counter - Ground Floor #G-08',
      initiated_at: new Date().toISOString(),
      qris_code: `00020101021226${Math.floor(100000000000 + Math.random() * 900000000000)}5204541153033605802ID5914SNACK SHOP INC6007JAKARTA6304`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      reference_no: `QRIS-${Date.now()}`
    }

    // Insert Order
    const [newOrder] = await sql`
      INSERT INTO orders (
        order_number,
        user_id,
        subtotal,
        shipping_fee,
        tax,
        total,
        status,
        payment_status,
        payment_method,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        payment_details
      ) VALUES (
        ${orderNumber},
        ${user.id},
        ${subtotal},
        ${shippingFee},
        ${tax},
        ${total},
        ${orderStatus},
        ${paymentStatus},
        'qris',
        ${customerName},
        ${customerPhone},
        ${pickup_notes || 'Take Away at Counter'},
        ${pickup_time || 'Ready in 10-15 mins'},
        ${pickupCode},
        ${JSON.stringify(paymentDetails)}
      )
      RETURNING *;
    `

    // Insert Order Items and Deduct Stock
    for (const item of cartItems) {
      const itemTotal = Number((Number(item.price) * item.quantity).toFixed(2))

      await sql`
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          product_image,
          price,
          quantity,
          total_price
        ) VALUES (
          ${newOrder.id},
          ${item.product_id},
          ${item.name},
          ${item.image_url},
          ${item.price},
          ${item.quantity},
          ${itemTotal}
        );
      `

      // Deduct stock
      await sql`
        UPDATE products 
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.product_id};
      `
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${user.id};`

    // Fetch items with order
    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ${newOrder.id};
    `

    return c.json({
      message: 'Order placed successfully',
      order: {
        ...newOrder,
        items
      }
    }, 201)
  } catch (err: any) {
    console.error('Checkout error:', err)
    return c.json({ error: err.message || 'Checkout failed' }, 500)
  }
})

// GET /api/orders (user's order history)
orderRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')

    const orders = await sql`
      SELECT * FROM orders 
      WHERE user_id = ${user.id}
      ORDER BY id DESC;
    `

    if (orders.length === 0) {
      return c.json({ orders: [] })
    }

    const orderIds = orders.map(o => o.id)
    const items = await sql`
      SELECT * FROM order_items 
      WHERE order_id = ANY(${orderIds});
    `

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id)
    }))

    return c.json({ orders: ordersWithItems })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch orders' }, 500)
  }
})

// GET /api/orders/:id
orderRoutes.get('/:id', async (c) => {
  try {
    const user = c.get('user')
    const id = Number(c.req.param('id'))

    const orders = await sql`
      SELECT * FROM orders 
      WHERE id = ${id} ${user.role === 'admin' ? sql`` : sql`AND user_id = ${user.id}`}
      LIMIT 1;
    `

    if (orders.length === 0) {
      return c.json({ error: 'Order not found' }, 404)
    }

    const order = orders[0]
    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ${order.id};
    `

    return c.json({ order: { ...order, items } })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch order' }, 500)
  }
})

// POST /api/orders/:id/pay (simulate / confirm payment)
orderRoutes.post('/:id/pay', async (c) => {
  try {
    const user = c.get('user')
    const id = Number(c.req.param('id'))

    const orders = await sql`
      SELECT * FROM orders 
      WHERE id = ${id} ${user.role === 'admin' ? sql`` : sql`AND user_id = ${user.id}`}
      LIMIT 1;
    `

    if (orders.length === 0) {
      return c.json({ error: 'Order not found' }, 404)
    }

    const order = orders[0]

    if (order.payment_status === 'paid') {
      return c.json({ error: 'Order is already paid', order }, 400)
    }

    const currentDetails = typeof order.payment_details === 'string' 
      ? JSON.parse(order.payment_details) 
      : (order.payment_details || {})

    const updatedDetails = {
      ...currentDetails,
      paid_at: new Date().toISOString(),
      transaction_id: `TXN-SIM-${Date.now()}`
    }

    const [updatedOrder] = await sql`
      UPDATE orders
      SET 
        payment_status = 'paid',
        status = CASE WHEN status = 'pending' THEN 'preparing' ELSE status END,
        payment_details = ${JSON.stringify(updatedDetails)},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `

    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ${id};
    `

    return c.json({
      message: 'Payment verified successfully!',
      order: {
        ...updatedOrder,
        items
      }
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Payment simulation failed' }, 500)
  }
})

// POST /api/orders/:id/cancel (User or admin cancels order, restores stock)
orderRoutes.post('/:id/cancel', async (c) => {
  try {
    const user = c.get('user')
    const id = Number(c.req.param('id'))

    const orders = await sql`
      SELECT * FROM orders 
      WHERE id = ${id} ${user.role === 'admin' ? sql`` : sql`AND user_id = ${user.id}`}
      LIMIT 1;
    `

    if (orders.length === 0) {
      return c.json({ error: 'Order not found' }, 404)
    }

    const order = orders[0]

    if (order.status === 'completed') {
      return c.json({ error: 'Completed orders cannot be cancelled' }, 400)
    }

    if (order.status === 'cancelled') {
      return c.json({ error: 'Order is already cancelled' }, 400)
    }

    // Restore stock to products
    const items = await sql`
      SELECT product_id, quantity FROM order_items WHERE order_id = ${id};
    `
    for (const item of items) {
      if (item.product_id) {
        await sql`
          UPDATE products
          SET stock = stock + ${item.quantity}
          WHERE id = ${item.product_id};
        `
      }
    }

    const [updatedOrder] = await sql`
      UPDATE orders
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `

    return c.json({
      message: 'Order cancelled and stock restored successfully',
      order: updatedOrder
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to cancel order' }, 500)
  }
})

export default orderRoutes
