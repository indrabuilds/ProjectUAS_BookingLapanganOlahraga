import { BookingBadge } from '@/components/common/StatusBadge'
import type { Booking } from '@/features/bookings/api'
import { formatIdr } from '@/features/venues/types'

// Daftar pendek di dashboard. Halaman lengkap tetap terpisah.
export function BookingLines({
  bookings,
  showCustomer = false,
  empty,
}: {
  bookings: Booking[]
  showCustomer?: boolean
  empty: string
}) {
  if (bookings.length === 0) {
    return <p className="mt-2 text-sm text-ink-soft">{empty}</p>
  }

  return (
    <ul className="mt-2 divide-y divide-line border-y border-line">
      {bookings.map((booking) => (
        <li key={booking.id} className="py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-ink">
              {booking.venue.name} · {booking.court.name}
            </p>
              <BookingBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {booking.code} · {booking.local.date} {booking.local.start}-{booking.local.end} · {formatIdr(booking.total_price)}
          </p>
          {showCustomer ? (
            <p className="mt-1 text-sm text-ink-soft">
              {booking.customer?.name ?? 'Pelanggan'} · {booking.customer?.phone || 'Telepon belum diisi'}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
