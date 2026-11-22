import { FormBanner } from '@/components/auth/FormBanner'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { TextField } from '@/components/auth/TextField'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { applyFieldErrors, apiErrorMessage } from '@/features/auth/formErrors'
import { useRegister } from '@/features/auth/hooks'
import { homePathForRole } from '@/features/auth/paths'
import { registerSchema, type RegisterValues } from '@/features/auth/schemas'
import { usePageTitle } from '@/lib/usePageTitle'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

export function RegisterPage() {
  usePageTitle('Daftar')
  const navigate = useNavigate()
  const registerUser = useRegister()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      account_type: 'customer',
    },
  })

  async function onSubmit(values: RegisterValues) {
    setFormError(null)

    try {
      const user = await registerUser.mutateAsync(values)
      navigate(homePathForRole(user.role), { replace: true })
    } catch (error) {
      const attached = applyFieldErrors(error, setError)
      if (!attached) {
        setFormError(apiErrorMessage(error, 'Pendaftaran gagal. Coba lagi.'))
      }
    }
  }

  return (
    <AuthLayout>
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate>
        <div>
          <h1 className="page-title">Daftar Akun Baru</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Pesan lapangan sebagai pelanggan atau daftarkan venue sebagai pemilik.
          </p>
        </div>

        <FormBanner message={formError} />

        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="text-sm font-medium text-ink">Daftar sebagai</legend>
          <label className="flex items-start gap-3 rounded-lg border border-line px-3 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
            <input
              type="radio"
              value="customer"
              className="mt-1"
              {...register('account_type')}
            />
            <span>
              <span className="block text-sm font-medium text-ink">Pelanggan</span>
              <span className="block text-sm text-ink-soft">Memesan lapangan.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-line px-3 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
            <input
              type="radio"
              value="owner"
              className="mt-1"
              {...register('account_type')}
            />
            <span>
              <span className="block text-sm font-medium text-ink">Pemilik venue</span>
              <span className="block text-sm text-ink-soft">
                Mendaftarkan venue. Verifikasi dilakukan admin.
              </span>
            </span>
          </label>
          {errors.account_type ? (
            <p className="text-sm text-taken">{errors.account_type.message}</p>
          ) : null}
        </fieldset>

        <TextField
          id="name"
          label="Nama"
          autoComplete="name"
          registration={register('name')}
          error={errors.name?.message}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />
        <TextField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password?.message}
          hint="Minimal 8 karakter, wajib ada huruf dan angka."
        />
        <TextField
          id="password_confirmation"
          label="Ulangi password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          registration={register('password_confirmation')}
          error={errors.password_confirmation?.message}
        />

        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-inverse"
          onClick={() => setShowPassword((current) => !current)}
        >
          {showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
        </button>

        <SubmitButton
          pending={registerUser.isPending}
          idleLabel="Buat akun"
          pendingLabel="Membuat akun..."
        />

        <p className="flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-sm text-ink-soft">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-inverse">
            Masuk
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
