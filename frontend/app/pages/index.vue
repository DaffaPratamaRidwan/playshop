<template>
  <div class="space-y-12 pb-20">
    
    <!-- Hero Banner -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-pink-500 text-white py-16 sm:py-24">
      <!-- Background decorative circles -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-2xl space-y-6">

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Craving Something <br class="hidden sm:inline" />
            <span class="text-pink-200 underline decoration-pink-300/60 decoration-wavy underline-offset-8">Delicious?</span>
          </h1>

          <p class="text-base sm:text-lg text-blue-100 font-medium leading-relaxed max-w-xl">
            Explore our curated vault of hand-crafted chips, Belgian chocolates, specialty cold brews, and healthy bites ready for fast take away at our express counter.
          </p>

          <!-- Search Bar in Hero -->
          <div class="relative max-w-lg">
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              placeholder="Search crispy chips, matcha chocolate, cookies..."
              class="w-full pl-12 pr-28 py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 text-sm"
            />
            <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button 
              @click="fetchProducts"
              class="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-pink-500/25"
            >
              Search
            </button>
          </div>

          <!-- Feature badges -->
          <div class="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-blue-100">
            <div class="flex items-center gap-1.5">
              <span>🛍️</span> 10-Min Take Away Prep
            </div>
            <div class="flex items-center gap-1.5">
              <span>📱</span> Instant QRIS Scan & Pay
            </div>
            <div class="flex items-center gap-1.5">
              <span>⭐</span> 4.9 Average Rating
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <!-- Category Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button 
          @click="selectCategory('all')"
          class="shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
          :class="selectedCategory === 'all' 
            ? 'bg-gradient-to-r from-blue-600 to-pink-500 text-white shadow-md shadow-blue-500/20' 
            : 'bg-white text-slate-600 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200'"
        >
          <span>🍿</span> All Snacks
        </button>

        <button 
          v-for="cat in categories" 
          :key="cat.id"
          @click="selectCategory(cat.slug)"
          class="shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
          :class="selectedCategory === cat.slug 
            ? 'bg-gradient-to-r from-blue-600 to-pink-500 text-white shadow-md shadow-pink-500/20' 
            : 'bg-white text-slate-600 hover:bg-pink-50/50 border border-slate-200 hover:border-pink-200'"
        >
          <span>{{ getCategoryEmoji(cat.slug) }}</span>
          <span>{{ cat.name }}</span>
          <span 
            class="text-[10px] px-1.5 py-0.5 rounded-full"
            :class="selectedCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
          >
            {{ cat.product_count }}
          </span>
        </button>
      </div>

      <!-- Filters & Sorting Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        <div class="flex items-center gap-3 text-xs text-slate-500">
          <span class="font-bold text-slate-800 text-sm">{{ products.length }}</span> Snacks Available
          <span v-if="searchQuery" class="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-200">
            Matching "{{ searchQuery }}"
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Featured Filter Toggle -->
          <button 
            @click="toggleFeaturedOnly"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            :class="featuredOnly ? 'bg-pink-100 text-pink-800 border border-pink-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>⭐</span> Featured Only
          </button>

          <!-- Sort Dropdown -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400 font-medium">Sort by:</span>
            <select 
              v-model="sortBy" 
              @change="fetchProducts"
              class="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-4">
          <div class="aspect-4/3 bg-slate-100 rounded-2xl"></div>
          <div class="h-4 bg-slate-100 rounded w-3/4"></div>
          <div class="h-3 bg-slate-100 rounded w-1/2"></div>
          <div class="flex justify-between items-center pt-2">
            <div class="h-5 bg-slate-100 rounded w-1/4"></div>
            <div class="h-8 bg-slate-100 rounded w-16"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8">
        <div class="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          🔍
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">No snacks match your search</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-6">
          Try adjusting your search keywords or switching category filters to discover more snacks.
        </p>
        <button 
          @click="resetFilters"
          class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 transition-all shadow-md shadow-blue-500/20"
        >
          Reset All Filters
        </button>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <SnackCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>

    </div>

    <!-- Value Props Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div class="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-pink-50 border border-blue-200/60 rounded-3xl p-8 sm:p-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center text-2xl shrink-0">
              ⚡
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm mb-1">Instant Counter Prep</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Snacks are freshly bagged and waiting for you right after QRIS payment.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-700 flex items-center justify-center text-2xl shrink-0">
              📱
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm mb-1">QRIS Instant Gateway</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Pay effortlessly with GoPay, OVO, Dana, ShopeePay, BCA, or mobile banking.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center text-2xl shrink-0">
              🛡️
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm mb-1">Secure & Authentic</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Role-based JWT security and authentic gourmet snack guarantee.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-700 flex items-center justify-center text-2xl shrink-0">
              🛍️
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm mb-1">100% Free Counter Pickup</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Pick up freshly packed snacks directly at our booth with zero pickup fees.</p>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const api = useApi()

const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(true)

const selectedCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('newest')
const featuredOnly = ref(false)

const getCategoryEmoji = (slug: string) => {
  const map: Record<string, string> = {
    'chips-crisps': '🥔',
    'chocolates-sweets': '🍫',
    'bakery-cookies': '🍪',
    'beverages': '🧃',
    'nuts-healthy': '🥜'
  }
  return map[slug] || '🍿'
}

const fetchCategories = async () => {
  try {
    const data = await api.get('/products/categories')
    categories.value = data.categories || []
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

const fetchProducts = async () => {
  try {
    loading.value = true
    let url = `/products?sort=${sortBy.value}`
    if (selectedCategory.value !== 'all') {
      url += `&category=${selectedCategory.value}`
    }
    if (searchQuery.value.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.value.trim())}`
    }
    if (featuredOnly.value) {
      url += `&featured=true`
    }

    const data = await api.get(url)
    products.value = data.products || []
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    loading.value = false
  }
}

let searchDebounceTimer: any = null
const handleSearch = () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    fetchProducts()
  }, 300)
}

const selectCategory = (slug: string) => {
  selectedCategory.value = slug
  fetchProducts()
}

const toggleFeaturedOnly = () => {
  featuredOnly.value = !featuredOnly.value
  fetchProducts()
}

const resetFilters = () => {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  sortBy.value = 'newest'
  featuredOnly.value = false
  fetchProducts()
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})
</script>
