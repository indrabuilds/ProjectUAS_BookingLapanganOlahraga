import { fieldClass } from '@/components/ui/field'
import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type TextFieldProps = {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: string
  hint?: string
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'autoComplete' | 'inputMode'
>

export function TextField({
  id,
  label,
  registration,
  error,
  hint,
  type = 'text',
  autoComplete,
  inputMode,
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={fieldClass}
        {...registration}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-taken">
          {error}
        </p>
      ) : null}
    </div>
  )
}
