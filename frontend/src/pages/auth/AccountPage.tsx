import { FormBanner } from '@/components/auth/FormBanner'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/auth/TextField'
import { AppShell } from '@/components/layout/AppShell'
import { applyFieldErrors, apiErrorMessage } from '@/features/auth/formErrors'
import { useLogout, useMe, useUpdatePassword, useUpdateProfile } from '@/features/auth/hooks'
import { roleLabel, statusLabel } from '@/features/auth/paths'
import {
  passwordChangeSchema,
  profileSchema,
  type PasswordChangeValues,
  type ProfileValues,
} from '@/features/auth/schemas'
import { usePageTitle } from '@/lib/usePageTitle'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export function AccountPage() {
  usePageTitle('Pengaturan')
  const me = useMe()
  const logout = useLogout()
  const updateProfile = useUpdateProfile()
  const updatePassword = useUpdatePassword()
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: me.data?.name ?? '',
      phone: me.data?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  async function onProfile(values: ProfileValues) {
    setProfileError(null)
    setProfileMessage(null)

    try {
      await updateProfile.mutateAsync(values)
      setProfileMessage('Profil disimpan.')
    } catch (error) {
      const attached = applyFieldErrors(error, profileForm.setError)
      if (!attached) {
        setProfileError(apiErrorMessage(error, 'Profil gagal disimpan.'))
      }
    }
  }

  async function onPassword(values: PasswordChangeValues) {
    setPasswordError(null)
    setPasswordMessage(null)

    try {
      await updatePassword.mutateAsync(values)
      passwordForm.reset()
      setPasswordMessage('Password diganti. Anda tetap masuk di perangkat ini.')
    } catch (error) {
      const attached = applyFieldErrors(error, passwordForm.setError)
      if (!attached) {
        setPasswordError(apiErrorMessage(error, 'Password gagal diganti.'))
      }
    }
  }

  if (!me.data) {
    return null
  }

  return (
    <AppShell compact>
      <h1 className="page-title">Pengaturan Akun</h1>
      <dl className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <div>
          <dt className="text-sm text-ink-soft">Email</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{me.data.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Peran</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{roleLabel(me.data.role)}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Status</dt>
          <dd className="mt-1 text-sm font-medium text-ink">{statusLabel(me.data.status)}</dd>
        </div>
      </dl>

      <form
        className="surface-card mt-6 space-y-5 p-5 sm:p-6"
        onSubmit={(event) => void profileForm.handleSubmit(onProfile)(event)}
        noValidate
      >
        <h2 className="section-title">Informasi Akun</h2>
        <FormBanner message={profileError} />
        {profileMessage ? (
          <p role="status" className="text-sm text-primary">
            {profileMessage}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="name"
            label="Nama"
            autoComplete="name"
            registration={profileForm.register('name')}
            error={profileForm.formState.errors.name?.message}
          />
          <TextField
            id="phone"
            label="Nomor telepon"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            registration={profileForm.register('phone')}
            error={profileForm.formState.errors.phone?.message}
            hint="Opsional. Contoh 081234567890."
          />
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>

      <form
        className="surface-card mt-6 space-y-5 p-5 sm:p-6"
        onSubmit={(event) => void passwordForm.handleSubmit(onPassword)(event)}
        noValidate
      >
        <h2 className="section-title">Keamanan &amp; Kata Sandi</h2>
        <FormBanner message={passwordError} />
        {passwordMessage ? (
          <p role="status" className="text-sm text-primary">
            {passwordMessage}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            id="current_password"
            label="Password saat ini"
            type="password"
            autoComplete="current-password"
            registration={passwordForm.register('current_password')}
            error={passwordForm.formState.errors.current_password?.message}
          />
          <TextField
            id="new_password"
            label="Password baru"
            type="password"
            autoComplete="new-password"
            registration={passwordForm.register('password')}
            error={passwordForm.formState.errors.password?.message}
            hint="Minimal 8 karakter, wajib ada huruf dan angka."
          />
          <TextField
            id="new_password_confirmation"
            label="Ulangi password baru"
            type="password"
            autoComplete="new-password"
            registration={passwordForm.register('password_confirmation')}
            error={passwordForm.formState.errors.password_confirmation?.message}
          />
        </div>
        <Button type="submit" disabled={updatePassword.isPending}>
          {updatePassword.isPending ? 'Menyimpan...' : 'Simpan Kata Sandi'}
        </Button>
      </form>
      <section className="surface-card mt-6 flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6" aria-label="Sesi akun">
        <p className="text-ink-soft">Masuk sebagai {me.data.email}</p>
        <Button tone="line" className="border-taken/25 text-taken hover:bg-taken-soft" onClick={() => logout.mutate()} disabled={logout.isPending}>
          {logout.isPending ? 'Keluar...' : 'Keluar Akun'}
        </Button>
      </section>
    </AppShell>
  )
}
