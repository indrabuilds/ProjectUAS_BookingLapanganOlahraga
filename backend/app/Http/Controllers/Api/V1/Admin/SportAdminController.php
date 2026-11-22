<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SportRequest;
use App\Http\Resources\SportResource;
use App\Models\Sport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

// Slug dibuat di server. Klien tidak boleh memilih alamat kategori.
class SportAdminController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return SportResource::collection(Sport::query()->orderBy('name')->get());
    }

    public function store(SportRequest $request): JsonResponse
    {
        $name = $request->string('name')->trim()->toString();
        $sport = Sport::query()->create([
            'name' => $name,
            'slug' => $this->slug($name),
            'is_active' => true,
        ]);

        return (new SportResource($sport))->response()->setStatusCode(201);
    }

    public function update(SportRequest $request, Sport $sport): SportResource
    {
        $name = $request->string('name')->trim()->toString();
        $sport->name = $name;
        $sport->slug = $this->slug($name, $sport->id);
        $sport->save();

        return new SportResource($sport);
    }

    public function toggle(Sport $sport): SportResource
    {
        $sport->is_active = ! $sport->is_active;
        $sport->save();

        return new SportResource($sport);
    }

    private function slug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'olahraga';
        }
        $base = substr($base, 0, 50);
        $slug = $base;
        $suffix = 2;

        while (
            Sport::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $slug = substr($base, 0, 50).'-'.$suffix;
            $suffix++;
        }

        return substr($slug, 0, 60);
    }
}
