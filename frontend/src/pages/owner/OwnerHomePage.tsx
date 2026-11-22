import { StatReadout } from '@/components/common/StatReadout'
import { AppShell } from '@/components/layout/AppShell'
import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { BookingLines } from '@/features/bookings/BookingLines'
import { getOwnerDashboard } from '@/features/dashboard/api'
import { cn } from '@/lib/cn'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarCheck, MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function OwnerHomePage() {
  usePageTitle('Dashboard pemilik venue')
  const dashboard = useQuery({ queryKey: ['owner-dashboard'], queryFn: getOwnerDashboard })

  return (
    <AppShell>
      <h1 className="page-title">Ringkasan Venue Owner</h1>
      <p className="mt-2 text-ink-soft">Pantau venue, lapangan, dan permintaan booking dari pelanggan.</p>
      {dashboard.isPending ? <p className="mt-4 text-ink-soft" role="status">Memuat ringkasan...</p> : null}
      {dashboard.isError ? <p className="mt-4 text-taken" role="alert">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p> : null}
      {dashboard.data ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatReadout value={dashboard.data.venues_count} label="Total venue saya" />
            <StatReadout value={dashboard.data.courts_count} label="Total lapangan" />
            <StatReadout value={dashboard.data.pending_bookings} label="Booking menunggu" />
            <StatReadout value={dashboard.data.confirmed_upcoming} label="Booking dikonfirmasi" />
          </div>
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="surface-card p-5 sm:p-6">
              <h2 className="section-title">Booking Terbaru</h2>
              <BookingLines bookings={dashboard.data.recent_bookings} showCustomer empty="Belum ada booking di venue Anda." />
            </section>
            <section className="surface-card space-y-3 p-5 sm:p-6">
              <h2 className="section-title">Akses Cepat</h2>
              <Link to="/owner/venues" className={cn(buttonClass, buttonTones.line, 'w-full justify-start')}><MapPin size={17} className="text-primary" aria-hidden="true" /> Venue &amp; Court <ArrowRight size={16} className="ml-auto" aria-hidden="true" /></Link>
              <Link to="/owner/bookings" className={cn(buttonClass, buttonTones.line, 'w-full justify-start')}><CalendarCheck size={17} className="text-primary" aria-hidden="true" /> Pesanan Masuk <ArrowRight size={16} className="ml-auto" aria-hidden="true" /></Link>
              <Link to="/owner/venues/new" className={cn(buttonClass, buttonTones.open, 'w-full')}><Plus size={17} aria-hidden="true" /> Tambah Venue</Link>
            </section>
          </div>
        </>
      ) : null}
    </AppShell>
  )
}
