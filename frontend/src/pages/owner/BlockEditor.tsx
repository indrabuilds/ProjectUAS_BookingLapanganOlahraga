import { Button } from '@/components/ui/button'
import { fieldClass } from '@/components/ui/field'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { createBlock, deleteBlock, listBlocks } from '@/features/discovery/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function BlockEditor({ courtId, courtPicker }: { courtId: number; courtPicker?: ReactNode }) {
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [startHour, setStartHour] = useState(10)
  const [endHour, setEndHour] = useState(12)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const blocks = useQuery({
    queryKey: ['blocks', courtId],
    queryFn: () => listBlocks(courtId),
  })
  const save = useMutation({
    mutationFn: () => createBlock(courtId, { date, start_hour: startHour, end_hour: endHour, reason }),
    onSuccess: async () => {
      setReason('')
      await queryClient.invalidateQueries({ queryKey: ['blocks', courtId] })
    },
  })

  return (
    <section className="surface-card p-5 sm:p-6">
      <h2 className="section-title">Blokir Jadwal Lapangan</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Jam mengikuti zona waktu venue. Blokir ditolak jika masih ada booking aktif di jam itu.
      </p>
      {courtPicker}
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          setError(null)
          void save.mutateAsync().catch((caught: unknown) => {
            setError(apiErrorMessage(caught, 'Blokir gagal disimpan.'))
          })
        }}
      >
        <label className="text-sm text-ink">
          Tanggal
          <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm text-ink">
          Alasan
          <input required value={reason} onChange={(event) => setReason(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm text-ink">
          Jam mulai
          <input type="number" min={0} max={23} value={startHour} onChange={(event) => setStartHour(Number(event.target.value))} className={fieldClass} />
        </label>
        <label className="text-sm text-ink">
          Jam selesai
          <input type="number" min={1} max={24} value={endHour} onChange={(event) => setEndHour(Number(event.target.value))} className={fieldClass} />
        </label>
        {error ? <p className="text-sm text-taken sm:col-span-2">{error}</p> : null}
        <Button type="submit" disabled={save.isPending} className="sm:col-span-2">
          {save.isPending ? 'Menyimpan...' : 'Simpan blokir'}
        </Button>
      </form>
      {blocks.isError ? <p role="alert" className="mt-3 text-taken">{apiErrorMessage(blocks.error, 'Jadwal yang diblokir gagal dimuat.')}</p> : null}
      <ul className="mt-4 divide-y divide-line text-sm text-ink">
        {blocks.data?.map((block) => (
          <li key={block.id} className="flex items-center justify-between gap-3 py-2.5">
            <span>
              {block.date} {String(block.start_hour).padStart(2, '0')}:00-{String(block.end_hour).padStart(2, '0')}:00 · {block.reason}
            </span>
            <button
              type="button"
              className="text-taken"
              onClick={() => {
                setError(null)
                void deleteBlock(block.id)
                  .then(() => queryClient.invalidateQueries({ queryKey: ['blocks', courtId] }))
                  .catch((caught: unknown) => setError(apiErrorMessage(caught, 'Blokir gagal dihapus.')))
              }}
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {blocks.data && blocks.data.length === 0 ? <p className="mt-3 text-sm text-ink-soft">Belum ada blokir.</p> : null}
    </section>
  )
}
