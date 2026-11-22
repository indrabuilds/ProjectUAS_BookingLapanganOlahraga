<?php

namespace App\Http\Requests\Admin;

use App\Models\Sport;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $sport = $this->route('sport');
        $sportId = $sport instanceof Sport ? $sport->id : null;

        return [
            'name' => ['required', 'string', 'max:50', Rule::unique('sports', 'name')->ignore($sportId)],
        ];
    }
}
