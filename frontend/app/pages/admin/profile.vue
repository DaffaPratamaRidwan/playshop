<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Top Bar Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <NuxtLink to="/admin" class="text-xs font-bold text-slate-500 hover:text-blue-600 mb-1 inline-block">
          ← Back to Dashboard
        </NuxtLink>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-100 text-pink-700">Settings & Gateway</span>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Profile & QRIS Gateway</h1>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">Manage administrator credentials and update your store's live QRIS payment image</p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink 
          to="/admin/products"
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>🍿</span> Snacks Catalog
        </NuxtLink>
        <NuxtLink 
          to="/admin/orders"
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <span>🛍️</span> Take Away Orders
        </NuxtLink>
      </div>
    </div>

    <!-- Admin Access Guard -->
    <div v-if="!isAdmin" class="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-md mx-auto">
      <span class="text-3xl block mb-2">🚫</span>
      <h3 class="text-base font-bold text-rose-900">Access Denied</h3>
      <p class="text-xs text-rose-700 mt-1 mb-4">You must be logged in as an administrator to access profile and QRIS settings.</p>
      <NuxtLink to="/login" class="px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25">
        Sign in with Admin Account
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Main Settings Layout -->
    <div v-else class="space-y-8">

      <!-- Success / Error Feedback Alerts -->
      <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
        <div class="flex items-center gap-2">
          <span class="text-base">✓</span>
          <span>{{ successMessage }}</span>
        </div>
        <button @click="successMessage = ''" class="text-emerald-600 hover:text-emerald-900 text-sm">✕</button>
      </div>

      <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
        <div class="flex items-center gap-2">
          <span class="text-base">⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>
        <button @click="errorMessage = ''" class="text-rose-600 hover:text-rose-900 text-sm">✕</button>
      </div>

      <!-- 2-Column Grid: Left QRIS Gateway & Image, Right Admin Profile -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- ============================================== -->
        <!-- LEFT: QRIS IMAGE & PAYMENT SETTINGS (7 Cols) -->
        <!-- ============================================== -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-pink-500 text-white flex items-center justify-center text-xl shadow-md shadow-pink-500/20">
                  📱
                </div>
                <div>
                  <h2 class="text-base font-black text-slate-900">QRIS Payment Image & Gateway</h2>
                  <p class="text-xs text-slate-500">Live QR code presented to customers at Take Away checkout</p>
                </div>
              </div>

              <span class="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active Gateway
              </span>
            </div>

            <!-- Live QR Code Card Preview -->
            <div class="bg-gradient-to-b from-blue-50/60 via-indigo-50/20 to-pink-50/40 rounded-2xl p-6 border-2 border-blue-200 text-center space-y-4 shadow-xs">
              <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-pink-500 text-white px-3 py-0.5 rounded-full text-[11px] font-black shadow-2xs">
                <span>📱 Live Customer View Preview</span>
              </div>

              <!-- Rendered QRIS Image with Fallback -->
              <div class="bg-white p-4 rounded-2xl shadow-md inline-block border-2 border-slate-200 max-w-xs mx-auto">
                <img 
                  :src="qrisForm.image_url" 
                  :alt="qrisForm.merchant_name"
                  class="w-56 h-auto max-h-72 object-contain mx-auto rounded-lg shadow-2xs"
                  @error="onImageError"
                />
                <div class="text-[10px] font-mono font-bold text-slate-600 mt-2.5 bg-slate-100 py-1 px-2 rounded">
                  NMID: {{ qrisForm.nmid || 'ID102026SNACK998' }}
                </div>
              </div>

              <div class="text-xs space-y-0.5">
                <p class="font-bold text-slate-900">{{ qrisForm.merchant_name || 'SnackVault Express Counter' }}</p>
                <p class="text-[11px] text-pink-600 font-semibold">Valid for instant take away orders</p>
              </div>
            </div>

            <!-- QRIS Upload & Input Form -->
            <form @submit.prevent="saveQrisSettings" class="space-y-5 text-xs">
              
              <!-- Option A: File Upload -->
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">
                  Option 1: Upload QRIS Image File (PNG, JPG, SVG, WebP)
                </label>
                <div class="border-2 border-dashed border-blue-200 hover:border-pink-400 rounded-2xl p-4 text-center transition-colors bg-blue-50/20 relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleFileUpload"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div class="space-y-1">
                    <span class="text-2xl block">📤</span>
                    <p class="font-bold text-blue-700">Click or drag & drop a new QRIS code image</p>
                    <p class="text-[11px] text-slate-400">Supports PNG, JPG, WebP, SVG (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <!-- Option B: Direct Image URL -->
              <div>
                <label class="block font-bold text-slate-700 mb-1">
                  Option 2: Enter External Image URL or Data URI
                </label>
                <input 
                  v-model="qrisForm.image_url" 
                  type="text" 
                  required
                  placeholder="https://... or data:image/png;base64,..."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Option C: Quick Preset Selection -->
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">
                  Option 3: Choose from Built-in QRIS Presets
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button 
                    type="button"
                    v-for="preset in qrisPresets"
                    :key="preset.id"
                    @click="applyPreset(preset)"
                    class="p-2.5 rounded-xl border text-left transition-all text-[11px] flex flex-col justify-between"
                    :class="qrisForm.image_url === preset.svg ? 'border-pink-500 bg-pink-50/60 text-pink-900 ring-2 ring-pink-500/20 font-bold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'"
                  >
                    <span>{{ preset.label }}</span>
                    <span class="text-[10px] text-slate-400 mt-1">{{ preset.desc }}</span>
                  </button>
                </div>
              </div>

              <!-- Merchant Name & NMID Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Merchant Display Name</label>
                  <input 
                    v-model="qrisForm.merchant_name" 
                    type="text" 
                    required 
                    placeholder="e.g. SnackVault Express Counter"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">National Merchant ID (NMID)</label>
                  <input 
                    v-model="qrisForm.nmid" 
                    type="text" 
                    required 
                    placeholder="e.g. ID102026SNACK998"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Save QRIS Button -->
              <div class="pt-2 flex items-center justify-between gap-3">
                <button 
                  type="button" 
                  @click="resetToDefaultQris"
                  class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs"
                >
                  Reset to Default
                </button>

                <button 
                  type="submit" 
                  :disabled="savingQris"
                  class="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 shadow-md shadow-pink-500/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <span v-if="savingQris">Saving QRIS Image...</span>
                  <span v-else>💾 Save QRIS Image & Settings</span>
                </button>
              </div>

            </form>

          </div>
        </div>

        <!-- ============================================== -->
        <!-- RIGHT: ADMINISTRATOR PROFILE & CREDENTIALS (5 Cols) -->
        <!-- ============================================== -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6">
            
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-600/20">
                👤
              </div>
              <div>
                <h2 class="text-base font-black text-slate-900">Administrator Profile</h2>
                <p class="text-xs text-slate-500">Your account identity and security details</p>
              </div>
            </div>

            <!-- Profile Summary Card -->
            <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-pink-500 text-white font-black text-xl flex items-center justify-center uppercase shadow-md shadow-pink-500/20 shrink-0">
                {{ adminForm.name ? adminForm.name.charAt(0) : 'A' }}
              </div>
              <div class="text-xs min-w-0">
                <span class="font-black text-slate-900 text-sm block truncate">{{ adminForm.name }}</span>
                <span class="text-slate-500 block truncate">{{ adminForm.email }}</span>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    👑 {{ adminForm.role }}
                  </span>
                  <span class="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full truncate">
                    {{ adminForm.department }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Profile Edit Form -->
            <form @submit.prevent="saveAdminProfile" class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  v-model="adminForm.name" 
                  type="text" 
                  required 
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Email (Login Identifier)</label>
                <input 
                  :value="adminForm.email" 
                  disabled
                  type="email" 
                  class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Department</label>
                  <select 
                    v-model="adminForm.department"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Store Operations">Store Operations</option>
                    <option value="Inventory & Supply Chain">Inventory & Supply</option>
                    <option value="Customer Fulfillment & Payments">Payments & QRIS</option>
                    <option value="General Administration">General Admin</option>
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">WhatsApp / Phone</label>
                  <input 
                    v-model="adminForm.phone" 
                    type="tel" 
                    placeholder="+62 812-..."
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Staff Bio / Counter Notes</label>
                <textarea 
                  v-model="adminForm.bio" 
                  rows="2" 
                  placeholder="Notes about store operations..."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <!-- Security: Update Password -->
              <div class="pt-3 border-t border-slate-100 space-y-3">
                <span class="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  🔐 Change Password (Optional)
                </span>
                
                <div>
                  <label class="block font-semibold text-slate-600 mb-1">New Password (leave blank to keep current)</label>
                  <input 
                    v-model="newPassword" 
                    type="password" 
                    placeholder="Min. 6 characters"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Submit Profile -->
              <div class="pt-2">
                <button 
                  type="submit" 
                  :disabled="savingProfile"
                  class="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-slate-900 hover:bg-slate-800 shadow-md transition-all disabled:opacity-50"
                >
                  <span v-if="savingProfile">Updating Profile...</span>
                  <span v-else>Update Profile Information</span>
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const api = useApi()
const { isAdmin, user: authUser } = useAuth()

const loading = ref(true)
const savingQris = ref(false)
const savingProfile = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const qrisForm = reactive({
  image_url: '',
  merchant_name: 'SnackVault Express Counter',
  nmid: 'ID102026SNACK998'
})

const adminForm = reactive({
  name: '',
  email: '',
  role: 'admin',
  department: 'Store Operations',
  phone: '+62 812-3456-7890',
  bio: '',
  avatar_url: ''
})

const newPassword = ref('')

// Pre-defined SVG QRIS presets
const presetOfficialSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380"><rect width="300" height="380" rx="16" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><rect x="15" y="15" width="270" height="50" rx="10" fill="%23dc2626"/><text x="150" y="48" font-family="Arial,sans-serif" font-weight="900" font-size="24" fill="%23ffffff" text-anchor="middle" letter-spacing="2">QRIS</text><text x="150" y="80" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="%231e293b" text-anchor="middle">SNACKVAULT TAKE AWAY</text><text x="150" y="96" font-family="monospace" font-weight="600" font-size="10" fill="%2364748b" text-anchor="middle">NMID: ID102026SNACK998</text><rect x="35" y="110" width="230" height="230" rx="8" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5"/><rect x="55" y="130" width="48" height="48" rx="6" fill="%230f172a"/><rect x="63" y="138" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="71" y="146" width="16" height="16" rx="2" fill="%230f172a"/><rect x="197" y="130" width="48" height="48" rx="6" fill="%230f172a"/><rect x="205" y="138" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="213" y="146" width="16" height="16" rx="2" fill="%230f172a"/><rect x="55" y="272" width="48" height="48" rx="6" fill="%230f172a"/><rect x="63" y="280" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="71" y="288" width="16" height="16" rx="2" fill="%230f172a"/><rect x="115" y="135" width="12" height="12" fill="%230f172a"/><rect x="135" y="145" width="14" height="14" fill="%230f172a"/><rect x="160" y="135" width="12" height="12" fill="%230f172a"/><rect x="115" y="165" width="16" height="16" fill="%230f172a"/><rect x="145" y="170" width="20" height="12" fill="%230f172a"/><rect x="115" y="195" width="25" height="12" fill="%230f172a"/><rect x="150" y="195" width="12" height="25" fill="%230f172a"/><rect x="175" y="180" width="14" height="14" fill="%230f172a"/><rect x="175" y="210" width="20" height="15" fill="%230f172a"/><rect x="70" y="195" width="14" height="14" fill="%230f172a"/><rect x="90" y="215" width="14" height="14" fill="%230f172a"/><rect x="65" y="235" width="25" height="12" fill="%230f172a"/><rect x="115" y="235" width="15" height="15" fill="%230f172a"/><rect x="140" y="230" width="22" height="22" fill="%230f172a"/><rect x="170" y="240" width="15" height="15" fill="%230f172a"/><rect x="200" y="195" width="18" height="18" fill="%230f172a"/><rect x="225" y="225" width="15" height="25" fill="%230f172a"/><rect x="205" y="260" width="18" height="18" fill="%230f172a"/><rect x="120" y="275" width="18" height="18" fill="%230f172a"/><rect x="145" y="270" width="24" height="14" fill="%230f172a"/><rect x="175" y="285" width="16" height="16" fill="%230f172a"/><rect x="135" y="305" width="30" height="15" fill="%230f172a"/><circle cx="150" cy="225" r="18" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="150" y="229" font-family="Arial,sans-serif" font-weight="900" font-size="10" fill="%23dc2626" text-anchor="middle">QRIS</text><text x="150" y="360" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="%2394a3b8" text-anchor="middle">DICETAK OLEH: SNACKVAULT INDONESIA</text></svg>`

const presetBluePinkSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="300" height="380"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232563eb"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="300" height="380" rx="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><rect x="15" y="15" width="270" height="50" rx="10" fill="url(%23g)"/><text x="150" y="48" font-family="Arial,sans-serif" font-weight="900" font-size="24" fill="%23ffffff" text-anchor="middle" letter-spacing="2">QRIS PAY</text><text x="150" y="80" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="%231e293b" text-anchor="middle">SNACKVAULT SPECIAL BLUE &amp; PINK</text><text x="150" y="96" font-family="monospace" font-weight="600" font-size="10" fill="%2364748b" text-anchor="middle">NMID: ID102026SNACK998</text><rect x="35" y="110" width="230" height="230" rx="8" fill="%23eff6ff" stroke="%23bfdbfe" stroke-width="1.5"/><rect x="55" y="130" width="48" height="48" rx="6" fill="%231e40af"/><rect x="63" y="138" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="71" y="146" width="16" height="16" rx="2" fill="%23db2777"/><rect x="197" y="130" width="48" height="48" rx="6" fill="%231e40af"/><rect x="205" y="138" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="213" y="146" width="16" height="16" rx="2" fill="%23db2777"/><rect x="55" y="272" width="48" height="48" rx="6" fill="%231e40af"/><rect x="63" y="280" width="32" height="32" rx="3" fill="%23ffffff"/><rect x="71" y="288" width="16" height="16" rx="2" fill="%23db2777"/><rect x="115" y="135" width="12" height="12" fill="%23db2777"/><rect x="135" y="145" width="14" height="14" fill="%231e40af"/><rect x="160" y="135" width="12" height="12" fill="%23db2777"/><rect x="115" y="165" width="16" height="16" fill="%231e40af"/><rect x="145" y="170" width="20" height="12" fill="%23db2777"/><rect x="115" y="195" width="25" height="12" fill="%231e40af"/><rect x="150" y="195" width="12" height="25" fill="%23db2777"/><rect x="175" y="180" width="14" height="14" fill="%231e40af"/><rect x="175" y="210" width="20" height="15" fill="%23db2777"/><rect x="70" y="195" width="14" height="14" fill="%23db2777"/><rect x="90" y="215" width="14" height="14" fill="%231e40af"/><rect x="65" y="235" width="25" height="12" fill="%23db2777"/><rect x="115" y="235" width="15" height="15" fill="%231e40af"/><rect x="140" y="230" width="22" height="22" fill="%23db2777"/><rect x="170" y="240" width="15" height="15" fill="%231e40af"/><rect x="200" y="195" width="18" height="18" fill="%23db2777"/><rect x="225" y="225" width="15" height="25" fill="%231e40af"/><rect x="205" y="260" width="18" height="18" fill="%23db2777"/><rect x="120" y="275" width="18" height="18" fill="%231e40af"/><rect x="145" y="270" width="24" height="14" fill="%23db2777"/><rect x="175" y="285" width="16" height="16" fill="%231e40af"/><rect x="135" y="305" width="30" height="15" fill="%23db2777"/><circle cx="150" cy="225" r="20" fill="%23ffffff" stroke="%23ec4899" stroke-width="2"/><text x="150" y="229" font-family="Arial,sans-serif" font-weight="900" font-size="9" fill="%232563eb" text-anchor="middle">SNACK</text><text x="150" y="360" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="%2394a3b8" text-anchor="middle">TAKE AWAY COUNTER GATEWAY</text></svg>`

const presetMinimalSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><rect width="300" height="300" rx="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><rect x="30" y="30" width="60" height="60" rx="8" fill="%230f172a"/><rect x="40" y="40" width="40" height="40" rx="4" fill="%23ffffff"/><rect x="50" y="50" width="20" height="20" rx="2" fill="%230f172a"/><rect x="210" y="30" width="60" height="60" rx="8" fill="%230f172a"/><rect x="220" y="40" width="40" height="40" rx="4" fill="%23ffffff"/><rect x="230" y="50" width="20" height="20" rx="2" fill="%230f172a"/><rect x="30" y="210" width="60" height="60" rx="8" fill="%230f172a"/><rect x="40" y="220" width="40" height="40" rx="4" fill="%23ffffff"/><rect x="50" y="230" width="20" height="20" rx="2" fill="%230f172a"/><rect x="110" y="35" width="20" height="20" fill="%230f172a"/><rect x="145" y="45" width="20" height="20" fill="%230f172a"/><rect x="175" y="35" width="15" height="15" fill="%230f172a"/><rect x="110" y="80" width="30" height="20" fill="%230f172a"/><rect x="155" y="85" width="30" height="20" fill="%230f172a"/><rect x="110" y="125" width="30" height="30" fill="%230f172a"/><rect x="155" y="125" width="25" height="40" fill="%230f172a"/><rect x="195" y="110" width="30" height="30" fill="%230f172a"/><rect x="195" y="160" width="30" height="20" fill="%230f172a"/><rect x="40" y="110" width="25" height="25" fill="%230f172a"/><rect x="40" y="150" width="25" height="40" fill="%230f172a"/><rect x="80" y="125" width="20" height="25" fill="%230f172a"/><rect x="80" y="165" width="20" height="25" fill="%230f172a"/><rect x="110" y="195" width="25" height="30" fill="%230f172a"/><rect x="150" y="185" width="30" height="30" fill="%230f172a"/><rect x="110" y="240" width="40" height="30" fill="%230f172a"/><rect x="165" y="230" width="30" height="40" fill="%230f172a"/><rect x="210" y="200" width="30" height="30" fill="%230f172a"/><rect x="210" y="245" width="60" height="25" fill="%230f172a"/><text x="150" y="290" font-family="monospace" font-weight="700" font-size="10" fill="%2364748b" text-anchor="middle">QRIS DIRECT SCAN</text></svg>`

const qrisPresets = [
  { id: 'official', label: '🔴 Official Red QRIS', desc: 'Standard national standee style', svg: presetOfficialSvg },
  { id: 'bluepink', label: '🎨 Blue & Pink Special', desc: 'Matches SnackVault theme', svg: presetBluePinkSvg },
  { id: 'minimal', label: '⬛ Minimalist Counter', desc: 'Compact clean QR matrix', svg: presetMinimalSvg }
]

const applyPreset = (preset: any) => {
  qrisForm.image_url = preset.svg
  successMessage.value = `Applied "${preset.label}". Click 'Save QRIS Image & Settings' to publish.`
}

const resetToDefaultQris = () => {
  qrisForm.image_url = presetOfficialSvg
  qrisForm.merchant_name = 'SnackVault Express Counter'
  qrisForm.nmid = 'ID102026SNACK998'
  successMessage.value = "Reset to default QRIS code template."
}

// Convert uploaded file to base64 Data URL
const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'File is too large. Please select an image under 5MB.'
    return
  }

  const reader = new FileReader()
  reader.onload = (readEvent) => {
    if (readEvent.target?.result) {
      qrisForm.image_url = readEvent.target.result as string
      successMessage.value = `Selected image "${file.name}" loaded for preview! Click "Save QRIS Image" to update store.`
    }
  }
  reader.readAsDataURL(file)
}

const onImageError = () => {
  errorMessage.value = 'Failed to load QRIS image from URL. Please check the URL or upload a file.'
}

const fetchProfile = async () => {
  if (!isAdmin.value) return
  try {
    loading.value = true
    errorMessage.value = ''
    const data = await api.get('/admin/profile')

    if (data.admin) {
      adminForm.name = data.admin.name || ''
      adminForm.email = data.admin.email || ''
      adminForm.role = data.admin.role || 'admin'
      adminForm.department = data.admin.department || 'Store Operations'
      adminForm.phone = data.admin.phone || '+62 812-3456-7890'
      adminForm.bio = data.admin.bio || ''
      adminForm.avatar_url = data.admin.avatar_url || ''
    }

    if (data.qris) {
      qrisForm.image_url = data.qris.image_url || presetOfficialSvg
      qrisForm.merchant_name = data.qris.merchant_name || 'SnackVault Express Counter'
      qrisForm.nmid = data.qris.nmid || 'ID102026SNACK998'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load admin profile & QRIS'
  } finally {
    loading.value = false
  }
}

const saveQrisSettings = async () => {
  try {
    savingQris.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const data = await api.put('/admin/qris', {
      image_url: qrisForm.image_url,
      merchant_name: qrisForm.merchant_name,
      nmid: qrisForm.nmid
    })

    successMessage.value = '🎉 ' + (data.message || 'QRIS image & details updated successfully! Customers will now see this image.')
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update QRIS settings'
  } finally {
    savingQris.value = false
  }
}

const saveAdminProfile = async () => {
  try {
    savingProfile.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const payload: any = {
      name: adminForm.name,
      department: adminForm.department,
      phone: adminForm.phone,
      bio: adminForm.bio,
      avatar_url: adminForm.avatar_url
    }

    if (newPassword.value) {
      if (newPassword.value.length < 6) {
        errorMessage.value = 'New password must be at least 6 characters'
        savingProfile.value = false
        return
      }
      payload.new_password = newPassword.value
    }

    const data = await api.put('/admin/profile', payload)
    newPassword.value = ''

    // Update global auth state name if changed
    if (authUser.value && data.admin) {
      authUser.value.name = data.admin.name
    }

    successMessage.value = '✓ Admin profile details updated successfully!'
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update profile'
  } finally {
    savingProfile.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
