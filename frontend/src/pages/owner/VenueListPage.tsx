import { VenueBadge } from '@/components/common/StatusBadge'
import { AppShell } from '@/components/layout/AppShell'
import { listMyVenues } from '@/features/venues/api'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export function VenueListPage() {
  usePageTitle('Venue saya')
  const venues = useQuery({
    queryKey: ['owner-venues'],
    queryFn: listMyVenues,
  })

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Venue Milik Saya</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Venue baru berstatus menunggu verifikasi. Admin yang menyetujui atau menolak.
          </p>
        </div>
        <Link
          to="/owner/venues/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-inverse"
        >
          Tambah venue
        </Link>
      </div>

      {venues.isPending ? <p className="mt-8 text-sm text-ink-soft">Memuat venue...</p> : null}
      {venues.isError ? (
        <p className="mt-8 text-sm text-taken">
          {apiErrorMessage(venues.error, 'Daftar venue gagal dimuat.')}{' '}
          <button type="button" className="font-semibold underline" onClick={() => void venues.refetch()}>
            Coba lagi
          </button>
        </p>
      ) : null}

      {venues.data && venues.data.length === 0 ? (
        <p className="mt-8 surface-card p-6 text-sm text-ink-soft">
          Belum ada venue. Tambah venue pertama, lalu lengkapi lapangan dan fotonya.
        </p>
      ) : null}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {venues.data?.map((venue) => (
          <li key={venue.id}>
            <Link
              to={`/owner/venues/${venue.id}`}
              className="block surface-card p-5 transition-colors hover:border-primary"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">{venue.name}</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    {venue.city}, {venue.province}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2"><VenueBadge status={venue.status} />{!venue.is_active ? <span className="rounded-full bg-panel px-2.5 py-1 text-xs text-ink-soft">Nonaktif</span> : null}</div>
              </div>
              <p className="mt-4 border-t border-line pt-3 font-semibold text-primary">Kelola Venue &amp; Lapangan →</p>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  )
}
