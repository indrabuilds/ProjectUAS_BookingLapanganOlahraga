import { SiteHeader } from '@/components/layout/SiteHeader'
import { usePageTitle } from '@/lib/usePageTitle'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  usePageTitle('Tidak ditemukan')

  return (
    <div className="min-h-screen bg-panel text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="page-title">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Tautan yang Anda buka tidak tersedia.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-inverse"
        >
          Kembali ke beranda
        </Link>
      </main>
    </div>
  )
}
