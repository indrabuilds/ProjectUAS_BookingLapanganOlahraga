<?php

namespace App\Http\Requests\Owner;

use App\Http\Requests\Concerns\HidesForeignResources;
use Illuminate\Foundation\Http\FormRequest;

class CourtBlockIndexRequest extends FormRequest
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
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ];
    }
}
