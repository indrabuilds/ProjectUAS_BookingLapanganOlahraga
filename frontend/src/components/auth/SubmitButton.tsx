import { Button } from '@/components/ui/button'

type SubmitButtonProps = {
  pending: boolean
  idleLabel: string
  pendingLabel: string
}

export function SubmitButton({ pending, idleLabel, pendingLabel }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? pendingLabel : idleLabel}
    </Button>
  )
}
