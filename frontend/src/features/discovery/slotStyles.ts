import type { SlotStatus } from '@/features/discovery/api'

export const slotLabel: Record<SlotStatus, string> = {
  available: 'Tersedia',
  booked: 'Terisi',
  blocked: 'Diblokir',
  past: 'Lewat',
}

export const slotTone: Record<SlotStatus, string> = {
  available: 'border-primary/35 bg-primary-soft text-primary',
  booked: 'border-taken/20 bg-taken-soft text-taken',
  blocked: 'border-gold/45 bg-wait-soft text-wait',
  past: 'border-line bg-panel text-ink-soft',
}
