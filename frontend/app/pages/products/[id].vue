<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
      <NuxtLink to="/" class="hover:text-blue-600 transition-colors">Home</NuxtLink>
      <span>/</span>
      <span v-if="product?.category_name" class="text-slate-600">{{ product.category_name }}</span>
      <span v-if="product?.category_name">/</span>
      <span class="text-slate-900 truncate max-w-xs">{{ product?.name || 'Loading...' }}</span>
    </nav>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!product" class="text-center py-20 bg-white rounded-3xl p-8 border border-slate-100">
      <p class="text-base font-bold text-slate-800 mb-4">Snack not found</p>
      <NuxtLink to="/" class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25">
        Back to Shop
      </NuxtLink>
    </div>

    <!-- Product Details Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
      
      <!-- Product Image -->
      <div class="space-y-4">
        <div class="relative aspect-square rounded-2xl overflow-hidden bg-blue-50/50 border border-slate-100 shadow-inner">
          <img 
            :src="product.image_url" 
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-4 left-4 flex gap-2">
            <span 
              v-if="product.is_featured" 
              class="bg-gradient-to-r from-blue-600 to-pink-500 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-md"
            >
              ⭐ Featured
            </span>
            <span 
              v-if="product.stock <= 10 && product.stock > 0" 
              class="bg-pink-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-md"
            >
              🔥 Low Stock
            </span>
          </div>
        </div>
      </div>

      <!-- Info & Controls -->
      <div class="flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              {{ product.category_name }}
            </span>
            <div class="flex items-center gap-1 text-xs font-bold text-slate-700">
              <span class="text-pink-500">★</span>
              <span>{{ Number(product.rating || 4.8).toFixed(1) }}</span>
              <span class="text-slate-400 font-normal">(Verified Snackers)</span>
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {{ product.name }}
          </h1>

          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-black text-slate-900">{{ formatRupiah(product.price) }}</span>
            <span class="text-xs font-bold uppercase" :class="product.stock > 0 ? 'text-blue-600' : 'text-rose-600'">
              {{ product.stock > 0 ? `In Stock (${product.stock} available)` : 'Sold Out' }}
            </span>
          </div>

          <p class="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            {{ product.description }}
          </p>

          <!-- Snack Specs -->
          <div class="grid grid-cols-2 gap-3 pt-4 text-xs">
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Category</span>
              <span class="font-bold text-slate-800">{{ product.category_name }}</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Packaging</span>
              <span class="font-bold text-slate-800">Sealed for Freshness</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Shelf Life</span>
              <span class="font-bold text-slate-800">6 - 12 Months</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span class="text-slate-400 block font-medium">Service</span>
              <span class="font-bold text-pink-700">Take Away Pickup</span>
            </div>
          </div>
        </div>

        <!-- Add to Cart controls -->
        <div class="space-y-4 pt-6 border-t border-slate-100">
          <div class="flex items-center gap-4">
            <div class="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
              <button 
                @click="quantity = Math.max(1, quantity - 1)"
                :disabled="product.stock <= 0"
                class="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-30"
              >
                -
              </button>
              <span class="w-12 text-center text-sm font-bold text-slate-800">{{ quantity }}</span>
              <button 
                @click="quantity = Math.min(product.stock, quantity + 1)"
                :disabled="quantity >= product.stock || product.stock <= 0"
                class="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button 
              @click="handleAddToCart"
              :disabled="product.stock <= 0 || adding"
              class="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
              :class="[
                product.stock <= 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : justAdded
                    ? 'bg-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-lg shadow-pink-500/25 hover:scale-[1.01]'
              ]"
            >
              <span v-if="justAdded">✓ Added {{ quantity }} to Cart!</span>
              <span v-else-if="product.stock > 0">Add to Snack Bag — {{ formatRupiah(Number(product.price) * quantity) }}</span>
              <span v-else>Out of Stock</span>
            </button>
          </div>

          <NuxtLink 
            to="/" 
            class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            ← Continue shopping more snacks
          </NuxtLink>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const { addToCart } = useCart()

const product = ref<any>(null)
const loading = ref(true)
const quantity = ref(1)
const adding = ref(false)
const justAdded = ref(false)

const fetchProduct = async () => {
  try {
    loading.value = true
    const data = await api.get(`/products/${route.params.id}`)
    product.value = data.product
    if (product.value && product.value.stock <= 0) {
      quantity.value = 0
    } else {
      quantity.value = 1
    }
  } catch (err) {
    console.error('Failed to load product:', err)
  } finally {
    loading.value = false
  }
}

const handleAddToCart = async () => {
  if (!product.value) return
  adding.value = true
  const success = await addToCart(product.value, quantity.value)
  if (success) {
    justAdded.value = true
    setTimeout(() => {
      justAdded.value = false
    }, 1500)
  }
  adding.value = false
}

onMounted(() => {
  fetchProduct()
})
</script>
