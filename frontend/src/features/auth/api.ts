import { api } from '@/lib/axios'
import type { User } from '@/types/user'
import axios from 'axios'

type UserResponse = {
  data: User
}

export type LoginInput = {
  email: string
  password: string
  remember?: boolean
}

export type RegisterInput = LoginInput & {
  name: string
  password_confirmation: string
  account_type: 'customer' | 'owner'
}

export type ProfileInput = {
  name: string
  phone: string
}

export type PasswordInput = {
  current_password: string
  password: string
  password_confirmation: string
}

// Dipanggil sebelum POST/PUT supaya Laravel menerima X-XSRF-TOKEN.
export async function ensureCsrfCookie(): Promise<void> {
  await api.get('/sanctum/csrf-cookie')
}

export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<UserResponse>('/api/v1/auth/me')
    return data.data
  } catch (error) {
    if (axios.isAxiosError<ErrorBody>(error) && (error.response?.status === 401 || error.response?.data?.code === 'ACCOUNT_SUSPENDED')) {
      return null
    }

    throw error
  }
}

export async function login(input: LoginInput): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await api.post<UserResponse>('/api/v1/auth/login', {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    remember: input.remember ?? false,
  })
  return data.data
}

export async function register(input: RegisterInput): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await api.post<UserResponse>('/api/v1/auth/register', {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    password_confirmation: input.password_confirmation,
    account_type: input.account_type,
  })
  return data.data
}

export async function logout(): Promise<void> {
  await ensureCsrfCookie()
  await api.post('/api/v1/auth/logout')
}

export async function updateProfile(input: ProfileInput): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await api.put<UserResponse>('/api/v1/auth/profile', {
    name: input.name.trim(),
    phone: input.phone.trim() === '' ? null : input.phone.trim(),
  })
  return data.data
}

export async function updatePassword(input: PasswordInput): Promise<void> {
  await ensureCsrfCookie()
  await api.put('/api/v1/auth/password', input)
}

type ErrorBody = {
  message?: string
  errors?: Record<string, string[]>
  code?: string
}

export function apiErrorBody(error: unknown): ErrorBody | null {
  if (!axios.isAxiosError(error)) {
    return null
  }

  return (error.response?.data as ErrorBody | undefined) ?? null
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const body = apiErrorBody(error)
  const fieldMessage = body?.errors
    ? Object.values(body.errors).find((items) => items[0])?.[0]
    : undefined

  return fieldMessage || body?.message || fallback
}
