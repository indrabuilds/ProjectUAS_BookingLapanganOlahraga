import type { UserRole } from '@/types/user'

// Tujuan setelah login. Halaman role sudah berisi ringkasan dari database.
export function homePathForRole(role: UserRole): string {
  if (role === 'owner') {
    return '/owner'
  }

  if (role === 'admin') {
    return '/admin'
  }

  return '/customer'
}

export function roleLabel(role: UserRole): string {
  if (role === 'owner') {
    return 'Pemilik venue'
  }

  if (role === 'admin') {
    return 'Admin'
  }

  return 'Pelanggan'
}

export function statusLabel(status: 'active' | 'suspended'): string {
  return status === 'active' ? 'Aktif' : 'Ditangguhkan'
}
