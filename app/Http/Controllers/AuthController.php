<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Http\Middleware\JwtMiddleware;

class AuthController extends Controller
{

    public $ERROR_SERVER_MSG = 'Ha ocurrido un error, intenta de nuevo más tarde.';

    /**
     * @var App\Http\Middleware\JwtMiddlewar _jwtMiddleware
     */
    public $_jwtMiddleware;

    /**
     *
     * @param JwtMiddleware $jwtMiddleware
     */

    public function __construct(
        JwtMiddleware $jwtMiddleware
    ) {
        $this->_jwtMiddleware = $jwtMiddleware;
    }


    /**
     * Get a JWT via given credentials.
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function authenticate(Request $request)
    {
        /*
        return response()->json([
            empty($request->get('remember_session')) ? false : true,
            $request->all()
        ]);*/

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'remember_session' => 'required|boolean',
        ], [
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'Correo electrónico no válido.',
            'password.required' => 'La contraseña es obligatoria',
            'remember_session.boolean' => 'Marque la casilla.',
        ]);

        /*
        $validator->after(function ($validator) {
            // if ($this->somethingElseIsInvalid()) {
            $validator->errors()->add('field', 'Otra validacion');
            //}
        });
        */

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ]);
        }

        $credentials = $request->only('email', 'password');
        $user = User::where('email', $credentials['email'])->first();
        //$token = Auth::login($user);
        // $users = DB::table('users')
        //             ->join('account_profiles','users.account_profile_id','=','account_profiles.id')
        //             ->where('users.email', $credentials['email'])
        //             ->get();
        if (!$user) {
            return response()->json([
                'message' => 'Credenciales invalidas.',
                'status' => 400,
            ]);
        }

        /**
         * Verificar cuenta
         *  //1=activo 2=bloqueado  3=verificarCuentaCorreo 4=RecursosSuspendidos  
         *
         */

        if ($user['account_status'] != 1) {
            $statusAccout = $this->_jwtMiddleware->statusAccount($user['account_status']);
            if ($statusAccout['status'] == 400) {
                return response()->json($statusAccout);
            }
        }

        try {
            if ($token = JWTAuth::attempt($credentials)) {
                $remember_session = $request->get('remember_session') === true ? true : false;
                $data = $this->respondWithToken($token, $user, $remember_session);
                $name = $user['name'];
                return response()->json(['data' => $data, 'status' => 200, 'message' => "Qué bueno verte de nuevo {$name} ."]);
            } else {
                return response()->json([
                    'message' => 'Credenciales invalidas.',
                    'status' => 400,
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $this->ERROR_SERVER_MSG . " ," . $e->getMessage(),
                'status' => 400
            ]);
        }
    }


    /**
     * leaked user information
     *
     * @param object $user
     * @return array $user_filter
     */
    public function getDataUser($user)
    {
        $exists = Storage::disk('public')->exists($user['photo']);
        $userData = array();
        $userData = [
            'name' => $user['name'],
            'last_name' => $user['last_name'],
            'second_last_name' => $user['second_last_name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'photo' => ($user['photo'] != null && $exists) ? Storage::url($user['photo']) : null,
            'roleNames' => $user->getRoleNames(),
            'addreses' => $user['addreses']
            //'level_account' => $user['level_account']
        ];

        return $userData;
    }

    /**
     * Get a JWT 
     * @param string $token
     * @param string $user
     * @param bool $remember_session "(60minutos*24horas*7dias=10080)"
     * @return \Illuminate\Http\JsonResponse
     */


    #60minutos*24horas="1440"  (1 dia)
    #((60minutos * 24horas) * 7dias *4semanas)=40320  "1 mes"
    #'ttl' => env('JWT_TTL', 40320) default
    protected function respondWithToken($token, $user, $remember_session = null)
    {
        $userData = $this->getDataUser($user);
        $timeExpireJWT = $remember_session != null && $remember_session === true ? auth()->factory()->getTTL() : (1440);
        $now = Carbon::now();
        $now = $now->format('Y-m-d H:i:s');
        $expires_in = Carbon::now()->addMinute($timeExpireJWT);
        $expires_in = $expires_in->format('Y-m-d H:i:s');

        return [
            'token' => $token,
            'created_time' => $now,
            'expires_in' => $expires_in,
            'expires_time' => $timeExpireJWT,
            'user' => $userData,
            'status' => 200
        ];
    }


    /**
     * Get a JWT via given credentials.
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerUser(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3|max:50',
            'last_name' => 'required|string|min:3|max:50',
            'email' => 'required|string|email|max:100|unique:users',
            'phone' => 'required|digits:10|unique:users',
            'password' => 'required|string|min:6|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->errors()
            ]);
        }


        // 4=usuario comun,registro desde el inicio

        $tipo_usuario = $request->get('level_account') != null ? $request->get('level_account') : 1;
        $confirmation_code = "";
        try {
            DB::beginTransaction();

            $confirmation_code = Str::random(40);
            $email = $request->get('email');
            $confirmation_code = base64_encode("{$confirmation_code}_{$email}");


            $user = User::create([
                'level_account' => $tipo_usuario,
                'account_status' => 3, //1=activo 2=bloqueado  3=verificarCuentaCorreo
                'name' => $request->get('name'),
                'last_name' => $request->get('last_name'),
                'second_last_name' => $request->get('second_last_name'),
                'email' => $request->get('email'),
                'phone' => $request->get('phone'),
                'verification_link' => $confirmation_code,
                'password' => bcrypt($request->get('password'))
            ]);

            $this->_addressesByParcelController->assignNumberOfAddresses($user->{'id_users'});
            /*
            Mail::to([$request->get('email')])->queue(new RegistroUsuario($data));
            $mensaje="se le ha enviado un correo para la activación de su cuenta";
           */
            DB::commit();
            return response()->json([
                'status' => 200,
                'codigo_confirmacion' => $confirmation_code,
                'message' => "Busca el correo electrónico de verificación en la bandeja de entrada o spam y haz clic en el vínculo que se muestra en el mensaje para activar tu cuenta."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG,
                'messageException' => $e->getMessage()
            ]);
        }
    }

    /**
     * 
     * @return array 
     */

    public function getAuthenticatedUser()
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['message' => 'No se encontro el usuario con el token proporcionado.', 'status' => 400]);
            }
            return response()->json([
                'user' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json($this->_jwtMiddleware->getErrorJwt($e));
        }
    }
    /**
     * @param \Illuminate\Http\Request  $request
     * @param $codigoConfirmacion
     */

    public function verifyAccount(Request $request, $codigoConfirmacion)
    {

        try {

            $verification_link = $codigoConfirmacion;
            $codigoConfirmacion = base64_decode($codigoConfirmacion);

            $validateLink = strpos($codigoConfirmacion, '_');
            if ($validateLink === false) {
                return response()->json([
                    'status' => 400,
                    'message' => "El enlace fue alterado, recargue la pagina (F5)"
                ]);
            }

            $datos = explode('_', $codigoConfirmacion);
            $email = $datos[1];

            $user = User::where('email', $email)
                ->where('verification_link', $verification_link)
                ->first();

            //return response()->json([$user]);

            if ($user == null)
                return response()->json([
                    'status' => 400,
                    'message' => "Este enlace ya fue utilizado",
                ]);

            $user->account_status = 1;
            $user->verification_link = null;
            $user->email_verified_at = now();
            $user->save();

            $token = JWTAuth::fromUser($user);

            $data = $this->respondWithToken($token, $user);
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG,
                'messageException' => $e->getMessage()
            ]);
        }
    }


    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            /*auth()->logout(); */
            $token = JWTAuth::getToken();
            JWTAuth::invalidate($token);
            return response()->json([
                'message' => "Sesion finalizada.",
                'status' => 200
            ]);
        } catch (\Exception $e) {
            return response()->json($this->_jwtMiddleware->getErrorJwt($e));
        }
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        try {
            /*return response()->json(['token'=>auth()->refresh()]);*/
            $user = JWTAuth::parseToken()->authenticate();
            //return response()->json(['user'=>$user]);
            $token = JWTAuth::getToken();
            $token = JWTAuth::refresh($token);

            $data = $this->respondWithToken($token, $user);
            $name = $user['name'];
            return response()->json(['data' => $data, 'status' => 200, 'message' => "{$name} has refrescado la sessión."]);
        } catch (\Exception $e) {
            return response()->json($this->_jwtMiddleware->getErrorJwt($e));
        }
    }
}
