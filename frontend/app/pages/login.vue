<template>
  <div class="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
      
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-pink-500 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md shadow-pink-500/20">
          🍿
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Sign in to SnackVault</h2>
        <p class="text-xs text-slate-500">Welcome back! Please enter your details.</p>
      </div>

      <!-- Quick Demo Account Fill Buttons -->
      <div class="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-3.5 space-y-2">
        <span class="text-[11px] font-bold text-blue-900 block uppercase tracking-wider">⚡ Instant Demo Login:</span>
        <div class="grid grid-cols-2 gap-2">
          <button 
            type="button"
            @click="fillDemo('user')"
            class="px-3 py-2 bg-white hover:bg-blue-100/50 text-slate-800 rounded-xl text-xs font-semibold border border-blue-200 transition-colors text-left flex flex-col"
          >
            <span class="font-bold text-blue-700">👤 User Account</span>
            <span class="text-[10px] text-slate-400">user@snackshop.com</span>
          </button>

          <button 
            type="button"
            @click="fillDemo('admin')"
            class="px-3 py-2 bg-white hover:bg-pink-50 text-slate-800 rounded-xl text-xs font-semibold border border-pink-200 transition-colors text-left flex flex-col"
          >
            <span class="font-bold text-pink-600">👑 Admin Account</span>
            <span class="text-[10px] text-slate-400">admin@snackshop.com</span>
          </button>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input 
            v-model="email"
            type="email" 
            required 
            placeholder="you@example.com"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input 
            v-model="password"
            type="password" 
            required 
            placeholder="••••••••"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign In to Account</span>
        </button>
      </form>

      <!-- Registration links -->
      <div class="border-t border-slate-100 pt-4 space-y-2 text-center text-xs text-slate-500">
        <div>
          New customer? 
          <NuxtLink to="/register" class="font-bold text-blue-600 hover:underline ml-1">
            Create Customer Account
          </NuxtLink>
        </div>
        <div class="text-[11px] text-slate-400">
          SnackVault Staff or Store Manager? 
          <NuxtLink to="/admin/register" class="font-bold text-pink-600 hover:underline ml-1">
            Admin Staff Registration →
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { login } = useAuth()
const { fetchCart } = useCart()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const fillDemo = (role: 'user' | 'admin') => {
  if (role === 'admin') {
    email.value = 'admin@snackshop.com'
    password.value = 'admin123'
  } else {
    email.value = 'user@snackshop.com'
    password.value = 'user123'
  }
}

const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const user = await login(email.value, password.value)
    await fetchCart()

    if (user.role === 'admin') {
      navigateTo('/admin')
    } else {
      navigateTo('/')
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
