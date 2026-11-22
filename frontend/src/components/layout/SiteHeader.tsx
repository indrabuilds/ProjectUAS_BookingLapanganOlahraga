import { SiteBrand } from '@/components/layout/SiteBrand'
import { Button } from '@/components/ui/button'
import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { useLogout, useMe } from '@/features/auth/hooks'
import { homePathForRole, roleLabel } from '@/features/auth/paths'
import { cn } from '@/lib/cn'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

const portalLinks = {
  owner: [['/owner', 'Dashboard'], ['/owner/venues', 'Venue & Court'], ['/owner/bookings', 'Pesanan Masuk'], ['/account', 'Pengaturan']],
  admin: [['/admin', 'Dashboard'], ['/admin/venues', 'Verifikasi Venue'], ['/admin/sports', 'Kategori'], ['/admin/users', 'Pengguna'], ['/admin/bookings', 'Booking'], ['/account', 'Pengaturan']],
}

const navLinkClass = 'inline-flex items-center border-b-2 pb-1 text-sm font-medium transition-colors duration-120 hover:text-primary'
const navLinkState = (active: boolean) => active
  ? 'border-primary font-semibold text-primary'
  : 'border-transparent text-ink-soft'

function MarketplaceHeader({ profilePath, schedulePath }: { profilePath: string; schedulePath: string }) {
  const { pathname, search } = useLocation()
  const exploring = pathname === '/' || pathname === '/explore'
  const entries = [
    { to: '/explore', title: 'Jelajah', active: exploring },
    { to: schedulePath, title: 'Jadwal', active: pathname === schedulePath },
    { to: profilePath, title: 'Profil', active: pathname === profilePath },
    { to: '/account', title: 'Pengaturan', active: pathname === '/account' },
  ]
  const bookingPath = exploring ? `${pathname}${search}#pencarian-venue` : '/explore#pencarian-venue'

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-8">
        <SiteBrand to="/explore" />
        <nav aria-label="Navigasi utama" className="order-last flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:order-none sm:w-auto sm:justify-start md:gap-x-8">
          {entries.map(({ to, title, active }) => (
            <Link key={title} to={to} aria-current={active ? 'page' : undefined} className={cn(navLinkClass, navLinkState(active))}>
              {title}
            </Link>
          ))}
        </nav>
        <Link
          to={bookingPath}
          className={cn(buttonClass, buttonTones.open, 'shrink-0 px-5 py-2.5')}
          onClick={() => {
            if (exploring) document.getElementById('pencarian-venue')?.focus()
          }}
        >
          Buat Booking
        </Link>
      </div>
    </header>
  )
}

export function SiteHeader() {
  const { data: user } = useMe()
  const logout = useLogout()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const role = user?.role
  const staff = role === 'owner' || role === 'admin' ? role : undefined
  const inPortal = staff && (
    pathname === `/${staff}` || pathname.startsWith(`/${staff}/`) || pathname === '/account'
  )

  if (!inPortal || !staff) {
    return (
      <MarketplaceHeader
        profilePath={staff ? homePathForRole(staff) : '/customer'}
        schedulePath={staff ? `/${staff}/bookings` : '/customer/bookings'}
      />
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <SiteBrand to={homePathForRole(staff)} />
          <span className="hidden rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary sm:inline">{roleLabel(staff)}</span>
        </div>
        <nav aria-label="Navigasi utama" className="order-last flex w-full flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-5 lg:order-none lg:w-auto">
          {portalLinks[staff].map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === `/${staff}`}
              className={({ isActive }) => cn(navLinkClass, navLinkState(isActive))}
            >
              {label}
            </NavLink>
          ))}
          <Link to="/explore" className={cn(navLinkClass, navLinkState(false))}>Jelajah</Link>
        </nav>
        <div className="flex items-center gap-2">
          {staff === 'owner' ? (
            <Link to="/owner/venues/new" className={cn(buttonClass, buttonTones.open, 'hidden sm:inline-flex')}>Tambah Venue</Link>
          ) : null}
          {pathname !== '/account' ? (
            <Button
              tone="ghost"
              onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })}
              disabled={logout.isPending}
            >
              {logout.isPending ? 'Keluar...' : 'Keluar'}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
