<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Top breadcrumb / navigation -->
    <div class="flex items-center justify-between mb-8">
      <NuxtLink to="/orders" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <span>←</span> Back to All Orders
      </NuxtLink>

      <button 
        v-if="order"
        @click="printReceipt"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
      >
        <span>🖨️</span> Print Take Away Ticket
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!order" class="text-center py-20 bg-white rounded-3xl p-8 border border-slate-100">
      <p class="text-base font-bold text-slate-800 mb-4">Order not found</p>
      <NuxtLink to="/orders" class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25">
        Back to Orders
      </NuxtLink>
    </div>

    <div v-else class="space-y-8">
      
      <!-- Order Header Card -->
      <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase font-extrabold tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                🛍️ Take Away Order
              </span>
              <span class="font-mono text-base font-black text-slate-900">{{ order.order_number }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Ordered on {{ formatDate(order.created_at) }}</p>
          </div>

          <div class="flex items-center gap-3">
            <span 
              class="text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full shadow-2xs"
              :class="{
                'bg-emerald-100 text-emerald-800 border border-emerald-200': order.payment_status === 'paid',
                'bg-pink-100 text-pink-800 border border-pink-200': order.payment_status === 'unpaid',
                'bg-rose-100 text-rose-800 border border-rose-200': order.payment_status === 'failed',
                'bg-purple-100 text-purple-800 border border-purple-200': order.payment_status === 'refunded',
              }"
            >
              Payment: {{ order.payment_status }}
            </span>

            <span 
              class="text-xs font-bold uppercase px-3 py-1.5 rounded-full"
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

        <!-- Take Away Fulfillment Progress Tracker -->
        <div class="pt-6">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Take Away Preparation Tracker</span>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1.5" :class="isStepComplete('pending') ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'">
                ✓
              </div>
              <span class="font-bold text-[11px] text-slate-800">1. Order Placed</span>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1.5" :class="isStepComplete('paid') ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'">
                {{ isStepComplete('paid') ? '✓' : '2' }}
              </div>
              <span class="font-bold text-[11px] text-slate-800">2. QRIS Paid</span>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1.5" :class="isStepComplete('preparing') ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'">
                {{ isStepComplete('preparing') ? '✓' : '3' }}
              </div>
              <span class="font-bold text-[11px] text-slate-800">3. Kitchen Packing</span>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1.5" :class="isStepComplete('ready_for_pickup') ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-400'">
                {{ isStepComplete('ready_for_pickup') ? '✓' : '4' }}
              </div>
              <span class="font-bold text-[11px]" :class="isStepComplete('ready_for_pickup') ? 'text-pink-700 font-extrabold' : 'text-slate-800'">
                4. Ready at Counter
              </span>
            </div>

            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1.5" :class="isStepComplete('completed') ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'">
                {{ isStepComplete('completed') ? '✓' : '5' }}
              </div>
              <span class="font-bold text-[11px]" :class="isStepComplete('completed') ? 'text-emerald-700 font-extrabold' : 'text-slate-800'">
                5. Picked Up ✓
              </span>
            </div>

          </div>
        </div>
      </div>

      <!-- PAYMENT / TAKE AWAY PASS HUB -->
      <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs">
        
        <!-- Case 0: Cancelled Order -->
        <div v-if="order.status === 'cancelled'" class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <span class="text-3xl block">🚫</span>
          <h2 class="text-base font-bold text-rose-900">This Order Has Been Cancelled</h2>
          <p class="text-xs text-rose-700 max-w-md mx-auto">
            This take away order was cancelled. Any reserved snacks have been returned to inventory.
          </p>
          <NuxtLink to="/" class="inline-block mt-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-slate-900">
            Browse Other Snacks
          </NuxtLink>
        </div>

        <!-- Case 1: Unpaid Order (QRIS Gateway) -->
        <div v-else-if="order.payment_status === 'unpaid'" class="space-y-6">
          <div class="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span class="text-2xl">📱</span>
            <div>
              <h2 class="text-base font-bold text-slate-900">QRIS Payment Required to Prepare Snacks</h2>
              <p class="text-xs text-slate-500">Pay <strong class="text-slate-900">{{ formatRupiah(order.total) }}</strong> so our kitchen staff can start packing your take away bag.</p>
            </div>
          </div>

          <!-- QRIS Payment Box -->
          <div class="bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-pink-50/40 rounded-2xl p-6 border border-blue-200/80 max-w-lg mx-auto text-center space-y-4 shadow-xs">
            <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-pink-500 text-white px-3.5 py-1 rounded-full text-xs font-black shadow-xs">
              <span>📱 QRIS Instant Payment Gateway</span>
            </div>

            <p class="text-xs text-slate-600">Scan this QRIS code using GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, or any mobile banking app</p>

            <!-- Dynamic QR Code Graphic configured by Admin -->
            <div class="bg-white p-4 rounded-2xl shadow-md inline-block border-2 border-slate-200 relative max-w-xs mx-auto">
              <img 
                v-if="qrisInfo.image_url"
                :src="qrisInfo.image_url" 
                :alt="qrisInfo.merchant_name"
                class="w-56 h-auto max-h-72 object-contain mx-auto rounded-lg shadow-2xs"
              />
              <div v-else class="w-52 h-52 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs rounded-lg">
                QRIS Code Loading...
              </div>
              <div class="text-[10px] font-mono font-bold text-slate-600 mt-2.5 bg-slate-100 py-1 px-2 rounded">
                NMID: {{ qrisInfo.nmid || 'ID102026SNACK998' }} • {{ formatRupiah(order.total) }}
              </div>
            </div>

            <div class="text-xs space-y-1">
              <p class="font-bold text-slate-800">{{ qrisInfo.merchant_name || 'SnackVault Take Away Counter' }}</p>
              <p class="text-slate-500 font-mono text-[11px]">{{ orderDetails.reference_no || 'QRIS-REF-99281' }}</p>
              <p class="text-[11px] text-pink-600 font-semibold">Valid for 15 minutes</p>
            </div>

            <!-- Instant Simulate Payment Button & Cancel Button -->
            <div class="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button 
                @click="simulatePayment"
                :disabled="processingPay || cancelling"
                class="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <span v-if="processingPay">Simulating QRIS confirmation...</span>
                <span v-else>⚡ Simulate Successful QRIS Payment</span>
              </button>
              <button 
                @click="cancelOrder"
                :disabled="processingPay || cancelling"
                class="w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <span v-if="cancelling">Cancelling...</span>
                <span v-else>Cancel Order</span>
              </button>
            </div>
            <span class="text-[10px] text-slate-400 block">Simulates the real-time banking callback acknowledging QRIS receipt</span>
          </div>

        </div>

        <!-- Case 2: Paid Order — OFFICIAL TAKE AWAY PICKUP PASS -->
        <div v-else class="space-y-6">
          
          <!-- Take Away Pass Hero Box -->
          <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div class="space-y-2">
                <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                  <span>✓ Payment Confirmed</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  <span>Take Away Pass Ready</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-black tracking-tight">Your Snacks are Getting Packed!</h3>
                <p class="text-xs text-emerald-100 leading-relaxed max-w-md">
                  Please show your <strong>Take Away Pickup Code</strong> at the counter when you arrive to pick up your freshly prepared bag.
                </p>
              </div>

              <!-- Pickup Code Badge -->
              <div class="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 text-center shadow-lg border border-emerald-100 shrink-0">
                <span class="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Pickup Code</span>
                <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-700 block my-1">
                  {{ orderDetails.pickup_code || order.shipping_postal_code || 'TKW-8921' }}
                </span>
                <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {{ orderDetails.pickup_time || 'Ready in 10-15 mins' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Pickup Details breakdown -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Order Type</span>
              <span class="font-bold text-slate-800">Take Away Pickup</span>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Payment Gateway</span>
              <span class="font-bold text-slate-800 uppercase">QRIS (Paid)</span>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Pickup Timing</span>
              <span class="font-bold text-emerald-700">{{ orderDetails.pickup_time || 'Ready in 10-15 mins' }}</span>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Transaction ID</span>
              <span class="font-bold text-slate-800 truncate block font-mono">{{ orderDetails.transaction_id || `TXN-${order.id}-OK` }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Items & Pickup Counter Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Order Items Table (2 cols) -->
        <div class="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Take Away Items ({{ (order.items || []).length }})
          </h3>

          <div class="divide-y divide-slate-100">
            <div 
              v-for="item in order.items" 
              :key="item.id"
              class="py-3.5 flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3">
                <img :src="item.product_image" :alt="item.product_name" class="w-14 h-14 rounded-xl object-cover bg-blue-50 border border-slate-100 shrink-0" />
                <div>
                  <h4 class="font-bold text-slate-800 text-xs">{{ item.product_name }}</h4>
                  <p class="text-xs text-slate-400 mt-0.5">{{ item.quantity }} × {{ formatRupiah(item.price) }}</p>
                </div>
              </div>

              <span class="font-bold text-sm text-slate-900">{{ formatRupiah(item.total_price) }}</span>
            </div>
          </div>

          <!-- Total breakdown (No Shipping Fee!) -->
          <div class="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
            <div class="flex justify-between">
              <span>Items Subtotal</span>
              <span class="font-bold text-slate-800">{{ formatRupiah(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Take Away Counter Service</span>
              <span class="font-bold text-emerald-600">FREE (Rp 0)</span>
            </div>
            <div class="flex justify-between">
              <span>Tax (8%)</span>
              <span class="font-bold text-slate-800">{{ formatRupiah(order.tax) }}</span>
            </div>
            <div class="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span class="text-pink-600">{{ formatRupiah(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Store Pickup Location Card (1 col) -->
        <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Take Away Counter Info
          </h3>

          <div class="text-xs space-y-3.5 text-slate-600">
            <div>
              <span class="text-slate-400 block font-medium">Pickup Store Counter</span>
              <p class="font-bold text-slate-900 leading-snug">
                SnackVault Express Counter<br />
                <span class="text-slate-600 font-normal">Ground Floor Booth #G-08, Plaza Sudirman Central, Jakarta</span>
              </p>
            </div>

            <div>
              <span class="text-slate-400 block font-medium">Customer Pickup Name</span>
              <span class="font-bold text-slate-800 text-sm">{{ order.shipping_name }}</span>
            </div>

            <div>
              <span class="text-slate-400 block font-medium">WhatsApp / Phone</span>
              <span class="font-semibold text-slate-800 font-mono">{{ order.shipping_phone }}</span>
            </div>

            <div v-if="orderDetails.pickup_notes">
              <span class="text-slate-400 block font-medium">Packaging Instructions</span>
              <p class="font-medium text-slate-800 italic mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                "{{ orderDetails.pickup_notes }}"
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100">
              <span class="text-slate-400 block font-medium">Counter Hours</span>
              <span class="font-bold text-slate-800">Open Daily 09:00 - 22:00</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()

const order = ref<any>(null)
const loading = ref(true)
const processingPay = ref(false)

const orderDetails = computed(() => {
  if (!order.value?.payment_details) return {}
  if (typeof order.value.payment_details === 'string') {
    try {
      return JSON.parse(order.value.payment_details)
    } catch {
      return {}
    }
  }
  return order.value.payment_details
})

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
    ready_for_pickup: 'Ready for Take Away 🛍️',
    completed: 'Picked Up ✓',
    delivered: 'Picked Up ✓',
    cancelled: 'Cancelled'
  }
  return map[status] || status
}

const isStepComplete = (step: string) => {
  if (!order.value) return false
  const status = order.value.status
  const paymentStatus = order.value.payment_status

  if (step === 'pending') return true
  if (step === 'paid') return paymentStatus === 'paid'
  if (step === 'preparing') return paymentStatus === 'paid' && ['preparing', 'processing', 'ready_for_pickup', 'completed'].includes(status)
  if (step === 'ready_for_pickup') return ['ready_for_pickup', 'completed'].includes(status)
  if (step === 'completed') return status === 'completed'
  return false
}

const cancelling = ref(false)

const cancelOrder = async () => {
  if (!order.value) return
  if (!confirm('Are you sure you want to cancel this take away order? Reserved snacks will be returned to stock.')) return
  try {
    cancelling.value = true
    const data = await api.post(`/orders/${order.value.id}/cancel`)
    order.value = data.order
    alert('Your order has been cancelled.')
  } catch (err: any) {
    alert(err.message || 'Failed to cancel order')
  } finally {
    cancelling.value = false
  }
}

const fetchOrder = async () => {
  try {
    loading.value = true
    const data = await api.get(`/orders/${route.params.id}`)
    order.value = data.order
  } catch (err) {
    console.error('Failed to load order:', err)
  } finally {
    loading.value = false
  }
}

const simulatePayment = async () => {
  if (!order.value) return
  try {
    processingPay.value = true
    const data = await api.post(`/orders/${order.value.id}/pay`)
    order.value = data.order
    alert('🎉 QRIS Payment verified! Your snacks are now being prepared at the counter for take away.')
  } catch (err: any) {
    alert(err.message || 'Payment simulation failed')
  } finally {
    processingPay.value = false
  }
}

const printReceipt = () => {
  if (import.meta.client) {
    window.print()
  }
}

const qrisInfo = ref<any>({
  image_url: '',
  merchant_name: 'SnackVault Express Counter',
  nmid: 'ID102026SNACK998'
})

const fetchQrisInfo = async () => {
  try {
    const data = await api.get('/qris-info')
    if (data.image_url) {
      qrisInfo.value = data
    }
  } catch (err) {
    console.error('Failed to load QRIS info:', err)
  }
}

onMounted(() => {
  fetchOrder()
  fetchQrisInfo()
})
</script>
