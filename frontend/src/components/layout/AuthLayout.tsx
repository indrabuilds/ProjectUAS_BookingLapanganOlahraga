import { SiteBrand } from '@/components/layout/SiteBrand'
import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-8 sm:py-12">
      <div className="surface-card w-full max-w-md rounded-xl p-6 sm:p-8">
        <div className="mb-6"><SiteBrand /></div>
        {children}
      </div>
    </main>
  )
}
