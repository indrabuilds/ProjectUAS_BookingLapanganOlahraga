<?php

namespace App\Support;

use Carbon\CarbonImmutable;

// Konversi jam lokal venue ke UTC. Database menyimpan UTC.
class VenueClock
{
    public static function localDay(string $date, string $timezone): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat('Y-m-d', $date, $timezone)->startOfDay();
    }

    public static function atHour(CarbonImmutable $day, int $hour): CarbonImmutable
    {
        return $day->startOfDay()->addHours($hour);
    }

    public static function toUtc(CarbonImmutable $local): CarbonImmutable
    {
        return $local->utc();
    }
}
