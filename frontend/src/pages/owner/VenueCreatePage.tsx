import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { createVenue } from '@/features/venues/api'
import type { VenueInput } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { VenueForm } from '@/pages/owner/VenueForm'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function VenueCreatePage() {
  usePageTitle('Tambah venue')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: createVenue,
    onSuccess: async (venue) => {
      await queryClient.invalidateQueries({ queryKey: ['owner-venues'] })
      navigate(`/owner/venues/${venue.id}`)
    },
  })

  async function onSubmit(values: VenueInput) {
    setError(null)
    try {
      await mutation.mutateAsync(values)
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Venue gagal disimpan.'))
    }
  }

  return (
    <AppShell>
      <Link to="/owner/venues" className="text-sm font-medium text-primary">
        Kembali ke daftar
      </Link>
      <h1 className="mt-3 page-title">Tambah venue</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Setelah disimpan, venue menunggu pemeriksaan admin. Anda bisa menambah lapangan dan foto di halaman berikutnya.
      </p>
      <div className="mt-6 surface-card p-6">
        <VenueForm pending={mutation.isPending} error={error} submitLabel="Simpan venue" onSubmit={onSubmit} />
      </div>
    </AppShell>
  )
}
