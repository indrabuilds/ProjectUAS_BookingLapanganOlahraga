import { ensureCsrfCookie } from '@/features/auth/api'
import { api } from '@/lib/axios'

export type PublicSport = { id: number; name: string; slug: string }

export type VenueCard = {
  id: number
  slug: string
  name: string
  city: string
  province: string
  cover_image_url: string | null
  sports: PublicSport[]
  starting_price: string | null
}

export type PublicCourt = {
  id: number
  name: string
  price_per_hour: string
  image_url: string | null
  sport?: PublicSport | null
}

export type PublicHour = {
  day_of_week: number
  is_closed: boolean
  open_hour: number | null
  close_hour: number | null
}

export type PublicVenue = VenueCard & {
  description: string
  address: string
  phone: string
  timezone: string
  facilities: string[]
  images?: { id: number; url: string; sort_order: number }[]
  operating_hours?: PublicHour[]
  courts?: PublicCourt[]
}

export type SlotStatus = 'available' | 'booked' | 'blocked' | 'past'

export type AvailabilitySlot = {
  start_hour: number
  label: string
  start_at: string
  status: SlotStatus
}

export type Availability = {
  court_id: number
  date: string
  timezone: string
  is_closed: boolean
  price_per_hour: string
  slots: AvailabilitySlot[]
}

export type CourtBlock = {
  id: number
  date: string
  start_hour: number
  end_hour: number
  reason: string
}

type Page<T> = {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}

export type ExploreFilters = {
  q?: string
  city?: string
  sport?: string
  min_price?: string
  max_price?: string
  sort?: string
  page?: number
}

export async function exploreVenues(filters: ExploreFilters): Promise<Page<VenueCard>> {
  const { data } = await api.get<Page<VenueCard>>('/api/v1/venues', { params: filters })
  return data
}

export async function getPublicVenue(id: number): Promise<PublicVenue> {
  const { data } = await api.get<{ data: PublicVenue }>(`/api/v1/venues/${id}`)
  return data.data
}

export async function getAvailability(courtId: number, date: string): Promise<Availability> {
  const { data } = await api.get<{ data: Availability }>(`/api/v1/courts/${courtId}/availability`, {
    params: { date },
  })
  return data.data
}

export async function saveOperatingHours(
  venueId: number,
  days: PublicHour[],
): Promise<PublicHour[]> {
  await ensureCsrfCookie()
  const { data } = await api.put<{ data: PublicHour[] }>(
    `/api/v1/owner/venues/${venueId}/operating-hours`,
    { days },
  )
  return data.data
}

export async function listBlocks(courtId: number): Promise<CourtBlock[]> {
  const { data } = await api.get<{ data: CourtBlock[] }>(`/api/v1/owner/courts/${courtId}/blocks`)
  return data.data
}

export async function createBlock(
  courtId: number,
  input: { date: string; start_hour: number; end_hour: number; reason: string },
): Promise<CourtBlock> {
  await ensureCsrfCookie()
  const { data } = await api.post<{ data: CourtBlock }>(
    `/api/v1/owner/courts/${courtId}/blocks`,
    input,
  )
  return data.data
}

export async function deleteBlock(blockId: number): Promise<void> {
  await ensureCsrfCookie()
  await api.delete(`/api/v1/owner/blocks/${blockId}`)
}
