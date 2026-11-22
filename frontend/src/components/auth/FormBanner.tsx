export function FormBanner({ message }: { message: string | null }) {
  if (!message) {
    return null
  }

  return (
    <p
      role="alert"
      className="rounded-md border border-taken bg-taken-soft px-3 py-2 text-sm text-taken"
    >
      {message}
    </p>
  )
}
