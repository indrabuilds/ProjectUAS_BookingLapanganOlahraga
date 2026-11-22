<?php

namespace App\Http\Requests\Owner;

use App\Http\Requests\Concerns\HidesForeignResources;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VenueRequest extends FormRequest
{
    use HidesForeignResources;

    public function authorize(): bool
    {
        return $this->hideForeignResource();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:5000'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            // Nomor venue mengikuti profil: 08... dan +62... sama-sama diterima.
            'phone' => ['required', 'string', 'max:20', 'regex:/^(?:\+62|0)[0-9]{8,15}$/'],
            'timezone' => ['required', 'string', Rule::in(config('sportscourt.venue.timezones'))],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['string', 'distinct', Rule::in(config('sportscourt.venue.facilities'))],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama venue',
            'description' => 'deskripsi',
            'address' => 'alamat',
            'city' => 'kota',
            'province' => 'provinsi',
            'phone' => 'nomor telepon',
            'timezone' => 'zona waktu',
            'facilities' => 'fasilitas',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Gunakan nomor Indonesia, misalnya 081234567890.',
            'facilities.*.in' => 'Fasilitas tidak dikenal.',
        ];
    }
}
