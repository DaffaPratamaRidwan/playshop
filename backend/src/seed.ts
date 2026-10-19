import { sql } from './db'

export async function seedDatabase() {
  // Check if users already exist
  const existingUsers = await sql`SELECT count(*)::int as count FROM users;`
  if (existingUsers[0].count === 0) {
    console.log('🌱 Seeding initial users...')
    const adminPasswordHash = await Bun.password.hash('admin123')
    const userPasswordHash = await Bun.password.hash('user123')

    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES 
        ('Admin User', 'admin@snackshop.com', ${adminPasswordHash}, 'admin'),
        ('John Snacklover', 'user@snackshop.com', ${userPasswordHash}, 'user');
    `
    console.log('✅ Users seeded: admin@snackshop.com / admin123, user@snackshop.com / user123')
  }

  // Check if categories exist
  const existingCategories = await sql`SELECT count(*)::int as count FROM categories;`
  if (existingCategories[0].count === 0) {
    console.log('🌱 Seeding categories...')
    await sql`
      INSERT INTO categories (name, slug, icon, description)
      VALUES
        ('Chips & Crisps', 'chips-crisps', 'Cookie', 'Crunchy, seasoned potato and tortilla crisps'),
        ('Chocolates & Sweets', 'chocolates-sweets', 'Candy', 'Rich cocoa treats and chewy gourmet candies'),
        ('Bakery & Cookies', 'bakery-cookies', 'Cake', 'Freshly baked biscuits, cookies and wafers'),
        ('Beverages', 'beverages', 'Coffee', 'Refreshing craft sodas, iced teas, and cold brews'),
        ('Nuts & Healthy', 'nuts-healthy', 'Apple', 'Protein-packed roasted nuts and organic dried fruits');
    `
  }

  // Check if products exist
  const existingProducts = await sql`SELECT count(*)::int as count FROM products;`
  if (existingProducts[0].count === 0) {
    console.log('🌱 Seeding products...')
    const categories = await sql`SELECT id, slug FROM categories;`
    const catMap = new Map(categories.map(c => [c.slug, c.id]))

    const sampleProducts = [
      {
        categoryId: catMap.get('chips-crisps'),
        name: 'Black Truffle Potato Chips',
        description: 'Crispy kettle-cooked potato chips dusted with aromatic black summer truffle and sea salt.',
        price: 49000,
        stock: 45,
        rating: 4.9,
        is_featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('chips-crisps'),
        name: 'Spicy Wasabi Rice Crackers',
        description: 'Traditional Japanese baked rice crackers glazed with soy sauce and fiery wasabi.',
        price: 35000,
        stock: 30,
        rating: 4.7,
        is_featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('chips-crisps'),
        name: 'Honey Mustard Tortilla Twists',
        description: 'Spiral corn twists packed with tangy honey mustard and smoked paprika punch.',
        price: 39000,
        stock: 50,
        rating: 4.6,
        is_featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('chocolates-sweets'),
        name: 'Belgian 72% Dark Chocolate Bar',
        description: 'Single-origin cocoa beans crafted into velvety dark chocolate with subtle vanilla undertones.',
        price: 55000,
        stock: 40,
        rating: 5.0,
        is_featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('chocolates-sweets'),
        name: 'Matcha White Chocolate Truffles',
        description: 'Delicate Kyoto matcha green tea infused creamy white chocolate ganache dusted in ceremonial powder.',
        price: 69000,
        stock: 25,
        rating: 4.9,
        is_featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('chocolates-sweets'),
        name: 'Artisanal Sour Berry Gummies',
        description: 'Real fruit juice gummy candies with raspberry, blackberry and tangy pomegranate zests.',
        price: 32000,
        stock: 60,
        rating: 4.5,
        is_featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('bakery-cookies'),
        name: 'Sea Salt Caramel Stroopwafels',
        description: 'Authentic Dutch thin waffles sandwiched with melted sea salt caramel.',
        price: 45000,
        stock: 35,
        rating: 4.8,
        is_featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('bakery-cookies'),
        name: 'Double Chocolate Fudge Cookies',
        description: 'Soft-baked cookies loaded with Belgian dark chocolate chunks and molten fudge center.',
        price: 42000,
        stock: 28,
        rating: 4.9,
        is_featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('bakery-cookies'),
        name: 'French Butter Madeleines (Pack of 6)',
        description: 'Classic shell-shaped sponge cakes with subtle lemon zest and rich European butter.',
        price: 59000,
        stock: 20,
        rating: 4.7,
        is_featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('beverages'),
        name: 'Sparkling Yuzu Citrus Soda',
        description: 'Craft soda made with cold-pressed Japanese yuzu fruit juice and delicate fizzy bubbles.',
        price: 38000,
        stock: 45,
        rating: 4.8,
        is_featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('beverages'),
        name: 'Cold Brew Oat Milk Latte',
        description: 'Slow-steeped Arabica coffee blended with velvety barista-edition oat milk.',
        price: 48000,
        stock: 30,
        rating: 4.8,
        is_featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('nuts-healthy'),
        name: 'Smoked Sea Salt Almonds & Cashews',
        description: 'Slow-roasted jumbo cashews and California almonds smoked over natural hickory wood.',
        price: 62000,
        stock: 40,
        rating: 4.9,
        is_featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1536591375315-1b836814981d?auto=format&fit=crop&w=600&q=80'
      },
      {
        categoryId: catMap.get('nuts-healthy'),
        name: 'Organic Crispy Edamame Pops',
        description: 'Air-popped green soybeans lightly seasoned with sea salt. High protein, zero guilt.',
        price: 39000,
        stock: 35,
        rating: 4.6,
        is_featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      }
    ]

    for (const p of sampleProducts) {
      if (p.categoryId) {
        await sql`
          INSERT INTO products (category_id, name, description, price, stock, rating, is_featured, image_url)
          VALUES (${p.categoryId}, ${p.name}, ${p.description}, ${p.price}, ${p.stock}, ${p.rating}, ${p.is_featured}, ${p.imageUrl});
        `
      }
    }
    console.log('✅ Sample products seeded successfully.')
  }
}
