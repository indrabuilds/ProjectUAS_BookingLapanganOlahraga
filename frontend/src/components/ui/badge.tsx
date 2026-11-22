import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

const tones = {
  open: 'bg-open-soft text-open',
  wait: 'bg-wait-soft text-wait',
  taken: 'bg-taken-soft text-taken',
  ink: 'bg-inverse text-paper',
  quiet: 'bg-paper text-ink-soft',
}

export function Badge({
  tone = 'quiet',
  children,
}: {
  tone?: keyof typeof tones
  children: ReactNode
}) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>
      {children}
    </span>
  )
}
