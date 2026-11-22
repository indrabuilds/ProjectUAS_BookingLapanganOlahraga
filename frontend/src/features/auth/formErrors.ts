import { apiErrorBody, apiErrorMessage } from '@/features/auth/api'
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

// Menempelkan error 422 ke field yang sama. Mengembalikan false jika tidak ada field.
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  const errors = apiErrorBody(error)?.errors
  if (!errors) {
    return false
  }

  let applied = false

  for (const [key, messages] of Object.entries(errors)) {
    const message = messages[0]
    if (!message) {
      continue
    }

    setError(key as FieldPath<T>, { message })
    applied = true
  }

  return applied
}

export { apiErrorMessage }
