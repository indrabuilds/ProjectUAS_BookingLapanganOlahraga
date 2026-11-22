import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof buttonTones }

export function Button({ tone = 'open', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClass, buttonTones[tone], className)} {...props} />
}
