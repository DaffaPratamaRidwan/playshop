export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:4000/api'

  const getToken = () => {
    if (import.meta.client) {
      return localStorage.getItem('snack_token') || ''
    }
    return ''
  }

  const request = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const token = getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`

    const res = await fetch(url, {
      ...options,
      headers
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`)
    }

    return data as T
  }

  return {
    apiBase,
    request,
    get: <T = any>(endpoint: string, options: any = {}) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T = any>(endpoint: string, body?: any, options: any = {}) => request<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T = any>(endpoint: string, body?: any, options: any = {}) => request<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    patch: <T = any>(endpoint: string, body?: any, options: any = {}) => request<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T = any>(endpoint: string, options: any = {}) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  }
}
