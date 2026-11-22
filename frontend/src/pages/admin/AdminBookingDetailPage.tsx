import { AppShell } from '@/components/layout/AppShell'
import { getAdminBooking } from '@/features/admin/api'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { statusLabel } from '@/features/bookings/api'
import { formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

export function AdminBookingDetailPage() {
  const params = useParams()
  const bookingId = Number(params.bookingId)
  usePageTitle('Detail booking')
  const booking = useQuery({
    queryKey: ['admin-booking', bookingId],
    queryFn: () => getAdminBooking(bookingId),
    enabled: Number.isFinite(bookingId),
  })

  return (
    <AppShell>
      <Link to="/admin/bookings" className="text-sm font-medium text-primary">
        Kembali ke pantauan
      </Link>
      {booking.isPending ? <p className="mt-4 text-sm text-ink-soft">Memuat booking...</p> : null}
      {booking.isError ? <p className="mt-4 text-sm text-taken">{apiErrorMessage(booking.error, 'Booking tidak ditemukan.')}</p> : null}
      {booking.data ? (
        <>
          <h1 className="mt-3 page-title">{booking.data.code}</h1>
          <p className="mt-2 text-sm text-ink">
            {statusLabel(booking.data.status)} · {booking.data.venue.name} · {booking.data.court.name}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {booking.data.local.date} {booking.data.local.start}-{booking.data.local.end} ({booking.data.local.timezone}) · {formatIdr(booking.data.total_price)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {booking.data.customer?.name ?? 'Pelanggan'} · {booking.data.customer?.phone || 'Telepon belum diisi'}
          </p>
          {booking.data.notes ? <p className="mt-3 text-sm text-ink-soft">{booking.data.notes}</p> : null}

          <h2 className="mt-8 text-lg font-semibold text-ink">Riwayat status</h2>
          {booking.data.histories && booking.data.histories.length > 0 ? (
            <ol className="mt-2 space-y-3 text-sm text-ink">
              {booking.data.histories.map((item, index) => (
                <li key={`${item.created_at}-${index}`}>
                  {item.from_status ? `${statusLabel(item.from_status)} menjadi ` : 'Mulai sebagai '}
                  {statusLabel(item.to_status)}. {item.changed_by ? `Oleh ${item.changed_by.name}.` : 'Oleh sistem.'}
                  {item.reason ? ` Alasan: ${item.reason}` : ''}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Belum ada catatan perubahan status.</p>
          )}
        </>
      ) : null}
    </AppShell>
  )
}
