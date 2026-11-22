<?php

namespace App\Http\Requests\Owner;

use App\Http\Requests\Concerns\HidesForeignResources;
use App\Models\Court;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourtRequest extends FormRequest
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
        /** @var Court $court */
        $court = $this->route('court');

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('courts', 'name')
                    ->ignore($court->id)
                    ->where(fn ($query) => $query->where('venue_id', $court->venue_id)->whereNull('deleted_at')),
            ],
            'sport_id' => [
                'required',
                'integer',
                Rule::exists('sports', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_per_hour' => ['required', 'numeric', 'gt:0', 'decimal:0,2', 'max:99999999.99'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama lapangan',
            'sport_id' => 'olahraga',
            'description' => 'deskripsi',
            'price_per_hour' => 'harga per jam',
        ];
    }
}
