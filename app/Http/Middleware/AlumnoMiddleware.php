<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlumnoMiddleware
{

    public function handle(Request $request, Closure $next)
    {   
        $user=Auth::user();
        $message="El usuario no tiene permiso para realizar esta accion";
        try {
            $typeRol=$user->getRoleNames();
            if($typeRol[0]!="Alumno"){
                return response()->json([
                    'message' => $message,
                    'status'=>400
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'status'=>400
            ], 400);
        }   
        return $next($request);
    }
}