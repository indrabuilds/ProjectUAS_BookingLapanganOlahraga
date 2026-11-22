// Bentuk user dari API. Password tidak pernah ada di sini.
export type UserRole = 'customer' | 'owner' | 'admin'

export type UserStatus = 'active' | 'suspended'

export type User = {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  created_at: string
}
