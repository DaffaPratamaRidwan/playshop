<template>
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-blue-100 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Left: Brand Logo -->
        <div class="flex items-center shrink-0">
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <span class="text-xl">🍿</span>
            </div>
            <div>
              <span class="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">Playshop</span>
            </div>
          </NuxtLink>
        </div>

        <!-- Right: Clean Text Buttons Only (Zero boxes, Zero tables, Zero dropdowns) -->
        <div class="hidden lg:flex items-center gap-6 xl:gap-7">
          
          <!-- Store Navigation Text Buttons -->
          <NuxtLink 
            to="/" 
            class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors" 
            active-class="!text-blue-600 !font-bold"
          >
            Browse Snacks
          </NuxtLink>

          <NuxtLink 
            v-if="isLoggedIn" 
            to="/orders" 
            class="text-xs font-semibold text-slate-700 hover:text-pink-600 transition-colors" 
            active-class="!text-pink-600 !font-bold"
          >
            My Orders
          </NuxtLink>

          <!-- Admin Controls (Direct Text Buttons) -->
          <template v-if="isAdmin">
            <span class="text-[10px] font-black uppercase tracking-wider text-blue-600 select-none">
              👑 Admin:
            </span>
            <NuxtLink 
              to="/admin" 
              class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              active-class="!text-blue-600 !font-bold"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/admin/products" 
              class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              active-class="!text-blue-600 !font-bold"
            >
              Snacks
            </NuxtLink>
            <NuxtLink 
              to="/admin/orders" 
              class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              active-class="!text-blue-600 !font-bold"
            >
              Orders
            </NuxtLink>
            <NuxtLink 
              to="/admin/profile" 
              class="text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors"
              active-class="!text-pink-600 !font-bold"
            >
              QRIS & Profile
            </NuxtLink>
          </template>

          <!-- Cart Text Button -->
          <button 
            @click="openDrawer"
            type="button" 
            class="text-xs font-semibold text-slate-700 hover:text-pink-600 transition-colors flex items-center gap-1.5"
            aria-label="View Cart"
          >
            <span>Cart</span>
            <span v-if="totalItems > 0" class="text-xs font-bold text-pink-600">
              ({{ totalItems > 99 ? '99+' : totalItems }})
            </span>
          </button>

          <!-- User Account Text Info & Sign Out Text Button -->
          <template v-if="isLoggedIn">
            <span class="text-xs font-medium text-slate-500 max-w-[120px] truncate">
              {{ user?.name }}
            </span>
            <button 
              @click="logout"
              type="button"
              class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          </template>

          <!-- Guest Text Buttons -->
          <template v-else>
            <NuxtLink 
              to="/login"
              class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              active-class="!text-blue-600 !font-bold"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/register"
              class="text-xs font-bold text-pink-600 hover:text-pink-700 transition-colors"
              active-class="!text-pink-700 !font-black"
            >
              Register
            </NuxtLink>
          </template>

        </div>

        <!-- Mobile Controls (Cart Text Button + Hamburger Toggle) -->
        <div class="flex lg:hidden items-center gap-3">
          <button 
            @click="openDrawer"
            type="button" 
            class="text-xs font-bold text-pink-600 flex items-center gap-1 py-1 px-2 hover:text-pink-700 transition-colors"
            aria-label="View Cart"
          >
            <span>Cart</span>
            <span v-if="totalItems > 0">({{ totalItems }})</span>
          </button>

          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            type="button" 
            class="p-1.5 rounded-lg text-slate-700 hover:text-blue-600 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>

      <!-- Mobile Navigation Drawer: Text Buttons Only (No boxes, No tables, No dropdowns) -->
      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-slate-100 py-4 space-y-4 bg-white animate-in fade-in">
        
        <!-- Mobile Store Links -->
        <div class="flex flex-col space-y-2.5">
          <NuxtLink 
            @click="mobileMenuOpen = false"
            to="/" 
            class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            active-class="!text-blue-600 !font-bold"
          >
            Browse Snacks
          </NuxtLink>
          <NuxtLink 
            v-if="isLoggedIn" 
            @click="mobileMenuOpen = false"
            to="/orders" 
            class="text-xs font-semibold text-slate-700 hover:text-pink-600 transition-colors"
            active-class="!text-pink-600 !font-bold"
          >
            My Orders
          </NuxtLink>
        </div>

        <!-- Mobile Admin Links -->
        <div v-if="isAdmin" class="flex flex-col space-y-2.5 pt-3 border-t border-slate-100">
          <span class="text-[10px] font-black uppercase tracking-wider text-blue-600">👑 Admin:</span>
          <NuxtLink 
            @click="mobileMenuOpen = false"
            to="/admin" 
            class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            active-class="!text-blue-600 !font-bold"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            @click="mobileMenuOpen = false"
            to="/admin/products" 
            class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            active-class="!text-blue-600 !font-bold"
          >
            Snacks Catalog
          </NuxtLink>
          <NuxtLink 
            @click="mobileMenuOpen = false"
            to="/admin/orders" 
            class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            active-class="!text-blue-600 !font-bold"
          >
            Orders Center
          </NuxtLink>
          <NuxtLink 
            @click="mobileMenuOpen = false"
            to="/admin/profile" 
            class="text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors"
            active-class="!text-pink-600 !font-bold"
          >
            QRIS & Profile
          </NuxtLink>
        </div>

        <!-- Mobile User Account / Sign Out / Auth -->
        <div class="flex flex-col space-y-2.5 pt-3 border-t border-slate-100">
          <template v-if="isLoggedIn">
            <span class="text-xs text-slate-500">
              {{ user?.name }} ({{ isAdmin ? 'Admin' : 'Customer' }})
            </span>
            <button 
              @click="logout(); mobileMenuOpen = false"
              class="text-left text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          </template>
          <template v-else>
            <NuxtLink 
              @click="mobileMenuOpen = false"
              to="/login"
              class="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              active-class="!text-blue-600 !font-bold"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              @click="mobileMenuOpen = false"
              to="/register"
              class="text-xs font-bold text-pink-600 hover:text-pink-700 transition-colors"
              active-class="!text-pink-700 !font-bold"
            >
              Register
            </NuxtLink>
          </template>
        </div>

      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
const { user, isLoggedIn, isAdmin, logout } = useAuth()
const { totalItems, openDrawer } = useCart()
const mobileMenuOpen = ref(false)
</script>
