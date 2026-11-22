import { ensureCsrfCookie } from '@/features/auth/api'
import type { Court, CourtInput, Sport, Venue, VenueImage, VenueInput } from '@/features/venues/types'
import { api } from '@/lib/axios'

type Data<T> = { data: T }

export async function listSports(): Promise<Sport[]> {
  const { data } = await api.get<Data<Sport[]>>('/api/v1/sports')
  return data.data
}

export async function listMyVenues(): Promise<Venue[]> {
  const { data } = await api.get<Data<Venue[]>>('/api/v1/owner/venues')
  return data.data
}

export async function getMyVenue(id: number): Promise<Venue> {
  const { data } = await api.get<Data<Venue>>(`/api/v1/owner/venues/${id}`)
  return data.data
}

export async function createVenue(input: VenueInput): Promise<Venue> {
  await ensureCsrfCookie()
  const { data } = await api.post<Data<Venue>>('/api/v1/owner/venues', input)
  return data.data
}

export async function updateVenue(id: number, input: VenueInput): Promise<Venue> {
  await ensureCsrfCookie()
  const { data } = await api.put<Data<Venue>>(`/api/v1/owner/venues/${id}`, input)
  return data.data
}

export async function toggleVenueActive(id: number): Promise<Venue> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Venue>>(`/api/v1/owner/venues/${id}/toggle-active`)
  return data.data
}

export async function deleteVenue(id: number): Promise<void> {
  await ensureCsrfCookie()
  await api.delete(`/api/v1/owner/venues/${id}`)
}

export async function uploadVenueImage(venueId: number, file: File): Promise<VenueImage> {
  await ensureCsrfCookie()
  const body = new FormData()
  body.append('image', file)
  const { data } = await api.post<Data<VenueImage>>(`/api/v1/owner/venues/${venueId}/images`, body)
  return data.data
}

export async function deleteVenueImage(venueId: number, imageId: number): Promise<void> {
  await ensureCsrfCookie()
  await api.delete(`/api/v1/owner/venues/${venueId}/images/${imageId}`)
}

export async function createCourt(venueId: number, input: CourtInput): Promise<Court> {
  await ensureCsrfCookie()
  const { data } = await api.post<Data<Court>>(`/api/v1/owner/venues/${venueId}/courts`, input)
  return data.data
}

export async function updateCourt(courtId: number, input: CourtInput): Promise<Court> {
  await ensureCsrfCookie()
  const { data } = await api.put<Data<Court>>(`/api/v1/owner/courts/${courtId}`, input)
  return data.data
}

export async function toggleCourtActive(courtId: number): Promise<Court> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Court>>(`/api/v1/owner/courts/${courtId}/toggle-active`)
  return data.data
}

export async function uploadCourtImage(courtId: number, file: File): Promise<Court> {
  await ensureCsrfCookie()
  const body = new FormData()
  body.append('image', file)
  const { data } = await api.post<Data<Court>>(`/api/v1/owner/courts/${courtId}/image`, body)
  return data.data
}

export async function deleteCourt(courtId: number): Promise<void> {
  await ensureCsrfCookie()
  await api.delete(`/api/v1/owner/courts/${courtId}`)
}
