import courtIllustration from '@/assets/court-illustration.webp'
import { cn } from '@/lib/cn'
import { ImageOff } from 'lucide-react'

export function VenueCover({ src, sports, className, eager = false }: {
  src?: string | null
  sports: { slug: string }[]
  className?: string
  eager?: boolean
}) {
  const illustration = !src && sports.some((sport) => sport.slug === 'futsal')
  const cover = src || (illustration ? courtIllustration : null)

  return (
    <div className={cn('relative grid w-full place-items-center overflow-hidden bg-panel', className)}>
      {cover ? (
        <img src={cover} alt="" className="absolute inset-0 size-full object-cover" loading={eager ? 'eager' : 'lazy'} />
      ) : (
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <ImageOff size={18} aria-hidden="true" /> Foto belum tersedia
        </div>
      )}
      {illustration ? <span className="absolute right-3 bottom-3 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-ink">Ilustrasi</span> : null}
    </div>
  )
}
