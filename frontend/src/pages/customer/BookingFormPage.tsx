import { FormBanner } from '@/components/auth/FormBanner'
import { fieldClass } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { createBooking, statusLabel, type Booking } from '@/features/bookings/api'
import { getAvailability, getPublicVenue } from '@/features/discovery/api'
import { slotLabel, slotTone } from '@/features/discovery/slotStyles'
import { formatIdr } from '@/features/venues/types'
import { cn } from '@/lib/cn'
import { usePageTitle } from '@/lib/usePageTitle'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

const bookingSchema = z.object({
  duration_hours: z.number().int().min(1, 'Pilih 1 sampai 4 jam.').max(4, 'Pilih 1 sampai 4 jam.'),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter.'),
})

type BookingValues = z.infer<typeof bookingSchema>

function readParams(params: URLSearchParams): { venueId: number; courtId: number; date: string; hour: number } | null {
  const venueId = Number(params.get('venue'))
  const courtId = Number(params.get('court'))
  const hourValue = params.get('hour')
  const hour = Number(hourValue)
  const date = params.get('date') ?? ''
  if (!Number.isInteger(venueId) || venueId < 1 || !Number.isInteger(courtId) || courtId < 1 || hourValue === null || !/^\d{1,2}$/.test(hourValue)) {
    return null
  }
  if (hour < 0 || hour > 23 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }

  return { venueId, courtId, date, hour }
}

export function BookingFormPage() {
  usePageTitle('Ajukan booking')
  const [params, setParams] = useSearchParams()
  const selection = readParams(params)
  const venue = useQuery({
    queryKey: ['public-venue', selection?.venueId],
    queryFn: () => getPublicVenue(selection?.venueId as number),
    enabled: selection !== null,
  })
  const court = venue.data?.courts?.find((item) => item.id === selection?.courtId) ?? null
  const availability = useQuery({
    queryKey: ['availability', selection?.courtId, selection?.date],
    queryFn: () => getAvailability(selection!.courtId, selection!.date),
    enabled: selection !== null && court !== null,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [created, setCreated] = useState<Booking | null>(null)
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { duration_hours: 1, notes: '' },
  })
  const duration = useWatch({ control: form.control, name: 'duration_hours' })
  const submit = useMutation({
    mutationFn: (values: BookingValues) =>
      createBooking({
        court_id: selection?.courtId as number,
        date: selection?.date as string,
        start_hour: selection?.hour as number,
        duration_hours: values.duration_hours,
        notes: values.notes.trim() === '' ? null : values.notes.trim(),
      }),
    onSuccess: (booking) => {
      setCreated(booking)
      setFormError(null)
    },
    onError: (error) => {
      setFormError(apiErrorMessage(error, 'Booking gagal diajukan.'))
    },
  })

  if (!selection) {
    return (
      <AppShell>
        <h1 className="page-title">Slot belum dipilih</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          Pilih jam kosong di halaman venue. Formulir ini tidak menerima harga atau status dari halaman.
        </p>
        <Link to="/explore" className="mt-4 inline-flex text-sm font-medium text-primary">
          Cari lapangan
        </Link>
      </AppShell>
    )
  }

  const selectedSlot = availability.data?.slots.find((slot) => slot.start_hour === selection.hour)
  const date = new Date(`${selection.date}T00:00:00Z`)
  const dateLabel = Number.isNaN(date.getTime())
    ? selection.date
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'UTC' }).format(date)

  return (
    <AppShell>
      <Link to={`/venues/${selection.venueId}`} className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Kembali ke venue
      </Link>
      <h1 className="page-title mt-3">Cek Ketersediaan &amp; Buat Booking</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">Pilih jam yang tersedia dan ajukan permintaan kepada pemilik venue.</p>

      {venue.isPending ? <p className="mt-6 text-ink-soft" role="status">Memuat lapangan...</p> : null}
      {venue.isError || (venue.data && !court) ? (
        <p className="mt-6 text-taken" role="alert">Lapangan ini tidak bisa dipesan dari halaman publik.</p>
      ) : null}

      {court && !created ? (
        <form className="mt-8 grid items-start gap-6 lg:grid-cols-[7fr_5fr]" onSubmit={(event) => void form.handleSubmit((values) => submit.mutate(values))(event)} noValidate>
          <section className="surface-card space-y-5 p-5 sm:p-6" aria-labelledby="booking-availability">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-panel p-3">
                <dt className="text-xs font-medium text-ink-soft">Lapangan</dt>
                <dd className="mt-1 font-semibold">{court.name}</dd>
              </div>
              <div className="rounded-md bg-panel p-3">
                <dt className="text-xs font-medium text-ink-soft">Tanggal</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold"><CalendarDays size={15} aria-hidden="true" />{dateLabel}</dd>
              </div>
            </dl>
            <h2 id="booking-availability" className="section-title">Ketersediaan Slot</h2>
            {availability.isPending ? <p role="status" className="text-ink-soft">Memuat slot...</p> : null}
            {availability.isError ? <p role="alert" className="text-taken">{apiErrorMessage(availability.error, 'Jadwal gagal dimuat.')}</p> : null}
            {availability.data?.is_closed ? <p className="text-ink-soft">Venue tutup pada tanggal ini.</p> : null}
            {availability.data && !availability.data.is_closed ? (
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {availability.data.slots.map((slot) => (
                  <li key={slot.start_hour}>
                    <button
                      type="button"
                      disabled={slot.status !== 'available' || submit.isPending}
                      aria-pressed={slot.start_hour === selection.hour}
                      onClick={() => {
                        const next = new URLSearchParams(params)
                        next.set('hour', String(slot.start_hour))
                        setFormError(null)
                        setParams(next, { replace: true })
                      }}
                      className={cn('flex min-h-14 w-full flex-col items-center justify-center rounded-md border px-2 py-2', slotTone[slot.status], 'enabled:hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-on-primary')}
                    >
                      <span className="font-semibold tabular-nums">{slot.label}</span>
                      <span className="text-xs">{slotLabel[slot.status]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <aside className="surface-card space-y-5 p-5 sm:p-6" aria-labelledby="booking-summary">
            <h2 id="booking-summary" className="section-title">Ringkasan Pengajuan</h2>
            <dl className="space-y-2 rounded-md bg-panel p-4">
              <div className="flex justify-between gap-3"><dt className="text-ink-soft">Venue</dt><dd className="text-right font-semibold">{venue.data?.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-soft">Mulai</dt><dd className="text-right font-semibold tabular-nums">{selectedSlot?.label ?? `${String(selection.hour).padStart(2, '0')}:00`}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-soft">Tarif</dt><dd className="text-right font-semibold tabular-nums">{formatIdr(court.price_per_hour)}/jam</dd></div>
            </dl>
            <FormBanner message={formError} />
            <label className="block font-medium" htmlFor="duration_hours">
              Durasi
              <select id="duration_hours" className={fieldClass} {...form.register('duration_hours', { valueAsNumber: true })}>
                <option value={1}>1 jam</option>
                <option value={2}>2 jam</option>
                <option value={3}>3 jam</option>
                <option value={4}>4 jam</option>
              </select>
              {form.formState.errors.duration_hours ? <span className="mt-1 block text-taken">{form.formState.errors.duration_hours.message}</span> : null}
            </label>
            <label className="block font-medium" htmlFor="notes">
              Catatan <span className="font-normal text-ink-soft">(opsional)</span>
              <textarea id="notes" rows={3} maxLength={500} className={fieldClass} {...form.register('notes')} />
              {form.formState.errors.notes ? <span className="mt-1 block text-taken">{form.formState.errors.notes.message}</span> : null}
            </label>
            <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
              <span className="font-semibold">Perkiraan total</span>
              <span className="font-display text-xl font-semibold text-primary tabular-nums">{formatIdr(Number(court.price_per_hour) * (Number.isFinite(duration) ? duration : 1))}</span>
            </div>
            <p className="text-xs text-ink-soft">Total akhir dihitung saat diajukan. Booking menunggu konfirmasi pemilik venue.</p>
            <Button type="submit" className="w-full" disabled={submit.isPending || selectedSlot?.status !== 'available'}>
              {submit.isPending ? 'Mengajukan...' : 'Ajukan Booking'}
            </Button>
          </aside>
        </form>
      ) : null}

      {created ? (
        <section className="surface-card mt-6 max-w-xl space-y-3 p-6" role="status">
          <h2 className="section-title flex items-center gap-2"><CheckCircle2 size={22} className="text-primary" aria-hidden="true" /> Booking {created.code} diajukan</h2>
          <p>Status {statusLabel(created.status)} · {created.local.date} {created.local.start}–{created.local.end} ({created.local.timezone}).</p>
          <p className="font-semibold text-primary tabular-nums">Total {formatIdr(created.total_price)}</p>
          <p className="text-ink-soft">Pemilik venue perlu mengonfirmasi sebelum batas waktu pengajuan habis.</p>
          <Link to="/customer/bookings" className={cn(buttonClass, buttonTones.open, 'mt-2')}>Lihat Jadwal Saya</Link>
        </section>
      ) : null}
    </AppShell>
  )
}
