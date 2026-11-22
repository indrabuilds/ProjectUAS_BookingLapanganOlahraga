import { FormBanner } from '@/components/auth/FormBanner'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { TextField } from '@/components/auth/TextField'
import { AppShell } from '@/components/layout/AppShell'
import { BlockEditor } from '@/pages/owner/BlockEditor'
import { apiErrorMessage } from '@/features/auth/formErrors'
import {
  createCourt,
  deleteCourt,
  getMyVenue,
  listSports,
  toggleCourtActive,
  updateCourt,
  uploadCourtImage,
} from '@/features/venues/api'
import { courtSchema, type CourtFormValues } from '@/features/venues/schemas'
import { usePageTitle } from '@/lib/usePageTitle'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function CourtFormPage() {
  const params = useParams()
  const venueId = Number(params.venueId)
  const courtId = params.courtId ? Number(params.courtId) : null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const sports = useQuery({ queryKey: ['sports'], queryFn: listSports })
  const venue = useQuery({
    queryKey: ['owner-venues', venueId],
    queryFn: () => getMyVenue(venueId),
    enabled: Number.isFinite(venueId),
  })

  const court = venue.data?.courts?.find((item) => item.id === courtId) ?? null
  usePageTitle(court ? `Ubah ${court.name}` : 'Tambah lapangan')

  const form = useForm<CourtFormValues>({
    resolver: zodResolver(courtSchema),
    values: court
      ? {
          name: court.name,
          sport_id: court.sport?.id ?? 0,
          description: court.description ?? '',
          price_per_hour: Number(court.price_per_hour),
        }
      : undefined,
    defaultValues: {
      name: '',
      sport_id: 0,
      description: '',
      price_per_hour: 0,
    },
  })

  const save = useMutation({
    mutationFn: (values: CourtFormValues) => {
      if (court) {
        return updateCourt(court.id, values)
      }
      return createCourt(venueId, values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner-venues'] })
      navigate(`/owner/venues/${venueId}`)
    },
  })

  async function onSubmit(values: CourtFormValues) {
    setError(null)
    try {
      await save.mutateAsync(values)
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Lapangan gagal disimpan.'))
    }
  }

  if (venue.isPending || sports.isPending) {
    return (
      <AppShell>
        <p className="text-sm text-ink-soft">Memuat formulir lapangan...</p>
      </AppShell>
    )
  }

  if (venue.isError || (courtId !== null && !court)) {
    return (
      <AppShell>
        <h1 className="page-title">Lapangan tidak ditemukan</h1>
        <Link to="/owner/venues" className="mt-4 inline-flex text-sm font-medium text-primary">
          Kembali ke venue
        </Link>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Link to={`/owner/venues/${venueId}`} className="text-sm font-medium text-primary">
        Kembali ke venue
      </Link>
      <h1 className="mt-3 page-title">
        {court ? 'Ubah lapangan' : 'Tambah lapangan'}
      </h1>
      <form
        className="mt-6 space-y-5 surface-card p-6"
        noValidate
        onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
      >
        <FormBanner message={error} />
        <TextField
          id="court-name"
          label="Nama lapangan"
          registration={form.register('name')}
          error={form.formState.errors.name?.message}
        />
        <div>
          <label htmlFor="sport_id" className="block text-sm font-medium text-ink">
            Olahraga
          </label>
          <select
            id="sport_id"
            className="mt-1.5 w-full rounded-md border border-line bg-panel px-3 py-2.5.5 text-base"
            {...form.register('sport_id', { valueAsNumber: true })}
          >
            <option value={0}>Pilih olahraga</option>
            {sports.data?.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          {form.formState.errors.sport_id ? (
            <p className="mt-1.5 text-sm text-taken">{form.formState.errors.sport_id.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="court-description" className="block text-sm font-medium text-ink">
            Deskripsi
          </label>
          <textarea
            id="court-description"
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-base"
            {...form.register('description')}
          />
        </div>
        <TextField
          id="price"
          label="Harga per jam (IDR)"
          type="number"
          registration={form.register('price_per_hour', { valueAsNumber: true })}
          error={form.formState.errors.price_per_hour?.message}
          hint="Contoh 75000 untuk Rp 75.000."
        />
        <SubmitButton
          pending={save.isPending}
          idleLabel={court ? 'Simpan lapangan' : 'Tambah lapangan'}
          pendingLabel="Menyimpan..."
        />
      </form>

      {court ? <div className="mt-6"><BlockEditor courtId={court.id} /></div> : null}

      {court ? (
        <section className="mt-6 surface-card p-6">
          <h2 className="section-title">Foto lapangan</h2>
          {court.image_url ? (
            <img src={court.image_url} alt="" className="mt-3 h-40 w-full rounded-xl object-cover" />
          ) : null}
          <label className="mt-3 inline-flex cursor-pointer text-sm font-semibold text-primary">
            {court.image_url ? 'Ganti foto' : 'Unggah foto'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return
                setError(null)
                void uploadCourtImage(court.id, file)
                  .then(() => queryClient.invalidateQueries({ queryKey: ['owner-venues'] }))
                  .catch((caught: unknown) => setError(apiErrorMessage(caught, 'Foto gagal diunggah.')))
              }}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              type="button"
              className="text-sm font-medium text-ink"
              onClick={() => {
                setError(null)
                void toggleCourtActive(court.id)
                  .then(() => queryClient.invalidateQueries({ queryKey: ['owner-venues'] }))
                  .catch((caught: unknown) => setError(apiErrorMessage(caught, 'Status lapangan gagal diubah.')))
              }}
            >
              {court.is_active ? 'Nonaktifkan lapangan' : 'Aktifkan lapangan'}
            </button>
            {confirmDelete ? (
              <button
                type="button"
                className="text-sm font-semibold text-taken"
                onClick={() => {
                  void deleteCourt(court.id)
                    .then(async () => {
                      await queryClient.invalidateQueries({ queryKey: ['owner-venues'] })
                      navigate(`/owner/venues/${venueId}`)
                    })
                    .catch((caught: unknown) => setError(apiErrorMessage(caught, 'Lapangan gagal dihapus.')))
                }}
              >
                Ya, hapus lapangan
              </button>
            ) : (
              <button type="button" className="text-sm font-medium text-taken" onClick={() => setConfirmDelete(true)}>
                Hapus lapangan
              </button>
            )}
          </div>
        </section>
      ) : null}
    </AppShell>
  )
}
