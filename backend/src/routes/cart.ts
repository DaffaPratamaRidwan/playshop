import { Hono } from 'hono'
import { sql } from '../db'
import { authMiddleware } from '../middleware/auth'

const cartRoutes = new Hono()

// Apply auth middleware to all cart endpoints
cartRoutes.use('*', authMiddleware)

// Helper to fetch full cart for user
async function getUserCart(userId: number) {
  const items = await sql`
    SELECT 
      c.id,
      c.user_id,
      c.product_id,
      c.quantity,
      p.name,
      p.price,
      p.stock,
      p.image_url,
      p.description,
      (c.quantity * p.price)::numeric(10,2) as total_price
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ${userId}
    ORDER BY c.id ASC;
  `

  const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    total_items: totalItems
  }
}

// GET /api/cart
cartRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const cart = await getUserCart(user.id)
    return c.json(cart)
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch cart' }, 500)
  }
})

// POST /api/cart/add
cartRoutes.post('/add', async (c) => {
  try {
    const user = c.get('user')
    const { product_id, quantity = 1 } = await c.req.json()

    if (!product_id || quantity <= 0) {
      return c.json({ error: 'Valid product_id and positive quantity required' }, 400)
    }

    // Check product existence and stock
    const products = await sql`
      SELECT id, name, stock, price FROM products WHERE id = ${product_id} LIMIT 1;
    `
    if (products.length === 0) {
      return c.json({ error: 'Product not found' }, 404)
    }

    const product = products[0]
    if (product.stock <= 0) {
      return c.json({ error: 'Product is out of stock' }, 400)
    }

    // Check existing cart quantity
    const existing = await sql`
      SELECT quantity FROM cart_items WHERE user_id = ${user.id} AND product_id = ${product_id} LIMIT 1;
    `
    const currentQty = existing.length > 0 ? existing[0].quantity : 0
    const newQty = currentQty + Number(quantity)

    if (newQty > product.stock) {
      return c.json({
        error: `Cannot add more. Only ${product.stock} items in stock (you already have ${currentQty} in cart).`
      }, 400)
    }

    await sql`
      INSERT INTO cart_items (user_id, product_id, quantity, updated_at)
      VALUES (${user.id}, ${product_id}, ${newQty}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = ${newQty}, updated_at = CURRENT_TIMESTAMP;
    `

    const cart = await getUserCart(user.id)
    return c.json({ message: 'Item added to cart', cart })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to add item to cart' }, 500)
  }
})

// PUT /api/cart/update
cartRoutes.put('/update', async (c) => {
  try {
    const user = c.get('user')
    const { product_id, quantity } = await c.req.json()

    if (!product_id || quantity === undefined) {
      return c.json({ error: 'product_id and quantity are required' }, 400)
    }

    const qty = Number(quantity)

    if (qty <= 0) {
      // Remove item
      await sql`
        DELETE FROM cart_items WHERE user_id = ${user.id} AND product_id = ${product_id};
      `
    } else {
      // Check stock
      const products = await sql`
        SELECT stock FROM products WHERE id = ${product_id} LIMIT 1;
      `
      if (products.length === 0) {
        return c.json({ error: 'Product not found' }, 404)
      }

      if (qty > products[0].stock) {
        return c.json({ error: `Cannot update quantity. Only ${products[0].stock} available in stock.` }, 400)
      }

      await sql`
        UPDATE cart_items
        SET quantity = ${qty}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user.id} AND product_id = ${product_id};
      `
    }

    const cart = await getUserCart(user.id)
    return c.json({ message: 'Cart updated', cart })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update cart' }, 500)
  }
})

// DELETE /api/cart/remove/:productId
cartRoutes.delete('/remove/:productId', async (c) => {
  try {
    const user = c.get('user')
    const productId = Number(c.req.param('productId'))

    await sql`
      DELETE FROM cart_items WHERE user_id = ${user.id} AND product_id = ${productId};
    `

    const cart = await getUserCart(user.id)
    return c.json({ message: 'Item removed from cart', cart })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to remove item' }, 500)
  }
})

// POST /api/cart/clear
cartRoutes.post('/clear', async (c) => {
  try {
    const user = c.get('user')
    await sql`
      DELETE FROM cart_items WHERE user_id = ${user.id};
    `
    return c.json({ message: 'Cart cleared', cart: { items: [], subtotal: 0, total_items: 0 } })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to clear cart' }, 500)
  }
})

export default cartRoutes
