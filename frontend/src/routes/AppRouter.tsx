import { setUnauthorizedHandler } from '@/lib/axios'
import { AdminBookingDetailPage } from '@/pages/admin/AdminBookingDetailPage'
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage'
import { AdminHomePage } from '@/pages/admin/AdminHomePage'
import { AdminSportsPage } from '@/pages/admin/AdminSportsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminVenueDetailPage } from '@/pages/admin/AdminVenueDetailPage'
import { AdminVenueListPage } from '@/pages/admin/AdminVenueListPage'
import { AccountPage } from '@/pages/auth/AccountPage'
import { ForbiddenPage } from '@/pages/auth/ForbiddenPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { BookingFormPage } from '@/pages/customer/BookingFormPage'
import { CustomerHomePage } from '@/pages/customer/CustomerHomePage'
import { MyBookingsPage } from '@/pages/customer/MyBookingsPage'
import { CourtFormPage } from '@/pages/owner/CourtFormPage'
import { OwnerBookingsPage } from '@/pages/owner/OwnerBookingsPage'
import { OwnerHomePage } from '@/pages/owner/OwnerHomePage'
import { VenueCreatePage } from '@/pages/owner/VenueCreatePage'
import { VenueDetailPage } from '@/pages/owner/VenueDetailPage'
import { VenueListPage } from '@/pages/owner/VenueListPage'
import { ExplorePage } from '@/pages/public/ExplorePage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { VenuePublicPage } from '@/pages/public/VenuePublicPage'
import { GuestOnly, RequireAuth, RequireRole } from '@/routes/guards'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'

function AuthEvents() {
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      navigate('/login', { replace: true })
    })
  }, [navigate])

  return null
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthEvents />
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/dashboard" element={<Navigate to="/customer" replace />} />
        <Route path="/profile" element={<Navigate to="/account" replace />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/venues/:venueId" element={<VenuePublicPage />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/customer"
          element={
            <RequireAuth>
              <RequireRole role="customer">
                <CustomerHomePage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/bookings/new"
          element={
            <RequireAuth>
              <RequireRole role="customer">
                <BookingFormPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <RequireAuth>
              <RequireRole role="customer">
                <MyBookingsPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <OwnerHomePage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner/bookings"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <OwnerBookingsPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner/venues"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <VenueListPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner/venues/new"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <VenueCreatePage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner/venues/:venueId"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <VenueDetailPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner/venues/:venueId/courts/new"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <CourtFormPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner/venues/:venueId/courts/:courtId"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <CourtFormPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminHomePage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminUsersPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/sports"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminSportsPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminBookingsPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/bookings/:bookingId"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminBookingDetailPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/venues"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminVenueListPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/venues/:venueId"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminVenueDetailPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
