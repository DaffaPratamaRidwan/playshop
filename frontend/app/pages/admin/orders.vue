<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <NuxtLink to="/admin" class="text-xs font-bold text-slate-500 hover:text-blue-600 mb-1 inline-block">
          ← Back to Dashboard
        </NuxtLink>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800">Take Away Mode</span>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Counter Pickup Fulfillment</h1>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">Manage customer snack orders, monitor kitchen packing, and hand over take away bags</p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <NuxtLink 
          to="/admin/profile"
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>📱</span> QRIS Settings
        </NuxtLink>
        <button 
          @click="fetchOrders"
          class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
        >
          <span>🔄 Refresh Orders</span>
        </button>
      </div>
    </div>

    <!-- Admin Guard -->
    <div v-if="!isAdmin" class="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-md mx-auto">
      <p class="text-sm font-bold text-rose-800">Administrator access required.</p>
    </div>

    <div v-else class="space-y-6">
      
      <!-- Filters -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        <div class="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <span class="text-slate-400 font-medium mr-2">Take Away Status:</span>
            <select 
              v-model="statusFilter" 
              @change="fetchOrders"
              class="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 font-semibold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Awaiting Payment</option>
              <option value="preparing">Kitchen Packing</option>
              <option value="ready_for_pickup">Ready for Take Away</option>
              <option value="completed">Picked Up (Completed)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <span class="text-slate-400 font-medium mr-2">QRIS Payment:</span>
            <select 
              v-model="paymentFilter" 
              @change="fetchOrders"
              class="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 font-semibold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div class="text-xs text-slate-500 font-medium">
          Found <strong class="text-slate-800">{{ orders.length }}</strong> take away orders
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="orders.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
        <p class="text-sm font-bold text-slate-800">No take away orders match the selected filters.</p>
      </div>

      <!-- Orders List Cards -->
      <div v-else class="space-y-4">
        <div 
          v-for="order in orders" 
          :key="order.id"
          class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4"
        >
          <!-- Order Card Header -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm font-black text-slate-900">{{ order.order_number }}</span>
                <span class="text-xs text-slate-400">•</span>
                <span class="text-xs text-slate-600 font-bold">{{ order.user_name }} ({{ order.user_email }})</span>
              </div>
              <span class="text-xs text-slate-400">Placed: {{ formatDate(order.created_at) }}</span>
            </div>

            <div class="flex items-center gap-4">
              <!-- Pickup Code Badge -->
              <div class="bg-pink-50 border border-pink-200 px-3 py-1 rounded-xl text-center">
                <span class="text-[9px] uppercase font-bold text-pink-700 block">Pickup Code</span>
                <span class="font-mono font-black text-sm text-pink-900">
                  {{ getOrderDetails(order).pickup_code || order.shipping_postal_code || 'TKW-8921' }}
                </span>
              </div>

              <div class="text-right">
                <span class="text-base font-black text-slate-900">{{ formatRupiah(order.total) }}</span>
                <NuxtLink :to="`/orders/${order.id}`" class="block text-xs font-bold text-blue-600 hover:underline">
                  Take Away Pass →
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Items & Customer Pickup Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <!-- Items ordered -->
            <div>
              <span class="font-bold text-slate-400 uppercase tracking-wider block mb-2 text-[10px]">
                Items to Pack ({{ (order.items || []).length }})
              </span>
              <div class="space-y-1.5 max-h-36 overflow-y-auto">
                <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span class="font-semibold text-slate-800 truncate max-w-xs">{{ item.product_name }}</span>
                  <span class="text-slate-500 shrink-0 font-mono">{{ item.quantity }} × {{ formatRupiah(item.price) }}</span>
                </div>
              </div>
            </div>

            <!-- Take Away Pickup Destination -->
            <div>
              <span class="font-bold text-slate-400 uppercase tracking-wider block mb-2 text-[10px]">
                Customer Pickup Information
              </span>
              <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 leading-relaxed">
                <p><strong>Customer:</strong> {{ order.shipping_name }}</p>
                <p><strong>Phone:</strong> <span class="font-mono">{{ order.shipping_phone }}</span></p>
                <p><strong>Pickup Time:</strong> <span class="font-bold text-pink-600">{{ getOrderDetails(order).pickup_time || 'In 10-15 mins' }}</span></p>
                <p v-if="getOrderDetails(order).pickup_notes">
                  <strong>Notes:</strong> <span class="italic text-slate-600">"{{ getOrderDetails(order).pickup_notes }}"</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Status Updaters & Quick Action -->
          <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl">
            <!-- Fulfillment Status Changer -->
            <div class="flex items-center gap-2 text-xs">
              <span class="font-bold text-slate-700">Take Away State:</span>
              <select 
                :value="order.status"
                @change="updateOrderStatus(order.id, ($event.target as HTMLSelectElement).value)"
                class="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 font-bold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="pending">Awaiting Payment</option>
                <option value="preparing">Kitchen Packing</option>
                <option value="processing">Kitchen Packing</option>
                <option value="ready_for_pickup">Ready for Take Away 🛍️</option>
                <option value="completed">Picked Up (Completed) ✓</option>
                <option value="delivered">Picked Up (Completed) ✓</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Quick Action Button -->
            <div class="flex items-center gap-3">
              <button 
                v-if="order.status === 'preparing' || order.status === 'processing'"
                @click="updateOrderStatus(order.id, 'ready_for_pickup')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/20 transition-all"
              >
                Mark Ready at Counter 🛍️
              </button>

              <button 
                v-else-if="order.status === 'ready_for_pickup'"
                @click="updateOrderStatus(order.id, 'completed')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
              >
                Mark Picked Up by Customer ✓
              </button>

              <!-- Payment Status Changer -->
              <div class="flex items-center gap-2 text-xs">
                <span class="font-bold text-slate-700">QRIS:</span>
                <select 
                  :value="order.payment_status"
                  @change="updatePaymentStatus(order.id, ($event.target as HTMLSelectElement).value)"
                  class="bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  :class="{
                    'text-emerald-700 font-extrabold': order.payment_status === 'paid',
                    'text-pink-600 font-extrabold': order.payment_status === 'unpaid'
                  }"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const api = useApi()
const { isAdmin } = useAuth()

const orders = ref<any[]>([])
const loading = ref(true)
const statusFilter = ref('all')
const paymentFilter = ref('all')

const getOrderDetails = (order: any) => {
  if (!order.payment_details) return {}
  if (typeof order.payment_details === 'string') {
    try {
      return JSON.parse(order.payment_details)
    } catch {
      return {}
    }
  }
  return order.payment_details
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchOrders = async () => {
  if (!isAdmin.value) return
  try {
    loading.value = true
    let url = `/admin/orders?status=${statusFilter.value}&payment_status=${paymentFilter.value}`
    const data = await api.get(url)
    orders.value = data.orders || []
  } catch (err) {
    console.error('Failed to load admin orders:', err)
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId: number, newStatus: string) => {
  try {
    await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
    await fetchOrders()
  } catch (err: any) {
    alert(err.message || 'Failed to update order status')
  }
}

const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
  try {
    await api.patch(`/admin/orders/${orderId}/payment`, { payment_status: newPaymentStatus })
    await fetchOrders()
  } catch (err: any) {
    alert(err.message || 'Failed to update payment status')
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
