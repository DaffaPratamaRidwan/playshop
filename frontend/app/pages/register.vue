<template>
  <div class="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
      
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-pink-500 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md shadow-pink-500/20">
          🍿
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Create your Account</h2>
        <p class="text-xs text-slate-500">Join SnackVault to unlock orders, tracking, and rewards</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <input 
            v-model="name"
            type="text" 
            required 
            placeholder="Jane Doe"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input 
            v-model="email"
            type="email" 
            required 
            placeholder="jane@example.com"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input 
            v-model="password"
            type="password" 
            required 
            placeholder="At least 6 characters"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
          <input 
            v-model="confirmPassword"
            type="password" 
            required 
            placeholder="Confirm your password"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          <span v-if="loading">Creating Account...</span>
          <span v-else>Register & Start Shopping</span>
        </button>
      </form>

      <!-- Footer link -->
      <div class="border-t border-slate-100 pt-4 space-y-2 text-center text-xs text-slate-500">
        <div>
          Already have an account? 
          <NuxtLink to="/login" class="font-bold text-blue-600 hover:underline ml-1">
            Sign In
          </NuxtLink>
        </div>
        <div class="text-[11px] text-slate-400">
          Need an administrator account? 
          <NuxtLink to="/admin/register" class="font-bold text-pink-600 hover:underline ml-1">
            Admin Staff Registration →
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { register } = useAuth()
const { fetchCart } = useCart()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    await register(name.value, email.value, password.value)
    await fetchCart()
    navigateTo('/')
  } catch (err: any) {
    errorMessage.value = err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
