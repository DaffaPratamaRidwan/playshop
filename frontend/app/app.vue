<template>
  <div class="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans antialiased selection:bg-pink-500 selection:text-white">
    <Navbar />
    
    <main class="flex-1">
      <NuxtPage />
    </main>

    <CartDrawer />
    <Footer />
  </div>
</template>

<script setup lang="ts">
const { initAuth } = useAuth()
const { fetchCart } = useCart()

onMounted(async () => {
  initAuth()
  await fetchCart()
})
</script>
