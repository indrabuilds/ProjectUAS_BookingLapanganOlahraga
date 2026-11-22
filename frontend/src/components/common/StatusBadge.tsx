import { Badge } from '@/components/ui/badge'
import { statusLabel as bookingLabel, type BookingStatus } from '@/features/bookings/api'
import { statusLabel as venueLabel, type VenueStatus } from '@/features/venues/types'

function bookingTone(status: BookingStatus): 'open' | 'wait' | 'taken' | 'quiet' | 'ink' {
  if (status === 'confirmed' || status === 'completed') return 'open'
  if (status === 'pending') return 'wait'
  if (status === 'rejected' || status === 'cancelled') return 'taken'
  return 'quiet'
}

export function BookingBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={bookingTone(status)}>{bookingLabel(status)}</Badge>
}

export function VenueBadge({ status }: { status: VenueStatus }) {
  const tone = status === 'approved' ? 'open' : status === 'pending_verification' ? 'wait' : status === 'rejected' || status === 'suspended' ? 'taken' : 'quiet'
  return <Badge tone={tone}>{venueLabel(status)}</Badge>
}
