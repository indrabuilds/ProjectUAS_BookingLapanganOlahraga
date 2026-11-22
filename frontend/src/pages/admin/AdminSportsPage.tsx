import { AppShell } from '@/components/layout/AppShell'
import { createSport, listAdminSports, toggleSport, updateSport } from '@/features/admin/api'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { usePageTitle } from '@/lib/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function AdminSportsPage() {
  usePageTitle('Olahraga')
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const sports = useQuery({ queryKey: ['admin-sports'], queryFn: listAdminSports })
  const refresh = async () => {
    setFormError(null)
    await queryClient.invalidateQueries({ queryKey: ['admin-sports'] })
  }
  const create = useMutation({
    mutationFn: () => createSport(name.trim()),
    onSuccess: async () => {
      setName('')
      await refresh()
    },
    onError: (error) => setFormError(apiErrorMessage(error, 'Olahraga gagal ditambah.')),
  })
  const rename = useMutation({
    mutationFn: (id: number) => updateSport(id, editName.trim()),
    onSuccess: async () => {
      setEditing(null)
      await refresh()
    },
    onError: (error) => setFormError(apiErrorMessage(error, 'Nama gagal diubah.')),
  })
  const toggle = useMutation({
    mutationFn: toggleSport,
    onSuccess: refresh,
    onError: (error) => setFormError(apiErrorMessage(error, 'Status olahraga gagal diubah.')),
  })

  return (
    <AppShell>
      <Link to="/admin" className="text-sm font-medium text-primary">
        Kembali ke ringkasan
      </Link>
      <h1 className="mt-3 page-title">Kategori Olahraga</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Nama yang nonaktif tidak muncul di pencarian. Data tidak dihapus, supaya lapangan yang sudah ada tetap punya kategori.
      </p>

      <form
        className="surface-card mt-6 flex flex-wrap items-end gap-3 p-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim() === '') {
            setFormError('Nama olahraga wajib diisi.')
            return
          }
          create.mutate()
        }}
      >
        <label className="min-w-56 flex-1 text-sm text-ink">
          Nama baru
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          />
        </label>
        <button type="submit" disabled={create.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60">
          {create.isPending ? 'Menambah...' : 'Tambah'}
        </button>
      </form>
      {formError ? <p className="mt-3 text-sm text-taken">{formError}</p> : null}
      {sports.isPending ? <p className="mt-6 text-sm text-ink-soft">Memuat olahraga...</p> : null}
      {sports.isError ? <p className="mt-6 text-sm text-taken">{apiErrorMessage(sports.error, 'Olahraga gagal dimuat.')}</p> : null}

      <ul className="surface-card mt-6 divide-y divide-line px-5">
        {sports.data?.map((sport) => (
          <li key={sport.id} className="py-4">
            {editing === sport.id ? (
              <form
                className="flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  rename.mutate(sport.id)
                }}
              >
                <label className="sr-only" htmlFor={`sport-${sport.id}`}>
                  Nama {sport.name}
                </label>
                <input
                  id={`sport-${sport.id}`}
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  maxLength={50}
                  className="min-w-40 flex-1 rounded-md border border-line bg-panel px-3 py-2.5 text-sm"
                />
                <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary">
                  Simpan
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{sport.name}</p>
                  <p className="text-sm text-ink-soft">{sport.is_active ? 'Aktif' : 'Nonaktif'} · {sport.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(sport.id)
                      setEditName(sport.name)
                      setFormError(null)
                    }}
                    className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink"
                  >
                    Ubah nama
                  </button>
                  <button
                    type="button"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate(sport.id)}
                    className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink disabled:opacity-60"
                  >
                    {sport.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </AppShell>
  )
}
