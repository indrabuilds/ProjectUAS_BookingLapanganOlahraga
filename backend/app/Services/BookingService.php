<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Enums\VenueStatus;
use App\Exceptions\BookingException;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\Court;
use App\Models\CourtBlock;
use App\Models\User;
use App\Support\VenueClock;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// Harga, slot, dan status hanya diubah di sini, di dalam transaksi yang mengunci court.
class BookingService
{
    /**
     * @param  array{court_id: int, date: string, start_hour: int, duration_hours: int, notes?: string|null}  $input
     */
    public function create(User $customer, array $input): Booking
    {
        return DB::transaction(function () use ($customer, $input) {
            $court = Court::query()->whereKey($input['court_id'])->lockForUpdate()->first();
            if ($court === null) {
                throw new BookingException('COURT_NOT_BOOKABLE', 'Lapangan tidak bisa dipesan.');
            }

            $court->load('venue.owner', 'sport');
            $this->assertBookable($court);

            $timezone = $court->venue->timezone;
            $day = VenueClock::localDay($input['date'], $timezone);
            $this->assertHorizon($day, $timezone);

            $startLocal = VenueClock::atHour($day, (int) $input['start_hour']);
            $endLocal = $startLocal->addHours((int) $input['duration_hours']);
            if ($endLocal->toDateString() !== $day->toDateString() && ! ($endLocal->format('H:i') === '00:00')) {
                throw new BookingException('BOOKING_OUTSIDE_OPERATING_HOURS', 'Booking tidak boleh melewati tengah malam.');
            }

            $startUtc = VenueClock::toUtc($startLocal);
            $endUtc = VenueClock::toUtc($endLocal);
            if ($startUtc->lessThanOrEqualTo(CarbonImmutable::now('UTC'))) {
                throw new BookingException('BOOKING_IN_PAST', 'Jam mulai sudah lewat.');
            }

            $this->assertInsideHours($court, $day, (int) $input['start_hour'], (int) $input['duration_hours']);
            $this->assertNoBlock($court, $startUtc, $endUtc);
            $this->assertNoBooking($court, $startUtc, $endUtc);

            $price = number_format((float) $court->price_per_hour, 2, '.', '');
            $total = bcmul($price, (string) $input['duration_hours'], 2);
            $expires = CarbonImmutable::now('UTC')->addMinutes((int) config('sportscourt.booking.pending_ttl_minutes'));
            if ($expires->greaterThan($startUtc)) {
                $expires = $startUtc;
            }

            $booking = Booking::query()->create([
                'code' => $this->code(),
                'user_id' => $customer->id,
                'court_id' => $court->id,
                'start_at' => $startUtc,
                'end_at' => $endUtc,
                'price_per_hour' => $price,
                'total_price' => $total,
                'status' => BookingStatus::Pending,
                'expires_at' => $expires,
                'notes' => $input['notes'] ?? null,
            ]);

            $this->history($booking, null, BookingStatus::Pending, $customer, null);

            return $booking->load('court.venue', 'court.sport', 'user');
        }, 3);
    }

    public function confirm(User $owner, Booking $booking): Booking
    {
        return $this->change($booking, function (Booking $locked) use ($owner) {
            $this->assertOwner($owner, $locked);
            if ($locked->expires_at !== null && $locked->expires_at->lessThanOrEqualTo(now())) {
                throw new BookingException('BOOKING_INVALID_TRANSITION', 'Booking sudah kedaluwarsa.', 409);
            }

            $this->move($locked, BookingStatus::Confirmed, $owner, null);
        });
    }

    public function reject(User $owner, Booking $booking, ?string $reason): Booking
    {
        return $this->change($booking, function (Booking $locked) use ($owner, $reason) {
            $this->assertOwner($owner, $locked);
            $this->move($locked, BookingStatus::Rejected, $owner, $reason);
        });
    }

    public function cancelByCustomer(User $customer, Booking $booking, ?string $reason): Booking
    {
        return $this->change($booking, function (Booking $locked) use ($customer, $reason) {
            if ($locked->user_id !== $customer->id) {
                throw new BookingException('BOOKING_INVALID_TRANSITION', 'Booking ini bukan milik Anda.', 404);
            }

            $this->assertCustomerMayCancel($locked);
            $this->move($locked, BookingStatus::Cancelled, $customer, $reason);
        });
    }

    public function cancelByOwner(User $owner, Booking $booking, string $reason): Booking
    {
        return $this->change($booking, function (Booking $locked) use ($owner, $reason) {
            $this->assertOwner($owner, $locked);
            if ($locked->status !== BookingStatus::Confirmed || $locked->start_at->lessThanOrEqualTo(now())) {
                throw new BookingException('BOOKING_INVALID_TRANSITION', 'Booking confirmed hanya bisa dibatalkan sebelum jam mulai.', 409);
            }

            $this->move($locked, BookingStatus::Cancelled, $owner, $reason);
        });
    }

    public function expireDue(): int
    {
        return $this->sweep(
            Booking::query()->where('status', BookingStatus::Pending)->where('expires_at', '<=', now())->pluck('id'),
            BookingStatus::Expired,
        );
    }

    public function completeDue(): int
    {
        return $this->sweep(
            Booking::query()->where('status', BookingStatus::Confirmed)->where('end_at', '<=', now())->pluck('id'),
            BookingStatus::Completed,
        );
    }

    public function canCancel(User $user, Booking $booking): bool
    {
        if ($user->id === $booking->user_id) {
            try {
                $this->assertCustomerMayCancel($booking);

                return true;
            } catch (BookingException) {
                return false;
            }
        }

        $booking->loadMissing('court.venue');

        return $user->role === UserRole::Owner
            && $booking->court?->venue?->owner_id === $user->id
            && $booking->status === BookingStatus::Confirmed
            && $booking->start_at->greaterThan(now());
    }

    private function change(Booking $booking, callable $callback): Booking
    {
        return DB::transaction(function () use ($booking, $callback) {
            $locked = Booking::query()->whereKey($booking->id)->lockForUpdate()->firstOrFail();
            $callback($locked);

            return $locked->fresh(['court.venue', 'court.sport', 'user']);
        }, 3);
    }

    private function move(Booking $booking, BookingStatus $to, ?User $actor, ?string $reason): void
    {
        $from = $booking->status;
        if (! $from->canTransitionTo($to)) {
            throw new BookingException('BOOKING_INVALID_TRANSITION', 'Perubahan status booking tidak diizinkan.', 409);
        }

        $booking->status = $to;
        if ($to !== BookingStatus::Pending) {
            $booking->expires_at = null;
        }
        $booking->save();
        $this->history($booking, $from, $to, $actor, $reason);
    }

    /**
     * @param  Collection<int, int>  $ids
     */
    private function sweep(Collection $ids, BookingStatus $to): int
    {
        $count = 0;
        foreach ($ids as $id) {
            DB::transaction(function () use ($id, $to, &$count): void {
                $locked = Booking::query()->whereKey($id)->lockForUpdate()->first();
                if ($locked === null || ! $locked->status->canTransitionTo($to)) {
                    return;
                }

                if ($to === BookingStatus::Expired && ($locked->status !== BookingStatus::Pending || $locked->expires_at === null || $locked->expires_at->greaterThan(now()))) {
                    return;
                }

                if ($to === BookingStatus::Completed && ($locked->status !== BookingStatus::Confirmed || $locked->end_at->greaterThan(now()))) {
                    return;
                }

                $this->move($locked, $to, null, null);
                $count++;
            });
        }

        return $count;
    }

    private function assertBookable(Court $court): void
    {
        $venue = $court->venue;
        $ok = $court->is_active
            && $venue !== null
            && $venue->status === VenueStatus::Approved
            && $venue->is_active
            && $venue->owner?->status === UserStatus::Active;

        if (! $ok) {
            throw new BookingException('COURT_NOT_BOOKABLE', 'Lapangan tidak bisa dipesan.');
        }
    }

    private function assertHorizon(CarbonImmutable $day, string $timezone): void
    {
        $today = CarbonImmutable::now($timezone)->startOfDay();
        $last = $today->addDays((int) config('sportscourt.booking.max_days_ahead'));
        if ($day->lt($today)) {
            throw new BookingException('BOOKING_IN_PAST', 'Tanggal booking sudah lewat.');
        }
        if ($day->gt($last)) {
            throw new BookingException('BOOKING_BEYOND_HORIZON', 'Tanggal booking terlalu jauh.');
        }
    }

    private function assertInsideHours(Court $court, CarbonImmutable $day, int $startHour, int $duration): void
    {
        $hours = $court->venue->operatingHours()->where('day_of_week', $day->dayOfWeekIso)->first();
        $endHour = $startHour + $duration;
        $fits = $hours !== null
            && ! $hours->is_closed
            && $hours->open_hour !== null
            && $hours->close_hour !== null
            && $startHour >= (int) $hours->open_hour
            && $endHour <= (int) $hours->close_hour;

        if (! $fits) {
            throw new BookingException('BOOKING_OUTSIDE_OPERATING_HOURS', 'Jam booking di luar jam buka venue.');
        }
    }

    private function assertNoBlock(Court $court, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $blocked = CourtBlock::query()
            ->where('court_id', $court->id)
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->exists();

        if ($blocked) {
            throw new BookingException('BOOKING_SLOT_UNAVAILABLE', 'Jam tersebut sedang diblokir.', 409);
        }
    }

    private function assertNoBooking(Court $court, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $taken = Booking::query()
            ->where('court_id', $court->id)
            ->holdingSlot()
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->lockForUpdate()
            ->exists();

        if ($taken) {
            throw new BookingException('BOOKING_SLOT_UNAVAILABLE', 'Jam tersebut sudah dipesan.', 409);
        }
    }

    private function assertOwner(User $owner, Booking $booking): void
    {
        $booking->loadMissing('court.venue');
        if ($owner->role !== UserRole::Owner || $booking->court?->venue?->owner_id !== $owner->id) {
            throw new BookingException('BOOKING_INVALID_TRANSITION', 'Booking tidak ditemukan.', 404);
        }
    }

    private function assertCustomerMayCancel(Booking $booking): void
    {
        // Zona waktu venue dipakai untuk pesan batas batal, jadi relasinya harus ada.
        $booking->loadMissing('court.venue');

        if ($booking->start_at->lessThanOrEqualTo(now()) || ! $booking->status->canTransitionTo(BookingStatus::Cancelled)) {
            throw new BookingException('BOOKING_INVALID_TRANSITION', 'Booking tidak bisa dibatalkan.', 409);
        }

        if ($booking->status === BookingStatus::Confirmed) {
            $cutoff = CarbonImmutable::instance($booking->start_at)
                ->subHours((int) config('sportscourt.booking.cancel_cutoff_hours'));
            if (CarbonImmutable::now('UTC')->greaterThan($cutoff)) {
                throw new BookingException('BOOKING_CANCEL_CUTOFF_PASSED', 'Pembatalan paling lambat '.$cutoff->timezone($booking->court->venue->timezone ?? 'UTC')->format('d M Y H:i').'.');
            }
        }
    }

    private function history(Booking $booking, ?BookingStatus $from, BookingStatus $to, ?User $actor, ?string $reason): void
    {
        BookingStatusHistory::query()->create([
            'booking_id' => $booking->id,
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => $actor?->id,
            'reason' => $reason,
            'created_at' => now(),
        ]);
    }

    private function code(): string
    {
        do {
            $code = 'SC-'.Str::upper(Str::random(8));
        } while (Booking::query()->where('code', $code)->exists());

        return $code;
    }
}
