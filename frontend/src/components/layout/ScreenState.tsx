import { SiteHeader } from '@/components/layout/SiteHeader'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
        <p className="text-sm text-ink">Memeriksa sesi akun...</p>
        <div className="mt-6 h-8 w-48 rounded-lg bg-line" />
        <div className="mt-4 h-4 w-full max-w-md rounded bg-line" />
        <div className="mt-2 h-4 w-2/3 rounded bg-line" />
      </main>
    </div>
  )
}

export function LoadErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="section-title">
          Sesi tidak bisa dicek
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Server tidak menjawab. Pastikan API berjalan di localhost:8000, lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-panel hover:bg-inverse"
        >
          Coba lagi
        </button>
      </main>
    </div>
  )
}
