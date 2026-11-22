<?php

namespace App\Http\Requests\Public;

use App\Models\Court;
use Illuminate\Foundation\Http\FormRequest;

class AvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        $court = $this->route('court');

        // Cek ketersediaan publik dulu. Kalau tidak, tanggal yang salah membocorkan bahwa court ada.
        if (! $court instanceof Court || ! $court->isOpenToPublic()) {
            abort(404);
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
        ];
    }
}
