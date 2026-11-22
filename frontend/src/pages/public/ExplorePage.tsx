import { VenueCover } from '@/components/common/VenueCover'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { fieldClass } from '@/components/ui/field'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { exploreVenues, type ExploreFilters } from '@/features/discovery/api'
import { listSports } from '@/features/venues/api'
import { formatIdr } from '@/features/venues/types'
import { cn } from '@/lib/cn'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'

type FilterField = 'q' | 'city' | 'min_price' | 'max_price'
const searchFields: { name: FilterField; label: string; placeholder?: string }[] = [
  { name: 'q', label: 'Nama venue', placeholder: 'Cari nama venue' },
  { name: 'city', label: 'Kota', placeholder: 'Semua kota' },
  { name: 'min_price', label: 'Harga minimum', placeholder: 'Rp minimum' },
  { name: 'max_price', label: 'Harga maksimum', placeholder: 'Rp maksimum' },
]

export function ExplorePage() {
  usePageTitle('Jelajah')
  const [params, setParams] = useSearchParams()
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#pencarian-venue') document.getElementById('pencarian-venue')?.focus()
  }, [hash])
  const filters: ExploreFilters = {
    q: params.get('q') ?? '',
    city: params.get('city') ?? '',
    sport: params.get('sport') ?? '',
    min_price: params.get('min_price') ?? '',
    max_price: params.get('max_price') ?? '',
    sort: params.get('sort') ?? 'newest',
    page: Number(params.get('page') ?? '1'),
  }
  const sports = useQuery({ queryKey: ['sports'], queryFn: listSports })
  const venues = useQuery({ queryKey: ['explore', filters], queryFn: () => exploreVenues(filters) })

  const pagination = venues.data?.meta

  function apply(values: Record<string, string>, resetPage = true) {
    const next = new URLSearchParams(params)
    if (resetPage) next.delete('page')
    for (const [key, value] of Object.entries(values)) {
      if (value.trim()) next.set(key, value.trim())
      else next.delete(key)
    }
    setParams(next)
  }

  return (
    <AppShell>
      <header>
        <h1 className="page-title">Temukan &amp; Pesan Lapangan Olahraga</h1>
        <p className="mt-2 text-ink-soft">Bandingkan harga per jam dan cek jadwal lapangan di venue terverifikasi.</p>
      </header>

      <form
        key={JSON.stringify(searchFields.map(({ name }) => filters[name]))}
        aria-label="Pencarian dan filter venue"
        className="surface-card mt-8 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto] lg:items-end"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          apply(Object.fromEntries(searchFields.map(({ name }) => [name, String(form.get(name) ?? '')])))
        }}
      >
        {searchFields.map(({ name, label, placeholder }) => (
          <label key={name} className="min-w-0 text-xs font-medium text-ink">
            {label}
            <span className="relative block">
              {name === 'q' ? <Search size={17} className="pointer-events-none absolute bottom-3 left-3 text-ink-soft" aria-hidden="true" /> : null}
              <input
                id={name === 'q' ? 'pencarian-venue' : undefined}
                name={name}
                defaultValue={filters[name]}
                type={name === 'q' ? 'search' : 'text'}
                inputMode={name === 'min_price' || name === 'max_price' ? 'numeric' : undefined}
                placeholder={placeholder}
                className={cn(fieldClass, name === 'q' && 'scroll-mt-36 pl-9')}
              />
            </span>
          </label>
        ))}
        <Button type="submit" tone="line" className="sm:w-fit lg:w-full">
          <SlidersHorizontal size={16} className="text-primary" aria-hidden="true" /> Terapkan
        </Button>
      </form>

      <section aria-label="Kategori olahraga" className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!filters.sport} onClick={() => apply({ sport: '' })} className="status-filter">Semua Olahraga</button>
          {sports.data?.map((sport) => (
            <button key={sport.id} type="button" aria-pressed={filters.sport === sport.slug} onClick={() => apply({ sport: sport.slug })} className="status-filter">
              {sport.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft">
          {venues.data ? (
            <span className="tabular-nums" role="status">{venues.data.data.length} dari {venues.data.meta.total} venue</span>
          ) : null}
          <label className="flex items-center gap-2">
            Urutan
            <select value={filters.sort} onChange={(event) => apply({ sort: event.target.value })} className="rounded-md border border-line bg-surface px-2.5 py-2 text-sm text-ink">
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga termurah</option>
              <option value="price_desc">Harga termahal</option>
              <option value="name">Nama</option>
            </select>
          </label>
        </div>
      </section>

      {venues.isPending ? <p className="mt-6 text-ink-soft" role="status">Mencari venue...</p> : null}
      {venues.isError ? (
        <p className="mt-6 rounded-md bg-taken-soft p-4 text-taken" role="alert">
          {apiErrorMessage(venues.error, 'Pencarian gagal. Periksa filter lalu coba lagi.')}
        </p>
      ) : null}
      {venues.data?.data.length === 0 ? (
        <p className="surface-card mt-6 p-6 text-ink-soft">Tidak ada venue yang cocok. Coba kota lain atau hapus filter harga.</p>
      ) : null}

      {venues.data && venues.data.data.length > 0 ? (
        <ul aria-label="Daftar venue terverifikasi" className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.data.data.map((venue) => (
            <li key={venue.id} className="surface-card flex flex-col overflow-hidden">
              <div className="relative">
                <VenueCover src={venue.cover_image_url} sports={venue.sports} className="aspect-video" />
                {venue.sports.length > 0 ? (
                  <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                    {venue.sports.map((sport) => sport.name).join(' · ')}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex-1">
                  <h2 className="text-base font-semibold">{venue.name}</h2>
                  <p className="mt-1 flex items-start gap-1.5 text-[13px] text-ink-soft">
                    <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {venue.city}, {venue.province}
                  </p>
                </div>
                <p className="border-t border-line pt-3 text-sm font-semibold text-primary tabular-nums">
                  {venue.starting_price ? `Mulai ${formatIdr(venue.starting_price)}/jam` : 'Harga belum tersedia'}
                </p>
                <Link to={`/venues/${venue.id}`} className={cn(buttonClass, buttonTones.open)} aria-label={`Lihat detail dan jadwal ${venue.name}`}>
                  Lihat Detail &amp; Jadwal <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {pagination && pagination.last_page > 1 ? (
        <nav aria-label="Halaman hasil" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Button tone="line" disabled={pagination.current_page <= 1} onClick={() => apply({ page: String(pagination.current_page - 1) }, false)}>
            Sebelumnya
          </Button>
          <span className="tabular-nums">Halaman {pagination.current_page} dari {pagination.last_page}</span>
          <Button tone="line" disabled={pagination.current_page >= pagination.last_page} onClick={() => apply({ page: String(pagination.current_page + 1) }, false)}>
            Berikutnya
          </Button>
        </nav>
      ) : null}
    </AppShell>
  )
}
