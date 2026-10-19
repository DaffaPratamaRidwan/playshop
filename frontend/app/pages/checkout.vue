<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
        <span>🛍️</span> Take Away & Counter Pickup Only
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Take Away Checkout</h1>
      <p class="text-xs text-slate-500 mt-1">Review your pickup details and complete QRIS payment to get your snacks prepared</p>
    </div>

    <!-- Login required notice if guest -->
    <div v-if="!isLoggedIn" class="bg-blue-50/60 border border-blue-200 rounded-3xl p-8 mb-8 text-center max-w-xl mx-auto shadow-sm">
      <div class="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
        🔒
      </div>
      <h2 class="text-lg font-bold text-slate-800 mb-2">Sign in to complete your pickup order</h2>
      <p class="text-xs text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
        To securely generate your unique Take Away pickup code and QRIS receipt, please sign in or register an account.
      </p>
      
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button 
          @click="autoLoginDemo"
          class="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all"
        >
          ⚡ Instant Login with Demo Account
        </button>
        <NuxtLink 
          to="/login"
          class="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
        >
          Sign In Manually
        </NuxtLink>
      </div>
    </div>

    <!-- Empty cart check -->
    <div v-else-if="items.length === 0" class="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
      <h2 class="text-lg font-bold text-slate-800 mb-2">Your cart is empty</h2>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mb-6">Add snacks before proceeding to checkout.</p>
      <NuxtLink to="/" class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25">
        Browse Snacks
      </NuxtLink>
    </div>

    <!-- Checkout Form Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left 2 Cols: Pickup Details & QRIS Payment -->
      <form @submit.prevent="handleCheckout" class="lg:col-span-2 space-y-6">
        
        <!-- Take Away Information Card -->
        <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</span>
              <h2 class="text-base font-bold text-slate-900">Take Away Pickup Information</h2>
            </div>
            <span class="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              🏬 Counter Collection
            </span>
          </div>

          <!-- Store Pickup Location Banner -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center text-xl shrink-0">
              📍
            </div>
            <div class="text-xs">
              <span class="font-extrabold text-slate-900 block">Pickup Store Location</span>
              <p class="font-semibold text-slate-700">SnackVault Express Counter • Ground Floor Booth #G-08</p>
              <p class="text-slate-500 mt-0.5">Plaza Sudirman Central, Jakarta (Open Daily: 09:00 - 22:00)</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Pickup Person Name</label>
              <input 
                v-model="pickup.name" 
                type="text" 
                required 
                placeholder="Name of person picking up"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Contact Phone</label>
              <input 
                v-model="pickup.phone" 
                type="tel" 
                required 
                placeholder="+62 812-3456-7890"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Pickup Timing -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Estimated Pickup Timing</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button" 
                v-for="t in pickupTimeOptions" 
                :key="t"
                @click="pickup.time = t"
                class="px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center"
                :class="pickup.time === t ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
              >
                {{ t }}
              </button>
            </div>
          </div>

          <!-- Special Notes -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Take Away Packaging Notes (Optional)</label>
            <input 
              v-model="pickup.notes" 
              type="text" 
              placeholder="e.g. Please pack cold drinks in a separate bag, extra napkins"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Payment Gateway Card (QRIS Only) -->
        <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">2</span>
              <h2 class="text-base font-bold text-slate-900">Payment Gateway</h2>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-100 text-pink-800 border border-pink-200">
              QRIS Standard
            </span>
          </div>

          <!-- QRIS Exclusive Gateway Banner -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-pink-50/50 border-2 border-blue-200 space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-white shadow-xs border border-blue-200 flex items-center justify-center overflow-hidden shrink-0">
                  <img v-if="qrisInfo.image_url" :src="qrisInfo.image_url" alt="QRIS" class="w-10 h-10 object-contain" />
                  <span v-else class="text-2xl">📱</span>
                </div>
                <div>
                  <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    {{ qrisInfo.merchant_name || 'QRIS Instant Pay' }}
                    <span class="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded tracking-wider">QRIS</span>
                  </h3>
                  <p class="text-xs text-slate-600 mt-0.5">Quick Response Code Indonesian Standard • NMID: {{ qrisInfo.nmid || 'ID102026SNACK998' }}</p>
                </div>
              </div>

              <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                ✓ Active Gateway
              </span>
            </div>

            <div class="bg-white/80 p-3 rounded-xl border border-blue-200/60 text-xs text-slate-700 space-y-1">
              <p class="font-bold text-blue-900">⚡ How Take Away Works:</p>
              <p>1. Complete payment via QRIS on the next screen.</p>
              <p>2. Once paid, the snack kitchen immediately prepares your take away order.</p>
              <p>3. Present your generated <strong>Pickup Ticket Code</strong> at the SnackVault Counter to take away your bag!</p>
            </div>

            <!-- Supported Apps Badges -->
            <div class="pt-2 border-t border-blue-200/40">
              <span class="text-[10px] font-extrabold uppercase text-slate-400 block mb-2">Compatible Apps:</span>
              <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-700">
                <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">GoPay</span>
                <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">OVO</span>
                <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">Dana</span>
                <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">ShopeePay</span>
                <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">BCA Mobile</span>
                <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">Livin' Mandiri</span>
                <span class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">BRImo</span>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
            {{ errorMessage }}
          </div>

          <!-- Submit Order Button -->
          <button 
            type="submit"
            :disabled="submitting"
            class="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-xl shadow-pink-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="submitting">Placing Take Away Order...</span>
            <span v-else>📱 Generate QRIS & Pay {{ formatRupiah(grandTotal) }} (Take Away)</span>
          </button>

        </div>

      </form>

      <!-- Right Column: Order Items Summary -->
      <div class="space-y-6">
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Snack Summary</span>
            <span class="text-xs text-slate-400 font-normal">{{ totalItems }} items</span>
          </h3>

          <!-- Items list -->
          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            <div 
              v-for="item in items" 
              :key="item.product_id"
              class="flex items-center gap-3 text-xs"
            >
              <img :src="item.image_url" :alt="item.name" class="w-12 h-12 rounded-xl object-cover bg-blue-50 shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-800 truncate">{{ item.name }}</p>
                <p class="text-slate-500">{{ item.quantity }} × {{ formatRupiah(item.price) }}</p>
              </div>
              <span class="font-bold text-slate-900">{{ formatRupiah(Number(item.price) * item.quantity) }}</span>
            </div>
          </div>

          <!-- Financial calculations (No shipping fee!) -->
          <div class="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div class="flex justify-between">
              <span>Items Subtotal</span>
              <span class="font-bold text-slate-800">{{ formatRupiah(subtotal) }}</span>
            </div>
            <div v-if="promoDiscount > 0" class="flex justify-between text-pink-600">
              <span>Promo Discount ({{ promoCode }})</span>
              <span class="font-bold">-{{ formatRupiah(promoDiscount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Order Type</span>
              <span class="font-bold text-emerald-600">Take Away Pickup (FREE)</span>
            </div>
            <div class="flex justify-between">
              <span>Sales Tax (8%)</span>
              <span class="font-bold text-slate-800">{{ formatRupiah(tax) }}</span>
            </div>
            <div class="border-t border-slate-200 pt-3 flex justify-between items-baseline text-sm font-black text-slate-900">
              <span>Total to Pay</span>
              <span class="text-xl text-pink-600">{{ formatRupiah(grandTotal) }}</span>
            </div>
          </div>

          <div class="bg-pink-50/60 rounded-xl p-3.5 text-[11px] text-pink-800 space-y-1 border border-pink-100">
            <div class="font-bold flex items-center gap-1.5">
              <span>🛍️</span> Fresh Pack Promise
            </div>
            <p>Your snacks will be packed in eco-friendly paper bags and sealed fresh for take away pickup.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isLoggedIn, login } = useAuth()
const { items, totalItems, subtotal, promoCode, promoDiscount, tax, grandTotal, clearCart, fetchCart } = useCart()
const api = useApi()

const pickup = reactive({
  name: user.value?.name || '',
  phone: '08123456789',
  time: 'In 10-15 mins',
  notes: ''
})

const pickupTimeOptions = [
  'In 10-15 mins',
  'In 30 mins',
  'In 45 mins',
  'In 1 hour'
]

const submitting = ref(false)
const errorMessage = ref('')

// Prepopulate user's name if logged in
watchEffect(() => {
  if (user.value?.name && !pickup.name) {
    pickup.name = user.value.name
  }
})

const autoLoginDemo = async () => {
  try {
    await login('user@snackshop.com', 'user123')
    await fetchCart()
  } catch (err: any) {
    alert('Demo login failed: ' + err.message)
  }
}

const handleCheckout = async () => {
  try {
    submitting.value = true
    errorMessage.value = ''

    const payload: any = {
      items: items.value.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      pickup_name: pickup.name,
      pickup_phone: pickup.phone,
      pickup_time: pickup.time,
      pickup_notes: pickup.notes,
      payment_method: 'qris',
      promo_code: promoCode.value || undefined
    }

    const data = await api.post('/orders/checkout', payload)

    // Clear local cart
    await clearCart()

    // Redirect to order details & payment page
    navigateTo(`/orders/${data.order.id}`)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to place order'
  } finally {
    submitting.value = false
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
  fetchQrisInfo()
})
</script>
