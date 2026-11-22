import { AppShell } from '@/components/layout/AppShell'
import { useMe } from '@/features/auth/hooks'
import { homePathForRole, roleLabel } from '@/features/auth/paths'
import { usePageTitle } from '@/lib/usePageTitle'
import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  usePageTitle('Tidak berhak')
  const me = useMe()

  return (
    <AppShell>
      <h1 className="page-title">
        Halaman ini bukan untuk akun Anda
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
        {me.data
          ? `Anda masuk sebagai ${roleLabel(me.data.role)}. Area peran lain tetap ditolak server, meskipun tautannya dibuka langsung.`
          : 'Masuk dulu untuk membuka halaman yang sesuai dengan akun Anda.'}
      </p>
      <Link
        to={me.data ? homePathForRole(me.data.role) : '/login'}
        className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-inverse"
      >
        {me.data ? 'Ke area saya' : 'Masuk'}
      </Link>
    </AppShell>
  )
}
