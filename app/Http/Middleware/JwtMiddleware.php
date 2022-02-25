<?php

namespace App\Http\Middleware;

use Closure;

use Exception;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if ($user->account_status != 1) {
                $statusAccout = $this->statusAccount($user->account_status);
                if ($statusAccout['status'] == 400) {
                    return response()->json([
                        'message' => $statusAccout['message'],
                        'status' => 400
                    ]);
                }
            }
            /*
            return response()->json([
                'user' => $user,
                'account_status' => $user->account_status
            ], 200);*/
        } catch (\Exception $e) {
            $error = $this->getErrorJwt($e);
            $error['status'] = 401;
            return response()->json($error, 401);
        }
        return $next($request);
    }

    public function getErrorJwt($e)
    {
        $tecnico = "";
        if ($e instanceof  TokenExpiredException) {
            $tecnico = 'Token expirado middleware.';
        } else if ($e instanceof  TokenInvalidException) {
            // Blacklisted token
            $tecnico = 'Token invalido middleware.';
        } else if ($e instanceof TokenBlacklistedException) {
            // Blacklisted token
            $tecnico = 'Error en refrescar Su sesión. Vuelva a iniciar sesión.';
        } else { //if($e instanceof  JWTException) {
            $tecnico = 'Token de autorización no encontrado. Vuelva a iniciar sesión.';
        }
        return [
            'message' => 'Su sesión ha caducado. Vuelva a iniciar sesión.',
            'status' => 400,
            'tecnico' => $tecnico
        ];
    }

    /***
     * @param $status  estatus de la cuenta
     * @return array
     */

    public function statusAccount($status)
    {
        $info = "";
        switch ($status) {
            case 2:
                $info = "Se inhabilitó tu cuenta, Comunícate con el administrador";
                break;
            case 3:
                $info = "Para activar tu cuenta Busca el correo electrónico de verificación en la bandeja de entrada o spam y haz clic en el vínculo que se muestra en el mensaje.";
                break;
            case 4:
                $info = "Hemos bloqueado tu cuenta de forma permanente, Comunícate con el administrador.";
                break;

            default:
                $info = "Comunícate con el administrador.";
                break;
        }

        return [
            'status' => 400,
            'message' => $info,
            'status_account' => $status
        ];
    }
}
