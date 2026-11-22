import { SiteHeader } from '@/components/layout/SiteHeader'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

export function AppShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className={cn('mx-auto w-full flex-1 px-4 py-7 sm:px-8 sm:py-8', compact ? 'max-w-[920px]' : 'max-w-[1200px]')}>
        {children}
      </main>
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-x-6 gap-y-1 px-4 py-5 text-xs text-ink-soft sm:px-8">
          <span>SportsCourt · Pemesanan lapangan olahraga</span>
          <span>IDR · Indonesia</span>
        </div>
      </footer>
    </div>
  )
}
