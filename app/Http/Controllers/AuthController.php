<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('username', $validated['username'])->first();
        $passwordHash = $user ? $user->getAuthPassword() : null;
        if (!$user || !$passwordHash || !Hash::check($validated['password'], $passwordHash)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $request->session()->regenerate();
        Auth::login($user, $request->boolean('remember', false));

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'role_id' => $user->role_id,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'section_id' => ['required', 'integer', 'exists:section,id'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'hashed_password' => Hash::make($validated['password']),
                'role_id' => 1,
            ]);

            DB::table('profile')->insert([
                'user_id' => $user->id,
                'section_id' => $validated['section_id'],
                'full_name' => isset($validated['name']) ? trim($validated['name']) : null,
                'position' => null,
                'image_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $user;
        });

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'role_id' => $user->role_id,
        ], 201);
    }
}
