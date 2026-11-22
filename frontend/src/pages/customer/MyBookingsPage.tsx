import { StatReadout } from '@/components/common/StatReadout'
import { BookingBadge } from '@/components/common/StatusBadge'
import { FormBanner } from '@/components/auth/FormBanner'
import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import {
  cancelMyBooking,
  listMyBookings,
  statusLabel,
  type Booking,
  type BookingStatus,
} from '@/features/bookings/api'
import { getCustomerDashboard } from '@/features/dashboard/api'
import { formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const statuses: Array<BookingStatus | ''> = ['', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired']

export function MyBookingsPage() {
  usePageTitle('Booking saya')
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [period, setPeriod] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const list = useQuery({
    queryKey: ['my-bookings', status, period, page],
    queryFn: () =>
      listMyBookings({
        status: status || undefined,
        period: period || undefined,
        page,
      }),
  })
  const dashboard = useQuery({ queryKey: ['customer-dashboard'], queryFn: getCustomerDashboard })
  const cancel = useMutation({
    mutationFn: (booking: Booking) => cancelMyBooking(booking.id, reason),
    onSuccess: async () => {
      setOpenId(null)
      setReason('')
      setActionError(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['customer-dashboard'] }),
      ])
    },
    onError: (error) => {
      setActionError(apiErrorMessage(error, 'Booking gagal dibatalkan.'))
    },
  })

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Daftar Booking Saya</h1>
        <Link to="/explore" className="rounded-md bg-primary px-4 py-2.5 font-semibold text-on-primary hover:bg-inverse">Cari Lapangan</Link>
      </div>
      {dashboard.data ? (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <StatReadout value={dashboard.data.upcoming_count} label="Akan datang" />
          <StatReadout value={dashboard.data.pending_count} label="Menunggu konfirmasi" />
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div role="group" aria-label="Status booking" className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button key={item || 'all'} type="button" aria-pressed={status === item} className="status-filter" onClick={() => {
              setStatus(item)
              setPage(1)
            }}>
              {item ? statusLabel(item) : 'Semua Status'}
            </button>
          ))}
        </div>
        <label className="text-sm text-ink">
          Waktu
          <select
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          >
            <option value="">Semua</option>
            <option value="upcoming">Akan datang</option>
            <option value="past">Sudah lewat</option>
          </select>
        </label>
      </div>

      <FormBanner message={actionError} />

      {list.isPending ? (
        <div className="mt-6 space-y-3" aria-busy="true">
          <p className="sr-only">Memuat booking...</p>
          <div className="h-20 rounded-xl bg-panel" />
          <div className="h-20 rounded-xl bg-panel" />
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
            {/* Catatan pelanggan ditampilkan sebagai teks, bukan HTML. */}
            {booking.notes ? <p className="mt-1 text-sm text-ink-soft">{booking.notes}</p> : null}
            {booking.can_cancel ? (
              <div className="mt-3">
                {openId === booking.id ? (
                  <form
                    className="space-y-2"
                    onSubmit={(event) => {
                      event.preventDefault()
                      cancel.mutate(booking)
                    }}
                  >
                    <label htmlFor={`reason-${booking.id}`} className="block text-sm text-ink">
                      Alasan batal
                      <textarea
                        id={`reason-${booking.id}`}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={500}
                        rows={2}
                        className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5 text-sm"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={cancel.isPending}
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60"
                      >
                        {cancel.isPending ? 'Membatalkan...' : 'Batalkan booking'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenId(null)}
                        className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink"
                      >
                        Tutup
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(booking.id)
                      setReason('')
                      setActionError(null)
                    }}
                    className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-panel"
                  >
                    Batalkan
                  </button>
                )}
              </div>
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
