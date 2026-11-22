import { StatReadout } from '@/components/common/StatReadout'
import { AppShell } from '@/components/layout/AppShell'
import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { statusLabel, type BookingStatus } from '@/features/bookings/api'
import { getAdminDashboard } from '@/features/dashboard/api'
import { cn } from '@/lib/cn'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const bookingStatuses: BookingStatus[] = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired']

export function AdminHomePage() {
  usePageTitle('Dashboard admin')
  const { data, error, isPending, isError } = useQuery({ queryKey: ['admin-dashboard'], queryFn: getAdminDashboard })

  return (
    <AppShell>
      <h1 className="page-title">Dashboard Admin Platform</h1>
      <p className="mt-2 text-ink-soft">Pantau aktivitas booking, status venue, dan pengguna SportsCourt.</p>
      {isPending ? <p className="mt-4 text-ink-soft" role="status">Memuat ringkasan...</p> : null}
      {isError ? <p className="mt-4 text-taken" role="alert">{apiErrorMessage(error, 'Ringkasan gagal dimuat.')}</p> : null}
      {data ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            <StatReadout value={data.users_count} label="Total pengguna" />
            <StatReadout value={data.owners_count} label="Pemilik venue" />
            <StatReadout value={data.venues_by_status.approved ?? 0} label="Venue disetujui" />
            <StatReadout value={data.courts_count} label="Total lapangan" />
            <StatReadout value={data.venues_by_status.pending_verification ?? 0} label="Menunggu verifikasi" />
          </div>
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[7fr_5fr]">
            <section className="surface-card p-5 sm:p-6">
              <h2 className="section-title">Perlu Tindak Lanjut</h2>
              {data.pending_venues.length === 0 ? (
                <p className="mt-4 text-ink-soft">Tidak ada venue yang menunggu.</p>
              ) : (
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {data.pending_venues.map((venue) => (
                    <li key={venue.id}>
                      <Link to={`/admin/venues/${venue.id}`} className="flex items-center justify-between gap-3 py-3 text-primary hover:underline">
                        <span>
                          <span className="block font-semibold">{venue.name}</span>
                          <span className="mt-1 block text-xs text-ink-soft">{venue.city} · {venue.owner_name ?? 'Pemilik tidak diketahui'}</span>
                        </span>
                        <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/venues" className={cn(buttonClass, buttonTones.open, 'mt-4')}>Verifikasi Venue</Link>
            </section>
            <section className="surface-card p-5 sm:p-6">
              <h2 className="section-title">Ringkasan Status Booking</h2>
              <dl className="mt-3 divide-y divide-line">
                {bookingStatuses.map((status) => (
                  <div key={status} className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-ink-soft">{statusLabel(status)}</dt>
                    <dd className="font-semibold text-primary tabular-nums">{data.bookings_by_status[status] ?? 0}</dd>
                  </div>
                ))}
              </dl>
              <Link to="/admin/bookings" className={cn(buttonClass, buttonTones.line, 'mt-4')}>Pantau Booking</Link>
            </section>
          </div>
        </>
      ) : null}
    </AppShell>
  )
}
