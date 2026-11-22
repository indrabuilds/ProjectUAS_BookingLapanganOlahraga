import { z } from 'zod'

// Sama dengan aturan backend: minimal 8 karakter, ada huruf dan angka.
export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter.')
  .max(72, 'Password maksimal 72 karakter.')
  .regex(/\p{L}/u, 'Password harus mengandung huruf.')
  .regex(/\p{N}/u, 'Password harus mengandung angka.')

export const loginSchema = z.object({
  email: z.email('Masukkan email yang valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
  remember: z.boolean(),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100, 'Nama maksimal 100 karakter.'),
    email: z.email('Masukkan email yang valid.'),
    password: passwordSchema,
    password_confirmation: z.string().min(1, 'Ulangi password.'),
    account_type: z.enum(['customer', 'owner'], {
      error: 'Pilih pelanggan atau pemilik venue.',
    }),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    error: 'Konfirmasi password tidak cocok.',
  })

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100, 'Nama maksimal 100 karakter.'),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^(?:\+62|0)8[0-9]{7,12}$/.test(value.replace(/[\s-]+/g, '')),
      'Gunakan nomor Indonesia, misalnya 081234567890.',
    ),
})

export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Password saat ini wajib diisi.'),
    password: passwordSchema,
    password_confirmation: z.string().min(1, 'Ulangi password baru.'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    error: 'Konfirmasi password tidak cocok.',
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>
