<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Enums\VenueStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Sport;
use App\Models\User;
use App\Models\Venue;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

// Data tetap untuk mengecek angka dashboard. Admin tidak dibuat di sini.
class DemoDataSeeder extends Seeder
{
    public const CUSTOMERS = 2;

    public const OWNERS = 2;

    public const USERS = 4;

    public const COURTS = 4;

    public const ANDI_UPCOMING = 2;

    public const ANDI_PENDING = 1;

    public const SARI_VENUES = 2;

    public const SARI_COURTS = 3;

    public const SARI_PENDING_BOOKINGS = 1;

    public const SARI_CONFIRMED_UPCOMING = 2;

    /** @var array<string, int> */
    public const VENUES = [
        'pending_verification' => 1,
        'approved' => 1,
        'rejected' => 1,
        'suspended' => 1,
    ];

    /** @var array<string, int> */
    public const BOOKINGS = [
        'pending' => 1,
        'confirmed' => 3,
        'rejected' => 1,
        'cancelled' => 1,
        'completed' => 0,
        'expired' => 1,
    ];

    public function run(): void
    {
        $this->call(SportSeeder::class);

        $andi = $this->user('Andi Pelanggan', 'andi@demo.test', UserRole::Customer, '081111111111');
        $bima = $this->user('Bima Pelanggan', 'bima@demo.test', UserRole::Customer, '081111111112');
        $sari = $this->user('Sari Venue', 'sari@demo.test', UserRole::Owner, '081222222222');
        $raka = $this->user('Raka Venue', 'raka@demo.test', UserRole::Owner, '081222222223');

        $sehat = $this->venue($sari, 'GOR Demo Sehat', 'gor-demo-sehat', VenueStatus::Approved, 'Bandung');
        $baru = $this->venue($sari, 'GOR Demo Baru', 'gor-demo-baru', VenueStatus::PendingVerification, 'Jakarta');
        $this->venue($raka, 'GOR Demo Ditolak', 'gor-demo-ditolak', VenueStatus::Rejected, 'Surabaya');
        $ditahan = $this->venue($raka, 'GOR Demo Ditahan', 'gor-demo-ditahan', VenueStatus::Suspended, 'Medan');

        $badminton = Sport::query()->where('slug', 'badminton')->firstOrFail();
        $futsal = Sport::query()->where('slug', 'futsal')->firstOrFail();
        $basket = Sport::query()->where('slug', 'basket')->firstOrFail();
        $tenis = Sport::query()->where('slug', 'tenis')->firstOrFail();

        $courtA = $this->court($sehat, $badminton, 'Court A');
        $courtB = $this->court($sehat, $futsal, 'Court B');
        $this->court($baru, $basket, 'Court C');
        $this->court($ditahan, $tenis, 'Court D');

        $this->booking('SC-DEMO0006', $andi, $courtA, BookingStatus::Expired, now()->addDays(8), now()->subHour(), 60);
        $this->booking('SC-DEMO0005', $andi, $courtA, BookingStatus::Rejected, now()->addDays(7), null, 50);
        $this->booking('SC-DEMO0004', $andi, $courtA, BookingStatus::Cancelled, now()->addDays(6), null, 40);
        $this->booking('SC-DEMO0003', $andi, $courtA, BookingStatus::Confirmed, now()->subDays(3), null, 30);
        $this->booking('SC-DEMO0002', $andi, $courtA, BookingStatus::Confirmed, now()->addDays(4), null, 20);
        $this->booking('SC-DEMO0001', $andi, $courtA, BookingStatus::Pending, now()->addDays(2), now()->addMinutes(30), 10);
        $this->booking('SC-DEMO0007', $bima, $courtB, BookingStatus::Confirmed, now()->addDays(3), null, 5);
    }

    private function user(string $name, string $email, UserRole $role, string $phone): User
    {
        $user = User::query()->firstOrNew(['email' => $email]);
        $user->fill([
            'name' => $name,
            'phone' => $phone,
            'password' => 'Rahasia12',
        ]);
        $user->role = $role;
        $user->status = UserStatus::Active;
        $user->save();

        return $user;
    }

    private function venue(User $owner, string $name, string $slug, VenueStatus $status, string $city): Venue
    {
        return Venue::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'owner_id' => $owner->id,
                'name' => $name,
                'description' => 'Venue contoh untuk dashboard.',
                'address' => 'Jalan Contoh 1',
                'city' => $city,
                'province' => 'Jawa Barat',
                'phone' => '081234567890',
                'timezone' => 'Asia/Jakarta',
                'facilities' => ['parking'],
                'status' => $status,
                'is_active' => $status === VenueStatus::Approved,
            ],
        );
    }

    private function court(Venue $venue, Sport $sport, string $name): Court
    {
        return Court::query()->updateOrCreate(
            ['venue_id' => $venue->id, 'name' => $name],
            [
                'sport_id' => $sport->id,
                'description' => null,
                'price_per_hour' => 75000,
                'is_active' => true,
            ],
        );
    }

    private function booking(
        string $code,
        User $customer,
        Court $court,
        BookingStatus $status,
        \DateTimeInterface $start,
        ?\DateTimeInterface $expires,
        int $minutesAgo,
    ): void {
        $startAt = CarbonImmutable::instance($start)->utc();
        $booking = Booking::query()->updateOrCreate(
            ['code' => $code],
            [
                'user_id' => $customer->id,
                'court_id' => $court->id,
                'start_at' => $startAt,
                'end_at' => $startAt->addHour(),
                'price_per_hour' => '75000.00',
                'total_price' => '75000.00',
                'status' => $status,
                'expires_at' => $expires,
                'notes' => null,
            ],
        );

        if ($booking->wasRecentlyCreated) {
            $booking->forceFill(['created_at' => now()->subMinutes($minutesAgo)])->save();
        }
    }
}
