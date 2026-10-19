<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <NuxtLink to="/admin" class="text-xs font-bold text-slate-500 hover:text-blue-600 mb-1 inline-block">
          ← Back to Dashboard
        </NuxtLink>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manage Snack Catalog</h1>
        <p class="text-xs text-slate-500 mt-0.5">Add, edit prices, update inventory stock, or delete items</p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <NuxtLink 
          to="/admin/profile"
          class="px-3.5 py-2.5 rounded-xl text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>📱</span> QRIS Settings
        </NuxtLink>
        <button 
          @click="openAddModal"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 flex items-center gap-2 transition-all"
        >
          <span>+ Add New Snack</span>
        </button>
      </div>
    </div>

    <!-- Admin Guard -->
    <div v-if="!isAdmin" class="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-md mx-auto">
      <p class="text-sm font-bold text-rose-800">Administrator access required.</p>
    </div>

    <div v-else class="space-y-6">
      
      <!-- Filter & Search Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Filter snacks by title..."
          class="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
        />

        <div class="text-xs text-slate-500 font-medium">
          Showing <strong class="text-slate-800">{{ filteredProducts.length }}</strong> products
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Products Table -->
      <div v-else class="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th class="py-3 px-4">Snack</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Price</th>
                <th class="py-3 px-4">Stock</th>
                <th class="py-3 px-4">Rating</th>
                <th class="py-3 px-4">Featured</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-slate-50/50">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img :src="product.image_url" :alt="product.name" class="w-12 h-12 rounded-xl object-cover bg-blue-50 shrink-0 border border-slate-100" />
                    <div>
                      <span class="font-bold text-slate-900 block">{{ product.name }}</span>
                      <span class="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{{ product.description }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 font-medium text-slate-600">
                  {{ product.category_name || 'Uncategorized' }}
                </td>
                <td class="py-3 px-4 font-bold text-slate-900">
                  {{ formatRupiah(product.price) }}
                </td>
                <td class="py-3 px-4">
                  <span 
                    class="px-2.5 py-1 rounded-md font-bold text-xs"
                    :class="product.stock <= 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'"
                  >
                    {{ product.stock }} units
                  </span>
                </td>
                <td class="py-3 px-4 font-bold text-slate-700">
                  ★ {{ Number(product.rating || 4.5).toFixed(1) }}
                </td>
                <td class="py-3 px-4">
                  <span v-if="product.is_featured" class="text-pink-600 font-bold text-xs">⭐ Yes</span>
                  <span v-else class="text-slate-400 text-xs">No</span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      @click="openEditModal(product)"
                      class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 font-bold text-[11px] transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteProduct(product.id)"
                      class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px]"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Modal for Add / Edit Product -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">
            {{ isEditing ? 'Edit Snack' : 'Add New Snack' }}
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Snack Name</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="e.g. White Truffle Popcorn"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Category</label>
              <select 
                v-model="form.category_id"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Price (Rp IDR)</label>
              <input 
                v-model.number="form.price" 
                type="number" 
                step="500" 
                min="500" 
                placeholder="e.g. 45000"
                required 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Stock Quantity</label>
              <input 
                v-model.number="form.stock" 
                type="number" 
                min="0" 
                required 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Rating (1.0 - 5.0)</label>
              <input 
                v-model.number="form.rating" 
                type="number" 
                step="0.1" 
                min="1.0" 
                max="5.0" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Image URL</label>
            <input 
              v-model="form.image_url" 
              type="url" 
              required 
              placeholder="https://images.unsplash.com/..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Description</label>
            <textarea 
              v-model="form.description" 
              rows="3" 
              placeholder="Crisp taste, imported ingredients..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="featured" v-model="form.is_featured" class="rounded text-pink-600 focus:ring-pink-500" />
            <label for="featured" class="font-bold text-slate-700 cursor-pointer">Mark as Featured Snack (Showcases on Home Banner)</label>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              @click="closeModal"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="px-5 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 disabled:opacity-50 transition-all"
            >
              {{ isEditing ? 'Save Changes' : 'Create Snack' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const api = useApi()
const { isAdmin } = useAuth()

const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  name: '',
  category_id: 1,
  price: 45000,
  stock: 50,
  rating: 4.8,
  image_url: '',
  description: '',
  is_featured: false
})

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(p => p.name.toLowerCase().includes(query))
})

const fetchCategories = async () => {
  try {
    const data = await api.get('/products/categories')
    categories.value = data.categories || []
    if (categories.value.length > 0 && !form.category_id) {
      form.category_id = categories.value[0].id
    }
  } catch {}
}

const fetchProducts = async () => {
  try {
    loading.value = true
    const data = await api.get('/products?sort=newest')
    products.value = data.products || []
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  currentId.value = null
  form.name = ''
  form.category_id = categories.value[0]?.id || 1
  form.price = 45000
  form.stock = 50
  form.rating = 4.8
  form.image_url = 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  form.description = ''
  form.is_featured = false
  showModal.value = true
}

const openEditModal = (product: any) => {
  isEditing.value = true
  currentId.value = product.id
  form.name = product.name
  form.category_id = product.category_id
  form.price = Number(product.price)
  form.stock = product.stock
  form.rating = Number(product.rating || 4.5)
  form.image_url = product.image_url
  form.description = product.description
  form.is_featured = Boolean(product.is_featured)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveProduct = async () => {
  try {
    saving.value = true
    if (isEditing.value && currentId.value) {
      await api.put(`/products/${currentId.value}`, form)
    } else {
      await api.post('/products', form)
    }
    await fetchProducts()
    closeModal()
  } catch (err: any) {
    alert(err.message || 'Failed to save product')
  } finally {
    saving.value = false
  }
}

const deleteProduct = async (id: number) => {
  if (!confirm('Are you sure you want to delete this snack?')) return
  try {
    await api.delete(`/products/${id}`)
    await fetchProducts()
  } catch (err: any) {
    alert(err.message || 'Failed to delete product')
  }
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})
</script>
