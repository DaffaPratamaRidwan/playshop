<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
        <p class="text-xs text-slate-500 mt-1">Review your snacks before proceeding to checkout</p>
      </div>

      <button 
        v-if="items.length > 0"
        @click="clearCart"
        class="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
      >
        Clear All Items
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
      <div class="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
        🛍️
      </div>
      <h2 class="text-lg font-bold text-slate-800 mb-2">Your cart is empty</h2>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mb-6">
        You haven't added any delicious snacks to your cart yet. Explore our pantry now!
      </p>
      <NuxtLink 
        to="/" 
        class="px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-transform hover:scale-105"
      >
        Explore Snacks
      </NuxtLink>
    </div>

    <!-- Active Cart Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Items Table / List -->
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs divide-y divide-slate-100">
          
          <div 
            v-for="item in items" 
            :key="item.product_id"
            class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <!-- Thumbnail & Name -->
            <div class="flex items-center gap-4">
              <img 
                :src="item.image_url" 
                :alt="item.name" 
                class="w-18 h-18 rounded-2xl object-cover bg-blue-50 shrink-0 border border-slate-100"
              />
              <div>
                <NuxtLink :to="`/products/${item.product_id}`" class="hover:text-blue-600 transition-colors">
                  <h3 class="font-bold text-slate-900 text-sm mb-1">{{ item.name }}</h3>
                </NuxtLink>
                <p class="text-xs font-semibold text-blue-700">{{ formatRupiah(item.price) }} each</p>
                <p class="text-[11px] text-slate-400 mt-1">Available in stock: {{ item.stock }}</p>
              </div>
            </div>

            <!-- Quantity & Actions -->
            <div class="flex items-center justify-between sm:justify-end gap-6">
              <div class="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button 
                  @click="updateQuantity(item.product_id, item.quantity - 1)"
                  class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  -
                </button>
                <span class="w-10 text-center text-xs font-bold text-slate-800">{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(item.product_id, item.quantity + 1)"
                  :disabled="item.quantity >= item.stock"
                  class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <div class="text-right min-w-[70px]">
                <span class="text-sm font-black text-slate-900 block">
                  {{ formatRupiah(Number(item.price) * item.quantity) }}
                </span>
                <button 
                  @click="removeItem(item.product_id)"
                  class="text-[11px] text-red-500 hover:underline mt-0.5"
                >
                  Remove
                </button>
              </div>
            </div>

          </div>

        </div>

        <NuxtLink 
          to="/" 
          class="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors pt-2"
        >
          ← Continue shopping more snacks
        </NuxtLink>
      </div>

      <!-- Order Summary Card -->
      <div class="space-y-6">
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h2 class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <!-- Promo Code -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Have a Promo Code?</label>
            <div class="flex gap-2">
              <input 
                v-model="inputPromo"
                type="text" 
                placeholder="Try SNACK10 for 10% off" 
                class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                @click="applyPromo"
                class="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shadow-pink-500/20"
              >
                Apply
              </button>
            </div>
            <p v-if="promoDiscount > 0" class="text-xs text-emerald-600 font-semibold mt-1">
              ✓ Promo {{ promoCode }} applied (-{{ formatRupiah(promoDiscount) }})
            </p>
          </div>

          <!-- Price Calculations -->
          <div class="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div class="flex justify-between">
              <span>Items Subtotal ({{ totalItems }})</span>
              <span class="font-bold text-slate-800">{{ formatRupiah(subtotal) }}</span>
            </div>
            <div v-if="promoDiscount > 0" class="flex justify-between text-emerald-600">
              <span>Promo Discount (10%)</span>
              <span class="font-bold">-{{ formatRupiah(promoDiscount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Order Type</span>
              <span class="font-bold text-blue-700">Take Away Pickup (Free)</span>
            </div>
            <div class="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span class="font-bold text-slate-800">{{ formatRupiah(tax) }}</span>
            </div>

            <div class="border-t border-slate-200 pt-3 flex justify-between items-baseline text-sm font-black text-slate-900">
              <span>Total to Pay</span>
              <span class="text-xl font-black text-pink-600">{{ formatRupiah(grandTotal) }}</span>
            </div>
          </div>

          <button 
            @click="navigateTo('/checkout')"
            class="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <span>Proceed to Take Away Checkout</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <!-- Security note -->
          <div class="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <span>🔒</span>
            <span>Bank-level secure 256-bit SSL encrypted checkout</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { items, totalItems, subtotal, shippingFee, tax, promoCode, promoDiscount, grandTotal, updateQuantity, removeItem, clearCart } = useCart()

const inputPromo = ref(promoCode.value || '')

const applyPromo = () => {
  if (inputPromo.value.trim().toUpperCase() === 'SNACK10') {
    promoCode.value = 'SNACK10'
  } else {
    alert('Invalid promo code. Try "SNACK10" for 10% off!')
  }
}
</script>
