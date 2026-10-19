import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:pass123456@localhost:5432/snackshop_db'

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  transform: {
    undefined: null,
  },
})

export async function initDatabase() {
  console.log('🔄 Initializing database schema...')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      icon VARCHAR(50),
      description TEXT
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      category_id INT REFERENCES categories(id) ON DELETE SET NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      image_url TEXT,
      rating DECIMAL(2,1) DEFAULT 4.8,
      is_featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      product_id INT REFERENCES products(id) ON DELETE CASCADE,
      quantity INT NOT NULL CHECK (quantity > 0),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      subtotal DECIMAL(10, 2) NOT NULL,
      shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
      tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
      total DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
      payment_method VARCHAR(50) NOT NULL,
      shipping_name VARCHAR(100) NOT NULL,
      shipping_phone VARCHAR(50) NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city VARCHAR(100) NOT NULL,
      shipping_postal_code VARCHAR(20),
      payment_details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id) ON DELETE CASCADE,
      product_id INT REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(200) NOT NULL,
      product_image TEXT,
      price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL
    );
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`

  // User Profile Columns
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'Store Operations';`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '+62 812-3456-7890';`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Store Administrator & Operations Manager at SnackVault.';`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';`

  // Store Settings (for QRIS image and configuration)
  await sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Default Standard QRIS SVG graphic
  const defaultQrisSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380"><rect width="300" height="380" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><rect x="15" y="15" width="270" height="50" rx="10" fill="%23dc2626"/><text x="150" y="48" font-family="Arial,sans-serif" font-weight="900" font-size="24" fill="%23ffffff" text-anchor="middle" letter-spacing="2">QRIS</text><text x="150" y="80" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="%231e293b" text-anchor="middle">SNACKVAULT TAKE AWAY</text><text x="150" y="96" font-family="monospace" font-weight="600" font-size="10" fill="%2364748b" text-anchor="middle">NMID: ID102026SNACK998</text><rect x="35" y="110" width="230" height="230" rx="8" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5"/><rect x="55" y="130" width="48" height="48" rx="6" fill="%230f172a"/><rect x="63" y="138" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="71" y="146" width="16" height="16" rx="2" fill="%230f172a"/><rect x="197" y="130" width="48" height="48" rx="6" fill="%230f172a"/><rect x="205" y="138" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="213" y="146" width="16" height="16" rx="2" fill="%230f172a"/><rect x="55" y="272" width="48" height="48" rx="6" fill="%230f172a"/><rect x="63" y="280" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="71" y="288" width="16" height="16" rx="2" fill="%230f172a"/><rect x="115" y="135" width="12" height="12" fill="%230f172a"/><rect x="135" y="145" width="14" height="14" fill="%230f172a"/><rect x="160" y="135" width="12" height="12" fill="%230f172a"/><rect x="115" y="165" width="16" height="16" fill="%230f172a"/><rect x="145" y="170" width="20" height="12" fill="%230f172a"/><rect x="115" y="195" width="25" height="12" fill="%230f172a"/><rect x="150" y="195" width="12" height="25" fill="%230f172a"/><rect x="175" y="180" width="14" height="14" fill="%230f172a"/><rect x="175" y="210" width="20" height="15" fill="%230f172a"/><rect x="70" y="195" width="14" height="14" fill="%230f172a"/><rect x="90" y="215" width="14" height="14" fill="%230f172a"/><rect x="65" y="235" width="25" height="12" fill="%230f172a"/><rect x="115" y="235" width="15" height="15" fill="%230f172a"/><rect x="140" y="230" width="22" height="22" fill="%230f172a"/><rect x="170" y="240" width="15" height="15" fill="%230f172a"/><rect x="200" y="195" width="18" height="18" fill="%230f172a"/><rect x="225" y="225" width="15" height="25" fill="%230f172a"/><rect x="205" y="260" width="18" height="18" fill="%230f172a"/><rect x="120" y="275" width="18" height="18" fill="%230f172a"/><rect x="145" y="270" width="24" height="14" fill="%230f172a"/><rect x="175" y="285" width="16" height="16" fill="%230f172a"/><rect x="135" y="305" width="30" height="15" fill="%230f172a"/><circle cx="150" cy="225" r="18" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="150" y="229" font-family="Arial,sans-serif" font-weight="900" font-size="10" fill="%23dc2626" text-anchor="middle">QRIS</text><text x="150" y="360" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="%2394a3b8" text-anchor="middle">DICETAK OLEH: SNACKVAULT INDONESIA</text></svg>`

  await sql`
    INSERT INTO store_settings (key, value)
    VALUES 
      ('qris_image_url', ${defaultQrisSvg}),
      ('qris_merchant_name', 'SnackVault Express Counter'),
      ('qris_nmid', 'ID102026SNACK998')
    ON CONFLICT (key) DO NOTHING;
  `

  console.log('✅ Database schema ready.')
}
