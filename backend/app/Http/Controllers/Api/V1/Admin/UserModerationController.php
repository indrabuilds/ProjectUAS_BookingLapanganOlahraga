<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserIndexRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// Admin tidak boleh membekukan admin lain. Kalau boleh, satu admin bisa mengunci yang lain.
class UserModerationController extends Controller
{
    public function index(UserIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 12);

        $users = User::query()
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->where('role', $role))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['q'] ?? null, function ($query, $q): void {
                $safe = str_replace(['%', '_'], ['\\%', '\\_'], $q);
                $query->where(function ($inner) use ($safe): void {
                    $inner->where('name', 'like', '%'.$safe.'%')
                        ->orWhere('email', 'like', '%'.$safe.'%');
                });
            })
            ->orderBy('name')
            ->paginate($perPage);

        return UserResource::collection($users);
    }

    public function suspend(Request $request, User $user): UserResource|JsonResponse
    {
        if ($this->protected($request, $user)) {
            return $this->forbidden();
        }

        $user->status = UserStatus::Suspended;
        $user->save();

        return new UserResource($user);
    }

    public function activate(Request $request, User $user): UserResource|JsonResponse
    {
        if ($user->role === UserRole::Admin && $request->user()->id !== $user->id) {
            return $this->forbidden();
        }

        $user->status = UserStatus::Active;
        $user->save();

        return new UserResource($user);
    }

    private function protected(Request $request, User $user): bool
    {
        return $request->user()->id === $user->id || $user->role === UserRole::Admin;
    }

    private function forbidden(): JsonResponse
    {
        return response()->json([
            'message' => 'Admin tidak bisa mengubah status dirinya atau admin lain.',
            'code' => 'USER_SUSPEND_FORBIDDEN',
        ], 422);
    }
}
