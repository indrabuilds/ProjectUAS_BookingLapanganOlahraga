import { api } from '@/lib/axios'
import type { Booking, BookingStatus } from '@/features/bookings/api'

type Data<T> = { data: T }

export type CustomerDashboard = {
  upcoming_count: number
  pending_count: number
  upcoming: Booking[]
  recent: Booking[]
}

export type OwnerDashboard = {
  venues_count: number
  courts_count: number
  pending_bookings: number
  confirmed_upcoming: number
  recent_bookings: Booking[]
}

export type AdminDashboard = {
  users_count: number
  owners_count: number
  venues_by_status: Record<string, number>
  courts_count: number
  bookings_by_status: Record<BookingStatus, number>
  pending_venues: Array<{
    id: number
    name: string
    city: string
    owner_name: string | null
    created_at: string | null
  }>
}

export async function getCustomerDashboard(): Promise<CustomerDashboard> {
  const { data } = await api.get<Data<CustomerDashboard>>('/api/v1/customer/dashboard')
  return data.data
}

export async function getOwnerDashboard(): Promise<OwnerDashboard> {
  const { data } = await api.get<Data<OwnerDashboard>>('/api/v1/owner/dashboard')
  return data.data
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await api.get<Data<AdminDashboard>>('/api/v1/admin/dashboard')
  return data.data
}
