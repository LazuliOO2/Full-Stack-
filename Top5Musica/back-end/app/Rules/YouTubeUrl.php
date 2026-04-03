<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;

class YouTubeUrl implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! self::extractVideoId($value)) {
            $fail('O campo :attribute deve conter uma URL válida do YouTube.');
        }
    }

    public static function extractVideoId(string $url): ?string
    {
        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        $parts = parse_url($url);

        if (! isset($parts['host'])) {
            return null;
        }

        $host = Str::lower($parts['host']);
        $path = trim($parts['path'] ?? '', '/');
        $segments = $path === '' ? [] : explode('/', $path);
        parse_str($parts['query'] ?? '', $query);

        $videoId = match (true) {
            in_array($host, ['youtu.be', 'www.youtu.be'], true) => $segments[0] ?? null,
            Str::endsWith($host, ['youtube.com', 'youtube-nocookie.com']) && $path === 'watch' => $query['v'] ?? null,
            Str::endsWith($host, ['youtube.com', 'youtube-nocookie.com']) && in_array($segments[0] ?? '', ['embed', 'shorts', 'live', 'v'], true) => $segments[1] ?? null,
            default => null,
        };

        return is_string($videoId) && preg_match('/^[A-Za-z0-9_-]{11}$/', $videoId)
            ? $videoId
            : null;
    }
}
