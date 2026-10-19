<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700">Admin Portal</span>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Store Analytics & Management</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">Real-time overview of revenue, snack inventory, and customer orders</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink 
          to="/admin/products"
          class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5"
        >
          <span>🍿</span> Manage Snacks
        </NuxtLink>
        <NuxtLink 
          to="/admin/orders"
          class="px-4 py-2 rounded-xl text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors flex items-center gap-1.5"
        >
          <span>🛍️</span> Take Away Orders
        </NuxtLink>
        <NuxtLink 
          to="/admin/profile"
          class="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5"
        >
          <span>⚙️</span> Profile & QRIS
        </NuxtLink>
      </div>
    </div>

    <!-- Admin Check -->
    <div v-if="!isAdmin" class="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-md mx-auto">
      <span class="text-3xl block mb-2">🚫</span>
      <h3 class="text-base font-bold text-rose-900">Access Denied</h3>
      <p class="text-xs text-rose-700 mt-1 mb-4">You must be logged in as an administrator to view this portal.</p>
      <NuxtLink to="/login" class="px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25">
        Sign in with Admin Account
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Analytics Dashboard -->
    <div v-else class="space-y-8">
      
      <!-- Key KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <!-- Revenue -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Revenue</span>
            <span class="text-emerald-500">💰</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            {{ formatRupiah(analytics.total_revenue) }}
          </div>
          <span class="text-[11px] text-emerald-600 font-semibold mt-1 block">From confirmed payments</span>
        </div>

        <!-- Orders -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Total Orders</span>
            <span class="text-blue-500">📦</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            {{ analytics.total_orders || 0 }}
          </div>
          <span class="text-[11px] text-slate-400 mt-1 block">All time takeaway orders</span>
        </div>

        <!-- Pending Orders -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Pending Orders</span>
            <span class="text-pink-500">⏳</span>
          </div>
          <div class="text-2xl font-black text-pink-600">
            {{ analytics.pending_orders || 0 }}
          </div>
          <span class="text-[11px] text-pink-700 font-semibold mt-1 block">Needs preparation</span>
        </div>

        <!-- Low Stock Items -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Low Stock</span>
            <span class="text-rose-500">⚠️</span>
          </div>
          <div class="text-2xl font-black text-rose-600">
            {{ analytics.low_stock_count || 0 }}
          </div>
          <span class="text-[11px] text-rose-600 font-semibold mt-1 block">Items with stock &lt; 25</span>
        </div>

        <!-- Total Customers -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Registered Users</span>
            <span class="text-blue-500">👥</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            {{ analytics.total_users || 0 }}
          </div>
          <span class="text-[11px] text-blue-600 font-semibold mt-1 block">Active snackers</span>
        </div>

      </div>

      <!-- Category Sales & Low Stock Alerts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Category Sales -->
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Sales by Category</span>
            <span class="text-xs text-slate-400">Total volume</span>
          </h3>

          <div class="space-y-3">
            <div 
              v-for="cat in analytics.category_stats" 
              :key="cat.category_name"
              class="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div>
                <span class="font-bold text-slate-800">{{ cat.category_name }}</span>
                <span class="text-slate-400 ml-2">({{ cat.total_sold }} units sold)</span>
              </div>
              <span class="font-black text-slate-900">{{ formatRupiah(cat.total_sales) }}</span>
            </div>
          </div>
        </div>

        <!-- Low Stock Items Watchlist -->
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Inventory Watchlist</h3>
            <NuxtLink to="/admin/products" class="text-xs font-bold text-blue-600 hover:underline">
              Manage All Snacks →
            </NuxtLink>
          </div>

          <div class="divide-y divide-slate-100">
            <div 
              v-for="prod in (analytics.low_stock_products || []).slice(0, 5)" 
              :key="prod.id"
              class="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div class="flex items-center gap-3">
                <img :src="prod.image_url" :alt="prod.name" class="w-10 h-10 rounded-lg object-cover bg-blue-50 shrink-0" />
                <span class="font-bold text-slate-800 truncate max-w-xs">{{ prod.name }}</span>
              </div>

              <div class="flex items-center gap-2">
                <span 
                  class="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
                  :class="prod.stock <= 10 ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-800'"
                >
                  {{ prod.stock }} in stock
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Recent Orders Table -->
      <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">Recent Take Away Orders</h3>
          <NuxtLink to="/admin/orders" class="text-xs font-bold text-pink-600 hover:underline">
            Take Away Counter Center →
          </NuxtLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                <th class="py-2.5">Order #</th>
                <th class="py-2.5">Customer</th>
                <th class="py-2.5">Date</th>
                <th class="py-2.5">Total</th>
                <th class="py-2.5">Payment</th>
                <th class="py-2.5">Status</th>
                <th class="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="ord in analytics.recent_orders" :key="ord.id" class="hover:bg-slate-50/50">
                <td class="py-3 font-mono font-bold text-slate-900">{{ ord.order_number }}</td>
                <td class="py-3 font-medium text-slate-800">{{ ord.customer_name }}</td>
                <td class="py-3 text-slate-500">{{ formatDate(ord.created_at) }}</td>
                <td class="py-3 font-black text-slate-900">{{ formatRupiah(ord.total) }}</td>
                <td class="py-3">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    :class="ord.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-pink-100 text-pink-800'"
                  >
                    {{ ord.payment_status }}
                  </span>
                </td>
                <td class="py-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {{ ord.status }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <NuxtLink :to="`/orders/${ord.id}`" class="text-blue-600 font-bold hover:underline">
                    View
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const api = useApi()
const { isAdmin } = useAuth()

const analytics = ref<any>({})
const loading = ref(true)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const fetchAnalytics = async () => {
  if (!isAdmin.value) return
  try {
    loading.value = true
    const data = await api.get('/admin/analytics')
    analytics.value = data
  } catch (err) {
    console.error('Failed to load admin analytics:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>
