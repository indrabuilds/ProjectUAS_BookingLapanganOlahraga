<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\UserStatus;
use App\Enums\VenueStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\VenueIndexRequest;
use App\Http\Resources\PublicCourtResource;
use App\Http\Resources\PublicVenueResource;
use App\Http\Resources\VenueCardResource;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VenueDiscoveryController extends Controller
{
    public function index(VenueIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 12);

        $venues = $this->visible()
            ->with([
                'images',
                'courts' => fn ($query) => $query->where('is_active', true)->with('sport'),
            ])
            ->withMin(['courts as starting_price' => fn ($query) => $query->where('is_active', true)], 'price_per_hour')
            ->when($filters['q'] ?? null, function (Builder $query, string $q): void {
                $safe = str_replace(['%', '_'], ['\\%', '\\_'], $q);
                $query->where('name', 'like', '%'.$safe.'%');
            })
            ->when($filters['city'] ?? null, fn (Builder $query, string $city) => $query->where('city', $city))
            ->when($filters['sport'] ?? null, function (Builder $query, string $sport): void {
                $query->whereHas('courts', function (Builder $courts) use ($sport): void {
                    $courts->where('is_active', true)
                        ->whereHas('sport', fn (Builder $sports) => $sports->where('slug', $sport));
                });
            })
            ->when(isset($filters['min_price']) || isset($filters['max_price']), function (Builder $query) use ($filters): void {
                $query->whereHas('courts', function (Builder $courts) use ($filters): void {
                    $courts->where('is_active', true);
                    if (isset($filters['min_price'])) {
                        $courts->where('price_per_hour', '>=', $filters['min_price']);
                    }
                    if (isset($filters['max_price'])) {
                        $courts->where('price_per_hour', '<=', $filters['max_price']);
                    }
                });
            });

        $this->applySort($venues, $filters['sort'] ?? 'newest');

        return VenueCardResource::collection($venues->paginate($perPage));
    }

    public function show(Venue $venue): PublicVenueResource
    {
        $visible = $this->visible()->whereKey($venue->id)->first();
        if ($visible === null) {
            abort(404);
        }

        $visible->load([
            'images',
            'operatingHours',
            'courts' => fn ($query) => $query->where('is_active', true)->with('sport'),
        ]);
        $visible->setAttribute(
            'starting_price',
            $visible->courts->min('price_per_hour'),
        );

        return new PublicVenueResource($visible);
    }

    public function courts(Venue $venue): AnonymousResourceCollection
    {
        $visible = $this->visible()->whereKey($venue->id)->first();
        if ($visible === null) {
            abort(404);
        }

        $courts = $visible->courts()->where('is_active', true)->with('sport')->orderBy('name')->get();

        return PublicCourtResource::collection($courts);
    }

    /**
     * @return Builder<Venue>
     */
    private function visible(): Builder
    {
        return Venue::query()
            ->where('status', VenueStatus::Approved)
            ->where('is_active', true)
            ->whereHas('owner', fn (Builder $owner) => $owner->where('status', UserStatus::Active));
    }

    /**
     * @param  Builder<Venue>  $venues
     */
    private function applySort(Builder $venues, string $sort): void
    {
        match ($sort) {
            'price_asc' => $venues->orderByRaw('starting_price IS NULL')->orderBy('starting_price'),
            'price_desc' => $venues->orderByRaw('starting_price IS NULL')->orderByDesc('starting_price'),
            'name' => $venues->orderBy('name'),
            default => $venues->latest(),
        };
    }
}
