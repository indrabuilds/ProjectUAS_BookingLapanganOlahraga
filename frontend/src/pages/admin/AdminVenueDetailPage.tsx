import { AppShell } from '@/components/layout/AppShell'
import { approveVenue, getAdminVenue, reactivateVenue, rejectVenue, suspendVenue } from '@/features/admin/api'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { formatIdr, statusLabel } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export function AdminVenueDetailPage() {
  const params = useParams()
  const venueId = Number(params.venueId)
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const venue = useQuery({
    queryKey: ['admin-venues', venueId],
    queryFn: () => getAdminVenue(venueId),
    enabled: Number.isFinite(venueId),
  })

  usePageTitle(venue.data?.name ?? 'Periksa venue')

  const action = useMutation({
    mutationFn: async (kind: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
      if (kind === 'approve') return approveVenue(venueId)
      if (kind === 'reactivate') return reactivateVenue(venueId)
      if (kind === 'reject') return rejectVenue(venueId, reason.trim())
      return suspendVenue(venueId, reason.trim())
    },
    onSuccess: async () => {
      setReason('')
      await queryClient.invalidateQueries({ queryKey: ['admin-venues'] })
    },
  })

  async function run(kind: 'approve' | 'reject' | 'suspend' | 'reactivate') {
    setError(null)
    try {
      await action.mutateAsync(kind)
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Perubahan status gagal.'))
    }
  }

  if (venue.isPending) {
    return (
      <AppShell>
        <p className="text-sm text-ink-soft">Memuat venue...</p>
      </AppShell>
    )
  }

  if (venue.isError || !venue.data) {
    return (
      <AppShell>
        <h1 className="page-title">Venue tidak ditemukan</h1>
        <Link to="/admin/venues" className="mt-4 inline-flex text-sm font-medium text-primary">
          Kembali ke daftar
        </Link>
      </AppShell>
    )
  }

  const current = venue.data

  return (
    <AppShell>
      <Link to="/admin/venues" className="text-sm font-medium text-primary">
        Kembali ke daftar
      </Link>
      <h1 className="mt-3 page-title">{current.name}</h1>
      <p className="mt-2 text-sm text-ink-soft">{statusLabel(current.status)}</p>
      {current.status_reason ? (
        <p className="mt-2 text-sm text-ink-soft">Alasan terakhir: {current.status_reason}</p>
      ) : null}

      <dl className="mt-6 grid gap-4 surface-card p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-soft">Pemilik</dt>
          <dd className="mt-1 text-sm font-medium text-ink">
            {current.owner?.name} · {current.owner?.email}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Lokasi</dt>
          <dd className="mt-1 text-sm font-medium text-ink">
            {current.address}, {current.city}, {current.province}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Telepon</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{current.phone}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Zona waktu</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{current.timezone}</dd>
        </div>
      </dl>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink">{current.description}</p>

      {current.images && current.images.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {current.images.map((image) => (
            <li key={image.id}>
              <img src={image.url} alt="" className="h-36 w-full rounded-xl border border-line object-cover" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">Belum ada foto.</p>
      )}

      <h2 className="mt-8 text-lg font-semibold text-ink">Lapangan</h2>
      {current.courts && current.courts.length > 0 ? (
        <ul className="mt-2 space-y-2 text-sm text-ink">
          {current.courts.map((court) => (
            <li key={court.id}>
              {court.name} · {court.sport?.name} · {formatIdr(court.price_per_hour)} / jam
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">Belum ada lapangan.</p>
      )}

      <section className="mt-8 surface-card p-6">
        <h2 className="section-title">Keputusan</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Tolak dan tangguhkan wajib punya alasan. Setujui hanya untuk venue yang masih menunggu.
        </p>
        <label htmlFor="reason" className="mt-4 block text-sm font-medium text-ink">
          Alasan
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-base"
        />
        {error ? <p className="mt-3 text-sm text-taken">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {current.status === 'pending_verification' ? (
            <>
              <button
                type="button"
                disabled={action.isPending}
                onClick={() => void run('approve')}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60"
              >
                Setujui
              </button>
              <button
                type="button"
                disabled={action.isPending}
                onClick={() => void run('reject')}
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
              >
                Tolak
              </button>
            </>
          ) : null}
          {current.status === 'approved' ? (
            <button
              type="button"
              disabled={action.isPending}
              onClick={() => void run('suspend')}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              Tangguhkan
            </button>
          ) : null}
          {current.status === 'suspended' ? (
            <button
              type="button"
              disabled={action.isPending}
              onClick={() => void run('reactivate')}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60"
            >
              Aktifkan kembali
            </button>
          ) : null}
        </div>
      </section>
    </AppShell>
  )
}
