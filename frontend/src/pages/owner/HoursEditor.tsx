import { apiErrorMessage } from '@/features/auth/formErrors'
import { saveOperatingHours, type PublicHour } from '@/features/discovery/api'
import { dayNames } from '@/features/venues/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

type HoursEditorProps = {
  venueId: number
  hours: PublicHour[]
}

// Mengubah jam tidak membatalkan booking yang sudah ada.
export function HoursEditor({ venueId, hours }: HoursEditorProps) {
  const queryClient = useQueryClient()
  const [days, setDays] = useState<PublicHour[]>(hours)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: () => saveOperatingHours(venueId, days),
    onSuccess: async (saved) => {
      setDays(saved)
      setMessage('Jam operasional disimpan.')
      await queryClient.invalidateQueries({ queryKey: ['owner-venues', venueId] })
    },
  })

  function update(index: number, patch: Partial<PublicHour>) {
    setDays((current) => current.map((day, i) => (i === index ? { ...day, ...patch } : day)))
  }

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)
        setMessage(null)
        void save.mutateAsync().catch((caught: unknown) => {
          setError(apiErrorMessage(caught, 'Jam gagal disimpan.'))
        })
      }}
    >
      {days.map((day, index) => (
        <div key={day.day_of_week} className="grid grid-cols-[1fr_1fr] items-center gap-2 border-b border-line pb-3 sm:grid-cols-[4rem_auto_1fr_1fr]">
          <span className="text-sm font-medium text-ink">{dayNames[day.day_of_week]}</span>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={day.is_closed}
              onChange={(event) => update(index, { is_closed: event.target.checked })}
            />
            Tutup
          </label>
          <label className="text-sm text-ink-soft">
            Buka
            <input
              type="number"
              min={0}
              max={23}
              disabled={day.is_closed}
              value={day.open_hour ?? ''}
              onChange={(event) => update(index, { open_hour: Number(event.target.value) })}
              className="mt-1 w-full rounded-md border border-line bg-panel px-2 py-1.5 disabled:opacity-50"
            />
          </label>
          <label className="text-sm text-ink-soft">
            Tutup jam
            <input
              type="number"
              min={1}
              max={24}
              disabled={day.is_closed}
              value={day.close_hour ?? ''}
              onChange={(event) => update(index, { close_hour: Number(event.target.value) })}
              className="mt-1 w-full rounded-md border border-line bg-panel px-2 py-1.5 disabled:opacity-50"
            />
          </label>
        </div>
      ))}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {error ? <p className="text-sm text-taken">{error}</p> : null}
      <button
        type="submit"
        disabled={save.isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-inverse disabled:opacity-60"
      >
        {save.isPending ? 'Menyimpan...' : 'Simpan jam'}
      </button>
    </form>
  )
}
