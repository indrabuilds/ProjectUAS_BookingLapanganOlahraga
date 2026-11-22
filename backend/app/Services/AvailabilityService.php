<?php

namespace App\Services;

use App\Exceptions\InvalidAvailabilityDate;
use App\Models\Booking;
use App\Models\Court;
use App\Models\CourtBlock;
use App\Models\OperatingHour;
use App\Support\VenueClock;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

// Slot dihitung saat diminta, tidak disimpan. Sumbernya jam buka, blokir, dan booking aktif.
class AvailabilityService
{
    /**
     * @return array<string, mixed>
     */
    public function forDate(Court $court, string $date): array
    {
        $court->loadMissing('venue');
        $timezone = $court->venue->timezone;
        $day = VenueClock::localDay($date, $timezone);
        $this->assertWithinHorizon($day, $timezone);

        $hours = $court->venue->operatingHours()->where('day_of_week', $day->dayOfWeekIso)->first();
        $closed = $hours === null || $hours->is_closed || $hours->open_hour === null || $hours->close_hour === null;

        return [
            'court_id' => $court->id,
            'date' => $date,
            'timezone' => $timezone,
            'is_closed' => $closed,
            'price_per_hour' => number_format((float) $court->price_per_hour, 2, '.', ''),
            'slots' => $closed ? [] : $this->slots($court, $day, $hours),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function slots(Court $court, CarbonImmutable $day, OperatingHour $hours): array
    {
        $windowStart = VenueClock::toUtc(VenueClock::atHour($day, (int) $hours->open_hour));
        $windowEnd = VenueClock::toUtc(VenueClock::atHour($day, (int) $hours->close_hour));
        $blocks = $this->blocks($court, $windowStart, $windowEnd);
        $bookings = $this->bookings($court, $windowStart, $windowEnd);
        $now = CarbonImmutable::now('UTC');
        $slots = [];

        for ($hour = (int) $hours->open_hour; $hour < (int) $hours->close_hour; $hour++) {
            $startLocal = VenueClock::atHour($day, $hour);
            $endLocal = $startLocal->addHour();
            $startUtc = VenueClock::toUtc($startLocal);
            $endUtc = VenueClock::toUtc($endLocal);

            $slots[] = [
                'start_hour' => $hour,
                'label' => $startLocal->format('H:i').'-'.$endLocal->format('H:i'),
                'start_at' => $startUtc->format('Y-m-d\TH:i:s\Z'),
                'status' => $this->status($startUtc, $endUtc, $now, $blocks, $bookings),
            ];
        }

        return $slots;
    }

    private function assertWithinHorizon(CarbonImmutable $day, string $timezone): void
    {
        $today = CarbonImmutable::now($timezone)->startOfDay();
        $last = $today->addDays((int) config('sportscourt.booking.max_days_ahead'));

        if ($day->lt($today) || $day->gt($last)) {
            throw new InvalidAvailabilityDate('Tanggal harus dari hari ini sampai '.$last->toDateString().' waktu venue.');
        }
    }

    /**
     * @return Collection<int, CourtBlock>
     */
    private function blocks(Court $court, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return CourtBlock::query()
            ->where('court_id', $court->id)
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->get();
    }

    /**
     * @return Collection<int, Booking>
     */
    private function bookings(Court $court, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return Booking::query()
            ->where('court_id', $court->id)
            ->holdingSlot()
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->get(['id', 'start_at', 'end_at']);
    }

    /**
     * @param  Collection<int, CourtBlock>  $blocks
     * @param  Collection<int, Booking>  $bookings
     */
    private function status(
        CarbonImmutable $start,
        CarbonImmutable $end,
        CarbonImmutable $now,
        Collection $blocks,
        Collection $bookings,
    ): string {
        if ($start->lessThanOrEqualTo($now)) {
            return 'past';
        }

        if ($this->overlaps($start, $end, $bookings)) {
            return 'booked';
        }

        if ($this->overlaps($start, $end, $blocks)) {
            return 'blocked';
        }

        return 'available';
    }

    /**
     * @param  Collection<int, CourtBlock|Booking>  $rows
     */
    private function overlaps(CarbonImmutable $start, CarbonImmutable $end, Collection $rows): bool
    {
        foreach ($rows as $row) {
            if ($row->start_at < $end && $row->end_at > $start) {
                return true;
            }
        }

        return false;
    }
}
