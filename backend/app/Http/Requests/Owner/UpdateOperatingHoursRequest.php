<?php

namespace App\Http\Requests\Owner;

use App\Http\Requests\Concerns\HidesForeignResources;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateOperatingHoursRequest extends FormRequest
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
            'days' => ['required', 'array', 'size:7'],
            'days.*.day_of_week' => ['required', 'integer', 'between:1,7', 'distinct'],
            'days.*.is_closed' => ['required', 'boolean'],
            'days.*.open_hour' => ['nullable', 'integer', 'between:0,23'],
            'days.*.close_hour' => ['nullable', 'integer', 'between:1,24'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ($this->input('days', []) as $index => $day) {
                if (! is_array($day)) {
                    continue;
                }

                $closed = filter_var($day['is_closed'] ?? false, FILTER_VALIDATE_BOOLEAN);
                if ($closed) {
                    continue;
                }

                $open = $day['open_hour'] ?? null;
                $close = $day['close_hour'] ?? null;
                if ($open === null || $close === null || (int) $close <= (int) $open) {
                    $validator->errors()->add('days.'.$index.'.close_hour', 'Jam tutup harus lebih besar dari jam buka.');
                }
            }
        });
    }
}
