<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * List profiles for schedule assignment.
     */
    public function index()
    {
        $profiles = Profile::with('user')
            ->orderBy('full_name')
            ->orderBy('id')
            ->get();

        return response()->json($profiles->map(fn (Profile $profile) => $this->serializeProfile($profile)));
    }

    /**
     * Get the authenticated user's profile (profile row + section name + email from users).
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = Profile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json([
                'id' => null,
                'full_name' => null,
                'username' => $user->username,
                'section_id' => null,
                'section_name' => null,
                'position' => null,
                'image_path' => null,
                'email' => $user->email,
            ]);
        }

        $section = $profile->section;
        return response()->json([
            'id' => $profile->id,
            'full_name' => $profile->full_name,
            'username' => $user->username,
            'section_id' => $profile->section_id,
            'section_name' => $section ? $section->name : null,
            'position' => $profile->position,
            'image_path' => $profile->image_path,
            'email' => $user->email,
        ]);
    }

    /**
     * Update the authenticated user's profile and optionally email.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'section_id' => ['nullable', 'integer', 'exists:section,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $userUpdates = [];
            if (array_key_exists('email', $validated) && $validated['email'] !== null) {
                $userUpdates['email'] = $validated['email'];
            }
            if (array_key_exists('username', $validated) && $validated['username'] !== null && trim($validated['username']) !== '') {
                $userUpdates['username'] = trim($validated['username']);
            }
            if (!empty($userUpdates)) {
                User::where('id', $user->id)->update($userUpdates);
            }

            $profile = Profile::where('user_id', $user->id)->first();
            $payload = [
                'full_name' => $validated['full_name'] ?? null,
                'section_id' => $validated['section_id'] ?? null,
                'position' => $validated['position'] ?? null,
            ];

            if ($profile) {
                $profile->update($payload);
            } else {
                Profile::create([
                    'user_id' => $user->id,
                    'full_name' => $payload['full_name'],
                    'section_id' => $payload['section_id'],
                    'position' => $payload['position'],
                ]);
            }
        });

        return $this->show($request);
    }

    /**
     * Update a profile by id (admin only).
     */
    public function updateById(Request $request, $id)
    {
        $actor = $request->user();
        if (!$actor || !in_array($actor->role_id, [2, 3], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $profile = Profile::with('user')->find($id);
        if (!$profile) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        $validated = $request->validate([
            'full_name' => ['nullable', 'string', 'max:255'],
            'section_id' => ['nullable', 'integer', 'exists:section,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'role_id' => ['nullable', 'integer', Rule::in([1, 2, 3])],
        ]);

        DB::transaction(function () use ($profile, $validated) {
            $profile->update([
                'full_name' => $validated['full_name'] ?? null,
                'section_id' => $validated['section_id'] ?? null,
                'position' => $validated['position'] ?? null,
            ]);

            if (
                array_key_exists('role_id', $validated)
                && $validated['role_id'] !== null
                && $profile->user
            ) {
                $profile->user->update(['role_id' => $validated['role_id']]);
            }
        });

        $profile->refresh()->load('user');

        return response()->json($this->serializeProfile($profile));
    }

    private function serializeProfile(Profile $profile): array
    {
        $user = $profile->user;
        $displayName = $profile->full_name;
        if (!$displayName && $user) {
            $displayName = $user->username;
        }

        return [
            'id' => $profile->id,
            'full_name' => $displayName,
            'raw_full_name' => $profile->full_name,
            'section_id' => $profile->section_id,
            'position' => $profile->position,
            'username' => $user ? $user->username : null,
            'email' => $user ? $user->email : null,
            'role_id' => $user ? $user->role_id : null,
            'user_id' => $user ? $user->id : null,
            'user' => $user ? [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id,
            ] : null,
        ];
    }
}
