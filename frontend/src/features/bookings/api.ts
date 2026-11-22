import { ensureCsrfCookie } from '@/features/auth/api'
import { api } from '@/lib/axios'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'expired'

export type Booking = {
  id: number
  code: string
  status: BookingStatus
  start_at: string
  end_at: string
  local: { date: string; start: string; end: string; timezone: string }
  duration_hours: number
  price_per_hour: string
  total_price: string
  expires_at: string | null
  notes: string | null
  court: { id: number; name: string; sport: string | null }
  venue: { id: number; name: string; slug: string }
  can_cancel: boolean
  customer?: { name: string | null; phone: string | null }
  created_at: string | null
  histories?: Array<{
    from_status: BookingStatus | null
    to_status: BookingStatus
    reason: string | null
    changed_by: { name: string } | null
    created_at: string | null
  }>
}

export type BookingPage = {
  data: Booking[]
  meta: { current_page: number; last_page: number; total: number }
}

type Data<T> = { data: T }

export type MyBookingFilters = {
  status?: string
  period?: string
  page?: number
}

export type OwnerBookingFilters = {
  venue_id?: number
  court_id?: number
  status?: string
  date_from?: string
  date_to?: string
  page?: number
}

export function bookingNewPath(venueId: number, courtId: number, date: string, hour: number): string {
  const params = new URLSearchParams({
    venue: String(venueId),
    court: String(courtId),
    date,
    hour: String(hour),
  })

  return `/bookings/new?${params.toString()}`
}

export async function createBooking(input: {
  court_id: number
  date: string
  start_hour: number
  duration_hours: number
  notes: string | null
}): Promise<Booking> {
  await ensureCsrfCookie()
  const { data } = await api.post<Data<Booking>>('/api/v1/bookings', input)
  return data.data
}

export async function listMyBookings(filters: MyBookingFilters): Promise<BookingPage> {
  const { data } = await api.get<BookingPage>('/api/v1/bookings/my', { params: filters })
  return data
}

export async function cancelMyBooking(id: number, reason: string): Promise<Booking> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Booking>>(`/api/v1/bookings/${id}/cancel`, {
    reason: reason.trim() === '' ? null : reason.trim(),
  })
  return data.data
}

export async function listOwnerBookings(filters: OwnerBookingFilters): Promise<BookingPage> {
  const { data } = await api.get<BookingPage>('/api/v1/owner/bookings', { params: filters })
  return data
}

export async function confirmOwnerBooking(id: number): Promise<Booking> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Booking>>(`/api/v1/owner/bookings/${id}/confirm`)
  return data.data
}

export async function rejectOwnerBooking(id: number, reason: string): Promise<Booking> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Booking>>(`/api/v1/owner/bookings/${id}/reject`, {
    reason: reason.trim() === '' ? null : reason.trim(),
  })
  return data.data
}

export async function cancelOwnerBooking(id: number, reason: string): Promise<Booking> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Booking>>(`/api/v1/owner/bookings/${id}/cancel`, {
    reason: reason.trim(),
  })
  return data.data
}

export function statusLabel(status: BookingStatus): string {
  if (status === 'pending') return 'Menunggu konfirmasi'
  if (status === 'confirmed') return 'Dikonfirmasi'
  if (status === 'rejected') return 'Ditolak'
  if (status === 'cancelled') return 'Dibatalkan'
  if (status === 'completed') return 'Selesai'
  return 'Kedaluwarsa'
}
