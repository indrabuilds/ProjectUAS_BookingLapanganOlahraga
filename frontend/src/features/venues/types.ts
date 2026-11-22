export type Sport = {
  id: number
  name: string
  slug: string
}

export type VenueStatus =
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'suspended'

export type VenueImage = {
  id: number
  url: string
  sort_order: number
}

export type OperatingHour = {
  day_of_week: number
  is_closed: boolean
  open_hour: number | null
  close_hour: number | null
}

export type Court = {
  id: number
  venue_id: number
  name: string
  description: string | null
  price_per_hour: string
  image_url: string | null
  is_active: boolean
  sport?: Sport | null
}

export type VenueOwner = {
  id: number
  name: string
  email: string
  phone: string | null
}

export type Venue = {
  id: number
  name: string
  slug: string
  description: string
  address: string
  city: string
  province: string
  phone: string
  timezone: VenueTimezone
  facilities: Facility[]
  status: VenueStatus
  status_reason: string | null
  is_active: boolean
  cover_image_url: string | null
  verified_at: string | null
  created_at: string | null
  images?: VenueImage[]
  operating_hours?: OperatingHour[]
  courts?: Court[]
  courts_count?: number
  owner?: VenueOwner
}

export type VenueTimezone = (typeof timezoneOptions)[number]['value']
export type Facility = (typeof facilityOptions)[number]['value']

export type VenueInput = {
  name: string
  description: string
  address: string
  city: string
  province: string
  phone: string
  timezone: VenueTimezone
  facilities: Facility[]
}

export type CourtInput = {
  name: string
  sport_id: number
  description: string
  price_per_hour: number
}

export const facilityOptions = [
  { value: 'parking', label: 'Parkir' },
  { value: 'toilet', label: 'Toilet' },
  { value: 'shower', label: 'Kamar mandi' },
  { value: 'canteen', label: 'Kantin' },
  { value: 'musholla', label: 'Musholla' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'locker', label: 'Loker' },
] as const

export const timezoneOptions = [
  { value: 'Asia/Jakarta', label: 'WIB, Jakarta' },
  { value: 'Asia/Makassar', label: 'WITA, Makassar' },
  { value: 'Asia/Jayapura', label: 'WIT, Jayapura' },
] as const

export const dayNames = [
  '',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]

export function statusLabel(status: VenueStatus): string {
  if (status === 'pending_verification') return 'Menunggu verifikasi'
  if (status === 'approved') return 'Disetujui'
  if (status === 'rejected') return 'Ditolak'
  return 'Ditangguhkan'
}

export function formatIdr(value: string | number): string {
  const amount = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
