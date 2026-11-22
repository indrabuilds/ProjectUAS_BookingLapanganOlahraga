import { facilityOptions, timezoneOptions } from '@/features/venues/types'
import { z } from 'zod'

const facilityValues = facilityOptions.map((item) => item.value) as [
  (typeof facilityOptions)[number]['value'],
  ...(typeof facilityOptions)[number]['value'][],
]

const timezoneValues = timezoneOptions.map((item) => item.value) as [
  (typeof timezoneOptions)[number]['value'],
  ...(typeof timezoneOptions)[number]['value'][],
]

export const venueSchema = z.object({
  name: z.string().trim().min(1, 'Nama venue wajib diisi.').max(150, 'Nama maksimal 150 karakter.'),
  description: z.string().trim().min(1, 'Deskripsi wajib diisi.').max(5000, 'Deskripsi maksimal 5000 karakter.'),
  address: z.string().trim().min(1, 'Alamat wajib diisi.').max(255, 'Alamat maksimal 255 karakter.'),
  city: z.string().trim().min(1, 'Kota wajib diisi.').max(100, 'Kota maksimal 100 karakter.'),
  province: z.string().trim().min(1, 'Provinsi wajib diisi.').max(100, 'Provinsi maksimal 100 karakter.'),
  phone: z.string().trim().regex(/^(?:\+62|0)[0-9]{8,15}$/, 'Gunakan nomor Indonesia, misalnya 081234567890.'),
  timezone: z.enum(timezoneValues, { error: 'Pilih zona waktu.' }),
  facilities: z.array(z.enum(facilityValues)),
})

export const courtSchema = z.object({
  name: z.string().trim().min(1, 'Nama lapangan wajib diisi.').max(100, 'Nama maksimal 100 karakter.'),
  sport_id: z.number({ error: 'Pilih olahraga.' }).int().positive('Pilih olahraga.'),
  description: z.string().trim().max(2000, 'Deskripsi maksimal 2000 karakter.'),
  price_per_hour: z
    .number({ error: 'Harga wajib diisi.' })
    .gt(0, 'Harga harus lebih dari 0.')
    .lte(99999999.99, 'Harga terlalu besar.'),
})

export type VenueFormValues = z.infer<typeof venueSchema>
export type CourtFormValues = z.infer<typeof courtSchema>
