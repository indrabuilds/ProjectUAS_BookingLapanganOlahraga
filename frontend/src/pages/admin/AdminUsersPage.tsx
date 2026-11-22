import { AppShell } from '@/components/layout/AppShell'
import { activateUser, listAdminUsers, suspendUser } from '@/features/admin/api'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { roleLabel, statusLabel } from '@/features/auth/paths'
import { usePageTitle } from '@/lib/usePageTitle'
import type { UserRole, UserStatus } from '@/types/user'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function AdminUsersPage() {
  usePageTitle('Pengguna')
  const queryClient = useQueryClient()
  const [role, setRole] = useState<UserRole | ''>('')
  const [status, setStatus] = useState<UserStatus | ''>('')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const users = useQuery({
    queryKey: ['admin-users', role, status, search, page],
    queryFn: () => listAdminUsers({ role, status, q: search, page }),
  })
  const change = useMutation({
    mutationFn: (input: { id: number; next: 'suspend' | 'activate' }) =>
      input.next === 'suspend' ? suspendUser(input.id) : activateUser(input.id),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => setActionError(apiErrorMessage(error, 'Status pengguna gagal diubah.')),
  })

  return (
    <AppShell>
      <Link to="/admin" className="text-sm font-medium text-primary">
        Kembali ke ringkasan
      </Link>
      <h1 className="mt-3 page-title">Daftar Pengguna &amp; Venue Owner</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Menangguhkan pelanggan atau pemilik menutup akses mereka. Admin tidak bisa menangguhkan dirinya atau admin lain.
      </p>

      <form
        className="surface-card mt-6 grid gap-3 p-5 sm:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(q.trim())
          setPage(1)
        }}
      >
        <label className="text-sm text-ink">
          Cari nama atau email
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          />
        </label>
        <label className="text-sm text-ink">
          Peran
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value as UserRole | '')
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          >
            <option value="">Semua</option>
            <option value="customer">Pelanggan</option>
            <option value="owner">Pemilik venue</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="text-sm text-ink">
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as UserStatus | '')
              setPage(1)
            }}
            className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2.5"
          >
            <option value="">Semua</option>
            <option value="active">Aktif</option>
            <option value="suspended">Ditangguhkan</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-inverse sm:col-span-3 sm:w-fit">
          Cari
        </button>
      </form>

      {actionError ? <p className="mt-4 text-sm text-taken">{actionError}</p> : null}
      {users.isPending ? <p className="mt-6 text-sm text-ink-soft">Memuat pengguna...</p> : null}
      {users.isError ? <p className="mt-6 text-sm text-taken">{apiErrorMessage(users.error, 'Pengguna gagal dimuat.')}</p> : null}
      {users.data && users.data.data.length === 0 ? <p className="mt-6 text-sm text-ink-soft">Tidak ada pengguna pada filter ini.</p> : null}

      <ul className="surface-card mt-6 divide-y divide-line px-5">
        {users.data?.data.map((user) => (
          <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium text-ink">{user.name}</p>
              <p className="text-sm text-ink-soft">
                {user.email} · {roleLabel(user.role)} · {statusLabel(user.status)}
              </p>
            </div>
            {user.role === 'admin' ? null : user.status === 'active' ? (
              <button
                type="button"
                disabled={change.isPending}
                onClick={() => change.mutate({ id: user.id, next: 'suspend' })}
                className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-panel disabled:opacity-60"
              >
                Tangguhkan
              </button>
            ) : (
              <button
                type="button"
                disabled={change.isPending}
                onClick={() => change.mutate({ id: user.id, next: 'activate' })}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60"
              >
                Aktifkan
              </button>
            )}
          </li>
        ))}
      </ul>

      {users.data && users.data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-50">
            Sebelumnya
          </button>
          <span className="text-ink-soft">
            Halaman {users.data.meta.current_page} dari {users.data.meta.last_page}
          </span>
          <button type="button" disabled={page >= users.data.meta.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-line px-3 py-2 disabled:opacity-50">
            Berikutnya
          </button>
        </div>
      ) : null}
    </AppShell>
  )
}
