export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null)
  const token = useState<string | null>('auth_token', () => null)
  const isInitialized = useState<boolean>('auth_initialized', () => false)

  const api = useApi()

  // Initialize from localStorage on client
  const initAuth = () => {
    if (import.meta.client && !isInitialized.value) {
      const storedToken = localStorage.getItem('snack_token')
      const storedUser = localStorage.getItem('snack_user')

      if (storedToken && storedUser) {
        try {
          token.value = storedToken
          user.value = JSON.parse(storedUser)
        } catch (e) {
          localStorage.removeItem('snack_token')
          localStorage.removeItem('snack_user')
        }
      }
      isInitialized.value = true
    }
  }

  const setAuth = (newUser: User, newToken: string) => {
    user.value = newUser
    token.value = newToken
    if (import.meta.client) {
      localStorage.setItem('snack_token', newToken)
      localStorage.setItem('snack_user', JSON.stringify(newUser))
    }
  }

  const login = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password })
    setAuth(data.user, data.token)
    return data.user
  }

  const register = async (name: string, email: string, password: string) => {
    const data = await api.post('/auth/register', { name, email, password })
    setAuth(data.user, data.token)
    return data.user
  }

  const registerAdmin = async (name: string, email: string, password: string, adminSecret: string, department?: string) => {
    const data = await api.post('/auth/register-admin', {
      name,
      email,
      password,
      admin_secret: adminSecret,
      department
    })
    setAuth(data.user, data.token)
    return data.user
  }

  const logout = () => {
    user.value = null
    token.value = null
    if (import.meta.client) {
      localStorage.removeItem('snack_token')
      localStorage.removeItem('snack_user')
    }
    // Navigate home
    navigateTo('/')
  }

  const fetchMe = async () => {
    if (!token.value) return null
    try {
      const data = await api.get('/auth/me')
      user.value = data.user
      if (import.meta.client) {
        localStorage.setItem('snack_user', JSON.stringify(data.user))
      }
      return data.user
    } catch {
      logout()
      return null
    }
  }

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    initAuth,
    login,
    register,
    registerAdmin,
    logout,
    fetchMe
  }
}
