<?php

namespace App\Http\Requests\Owner;

use App\Http\Requests\Concerns\HidesForeignResources;
use Illuminate\Foundation\Http\FormRequest;

class OwnerCancelBookingRequest extends FormRequest
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
            'reason' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'reason' => 'alasan',
        ];
    }
}
