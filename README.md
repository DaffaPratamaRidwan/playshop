# 🍿 SnackVault — Take Away Snack Shop Application

A full-stack gourmet snack shop web application built for **in-store Take Away / Counter Pickup** with exclusive **QRIS payment**, live order tracking, and role-based authentication & authorization separating customers and store administrators.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: [Bun](https://bun.sh) + [Hono](https://hono.dev) (High-performance, modular TypeScript server running on port `4000`)
- **Database**: [PostgreSQL](https://www.postgresql.org) on port `5432` (`snackshop_db`) with automated schema migration & seed scripts
- **Frontend**: [Nuxt 4](https://nuxt.com) + [Vue 3](https://vuejs.org) + [Tailwind CSS](https://tailwindcss.com) + [Lucide Icons](https://lucide.dev) running on port `3000`
- **Security**: JWT (`hono/jwt`) Bearer authentication, role-based route guards (`authMiddleware`, `adminMiddleware`), secure password hashing (`Bun.password.hash` / bcrypt)

---

## 🚀 Core Features

### 1. 🛍️ Take Away & Counter Pickup (No Delivery)
- **100% Take Away Policy**: Delivery features, shipping fees, courier options, and delivery addresses have been completely removed.
- **$0.00 Pickup Fee**: All orders are prepared for self-pickup at our central booth at Plaza Sudirman Booth #G-08.
- **Unique Pickup Code**: Every order automatically generates a unique counter pickup pass code (e.g. `TKW-8921`).
- **Flexible Pickup Timing**: Customers can choose their pickup window:
  - *Ready in 10-15 mins* (Immediate prep)
  - *In 30 mins*
  - *In 1 hour*
  - *Later today*
- **Live Counter Preparation Tracker**:
  1. `pending`: Order placed, awaiting QRIS payment.
  2. `preparing`: QRIS payment verified, kitchen staff packing snacks.
  3. `ready_for_pickup`: Packed in takeaway bag and staged at counter.
  4. `completed`: Customer presented pickup pass code at counter and received their order.

### 2. 📱 Exclusive QRIS Payment Gateway
- **QRIS Only**: All transactions are exclusively routed through the QRIS payment gateway. Other payment methods (card, bank transfer, COD) are disabled and rejected by the API.
- **Dynamic QRIS Generation**: Generates compliant QR codes with unique merchant NMID, order reference number, and a 15-minute expiration countdown timer.
- **Compatible with all Indonesian e-wallets & mobile banking**: GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin' by Mandiri, BRImo, and any QRIS-compatible banking app.
- **Interactive QRIS Simulator**: One-click *"Simulate Successful QRIS Payment Scan"* triggers instant verification, advancing the order to `preparing` status.
- **Printable Pickup Pass / Receipt**: Includes QR code, pickup pass token, items ordered, and booth pickup instructions.

### 3. 🔐 Distinct Authentication & Authorization (Admin vs Customer)
- **Role-based Access Control**: Distinct capabilities and registration flows for customers and store administrators.
- **Dedicated Admin Staff Registration (`/admin/register`)**:
  - Requires **Organization Passkey** (`SNACK-ADMIN-2026`) to prevent unauthorized administrative accounts.
  - Staff department selection (Store Operations, Counter Fulfillment, Inventory Management, Store Supervision).
  - One-click **"Auto-Fill Demo Passkey"** button for quick onboarding.
- **Customer Registration (`/register`)**: Standard registration for snack shoppers creating regular user accounts (`role: user`).
- **Pre-seeded Accounts**:
  - **Administrator**: `admin@snackshop.com` / `admin123`
  - **Customer**: `user@snackshop.com` / `user123`
- Instant one-click demo login buttons on the Login page (`/login`) with clear navigation links to both user and admin registrations.

### 4. 🍿 Snack Catalog & Browsing
- Categories: Chips & Crisps, Chocolates & Sweets, Bakery & Cookies, Beverages, Nuts & Healthy.
- Search snacks by keywords with live debouncing.
- Filters & Sorting: Newest, Price (Low-High, High-Low), Top Rated, Featured Only.
- Product details page with image preview, stock indicators, and instant Add-to-Cart.

### 5. 🛒 Persistent Shopping Cart
- Slide-over Cart Drawer + Dedicated Shopping Cart Page (`/cart`).
- Dual storage synchronization: database persistence for logged-in users and localStorage for guest sessions.
- Real-time calculations: Subtotal, Sales Tax (8%), and Take Away ($0.00 Free Pickup).
- Promo code support (e.g. `SNACK10` for 10% discount).
- Stock level enforcement (cannot add more than available inventory).

### 6. 👑 Counter Fulfillment & Admin Portal (`/admin`)
- **Executive Analytics Dashboard (`/admin`)**:
  - Real-time Revenue counter (from paid orders)
  - Total Take Away Orders, Orders Needing Prep, and Registered Customers
  - Category sales volume breakdown
  - Low stock warning watchlist
- **Counter Pickup Fulfillment Center (`/admin/orders`)**:
  - Filter orders by fulfillment status (`pending`, `preparing`, `ready_for_pickup`, `completed`, `cancelled`).
  - Filter orders by payment status (`unpaid`, `paid`, `refunded`).
  - Search orders by customer name, order number, or Take Away pickup code.
  - Quick action buttons: **Mark Ready at Counter** and **Mark Picked Up**.
- **Snack Inventory CRUD (`/admin/products`)**:
  - Add new snacks with category, price, stock, image URL, and featured flag.
  - Edit snack prices and stock levels.
  - Delete snacks.

---

## 🏃 Running the Application

### 1. Database (PostgreSQL)
Ensure PostgreSQL is running locally on port 5432 with database `snackshop_db`.
```bash
# If using Docker:
cd db
docker compose up -d

# Verify connection:
# Host: localhost:5432
# Database: snackshop_db
# User: postgres
# Password: pass123456
```

### 2. Backend (Hono + Bun)
```bash
cd backend
bun install
bun run seed    # (Optional: seeds initial snacks and accounts)
bun run dev     # Runs server on http://localhost:4000
```

### 3. Frontend (Nuxt 4 + Tailwind)
```bash
cd frontend
bun install
bun run dev     # Runs frontend on http://localhost:3000
```

---

## 🧪 Automated Testing
Run the comprehensive end-to-end integration test verifying the entire Take Away & QRIS lifecycle:
```bash
bun run scratch/test_takeaway_qris.ts
```
Tests:
1. Rejection of invalid admin registration passkeys (HTTP 403)
2. Admin registration with passkey `SNACK-ADMIN-2026`
3. Customer registration
4. Adding snacks to shopping cart
5. Strict rejection of non-QRIS payment methods (HTTP 400)
6. Take Away checkout with $0.00 pickup fee and `TKW-XXXX` pickup pass generation
7. QRIS scan payment verification -> order moves to `preparing`
8. Admin views order in Counter Fulfillment Center
9. Admin marks order as `ready_for_pickup`
10. Customer picks up order at counter -> Admin marks `completed`
11. Admin analytics updates
