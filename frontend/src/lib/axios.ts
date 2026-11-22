import { authKeys } from '@/features/auth/keys'
import { queryClient } from '@/lib/queryClient'
import axios, { type InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Cookie session Sanctum. Token tidak disimpan di localStorage.
export const api = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

type RetryConfig = InternalAxiosRequestConfig & { alreadyRetriedCsrf?: boolean }

let onUnauthorized: (() => void) | null = null

// Dipasang dari dalam router supaya 401 bisa pindah halaman tanpa reload penuh.
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const original = error.config as RetryConfig | undefined
    const status = error.response?.status

    // 419 berarti cookie CSRF basi. Ambil cookie baru, lalu coba sekali lagi.
    if (status === 419 && original && !original.alreadyRetriedCsrf) {
      original.alreadyRetriedCsrf = true
      await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      })
      return api.request(original)
    }

    if (status === 401) {
      queryClient.setQueryData(authKeys.me, null)
      const url = original?.url ?? ''
      const isExpectedGuestCall =
        url.includes('/auth/me') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register')

      if (!isExpectedGuestCall) {
        onUnauthorized?.()
      }
    }

    return Promise.reject(error)
  },
)
