<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $description = $this->input('description');

        if (is_string($description)) {
            $description = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $description) ?? $description;

            $this->merge([
                'description' => strip_tags($description),
            ]);
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string', 'max:5000'],
            'priority' => ['sometimes', 'required', 'string', Rule::in(['low', 'medium', 'high'])],
            'status' => ['sometimes', 'required', 'string', Rule::in(['open', 'closed'])],
            'assigned_to' => ['sometimes', 'nullable', 'integer', Rule::exists('agents', 'id')],
            'opened_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
