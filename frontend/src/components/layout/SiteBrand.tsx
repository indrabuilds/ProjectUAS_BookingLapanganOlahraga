import soccerIcon from '@/assets/material-symbols/sports-soccer.svg'
import { Link } from 'react-router-dom'

export function SiteBrand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex shrink-0 items-center gap-2.5 font-display text-lg font-semibold text-primary">
      <span className="grid size-8 place-items-center rounded-md bg-primary text-on-primary">
        <img src={soccerIcon} className="size-5" alt="" aria-hidden="true" />
      </span>
      SportsCourt
    </Link>
  )
}
