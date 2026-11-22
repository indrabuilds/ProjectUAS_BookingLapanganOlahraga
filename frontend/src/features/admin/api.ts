import { ensureCsrfCookie } from '@/features/auth/api'
import type { Booking, BookingStatus } from '@/features/bookings/api'
import type { User, UserRole, UserStatus } from '@/types/user'
import type { Venue, VenueStatus } from '@/features/venues/types'
import { api } from '@/lib/axios'

type Data<T> = { data: T }

export type AdminVenueFilters = {
  q?: string
  city?: string
  status?: VenueStatus | ''
  page?: number
}

export type AdminVenuePage = {
  data: Venue[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

export async function listAdminVenues(filters: AdminVenueFilters): Promise<AdminVenuePage> {
  const { data } = await api.get<AdminVenuePage>('/api/v1/admin/venues', {
    params: {
      q: filters.q || undefined,
      city: filters.city || undefined,
      status: filters.status || undefined,
      page: filters.page || undefined,
      per_page: 12,
    },
  })
  return data
}

export async function getAdminVenue(id: number): Promise<Venue> {
  const { data } = await api.get<Data<Venue>>(`/api/v1/admin/venues/${id}`)
  return data.data
}

async function patchVenue(id: number, action: string, body?: { reason: string }): Promise<Venue> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Venue>>(`/api/v1/admin/venues/${id}/${action}`, body)
  return data.data
}

export function approveVenue(id: number): Promise<Venue> {
  return patchVenue(id, 'approve')
}

export function rejectVenue(id: number, reason: string): Promise<Venue> {
  return patchVenue(id, 'reject', { reason })
}

export function suspendVenue(id: number, reason: string): Promise<Venue> {
  return patchVenue(id, 'suspend', { reason })
}

export function reactivateVenue(id: number): Promise<Venue> {
  return patchVenue(id, 'reactivate')
}

export type AdminUserFilters = {
  role?: UserRole | ''
  status?: UserStatus | ''
  q?: string
  page?: number
}

export type AdminUserPage = {
  data: User[]
  meta: { current_page: number; last_page: number; total: number }
}

export async function listAdminUsers(filters: AdminUserFilters): Promise<AdminUserPage> {
  const { data } = await api.get<AdminUserPage>('/api/v1/admin/users', {
    params: {
      role: filters.role || undefined,
      status: filters.status || undefined,
      q: filters.q || undefined,
      page: filters.page || undefined,
    },
  })
  return data
}

export async function suspendUser(id: number): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<User>>(`/api/v1/admin/users/${id}/suspend`)
  return data.data
}

export async function activateUser(id: number): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<User>>(`/api/v1/admin/users/${id}/activate`)
  return data.data
}

export type AdminSport = {
  id: number
  name: string
  slug: string
  is_active: boolean
}

export async function listAdminSports(): Promise<AdminSport[]> {
  const { data } = await api.get<Data<AdminSport[]>>('/api/v1/admin/sports')
  return data.data
}

export async function createSport(name: string): Promise<AdminSport> {
  await ensureCsrfCookie()
  const { data } = await api.post<Data<AdminSport>>('/api/v1/admin/sports', { name })
  return data.data
}

export async function updateSport(id: number, name: string): Promise<AdminSport> {
  await ensureCsrfCookie()
  const { data } = await api.put<Data<AdminSport>>(`/api/v1/admin/sports/${id}`, { name })
  return data.data
}

export async function toggleSport(id: number): Promise<AdminSport> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<AdminSport>>(`/api/v1/admin/sports/${id}/toggle-active`)
  return data.data
}

export type AdminBookingFilters = {
  status?: BookingStatus | ''
  venue_id?: string
  date_from?: string
  date_to?: string
  page?: number
}

export type AdminBookingPage = {
  data: Booking[]
  meta: { current_page: number; last_page: number; total: number }
}

export async function listAdminBookings(filters: AdminBookingFilters): Promise<AdminBookingPage> {
  const { data } = await api.get<AdminBookingPage>('/api/v1/admin/bookings', {
    params: {
      status: filters.status || undefined,
      venue_id: filters.venue_id || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      page: filters.page || undefined,
    },
  })
  return data
}

export async function getAdminBooking(id: number): Promise<Booking> {
  const { data } = await api.get<Data<Booking>>(`/api/v1/admin/bookings/${id}`)
  return data.data
}
