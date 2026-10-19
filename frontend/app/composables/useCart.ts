export interface CartItem {
  id?: number
  product_id: number
  name: string
  price: number | string
  stock: number
  image_url: string
  quantity: number
  total_price?: number | string
}

export const useCart = () => {
  const items = useState<CartItem[]>('cart_items', () => [])
  const isDrawerOpen = useState<boolean>('cart_drawer_open', () => false)
  const loading = useState<boolean>('cart_loading', () => false)
  const promoCode = useState<string>('cart_promo_code', () => '')

  const api = useApi()
  const { isLoggedIn } = useAuth()

  const subtotal = computed(() => {
    return Math.round(
      items.value.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    )
  })

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const shippingFee = computed(() => 0)

  const promoDiscount = computed(() => {
    if (promoCode.value.trim().toUpperCase() === 'SNACK10') {
      return Math.round(subtotal.value * 0.10)
    }
    return 0
  })

  const tax = computed(() => {
    const taxableAmount = Math.max(0, subtotal.value - promoDiscount.value)
    return Math.round(taxableAmount * 0.08)
  })

  const grandTotal = computed(() => {
    return Math.max(0, subtotal.value - promoDiscount.value) + tax.value
  })

  // Sync guest items into database cart upon authentication
  const syncGuestCart = async () => {
    if (import.meta.client && isLoggedIn.value) {
      const stored = localStorage.getItem('snack_guest_cart')
      if (stored) {
        try {
          const guestItems = JSON.parse(stored)
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            for (const item of guestItems) {
              await api.post('/cart/add', {
                product_id: item.product_id,
                quantity: item.quantity
              }).catch(() => {})
            }
          }
        } catch {}
        localStorage.removeItem('snack_guest_cart')
      }
    }
  }

  // Load cart from server or local
  const fetchCart = async () => {
    if (isLoggedIn.value) {
      try {
        loading.value = true
        await syncGuestCart()
        const data = await api.get('/cart')
        items.value = data.items || []
      } catch (err) {
        console.error('Error fetching cart:', err)
      } finally {
        loading.value = false
      }
    } else {
      if (import.meta.client) {
        const stored = localStorage.getItem('snack_guest_cart')
        if (stored) {
          try {
            items.value = JSON.parse(stored)
          } catch {
            items.value = []
          }
        }
      }
    }
  }

  const saveGuestCart = () => {
    if (import.meta.client && !isLoggedIn.value) {
      localStorage.setItem('snack_guest_cart', JSON.stringify(items.value))
    }
  }

  const addToCart = async (product: any, quantity: number = 1) => {
    if (quantity <= 0) return

    if (isLoggedIn.value) {
      try {
        loading.value = true
        const data = await api.post('/cart/add', {
          product_id: product.id,
          quantity
        })
        items.value = data.cart.items
        isDrawerOpen.value = true
        return true
      } catch (err: any) {
        alert(err.message || 'Failed to add item to cart')
        return false
      } finally {
        loading.value = false
      }
    } else {
      // Guest local cart
      const existing = items.value.find(i => i.product_id === product.id)
      const currentQty = existing ? existing.quantity : 0
      const newQty = currentQty + quantity

      if (newQty > product.stock) {
        alert(`Cannot add more. Only ${product.stock} available in stock.`)
        return false
      }

      if (existing) {
        existing.quantity = newQty
      } else {
        items.value.push({
          product_id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image_url: product.image_url,
          quantity: newQty
        })
      }
      saveGuestCart()
      isDrawerOpen.value = true
      return true
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (isLoggedIn.value) {
      try {
        loading.value = true
        const data = await api.put('/cart/update', {
          product_id: productId,
          quantity
        })
        items.value = data.cart.items
      } catch (err: any) {
        alert(err.message || 'Failed to update quantity')
      } finally {
        loading.value = false
      }
    } else {
      if (quantity <= 0) {
        items.value = items.value.filter(i => i.product_id !== productId)
      } else {
        const item = items.value.find(i => i.product_id === productId)
        if (item) {
          if (quantity > item.stock) {
            alert(`Only ${item.stock} in stock.`)
            return
          }
          item.quantity = quantity
        }
      }
      saveGuestCart()
    }
  }

  const removeItem = async (productId: number) => {
    if (isLoggedIn.value) {
      try {
        loading.value = true
        const data = await api.delete(`/cart/remove/${productId}`)
        items.value = data.cart.items
      } catch (err: any) {
        alert(err.message || 'Failed to remove item')
      } finally {
        loading.value = false
      }
    } else {
      items.value = items.value.filter(i => i.product_id !== productId)
      saveGuestCart()
    }
  }

  const clearCart = async () => {
    if (isLoggedIn.value) {
      try {
        await api.post('/cart/clear')
      } catch {}
    }
    items.value = []
    if (import.meta.client) {
      localStorage.removeItem('snack_guest_cart')
    }
  }

  const openDrawer = () => { isDrawerOpen.value = true }
  const closeDrawer = () => { isDrawerOpen.value = false }
  const toggleDrawer = () => { isDrawerOpen.value = !isDrawerOpen.value }

  return {
    items,
    loading,
    subtotal,
    totalItems,
    shippingFee,
    promoCode,
    promoDiscount,
    tax,
    grandTotal,
    isDrawerOpen,
    fetchCart,
    syncGuestCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    openDrawer,
    closeDrawer,
    toggleDrawer
  }
}
