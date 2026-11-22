import { fieldClass } from '@/components/ui/field'
import { BlockEditor } from '@/pages/owner/BlockEditor'
import { AppShell } from '@/components/layout/AppShell'
import { HoursEditor } from '@/pages/owner/HoursEditor'
import { apiErrorMessage } from '@/features/auth/formErrors'
import {
  deleteVenue,
  deleteVenueImage,
  getMyVenue,
  toggleVenueActive,
  updateVenue,
  uploadVenueImage,
} from '@/features/venues/api'
import { formatIdr, statusLabel, type VenueInput } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { VenueForm } from '@/pages/owner/VenueForm'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

export function VenueDetailPage() {
  const params = useParams()
  const venueId = Number(params.venueId)
  const navigate = useNavigate()
  const { hash } = useLocation()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [courtForBlocks, setCourtForBlocks] = useState<number | null>(null)
  const venue = useQuery({
    queryKey: ['owner-venues', venueId],
    queryFn: () => getMyVenue(venueId),
    enabled: Number.isFinite(venueId),
  })

  usePageTitle(venue.data?.name ?? 'Venue')

  useEffect(() => {
    if (hash === '#jadwal') document.getElementById('jadwal')?.focus()
  }, [hash, venue.data?.id])

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['owner-venues'] })
    await queryClient.invalidateQueries({ queryKey: ['owner-venues', venueId] })
  }

  const save = useMutation({
    mutationFn: (input: VenueInput) => updateVenue(venueId, input),
    onSuccess: refresh,
  })
  const toggle = useMutation({ mutationFn: () => toggleVenueActive(venueId), onSuccess: refresh })
  const remove = useMutation({
    mutationFn: () => deleteVenue(venueId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner-venues'] })
      navigate('/owner/venues')
    },
  })
  const upload = useMutation({
    mutationFn: (file: File) => uploadVenueImage(venueId, file),
    onSuccess: refresh,
  })
  const removeImage = useMutation({
    mutationFn: (imageId: number) => deleteVenueImage(venueId, imageId),
    onSuccess: refresh,
  })

  async function run(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Aksi gagal. Coba lagi.'))
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
        <p className="mt-2 text-sm text-ink-soft">Venue ini bukan milik akun Anda, atau sudah dihapus.</p>
        <Link to="/owner/venues" className="mt-4 inline-flex text-sm font-medium text-primary">
          Kembali ke daftar
        </Link>
      </AppShell>
    )
  }

  const current = venue.data
  const locked = current.status === 'suspended'
  const courtOptions = current.courts ?? []
  const selectedCourt = courtOptions.find((court) => court.id === courtForBlocks) ?? courtOptions[0]

  return (
    <AppShell>
      <Link to="/owner/venues" className="text-sm font-medium text-primary">
        Kembali ke daftar
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{current.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {statusLabel(current.status)}
            {current.is_active ? '' : ', disembunyikan pemilik'}
          </p>
          {current.status_reason ? (
            <p className="mt-2 max-w-xl text-sm text-ink-soft">Alasan admin: {current.status_reason}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={toggle.isPending}
          onClick={() => void run(() => toggle.mutateAsync())}
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-panel disabled:opacity-60"
        >
          {current.is_active ? 'Nonaktifkan' : 'Aktifkan lagi'}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-taken">{error}</p> : null}
      <nav aria-label="Kelola venue" className="mt-5 flex flex-wrap gap-2">
        <a href="#lapangan" className="status-filter">Daftar Lapangan</a>
        <Link to="#jadwal" className="status-filter">Jadwal &amp; Blokir</Link>
      </nav>

      <section className="mt-6 surface-card p-6">
        <h2 className="section-title">Data venue</h2>
        {locked ? (
          <p className="mt-2 text-sm text-ink-soft">
            Venue ditangguhkan admin, jadi isinya tidak bisa diubah sampai diaktifkan kembali.
          </p>
        ) : (
          <div className="mt-4">
            <VenueForm
              initial={{
                name: current.name,
                description: current.description,
                address: current.address,
                city: current.city,
                province: current.province,
                phone: current.phone,
                timezone: current.timezone,
                facilities: current.facilities,
              }}
              pending={save.isPending}
              error={null}
              submitLabel={current.status === 'rejected' ? 'Simpan dan kirim ulang' : 'Simpan perubahan'}
              onSubmit={async (values) => {
                await run(() => save.mutateAsync(values))
              }}
            />
          </div>
        )}
      </section>

      <section className="mt-6 surface-card p-6">
        <h2 className="section-title">Foto</h2>
        <p className="mt-2 text-sm text-ink-soft">Maksimal 5 foto, JPG, PNG, atau WebP, tiap file maksimal 2 MB.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {current.images?.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-line">
              <img src={image.url} alt="" className="h-36 w-full object-cover" />
              <button
                type="button"
                className="px-3 py-2 text-sm font-medium text-taken"
                onClick={() => void run(() => removeImage.mutateAsync(image.id))}
              >
                Hapus foto
              </button>
            </li>
          ))}
        </ul>
        {!locked && (current.images?.length ?? 0) < 5 ? (
          <label className="mt-4 inline-flex cursor-pointer text-sm font-semibold text-primary">
            Unggah foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) {
                  void run(() => upload.mutateAsync(file))
                }
              }}
            />
          </label>
        ) : null}
      </section>

      <section id="lapangan" className="surface-card mt-6 scroll-mt-36 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Daftar Lapangan</h2>
          {!locked ? (
            <Link
              to={`/owner/venues/${current.id}/courts/new`}
              className="text-sm font-semibold text-primary"
            >
              Tambah lapangan
            </Link>
          ) : null}
        </div>
        {current.courts && current.courts.length > 0 ? (
          <ul className="mt-4 divide-y divide-line">
            {current.courts.map((court) => (
              <li key={court.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{court.name}</p>
                  <p className="text-sm text-ink-soft">
                    {court.sport?.name ?? 'Olahraga'} · {formatIdr(court.price_per_hour)} / jam
                    {court.is_active ? '' : ' · nonaktif'}
                  </p>
                </div>
                <Link
                  to={`/owner/venues/${current.id}/courts/${court.id}`}
                  className="text-sm font-semibold text-primary"
                >
                  Ubah
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">Belum ada lapangan di venue ini.</p>
        )}
      </section>

      <section id="jadwal" tabIndex={-1} className="mt-8 scroll-mt-36" aria-labelledby="venue-schedule-title">
        <h2 id="venue-schedule-title" className="section-title">Jam Operasional &amp; Blokir Jadwal</h2>
        <div className="mt-4 grid items-start gap-6 lg:grid-cols-2">
          <section className="surface-card p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold">Jam Operasional</h3>
            <p className="mt-2 text-ink-soft">Jam ditampilkan dalam zona waktu venue. Perubahan tidak membatalkan booking yang sudah ada.</p>
            {current.operating_hours ? <HoursEditor key={current.id} venueId={current.id} hours={current.operating_hours} /> : null}
          </section>
          {selectedCourt && !locked ? (
            <BlockEditor key={selectedCourt.id} courtId={selectedCourt.id} courtPicker={
              <label className="mt-4 block font-medium">
                Lapangan
                <select value={selectedCourt.id} onChange={(event) => setCourtForBlocks(Number(event.target.value))} className={fieldClass}>
                  {courtOptions.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
                </select>
              </label>
            } />
          ) : null}
        </div>
      </section>

      <section className="mt-6">
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-ink-soft">Hapus venue ini dari daftar Anda?</p>
            <button
              type="button"
              className="rounded-lg bg-taken px-4 py-2 text-sm font-semibold text-on-primary"
              onClick={() => void run(() => remove.mutateAsync())}
            >
              Ya, hapus
            </button>
            <button type="button" className="text-sm font-medium text-ink-soft" onClick={() => setConfirmDelete(false)}>
              Batal
            </button>
          </div>
        ) : (
          <button type="button" className="text-sm font-medium text-taken" onClick={() => setConfirmDelete(true)}>
            Hapus venue
          </button>
        )}
      </section>
    </AppShell>
  )
}
