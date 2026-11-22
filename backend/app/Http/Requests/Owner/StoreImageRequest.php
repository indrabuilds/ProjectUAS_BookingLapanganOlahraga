<?php

namespace App\Http\Requests\Owner;

use App\Http\Requests\Concerns\HidesForeignResources;
use Illuminate\Foundation\Http\FormRequest;

class StoreImageRequest extends FormRequest
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
            // SVG ditolak. image bawaan Laravel juga tidak mengizinkan SVG kecuali allow_svg.
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
                'dimensions:max_width=4000,max_height=4000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'image' => 'gambar',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.mimes' => 'Gambar harus JPG, PNG, atau WebP. SVG tidak diterima.',
            'image.max' => 'Gambar maksimal 2 MB.',
            'image.dimensions' => 'Gambar maksimal 4000 x 4000 piksel.',
        ];
    }
}
