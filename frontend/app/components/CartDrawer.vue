<template>
  <div v-if="isDrawerOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div 
      @click="closeDrawer"
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🛍️</span>
            <div>
              <h2 class="text-lg font-bold text-slate-800">Your Snack Bag</h2>
              <p class="text-xs text-slate-500">{{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }} selected</p>
            </div>
          </div>
          <button 
            @click="closeDrawer"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Take Away notice -->
        <div class="bg-blue-50/80 px-6 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs font-bold text-blue-900">
          <span class="flex items-center gap-1.5">
            <span>🛍️</span> Take Away / Counter Pickup
          </span>
          <span class="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase border border-pink-200">
            No Shipping Fee
          </span>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="items.length === 0" class="h-full flex flex-col items-center justify-center text-center py-12">
            <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4">
              🍿
            </div>
            <h3 class="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
            <p class="text-xs text-slate-500 max-w-xs mb-6">Looks like you haven't picked any tasty snacks yet.</p>
            <button 
              @click="closeDrawer"
              class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-blue-500/20"
            >
              Start Snacking
            </button>
          </div>

          <div 
            v-else 
            v-for="item in items" 
            :key="item.product_id"
            class="flex items-center gap-4 bg-slate-50/60 hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-100 transition-colors"
          >
            <!-- Thumbnail -->
            <img 
              :src="item.image_url" 
              :alt="item.name" 
              class="w-16 h-16 rounded-xl object-cover bg-blue-50 shrink-0 border border-slate-200"
            />

            <!-- Item details -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-slate-800 truncate mb-1">{{ item.name }}</h4>
              <p class="text-xs font-bold text-blue-700">{{ formatRupiah(item.price) }}</p>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-2 mt-2">
                <div class="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                  <button 
                    @click="updateQuantity(item.product_id, item.quantity - 1)"
                    class="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors text-xs font-bold"
                  >
                    -
                  </button>
                  <span class="w-8 text-center text-xs font-semibold text-slate-700">{{ item.quantity }}</span>
                  <button 
                    @click="updateQuantity(item.product_id, item.quantity + 1)"
                    :disabled="item.quantity >= item.stock"
                    class="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 transition-colors text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                <span class="text-[11px] text-slate-400">
                  Total: <strong class="text-slate-700">{{ formatRupiah(Number(item.price) * item.quantity) }}</strong>
                </span>
              </div>
            </div>

            <!-- Remove Button -->
            <button 
              @click="removeItem(item.product_id)"
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove snack"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Footer / Order Summary -->
        <div v-if="items.length > 0" class="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div class="space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-semibold text-slate-800">{{ formatRupiah(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Order Type</span>
              <span class="font-bold text-blue-700">Take Away Pickup (Free)</span>
            </div>
            <div class="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span class="font-semibold text-slate-800">{{ formatRupiah(tax) }}</span>
            </div>
            <div class="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total to Pay</span>
              <span class="text-base font-black text-pink-600">{{ formatRupiah(grandTotal) }}</span>
            </div>
          </div>

          <div class="space-y-2 pt-2">
            <button 
              @click="proceedToCheckout"
              class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
            >
              <span>🛍️ Proceed to Take Away Checkout</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button 
              @click="closeDrawer"
              class="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, totalItems, subtotal, shippingFee, tax, grandTotal, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart()

const proceedToCheckout = () => {
  closeDrawer()
  navigateTo('/checkout')
}
</script>
