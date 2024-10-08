<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try {
            $user = User::create([
                'email' => $request->validated('email'),
                'name' => $request->validated('name'),
                'password' => bcrypt($request->validated('password')),
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Auth.register', ['error' => $e, 'request' => $request->validated()]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->only('email', 'password');

            if (!$token = auth()->attempt($credentials)) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 401);
            }

            return $this->respondWithToken($token);
        } catch (\Exception $e) {
            Log::error('Auth.login', ['error' => $e, 'request' => $request->validated()]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function me()
    {
        try {
            return response()->json([
                'message' => 'User profile',
                'data' => auth()->user(),
            ]);
        } catch (\Exception $e) {
            Log::error('Auth.me', ['error' => $e]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout()
    {
        try {
            auth()->logout();

            return response()->json([
                'message' => 'User logged out',
            ]);
        } catch (\Exception $e) {
            Log::error('Auth.logout', ['error' => $e]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function refresh()
    {
        try {
            return $this->respondWithToken(auth()->refresh());
        } catch (\Exception $e) {
            Log::error('Auth.refresh', ['error' => $e]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
