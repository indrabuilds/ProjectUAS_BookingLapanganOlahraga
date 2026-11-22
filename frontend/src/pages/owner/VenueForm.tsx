import { FormBanner } from '@/components/auth/FormBanner'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { TextField } from '@/components/auth/TextField'
import { venueSchema, type VenueFormValues } from '@/features/venues/schemas'
import { facilityOptions, timezoneOptions, type VenueInput } from '@/features/venues/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

type VenueFormProps = {
  initial?: VenueInput
  pending: boolean
  error: string | null
  submitLabel: string
  onSubmit: (values: VenueInput) => Promise<void>
}

const empty: VenueFormValues = {
  name: '',
  description: '',
  address: '',
  city: '',
  province: '',
  phone: '',
  timezone: 'Asia/Jakarta',
  facilities: [],
}

// Status dan owner tidak ada di form. Server yang mengisinya.
export function VenueForm({ initial, pending, error, submitLabel, onSubmit }: VenueFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: initial ?? empty,
  })

  const facilities = watch('facilities')

  function toggleFacility(value: VenueFormValues['facilities'][number]) {
    const next = facilities.includes(value)
      ? facilities.filter((item) => item !== value)
      : [...facilities, value]
    setValue('facilities', next, { shouldValidate: true })
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(event) =>
        void handleSubmit((values) => onSubmit(values))(event)
      }
    >
      <FormBanner message={error} />
      <TextField id="name" label="Nama venue" registration={register('name')} error={errors.name?.message} />
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink">
          Deskripsi
        </label>
        <textarea
          id="description"
          rows={4}
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-base text-ink focus:border-primary"
          {...register('description')}
        />
        {errors.description ? <p className="mt-1.5 text-sm text-taken">{errors.description.message}</p> : null}
      </div>
      <TextField id="address" label="Alamat" registration={register('address')} error={errors.address?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="city" label="Kota" registration={register('city')} error={errors.city?.message} />
        <TextField id="province" label="Provinsi" registration={register('province')} error={errors.province?.message} />
      </div>
      <TextField
        id="phone"
        label="Telepon venue"
        type="tel"
        registration={register('phone')}
        error={errors.phone?.message}
        hint="Contoh 081234567890."
      />
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-ink">
          Zona waktu
        </label>
        <select
          id="timezone"
          className="mt-1.5 w-full rounded-md border border-line bg-panel px-3 py-2.5.5 text-base text-ink focus:border-primary"
          {...register('timezone')}
        >
          {timezoneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.timezone ? <p className="mt-1.5 text-sm text-taken">{errors.timezone.message}</p> : null}
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-ink">Fasilitas</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {facilityOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={facilities.includes(option.value)}
                onChange={() => toggleFacility(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <SubmitButton pending={pending} idleLabel={submitLabel} pendingLabel="Menyimpan..." />
    </form>
  )
}
