import { LoadErrorScreen, LoadingScreen } from '@/components/layout/ScreenState'
import { useMe } from '@/features/auth/hooks'
import { homePathForRole } from '@/features/auth/paths'
import type { UserRole } from '@/types/user'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

// Guard ini hanya untuk tampilan. API tetap menolak request yang tidak berhak.
export function RequireAuth({ children }: { children: ReactNode }) {
  const me = useMe()
  const location = useLocation()

  if (me.isPending) {
    return <LoadingScreen />
  }

  if (me.isError) {
    return <LoadErrorScreen onRetry={() => void me.refetch()} />
  }

  if (!me.data) {
    const from = location.pathname.startsWith('/bookings/')
      ? `${location.pathname}${location.search}`
      : location.pathname

    return <Navigate to="/login" replace state={{ from }} />
  }

  return children
}

export function RequireRole({
  role,
  children,
}: {
  role: UserRole
  children: ReactNode
}) {
  const me = useMe()

  if (!me.data) {
    return <Navigate to="/login" replace />
  }

  if (me.data.role !== role) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const me = useMe()

  if (me.isPending) {
    return <LoadingScreen />
  }

  if (me.isError) {
    return <LoadErrorScreen onRetry={() => void me.refetch()} />
  }

  if (me.data) {
    return <Navigate to={homePathForRole(me.data.role)} replace />
  }

  return children
}
