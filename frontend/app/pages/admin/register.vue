<template>
  <div class="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/5">
    <div class="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-blue-100 shadow-2xl relative overflow-hidden">
      
      <!-- Top banner line -->
      <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500"></div>

      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 bg-gradient-to-tr from-blue-600 to-pink-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg shadow-pink-500/25">
          🛡️
        </div>
        <div class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
          Staff & Operations Portal
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Staff Registration</h2>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Create an administrator account with elevated privileges to manage snack inventory, orders, and sales analytics.
        </p>
      </div>

      <!-- Secret Key Helper Box -->
      <div class="bg-pink-50/70 border border-pink-200/70 rounded-2xl p-4 text-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-pink-900 flex items-center gap-1.5">
            <span>🔑</span> Admin Authorization Passkey Required
          </span>
          <button 
            type="button"
            @click="fillDemoKey"
            class="text-[11px] font-bold text-pink-700 hover:text-pink-900 bg-white hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200 shadow-2xs transition-colors"
          >
            ⚡ Auto-Fill Demo Key
          </button>
        </div>
        <p class="text-slate-600 text-[11px] leading-relaxed">
          Admin registration requires the verified organization secret key. For local testing, use: <code class="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-pink-800 border border-pink-200">SNACK-ADMIN-2026</code>.
        </p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
        <span>⚠️</span>
        <span class="font-medium">{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleAdminRegister" class="space-y-4 text-xs">
        
        <div>
          <label class="block font-bold text-slate-700 mb-1">Administrator Full Name</label>
          <input 
            v-model="name"
            type="text" 
            required 
            placeholder="e.g. Alex Vance"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Official Work Email</label>
            <input 
              v-model="email"
              type="email" 
              required 
              placeholder="alex@snackshop.com"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Department / Role</label>
            <select 
              v-model="department"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Store Operations">Store Operations</option>
              <option value="Inventory & Supply Chain">Inventory & Supply Chain</option>
              <option value="Customer Fulfillment & Payments">Customer Fulfillment & Payments</option>
              <option value="General Administration">General Administration</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Admin Authorization Secret Key</label>
          <input 
            v-model="adminSecret"
            type="password" 
            required 
            placeholder="Enter organization admin key"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-wider"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Admin Password</label>
            <input 
              v-model="password"
              type="password" 
              required 
              placeholder="Min. 6 characters"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Confirm Password</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              required 
              placeholder="Confirm password"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2"
        >
          <span v-if="loading">Verifying Authorization & Registering...</span>
          <span v-else>Register Administrator Account 👑</span>
        </button>

      </form>

      <!-- Bottom Links -->
      <div class="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <NuxtLink to="/login" class="hover:text-blue-600 font-semibold">
          ← Back to Sign In
        </NuxtLink>
        <NuxtLink to="/register" class="text-pink-600 hover:underline font-bold">
          Not staff? Customer Sign Up →
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { registerAdmin } = useAuth()
const { fetchCart } = useCart()

const name = ref('')
const email = ref('')
const department = ref('Inventory & Supply Chain')
const adminSecret = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')

const fillDemoKey = () => {
  adminSecret.value = 'SNACK-ADMIN-2026'
  if (!name.value) name.value = 'Operations Admin'
  if (!email.value) email.value = `admin${Math.floor(Math.random() * 900 + 100)}@snackshop.com`
  if (!password.value) {
    password.value = 'admin123'
    confirmPassword.value = 'admin123'
  }
}

const handleAdminRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    await registerAdmin(
      name.value,
      email.value,
      password.value,
      adminSecret.value,
      department.value
    )
    await fetchCart()
    // Admin directly directed to the admin portal
    navigateTo('/admin')
  } catch (err: any) {
    errorMessage.value = err.message || 'Admin registration failed'
  } finally {
    loading.value = false
  }
}
</script>
