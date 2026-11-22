import { VenueCover } from '@/components/common/VenueCover'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fieldClass } from '@/components/ui/field'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { useMe } from '@/features/auth/hooks'
import { bookingNewPath } from '@/features/bookings/api'
import { getAvailability, getPublicVenue, type AvailabilitySlot } from '@/features/discovery/api'
import { slotLabel, slotTone } from '@/features/discovery/slotStyles'
import { dayNames, facilityOptions, formatIdr } from '@/features/venues/types'
import { cn } from '@/lib/cn'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Clock3, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function todayInput(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function VenuePublicPage() {
  const params = useParams()
  const venueId = Number(params.venueId)
  const validVenueId = Number.isInteger(venueId) && venueId > 0
  const me = useMe()
  const [date, setDate] = useState(todayInput)
  const [chosenCourt, setChosenCourt] = useState<{ venueId: number; courtId: number } | null>(null)
  const venue = useQuery({
    queryKey: ['public-venue', venueId],
    queryFn: () => getPublicVenue(venueId),
    enabled: validVenueId,
  })
  const courts = venue.data?.courts ?? []
  const selectedCourt = chosenCourt?.venueId === venueId ? chosenCourt.courtId : courts[0]?.id
  const availability = useQuery({
    queryKey: ['availability', selectedCourt, date],
    queryFn: () => getAvailability(selectedCourt as number, date),
    enabled: selectedCourt !== undefined && date !== '',
  })

  usePageTitle(venue.data?.name ?? 'Venue')

  if (validVenueId && venue.isPending) {
    return <AppShell><p role="status" className="text-ink-soft">Memuat venue...</p></AppShell>
  }

  if (!venue.data) {
    return (
      <AppShell>
        <h1 className="page-title">Venue tidak tersedia</h1>
        <p className="mt-2 text-ink-soft">Venue ini belum disetujui, sedang ditutup, atau tidak ada.</p>
        <Link to="/explore" className="mt-4 inline-flex text-sm font-medium text-primary">Kembali ke Jelajah</Link>
      </AppShell>
    )
  }

  const current = venue.data
  const cover = current.images?.[0]?.url ?? current.cover_image_url
  const remainingImages = current.images?.slice(1) ?? []
  const canBook = !me.isPending && (!me.data || me.data.role === 'customer')

  return (
    <AppShell>
      <Link to="/explore" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Kembali ke Jelajah
      </Link>
      <header className="surface-card mt-4 overflow-hidden rounded-xl">
        <VenueCover src={cover} sports={current.sports} className="h-44 sm:h-64" eager />
        <div className="flex flex-col items-start gap-2 p-5 sm:p-6">
          <Badge tone="open">Venue terverifikasi</Badge>
          <h1 className="page-title">{current.name}</h1>
          <p className="flex items-start gap-2 text-ink-soft">
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            {current.address}, {current.city}, {current.province}
          </p>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="section-title">Daftar Lapangan</h2>
        {courts.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <li key={court.id} className="surface-card flex flex-col items-start gap-3 overflow-hidden p-5">
                {court.image_url ? <img src={court.image_url} alt="" className="aspect-video w-full rounded-md object-cover" /> : null}
                {court.sport ? <Badge tone="open">{court.sport.name}</Badge> : null}
                <h3 className="text-base font-semibold">{court.name}</h3>
                <p className="font-semibold text-primary tabular-nums">{formatIdr(court.price_per_hour)}/jam</p>
                <Button tone="line" className="mt-auto w-full" onClick={() => {
                  setChosenCourt({ venueId, courtId: court.id })
                  document.getElementById('venue-availability')?.focus()
                }}>
                  <CalendarDays size={16} aria-hidden="true" /> Cek Ketersediaan
                </Button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-ink-soft">Venue ini belum punya lapangan aktif.</p>}
      </section>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[5fr_7fr]">
        <section className="surface-card p-5 sm:p-6">
          <h2 className="section-title">Jam Operasional</h2>
          <ul className="mt-3 divide-y divide-line">
            {current.operating_hours?.map((hour) => (
              <li key={hour.day_of_week} className="flex justify-between gap-3 py-2.5">
                <span>{dayNames[hour.day_of_week]}</span>
                <span className="text-ink-soft tabular-nums">
                  {hour.is_closed || hour.open_hour === null || hour.close_hour === null
                    ? 'Tutup'
                    : `${String(hour.open_hour).padStart(2, '0')}:00–${String(hour.close_hour).padStart(2, '0')}:00`}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft"><Clock3 size={14} aria-hidden="true" /> {current.timezone}</p>
        </section>
        <section className="surface-card space-y-4 p-5 sm:p-6">
          <h2 className="section-title">Tentang &amp; Fasilitas Venue</h2>
          <p className="whitespace-pre-line text-ink-soft">{current.description}</p>
          {current.phone ? <p className="flex items-center gap-2 text-ink-soft"><Phone size={15} aria-hidden="true" /> {current.phone}</p> : null}
          {current.facilities.length > 0 ? (
            <ul aria-label="Fasilitas" className="flex flex-wrap gap-2">
              {current.facilities.map((key) => (
                <li key={key}><Badge tone="quiet">{facilityOptions.find((item) => item.value === key)?.label ?? key}</Badge></li>
              ))}
            </ul>
          ) : null}
          {remainingImages.length > 0 ? (
            <ul aria-label="Foto venue" className="grid gap-3 sm:grid-cols-2">
              {remainingImages.map((image) => (
                <li key={image.id}><img src={image.url} alt="" className="h-32 w-full rounded-md object-cover" loading="lazy" /></li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      {courts.length > 0 ? (
        <section id="venue-availability" tabIndex={-1} className="surface-card mt-8 scroll-mt-32 p-5 sm:p-6" aria-labelledby="availability-title">
          <h2 id="availability-title" className="section-title">Ketersediaan Slot</h2>
          {!me.isPending && !me.data ? <p className="mt-2 text-ink-soft">Masuk sebagai pelanggan untuk mengajukan booking.</p> : null}
          {me.data && me.data.role !== 'customer' ? <p className="mt-2 text-ink-soft">Booking tersedia untuk akun pelanggan.</p> : null}
          <div className="mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
            <label className="font-medium">
              Lapangan
              <select value={selectedCourt ?? ''} onChange={(event) => setChosenCourt({ venueId, courtId: Number(event.target.value) })} className={fieldClass}>
                {courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
              </select>
            </label>
            <label className="min-w-0 font-medium">
              Tanggal
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
            </label>
          </div>
          {availability.isPending && date ? <p className="mt-4 text-ink-soft" role="status">Menghitung slot...</p> : null}
          {availability.isError ? <p className="mt-4 text-taken" role="alert">{apiErrorMessage(availability.error, 'Jadwal gagal dimuat.')}</p> : null}
          {availability.data?.is_closed ? <p className="mt-4 text-ink-soft">Venue tutup pada tanggal ini.</p> : null}
          {availability.data && !availability.data.is_closed ? (
            <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {availability.data.slots.map((slot) => (
                <li key={slot.start_hour}>
                  <SlotCell
                    slot={slot}
                    href={canBook && slot.status === 'available' && selectedCourt !== undefined
                      ? bookingNewPath(current.id, selectedCourt, date, slot.start_hour)
                      : null}
                    isCustomer={me.data?.role === 'customer'}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </AppShell>
  )
}

function SlotCell({ slot, href, isCustomer }: { slot: AvailabilitySlot; href: string | null; isCustomer: boolean }) {
  const className = cn('flex min-h-14 flex-col items-center justify-center rounded-md border p-2 text-center', slotTone[slot.status], href && 'hover:border-primary')
  const body = <><span className="font-semibold tabular-nums">{slot.label}</span><span className="text-xs">{slotLabel[slot.status]}</span></>

  if (!href) return <div className={className}>{body}</div>

  return <Link to={isCustomer ? href : '/login'} state={isCustomer ? undefined : { from: href }} className={className}>{body}</Link>
}
