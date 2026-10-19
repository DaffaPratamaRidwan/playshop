<template>
  <div class="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden">
    
    <!-- Image & Badges -->
    <div class="relative aspect-4/3 overflow-hidden bg-blue-50/50">
      <img 
        :src="product.image_url" 
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
        <span 
          v-if="product.is_featured" 
          class="bg-gradient-to-r from-blue-600 to-pink-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs"
        >
          ⭐ Featured
        </span>
        <span 
          v-if="product.stock > 0 && product.stock <= 10" 
          class="bg-pink-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs"
        >
          🔥 Only {{ product.stock }} Left
        </span>
        <span 
          v-if="product.stock <= 0" 
          class="bg-slate-800/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs"
        >
          Out of Stock
        </span>
      </div>

      <!-- Category Chip -->
      <span 
        v-if="product.category_name"
        class="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-blue-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs border border-blue-100"
      >
        {{ product.category_name }}
      </span>

      <!-- Rating -->
      <div class="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold px-2 py-1 rounded-lg shadow-2xs flex items-center gap-1">
        <span class="text-pink-500">★</span>
        <span>{{ Number(product.rating || 4.8).toFixed(1) }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex-1 flex flex-col justify-between">
      <div>
        <NuxtLink :to="`/products/${product.id}`" class="block group-hover:text-blue-600 transition-colors">
          <h3 class="font-bold text-slate-800 text-base line-clamp-1 mb-1.5" :title="product.name">
            {{ product.name }}
          </h3>
        </NuxtLink>

        <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {{ product.description }}
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span class="text-[11px] text-slate-400 block font-medium">Price</span>
          <span class="text-base font-black text-slate-900">{{ formatRupiah(product.price) }}</span>
        </div>

        <button 
          @click="handleAddToCart"
          :disabled="product.stock <= 0 || adding"
          class="relative flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200"
          :class="[
            product.stock <= 0 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : justAdded
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95'
          ]"
        >
          <span v-if="justAdded">✓ Added</span>
          <template v-else-if="product.stock > 0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add</span>
          </template>
          <span v-else>Sold Out</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: any
}>()

const { addToCart } = useCart()
const adding = ref(false)
const justAdded = ref(false)

const handleAddToCart = async () => {
  adding.value = true
  const success = await addToCart(props.product, 1)
  if (success) {
    justAdded.value = true
    setTimeout(() => {
      justAdded.value = false
    }, 1500)
  }
  adding.value = false
}
</script>
