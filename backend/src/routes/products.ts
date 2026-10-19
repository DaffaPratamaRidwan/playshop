import { Hono } from 'hono'
import { sql } from '../db'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const productRoutes = new Hono()

// GET /api/categories
productRoutes.get('/categories', async (c) => {
  try {
    const categories = await sql`
      SELECT c.*, COUNT(p.id)::int as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id ASC;
    `
    return c.json({ categories })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch categories' }, 500)
  }
})

// GET /api/products
productRoutes.get('/', async (c) => {
  try {
    const categorySlug = c.req.query('category')
    const search = c.req.query('search')
    const sort = c.req.query('sort') || 'newest'
    const featured = c.req.query('featured')

    let query = sql`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `

    if (categorySlug && categorySlug !== 'all') {
      query = sql`${query} AND c.slug = ${categorySlug}`
    }

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim().toLowerCase()}%`
      query = sql`${query} AND (LOWER(p.name) LIKE ${searchPattern} OR LOWER(p.description) LIKE ${searchPattern})`
    }

    if (featured === 'true') {
      query = sql`${query} AND p.is_featured = true`
    }

    // Sorting
    if (sort === 'price_asc') {
      query = sql`${query} ORDER BY p.price ASC`
    } else if (sort === 'price_desc') {
      query = sql`${query} ORDER BY p.price DESC`
    } else if (sort === 'rating_desc') {
      query = sql`${query} ORDER BY p.rating DESC`
    } else if (sort === 'name_asc') {
      query = sql`${query} ORDER BY p.name ASC`
    } else {
      query = sql`${query} ORDER BY p.id DESC`
    }

    const products = await query
    return c.json({ products })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch products' }, 500)
  }
})

// GET /api/products/:id
productRoutes.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json({ error: 'Invalid product id' }, 400)

    const products = await sql`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
      LIMIT 1;
    `

    if (products.length === 0) {
      return c.json({ error: 'Product not found' }, 404)
    }

    return c.json({ product: products[0] })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to fetch product' }, 500)
  }
})

// ADMIN: POST /api/products
productRoutes.post('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json()
    const { name, category_id, description, price, stock, image_url, rating, is_featured } = body

    if (!name || price === undefined || stock === undefined) {
      return c.json({ error: 'Name, price, and stock are required' }, 400)
    }

    const [product] = await sql`
      INSERT INTO products (
        name, category_id, description, price, stock, image_url, rating, is_featured
      )
      VALUES (
        ${name},
        ${category_id || null},
        ${description || ''},
        ${price},
        ${stock},
        ${image_url || 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'},
        ${rating || 4.5},
        ${Boolean(is_featured)}
      )
      RETURNING *;
    `

    return c.json({ message: 'Product created successfully', product }, 201)
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create product' }, 500)
  }
})

// ADMIN: PUT /api/products/:id
productRoutes.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json({ error: 'Invalid product id' }, 400)

    const body = await c.req.json()
    const { name, category_id, description, price, stock, image_url, rating, is_featured } = body

    const [updated] = await sql`
      UPDATE products
      SET
        name = COALESCE(${name ?? null}, name),
        category_id = CASE WHEN ${category_id !== undefined} THEN ${category_id ?? null} ELSE category_id END,
        description = COALESCE(${description ?? null}, description),
        price = COALESCE(${price ?? null}, price),
        stock = COALESCE(${stock ?? null}, stock),
        image_url = COALESCE(${image_url ?? null}, image_url),
        rating = COALESCE(${rating ?? null}, rating),
        is_featured = CASE WHEN ${is_featured !== undefined} THEN ${Boolean(is_featured)} ELSE is_featured END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `

    if (!updated) {
      return c.json({ error: 'Product not found' }, 404)
    }

    return c.json({ message: 'Product updated successfully', product: updated })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to update product' }, 500)
  }
})

// ADMIN: DELETE /api/products/:id
productRoutes.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json({ error: 'Invalid product id' }, 400)

    const deleted = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING id;
    `

    if (deleted.length === 0) {
      return c.json({ error: 'Product not found' }, 404)
    }

    return c.json({ message: 'Product deleted successfully', id })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to delete product' }, 500)
  }
})

export default productRoutes
