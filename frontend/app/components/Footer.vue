<template>
  <footer class="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <!-- Brand -->
        <div class="md:col-span-1 space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <span class="text-xl">🍿</span>
            </div>
            <span class="font-extrabold text-xl tracking-tight text-white">Playshop</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Curated artisan snacks, gourmet crisps, luxury chocolates, and craft refreshments prepared fresh for fast counter take away.
          </p>
          <div class="text-xs text-slate-400">
            <p>📍 Plaza Sudirman Booth #G-08, Jakarta</p>
            <p>🛍️ Take Away Counter Pickup Only</p>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white text-xs font-bold uppercase tracking-wider mb-4">Explore</h4>
          <ul class="space-y-2.5 text-xs">
            <li><NuxtLink to="/" class="hover:text-blue-400 transition-colors">All Snacks</NuxtLink></li>
            <li><NuxtLink to="/orders" class="hover:text-pink-400 transition-colors">Order Tracking</NuxtLink></li>
            <li><NuxtLink to="/admin" class="hover:text-blue-400 transition-colors">Admin Portal</NuxtLink></li>
          </ul>
        </div>

        <!-- Payment Methods -->
        <div>
          <h4 class="text-white text-xs font-bold uppercase tracking-wider mb-4">Payment Gateway</h4>
          <div class="space-y-2.5 text-xs text-slate-400">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-pink-600 text-[10px] font-black text-white">QRIS</span>
              <span class="text-white font-bold">Standard Indonesian QR</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Accepting all Indonesian mobile banks and e-wallets (GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, BNI).
            </p>
          </div>
        </div>

        <!-- Demo Credentials Help -->
        <div>
          <h4 class="text-white text-xs font-bold uppercase tracking-wider mb-4">Demo Credentials</h4>
          <div class="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-xs space-y-2">
            <div>
              <span class="text-[10px] uppercase font-bold text-blue-400 block">Customer</span>
              <p class="text-slate-300 font-mono text-[11px]">user@snackshop.com</p>
              <p class="text-slate-500 font-mono text-[11px]">user123</p>
            </div>
            <div class="border-t border-slate-700 pt-1.5">
              <span class="text-[10px] uppercase font-bold text-pink-400 block">Administrator</span>
              <p class="text-slate-300 font-mono text-[11px]">admin@snackshop.com</p>
              <p class="text-slate-500 font-mono text-[11px]">admin123</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 Playshop Inc. Built with Bun, Hono, PostgreSQL & Nuxt 4.</p>
        <div class="flex gap-4 mt-4 sm:mt-0">
          <span>🔒 256-Bit SSL Encrypted Checkout</span>
          <span>⚡ 100% Snack Satisfaction</span>
        </div>
      </div>
    </div>
  </footer>
</template>
