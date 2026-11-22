export function StatReadout({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="surface-card flex min-w-0 flex-col gap-1.5 p-4 sm:p-5">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <span className="font-display text-[1.875rem]/[1.2] font-semibold text-primary tabular-nums">{value}</span>
    </div>
  )
}
