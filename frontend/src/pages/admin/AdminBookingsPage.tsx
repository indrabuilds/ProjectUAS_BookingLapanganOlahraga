import { BookingBadge } from '@/components/common/StatusBadge'
import { AppShell } from '@/components/layout/AppShell'
import { listAdminBookings } from '@/features/admin/api'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { statusLabel, type BookingStatus } from '@/features/bookings/api'
import { formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const statuses: Array<BookingStatus | ''> = ['', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired']

export function AdminBookingsPage() {
  usePageTitle('Pantau booking')
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [venueId, setVenueId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const bookings = useQuery({
    queryKey: ['admin-bookings', status, venueId, dateFrom, dateTo, page],
    queryFn: () =>
      listAdminBookings({
        status,
        venue_id: venueId,
        date_from: dateFrom,
        date_to: dateTo,
        page,
      }),
  })

  return (
    <AppShell>
      <Link to="/admin" className="text-sm font-medium text-primary">
        Kembali ke ringkasan
      </Link>
      <h1 className="mt-3 page-title">Pantau booking</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Admin hanya melihat. Konfirmasi dan pembatalan tetap dilakukan pemilik venue atau pelanggan.
      </p>

      <div className="surface-card mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-ink">
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as BookingStatus | '')
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          >
            {statuses.map((item) => (
              <option key={item || 'all'} value={item}>
                {item === '' ? 'Semua' : statusLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ink">
          ID venue
          <input
            value={venueId}
            inputMode="numeric"
            onChange={(event) => {
              setVenueId(event.target.value.replace(/\D/g, ''))
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          />
        </label>
        <label className="text-sm text-ink">
          Dari tanggal
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          />
        </label>
        <label className="text-sm text-ink">
          Sampai tanggal
          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          />
        </label>
      </div>

      {bookings.isPending ? <p className="mt-6 text-sm text-ink-soft">Memuat booking...</p> : null}
      {bookings.isError ? <p className="mt-6 text-sm text-taken">{apiErrorMessage(bookings.error, 'Booking gagal dimuat.')}</p> : null}
      {bookings.data && bookings.data.data.length === 0 ? <p className="mt-6 text-sm text-ink-soft">Tidak ada booking pada filter ini.</p> : null}

      <ul className="mt-6 space-y-3">
        {bookings.data?.data.map((booking) => (
          <li key={booking.id} className="surface-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link to={`/admin/bookings/${booking.id}`} className="font-semibold text-primary hover:underline">{booking.code}</Link>
              <BookingBadge status={booking.status} />
            </div>
            <p className="mt-1 text-sm text-ink">
              {booking.venue.name} · {booking.court.name}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {booking.local.date} {booking.local.start}-{booking.local.end} · {formatIdr(booking.total_price)} · {booking.customer?.name ?? 'Pelanggan'}
            </p>
          </li>
        ))}
      </ul>

      {bookings.data && bookings.data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-50">
            Sebelumnya
          </button>
          <span className="text-ink-soft">
            Halaman {bookings.data.meta.current_page} dari {bookings.data.meta.last_page}
          </span>
          <button type="button" disabled={page >= bookings.data.meta.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-50">
            Berikutnya
          </button>
        </div>
      ) : null}
    </AppShell>
  )
}
