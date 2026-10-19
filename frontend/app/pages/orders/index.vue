<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
      <p class="text-xs text-slate-500 mt-1">Track your snack orders, QRIS payments, and take away pickup status</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="orders.length === 0" class="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
      <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
        📦
      </div>
      <h2 class="text-lg font-bold text-slate-800 mb-2">No orders placed yet</h2>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mb-6">Explore our snack catalog and treat yourself today!</p>
      <NuxtLink to="/" class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25">
        Browse Snacks
      </NuxtLink>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-4">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-shadow space-y-4"
      >
        <!-- Top bar: Order #, date, statuses -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-black text-slate-900">{{ order.order_number }}</span>
              <span class="text-xs text-slate-400">•</span>
              <span class="text-xs text-slate-500">{{ formatDate(order.created_at) }}</span>
            </div>
            <span class="text-xs text-slate-400">Payment via <strong class="text-slate-600 uppercase">{{ order.payment_method }}</strong></span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Payment status badge -->
            <span 
              class="text-xs font-extrabold uppercase px-3 py-1 rounded-full"
              :class="{
                'bg-emerald-100 text-emerald-800': order.payment_status === 'paid',
                'bg-pink-100 text-pink-800': order.payment_status === 'unpaid',
                'bg-rose-100 text-rose-800': order.payment_status === 'failed',
                'bg-purple-100 text-purple-800': order.payment_status === 'refunded',
              }"
            >
              ● {{ order.payment_status }}
            </span>

            <!-- Take Away status badge -->
            <span 
              class="text-xs font-bold uppercase px-3 py-1 rounded-full"
              :class="{
                'bg-pink-100 text-pink-800 font-extrabold': order.status === 'ready_for_pickup',
                'bg-emerald-100 text-emerald-800 font-extrabold': order.status === 'completed',
                'bg-slate-100 text-slate-700': order.status !== 'ready_for_pickup' && order.status !== 'completed'
              }"
            >
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
        </div>

        <!-- Items preview -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2 overflow-x-auto py-1">
            <div 
              v-for="item in (order.items || []).slice(0, 4)" 
              :key="item.id"
              class="relative shrink-0 group"
              :title="item.product_name"
            >
              <img 
                :src="item.product_image" 
                :alt="item.product_name"
                class="w-14 h-14 rounded-xl object-cover bg-blue-50 border border-slate-200"
              />
              <span class="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {{ item.quantity }}
              </span>
            </div>
            <span v-if="(order.items || []).length > 4" class="text-xs font-bold text-slate-400 pl-1">
              +{{ order.items.length - 4 }} more
            </span>
          </div>

          <!-- Total & Link -->
          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="text-[11px] text-slate-400 block font-medium">Total (Take Away)</span>
              <span class="text-base font-black text-slate-900">{{ formatRupiah(order.total) }}</span>
            </div>

            <NuxtLink 
              :to="`/orders/${order.id}`"
              class="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"
              :class="order.payment_status === 'unpaid' 
                ? 'bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25' 
                : order.status === 'ready_for_pickup'
                  ? 'bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-600/25'
                  : 'bg-blue-900 hover:bg-blue-800 shadow-md shadow-blue-900/20'"
            >
              <span v-if="order.payment_status === 'unpaid'">📱 Pay QRIS</span>
              <span v-else-if="order.status === 'ready_for_pickup'">🛍️ Collect Snacks</span>
              <span v-else>View Take Away Pass</span>
              <span>→</span>
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi()
const { isLoggedIn } = useAuth()

const orders = ref<any[]>([])
const loading = ref(true)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Awaiting Payment',
    preparing: 'Kitchen Packing',
    processing: 'Kitchen Packing',
    ready_for_pickup: 'Ready for Pickup 🛍️',
    completed: 'Picked Up ✓',
    delivered: 'Picked Up ✓',
    cancelled: 'Cancelled'
  }
  return map[status] || status
}

const fetchOrders = async () => {
  if (!isLoggedIn.value) {
    navigateTo('/login')
    return
  }
  try {
    loading.value = true
    const data = await api.get('/orders')
    orders.value = data.orders || []
  } catch (err) {
    console.error('Failed to load orders:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
