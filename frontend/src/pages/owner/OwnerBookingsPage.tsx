import { BookingBadge } from '@/components/common/StatusBadge'
import { FormBanner } from '@/components/auth/FormBanner'
import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import {
  cancelOwnerBooking,
  confirmOwnerBooking,
  listOwnerBookings,
  rejectOwnerBooking,
  statusLabel,
  type Booking,
  type BookingStatus,
} from '@/features/bookings/api'
import { listMyVenues, getMyVenue } from '@/features/venues/api'
import { formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const statuses: Array<BookingStatus | ''> = ['', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired']

export function OwnerBookingsPage() {
  usePageTitle('Booking masuk')
  const queryClient = useQueryClient()
  const [venueId, setVenueId] = useState<number | ''>('')
  const [courtId, setCourtId] = useState<number | ''>('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [reasonFor, setReasonFor] = useState<{ id: number; action: 'reject' | 'cancel' } | null>(null)
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const venues = useQuery({ queryKey: ['my-venues'], queryFn: listMyVenues })
  const venueDetail = useQuery({
    queryKey: ['my-venue', venueId],
    queryFn: () => getMyVenue(Number(venueId)),
    enabled: venueId !== '',
  })
  const list = useQuery({
    queryKey: ['owner-bookings', venueId, courtId, status, page],
    queryFn: () =>
      listOwnerBookings({
        venue_id: venueId === '' ? undefined : venueId,
        court_id: courtId === '' ? undefined : courtId,
        status: status || undefined,
        page,
      }),
  })

  const refresh = async () => {
    setReasonFor(null)
    setReason('')
    setActionError(null)
    await queryClient.invalidateQueries({ queryKey: ['owner-bookings'] })
  }

  const confirm = useMutation({
    mutationFn: (booking: Booking) => confirmOwnerBooking(booking.id),
    onSuccess: refresh,
    onError: (error) => setActionError(apiErrorMessage(error, 'Booking gagal dikonfirmasi.')),
  })
  const reject = useMutation({
    mutationFn: (booking: Booking) => rejectOwnerBooking(booking.id, reason),
    onSuccess: refresh,
    onError: (error) => setActionError(apiErrorMessage(error, 'Booking gagal ditolak.')),
  })
  const cancel = useMutation({
    mutationFn: (booking: Booking) => cancelOwnerBooking(booking.id, reason),
    onSuccess: refresh,
    onError: (error) => setActionError(apiErrorMessage(error, 'Booking gagal dibatalkan.')),
  })

  return (
    <AppShell>
      <h1 className="page-title">Permintaan Booking Masuk</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Konfirmasi atau tolak pengajuan yang masih menunggu. Pembatalan booking yang sudah dikonfirmasi wajib disertai alasan.
      </p>

      <div className="surface-card mt-6 grid gap-3 p-4 sm:grid-cols-3">
        <label className="text-sm text-ink">
          Venue
          <select
            value={venueId}
            onChange={(event) => {
              setVenueId(event.target.value === '' ? '' : Number(event.target.value))
              setCourtId('')
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          >
            <option value="">Semua venue saya</option>
            {venues.data?.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ink">
          Lapangan
          <select
            value={courtId}
            onChange={(event) => {
              setCourtId(event.target.value === '' ? '' : Number(event.target.value))
              setPage(1)
            }}
            disabled={venueId === ''}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5 disabled:bg-panel"
          >
            <option value="">Semua lapangan</option>
            {venueDetail.data?.courts?.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ink">
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
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
      </div>

      <div className="mt-4">
        <FormBanner message={actionError} />
      </div>

      {list.isPending ? (
        <div className="mt-6 space-y-3" aria-busy="true">
          <p className="sr-only">Memuat booking...</p>
          <div className="h-24 rounded-xl bg-panel" />
          <div className="h-24 rounded-xl bg-panel" />
        </div>
      ) : null}
      {list.isError ? <p className="mt-6 text-sm text-taken">{apiErrorMessage(list.error, 'Booking gagal dimuat.')}</p> : null}
      {list.data && list.data.data.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">Belum ada booking pada filter ini.</p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {list.data?.data.map((booking) => (
          <li key={booking.id} className="surface-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-base font-semibold text-ink">
                {booking.venue.name} · {booking.court.name}
              </p>
              <BookingBadge status={booking.status} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {booking.code} · {booking.local.date} {booking.local.start}–{booking.local.end} · {formatIdr(booking.total_price)}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {booking.customer?.name ?? 'Pelanggan'} · {booking.customer?.phone || 'Telepon belum diisi'}
            </p>
            {booking.notes ? <p className="mt-1 text-sm text-ink-soft">{booking.notes}</p> : null}

            {booking.status === 'pending' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={confirm.isPending}
                  onClick={() => confirm.mutate(booking)}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60"
                >
                  Konfirmasi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReasonFor({ id: booking.id, action: 'reject' })
                    setReason('')
                    setActionError(null)
                  }}
                  className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-panel"
                >
                  Tolak
                </button>
              </div>
            ) : null}

            {booking.status === 'confirmed' && booking.can_cancel ? (
              <button
                type="button"
                onClick={() => {
                  setReasonFor({ id: booking.id, action: 'cancel' })
                  setReason('')
                  setActionError(null)
                }}
                className="mt-3 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-panel"
              >
                Batalkan
              </button>
            ) : null}

            {reasonFor?.id === booking.id ? (
              <form
                className="mt-3 space-y-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (reasonFor.action === 'cancel' && reason.trim() === '') {
                    setActionError('Alasan pembatalan wajib diisi.')
                    return
                  }
                  if (reasonFor.action === 'reject') {
                    reject.mutate(booking)
                    return
                  }
                  cancel.mutate(booking)
                }}
              >
                <label htmlFor={`owner-reason-${booking.id}`} className="block text-sm text-ink">
                  {reasonFor.action === 'cancel' ? 'Alasan batal (wajib)' : 'Alasan tolak (opsional)'}
                  <textarea
                    id={`owner-reason-${booking.id}`}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    maxLength={500}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  disabled={reject.isPending || cancel.isPending}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60"
                >
                  {reasonFor.action === 'cancel' ? 'Simpan pembatalan' : 'Simpan penolakan'}
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      {list.data && list.data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-line px-3 py-2 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-ink-soft">
            Halaman {list.data.meta.current_page} dari {list.data.meta.last_page}
          </span>
          <button
            type="button"
            disabled={page >= list.data.meta.last_page}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-line px-3 py-2 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      ) : null}
    </AppShell>
  )
}
