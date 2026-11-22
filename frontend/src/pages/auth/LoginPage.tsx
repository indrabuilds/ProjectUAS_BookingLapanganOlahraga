import { FormBanner } from '@/components/auth/FormBanner'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { TextField } from '@/components/auth/TextField'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { applyFieldErrors, apiErrorMessage } from '@/features/auth/formErrors'
import { useLogin } from '@/features/auth/hooks'
import { homePathForRole } from '@/features/auth/paths'
import { loginSchema, type LoginValues } from '@/features/auth/schemas'
import { usePageTitle } from '@/lib/usePageTitle'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { UserRole } from '@/types/user'

function nextPath(role: UserRole, from: string | undefined): string {
  const home = homePathForRole(role)
  if (from === '/account' || from === home) {
    return from
  }

  if (role === 'customer' && (from === '/customer/bookings' || (from?.startsWith('/bookings/') && !from.includes('//')))) {
    return from
  }

  return home
}

export function LoginPage() {
  usePageTitle('Masuk')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const from = (location.state as { from?: string } | null)?.from

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  async function onSubmit(values: LoginValues) {
    setFormError(null)

    try {
      const user = await login.mutateAsync(values)
      navigate(nextPath(user.role, from), { replace: true })
    } catch (error) {
      const attached = applyFieldErrors(error, setError)
      if (!attached) {
        setFormError(apiErrorMessage(error, 'Login gagal. Coba lagi.'))
      }
    }
  }

  return (
    <AuthLayout>
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate>
        <div>
          <h1 className="page-title">Masuk ke SportsCourt</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Masuk menggunakan email dan kata sandi akun Anda.
          </p>
        </div>

        <FormBanner message={formError} />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />

        <div>
          <TextField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            registration={register('password')}
            error={errors.password?.message}
          />
          <button
            type="button"
            className="mt-2 text-sm font-medium text-primary hover:text-inverse"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('remember')} />
          Ingat saya
        </label>

        <SubmitButton
          pending={login.isPending}
          idleLabel="Masuk Akun"
          pendingLabel="Masuk..."
        />

        <p className="flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-sm text-ink-soft">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-inverse">
            Daftar
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
