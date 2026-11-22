import { StatReadout } from '@/components/common/StatReadout'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/badge'
import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { useMe } from '@/features/auth/hooks'
import { BookingLines } from '@/features/bookings/BookingLines'
import { getCustomerDashboard } from '@/features/dashboard/api'
import { cn } from '@/lib/cn'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CustomerHomePage() {
  usePageTitle('Profil')
  const { data: user } = useMe()
  const dashboard = useQuery({ queryKey: ['customer-dashboard'], queryFn: getCustomerDashboard })
  const initials = user?.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()

  return (
    <AppShell compact>
      {user ? (
        <header className="surface-card flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-xl font-semibold text-primary sm:size-16">{initials}</span>
          <div className="min-w-0 flex-1">
            <h1 className="page-title wrap-break-word">{user.name}</h1>
            <p className="mt-1 break-all text-ink-soft">{user.email}</p>
            <div className="mt-2"><Badge tone="open">Pelanggan</Badge></div>
          </div>
          <Link to="/account" className={cn(buttonClass, buttonTones.line)}><Settings size={16} aria-hidden="true" /> Pengaturan</Link>
        </header>
      ) : <h1 className="page-title">Profil</h1>}
      {dashboard.isPending ? <p className="mt-4 text-ink-soft" role="status">Memuat ringkasan...</p> : null}
      {dashboard.isError ? <p className="mt-4 text-taken" role="alert">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p> : null}
      {dashboard.data ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatReadout value={dashboard.data.upcoming_count} label="Booking akan datang" />
            <StatReadout value={dashboard.data.pending_count} label="Menunggu konfirmasi" />
          </div>
          <section className="surface-card mt-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="section-title">Jadwal Mendatang</h2>
              <Link to="/explore" className={cn(buttonClass, buttonTones.line)}>Cari Lapangan</Link>
            </div>
            <BookingLines bookings={dashboard.data.upcoming} empty="Belum ada jadwal yang masih berjalan." />
          </section>
          <section className="surface-card mt-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="section-title">Riwayat Booking Terakhir</h2>
              <Link to="/customer/bookings" className={cn(buttonClass, buttonTones.line)}>Lihat Semua</Link>
            </div>
            <BookingLines bookings={dashboard.data.recent} empty="Belum ada booking." />
          </section>
        </>
      ) : null}
    </AppShell>
  )
}
