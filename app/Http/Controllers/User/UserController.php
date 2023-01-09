<?php

namespace App\Http\Controllers\User;

use App\Exports\UsersExport;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\StudentController;
use App\Imports\UsersImport;
use App\Mail\MessageResetPassword;
use App\Traits\Helper;
//use App\HistoryLog;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use JWTAuth;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use Helper;

    /**
     * @var AuthController $_authController
     */
    public $_authController;

    public $ERROR_SERVER_MSG = 'Ha ocurrido un error, intenta de nuevo más tarde.';
    public $idUser;
    public $nameUser;

    /**
     * @var StudentController $_studentController
     */
    public $_studentController;
    /**
     * Undocumented function
     *
     * @param AuthController $AuthController
     * @param StudentController $StudentController
     */
    public function __construct(
        AuthController $AuthController,
        StudentController $StudentController
    ) {
        $this->_authController = $AuthController;
        $this->_studentController = $StudentController;
        if (auth()->user()) {
            $this->idUser = auth()->user()->id_users;
            $this->nameUser = auth()->user()->name;
        }
    }

    /**
     * save users
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function saveUser(Request $request)
    {
        try {
            /**
             * Nota: $isAdmin==false significa que el registro es desde la parte publica
             */
            $isAdmin = false;
            if (!empty($this->idUser)) {
                $isAdmin = auth()->user()->hasRole('Administrador');
            }

            $_validator = $this->validationUser($request);
            if (isset($_validator['status']) && $_validator['status'] == 422) {
                return response()->json($_validator);
            }

            #obligatorios globales
            $name = ucwords($request->get('name'));
            $last_name = ucwords($request->get('last_name'));
            $second_last_name = ucwords($request->get('second_last_name'));
            $gender = $request->get('gender');
            $email = $request->get('email');

            #variant=> type_form
            $password = $request->get('password');
            $phone = $request->get('phone');
            $addreses = $request->get('addreses');
            $type_form = $request->get('type_form');
            $typeRol = $request->get('type_rol');
            DB::beginTransaction();

            $user = null;
            $adtUser = null;
            $id_user = $request->get('id_users');
            if (!empty($id_user)) {
                $user = User::where('id_users', $id_user)->first();
                if (empty($user)) {
                    return response()->json([
                        'status' => 400,
                        'message' => "No se encontro el usuario con ID: {$id_user}",
                    ]);
                }
            } else {
                $user = new User;
                //$adtUser = new AdditionalInfoUser;
                $user->password = Hash::make(empty($password) ? "password" : $password);
            }

            #update type_rol=>request
            $rol_name = $typeRol;
            $user->name = $name;
            $user->last_name = $last_name;
            $user->second_last_name = $second_last_name;
            $user->gender = $gender;
            $user->email = $email;
            $user->account_status = 1; //1=activo 2=bloqueado  3=verificarCuentaCorreo 4=eliminado
            $user->syncRoles($rol_name);
            #variant=> type_form
            $user->addreses = $addreses;
            $user->phone = $phone;
            $user->complete_register = false;
            $user->save();

            $id_user = $user->id_users;
            $request->request->add([
                'id_users' => $id_user,
            ]);
            if ($typeRol == "Alumno") {
                $this->_studentController->setAlumno($request);
            }
            //$this->saveAdditionalUser($request, $id_user, $adtUser);
            DB::commit();
            $message = strpos($type_form, "create") === false ? "Se ha actualizado con éxito." : "Se ha creado con éxito.";

            return response()->json([
                'status' => 200,
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage(),
            ]);
        }
    }

    /**
     * validation function
     *
     * @param Request $request
     * @param $validator
     * @return array
     */

    public function validationUser(Request $request)
    {
        $type_form = "create";
        if ($request->has('type_form')) {
            $type_form = $request->get('type_form');
        }

        $validations = array();

        $validations = [
            'name' => 'required|max:50',
            'last_name' => 'required|max:50',
            'second_last_name' => 'required|max:50',
            'gender' => [
                'required',
                Rule::in(['Masculino', 'Femenino']),
            ],
            'email' => 'required|email|unique:users|max:100',
        ];

        if ($type_form == "create") {
            //$validations['password'] = "required|confirmed";
        }

        /**
         * si esta logueado y es un admnistrador solicitamos el tipo de rol
         */
        $typeRol = $request->get('type_rol');
        $rolesName = $this->getRolesName();
        $validations['type_rol'] = [
            'required',
            Rule::in($rolesName),
        ];

        if ($typeRol == "Alumno") {
            $validations = array_merge($validations, [
                'matricula' => [
                    'required',
                    'unique:students',
                    'regex:/[0-9]{2}/',
                    'regex:/[Ee]{1}/',
                    'regex:/[0-9]{5}/',
                ],
                'careers' => 'required|numeric',
                'semester' =>
                [
                    'required',
                    'regex:/[1-9]{1}/',
                ],
                'school_shift' => [
                    'required',
                    Rule::in(['Matutino', 'Vespertino']),
                ],
            ]);
        }

        if ($type_form == "update") {
            $id_user = $request->get('id_users');
            $validations['email'] = ['required', 'email', Rule::unique('users', 'email')->ignore($id_user, 'id_users')];
            if ($typeRol == "Alumno") {
                $id_students = null;
                if (!empty($request->get('alumno'))) {
                    $id_students = intval($request->get('alumno')['id_students']);
                    $validations['matricula'] = ['required', Rule::unique('students', 'matricula')->ignore($id_students, 'id_students')];
                }
            }
        }

        $messagesValidator = [
            'type_rol.required' => 'El rol es obligatorio.',
            'type_rol.in' => 'Seleccione un rol de la lista.',
            'type_form.required' => 'El tipo de request es obligatorio',
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre debe contener como máximo 50 caracteres.',
            'last_name.required' => 'El primer apellido es obligatorio.',
            'last_name.max' => 'El primer apellido debe contener como máximo 50 caracteres.',
            'second_last_name.required' => 'El segundo apellido es obligatorio.',
            'second_last_name.max' => 'El segundo apellido debe contener como máximo 50 caracteres.',
            'gender.required' => 'El genero es obligatorio.',
            'email.required' => 'El correo es obligatorio.',
            'email.unique' => 'El correo ya está en uso.',
            'email.email' => 'El correo es invalido verifique el formato.',
            'email.max' => 'El correo debe contener como máximo 100 caracteres.',
            //'phone.required' => 'El telefono es obligatorio.',
            //'phone.digits' => 'El telefono debe contener 10 digitos.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'La contraseñas no coinciden.',
            'matricula.required' => 'La matricula es obligatorio.',
            'matricula.regex' => 'Formato incorrecto de matricula.',
            'matricula.unique' => 'La matricula ya está en uso.',
            'careers.required' => 'Selecciona tu carrera',
            'semester.required' => 'Selecciona tu semestre',
            'semester.regex' => 'El semestre seleccionado no existe en la lista.',
            'school_shift.required' => 'Selecciona tu turno',
            'school_shift.in' => 'El turno seleccionado no existe en la lista.',
        ];

        $validator = Validator::make($request->all(), $validations, $messagesValidator);
        if ($validator->fails()) {
            return [
                'status' => 422,
                'errors' => $validator->errors(),
            ];
        }

        $request->request->add([
            'type_rol' => $typeRol,
        ]);
    }

    /**
     *  list of roles.
     *
     * @return \Illuminate\Http\Response
     */
    public function getRoles()
    {
        try {
            $all_roles_in_database = Role::all();
            return response()->json([
                'status' => 200,
                'data' => $all_roles_in_database,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e,
            ]);
        }
    }

    public function getRolesName()
    {
        $all_roles_in_database = \json_decode(Role::all()->pluck('name'), true);
        if (!is_array($all_roles_in_database)) {
            $all_roles_in_database = array();
        }
        return $all_roles_in_database;
    }

    /**
     * list users
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getUsers(Request $request)
    {
        $id_user = $this->idUser;

        $numberPage = abs($request->get('numberPage') ?? 1);
        $endRow = abs($request->get('endRow') ?? 10);
        $startRow = (($numberPage * $endRow) - $endRow);
        $totalRows = 0;

        try {
            $typeRol = $request->get('typeRol');
            $searchRoles = $this->getRolesName();
            $searchRol = array();

            if (in_array($typeRol, $searchRoles)) {
                $searchRol = [$typeRol];
            } else if ($typeRol == "all" || $typeRol == 0) {
                $searchRol = $searchRoles;
            }
            /**https://spatie.be/index.php/docs/laravel-permission/v5/basic-usage/basic-usage */

            $queryUser = User::query();
            $users = $queryUser->whereHas('roles', function ($query) use ($searchRol) {
                $query->whereIn('name', $searchRol);
            })->with(['roles', 'alumno'])
                ->where('id_users', "!=", $id_user)
                ->where('account_status', "!=", 4);

            if (!empty($request->get('search'))) {
                $search = $request->get('search');
                $users = $queryUser->whereRaw(
                    '(
                        users.name like ? OR
                        users.last_name like ? OR
                        users.second_last_name like ? OR
                        users.email like ? OR
                        users.phone like ?
                    )',
                    array("%{$search}%", "%{$search}%", "%{$search}%", "%{$search}%", "%{$search}%")
                );
                /*
            return response()->json([
            'status' => 500,
            'eloquent' => $users->getQuery()->toSql()
            ]);*/
            }
            $totalRows = $users->count();

            if ($startRow > $totalRows) {
                /**reinicia la paginacion */
                $startRow = 0;
                $numberPage = 1;
            }

            $users = $queryUser
                ->orderBy('id_users', 'desc')
                ->offset($startRow)
                ->limit($endRow)
                ->get();

            return response()->json([
                'status' => 200,
                'message' => 'Lista de usuarios.',
                'data' => $users,
                'numberPage' => $numberPage,
                'startRow' => $startRow,
                'endRow' => $endRow,
                'totalRows' => $totalRows,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage(),
            ]);
        }
    }

    /**
     * vendor/maatwebsite/excel/src/Facades/Excel.php
     *https://docs.laravel-excel.com/3.1/exports/collection.html
     * export all users with filters
     *
     * @return file
     */

    public function exportUsers(Request $request)
    {
        try {
            // return Excel::store(new UsersExport, '/public/exports/invoices.xlsx', null);
            //return Excel::download(new UsersExport, 'users.xlsx');
            $headersColumn = array();
            $headersColumn = ["Nombre", "Correo", "Telefono", "Rol"];

            $queryUser = User::query();
            $usersData = $queryUser
                ->with('roles')
                ->where('account_status', '!=', '4');

            $nameFile = "Usuarios";
            $roles = $this->getRolesName();

            if ($request->has('filter_rol')) {
                $rol = $request->get('filter_rol');
                if (in_array($rol, $this->getRolesName())) {
                    $roles = [$rol];
                    $nameFile = ucwords($rol);
                }
            }

            $usersData = $queryUser
                ->whereHas('roles', function ($query) use ($roles) {
                    $query->whereIn('name', $roles);
                })
                ->orderBy('id_users')
                ->get();

            $ArrayExportUser = array();
            foreach ($usersData as $key => $item) {
                $fullName = $item['name'] . " " . $item['last_name'] . " " . $item['second_last_name'];
                $ArrayExportUser[$key]['full_name'] = $fullName;
                $ArrayExportUser[$key]['correo'] = $item['email'];
                $ArrayExportUser[$key]['telefono'] = $item['phone'];

                $nameRol = "";
                foreach ($item['roles'] as $rol) {
                    $nameRol = $rol['name'];
                }
                $ArrayExportUser[$key]['rol'] = $nameRol;
            }

            $export = new UsersExport($ArrayExportUser, $headersColumn);

            return Excel::download($export, $nameFile . '.xlsx', \Maatwebsite\Excel\Excel::XLSX);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage(),
            ], 400);
        }
    }

    //////////METODOS QUE SI SE OCUPARAN

    /**
     * Update photo of user
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function updateImageProfile(Request $request)
    {

        try {
            DB::beginTransaction();
            if ($request->hasFile('photo') && count($_FILES) > 0) {
                $file = $_FILES['photo'];
                $allowedFormats = array('jpg', 'jpeg', 'png');
                $allowedformat = $this->validate_extension_img($file['name'], $allowedFormats);

                $allowedSize = (3 * 1048576);
                $allowedSize = $this->validate_size_img($file['size'], $allowedSize);

                if ($allowedformat['status'] != 200 || $allowedSize['status'] != 200) {
                    $errors = $allowedformat['message'] . "" . $allowedSize['message'];
                    return response()->json([
                        'status' => 400,
                        'message' => $errors,
                    ]);
                }
                $photo_new = $request->file('photo')->store('users', 'public');

                $id_user = $this->idUser;
                $user = User::where('id_users', $id_user)->first();
                $photo_old = $user->photo;
                $user->photo = $photo_new;
                $user->save();

                $userData = $this->_authController->getDataUser($user);

                #verifica la existencia de la imagen
                $exists = Storage::disk('public')->exists($photo_old);
                if (!empty($photo_old) && $exists) {
                    Storage::delete('public/' . $photo_old);
                }

                DB::commit();

                return response()->json([
                    'status' => 200,
                    'data' => $userData,
                    'message' => "Se ha cambiado con éxito la foto de perfil",
                ]);
            } else {
                return response()->json([
                    'status' => 400,
                    'message' => "No se encontro archivos para actualizar.",
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage(),
            ]);
        }
    }
    /**
     * update profile
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateProfile(Request $request)
    {

        $id_user = $this->idUser;
        try {
            $validator = [
                'name' => 'required|string|max:50',
                'last_name' => 'required|string|max:50',
                'second_last_name' => 'required|string|max:50',
                'email' => ['required', 'email', Rule::unique('users')->ignore($id_user, 'id_users')],
                //'phone' => ['required', 'digits:10', 'sometimes', Rule::unique('users')->ignore($id_user, 'id_users')],
                'phone' => ['required', 'digits:10'],
                'addreses' => 'string|nullable|max:100',
            ];

            $validator = Validator::make($request->all(), $validator, [
                'name.required' => 'El nombre es obligatorio.',
                'last_name.required' => 'El primer apellido es obligatorio.',
                'second_last_name.required' => 'El segundo apellido es obligatorio.',
                'email.required' => 'El correo es obligatorio.',
                'email.unique' => 'El correo ya está en uso.',
                'phone.required' => 'El telefono es obligatorio.',
                'addreses.max' => 'La dirección debe tener como máximo 255 caracteres.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'errors' => $validator->errors(),
                ]);
            }

            #$type_form = $request->get('type_form');
            $name = ucwords($request->get('name'));
            $last_name = ucwords($request->get('last_name'));
            $second_last_name = ucwords($request->get('second_last_name'));
            $email = $request->get('email');
            $addreses = $request->get('addreses');
            $phone = $request->get('phone');

            DB::beginTransaction();
            $user = User::where('id_users', $id_user)->first();

            if ((!empty($password)) && (!empty($password_confirmation))) {
                $user->password = Hash::make($password);
            }
            if (!empty($addreses)) {
                $user->addreses = $addreses;
            }
            $user->name = $name;
            $user->last_name = $last_name;
            $user->second_last_name = $second_last_name;
            $user->email = $email;
            $user->phone = $phone;
            $user->complete_register = true;
            $user->save();
            DB::commit();

            $userData = $this->_authController->getDataUser($user);
            return response()->json([
                'status' => 200,
                'message' => 'información actualizada con éxito.',
                'data' => $userData,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage() . $e->getLine(),
            ]);
        }
    }

    /**
     * update password
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateProfilePassword(Request $request)
    {
        try {

            $validator = Validator::make($request->all(), [
                'password' => 'required|min:6|confirmed',
                'password_confirmation' => 'required|min:6',
            ], [
                'password.confirmed' => 'La contraseñas no coinciden.',
                'password.required' => 'La contraseña es obligatorio.',
                'password_confirmation.required' => 'La contraseña de confirmación es obligatorio.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'errors' => $validator->errors(),
                ]);
            }
            $id_user = $this->idUser;
            $password = $request->get('password');
            //$password_confirmation = $request->get('password_confirmation');
            $user = User::where('id_users', $id_user)->first();
            $user->password = Hash::make($password);
            $user->save();
            return response()->json([
                'status' => 200,
                'message' => 'contraseña actualizada con éxito.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage() . $e->getLine(),
            ]);
        }
    }
    /**
     * recovery password
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function recoveryPassword(Request $request)
    {
        $email = $request->get('email');
        $user = User::where('email', '=', $email)->first();

        if (empty($user)) {
            return json_encode([
                'status' => 400,
                'message' => "No hay una cuenta con {$email}.",
            ]);
        }

        try {
            $password = Str::random(10);
            $userData = $this->_authController->getDataUser($user);
            $userData['newPassword'] = $password;
            /**save user */
            $user->password = Hash::make($password);
            $user->save();

            Mail::to($email)->send(new MessageResetPassword($userData));
            return response()->json(
                [
                    'status' => 200,
                    'message' => "Busca el correo en la bandeja de entrada o spam.",
                ]
            );
        } catch (\Exception $e) {
            return response()->json(
                [
                    'status' => 400,
                    'message' => $this->ERROR_SERVER_MSG,
                    $e->getMessage(),
                ]
            );
        }
    }

    /**
     * eliminar cuenta
     * @param integer $id
     * @return \Illuminate\Http\Response
     */
    public function deleteUser(int $id)
    {
        $id_user = $this->idUser;
        $name_user = $this->nameUser;

        try {
            $user = User::where('id_users', $id)->first();
            if (!empty($user)) {
                DB::beginTransaction();
                $now = date("Y-m-d H:i:s");
                $user->account_status = 4;
                $user->phone = $user->phone; //modificar el numero para evitar conflictos de unique
                $user->email = $user->email; ////modificar el numero para evitar conflictos de unique
                $user->updated_at = $now;
                $user->save();

                /*$historyLog = new HistoryLog;
                $historyLog->id_user = $id_user;
                $historyLog->id_user_delete = $user->id_users;
                $historyLog->note = "id:$id_user {$name_user} ha eliminado temporalmente a {$user->name} id: {$user->id_users}";
                $historyLog->save();
                 */

                //$user = User::where('id_users', $id)->delete();
                DB::commit();
                return response()->json([
                    'status' => 200,
                    'data' => [],
                    'message' => "Se ha eliminado temporalmente al usuario.",
                ]);
            } else {
                return response()->json([
                    'status' => 400,
                    'message' => 'No se encontro el usuario',
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage(),
            ]);
        }
    }

    /**
     * actualizar estatus de la cuenta
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateAccount(Request $request)
    {
        $id_user = $this->idUser;
        $name_user = $this->nameUser;

        try {
            $user = User::where('id_users', $request->get('id_user'))->first();
            if (empty($user)) {
                return response()->json([
                    'status' => 400,
                    'message' => 'No se encontro el usuario',
                ]);
            }

            DB::beginTransaction();
            $now = date("Y-m-d H:i:s");
            $statusAccountUser = $request->get('statusAccountUser') === true ? 1 : 2; //activo 2=inactivo
            $user->account_status = $statusAccountUser;
            $user->save();

            /*
            $historyLog = new HistoryLog;
            $historyLog->id_user = $id_user;
            $historyLog->id_user_delete = $user->id_users;
            $historyLog->note = "id:$id_user {$name_user} ha bloqueado temporalmente a {$user->name} id: {$user->id_users}";
            $historyLog->save();
             */

            //$user = User::where('id_users', $id)->delete();
            DB::commit();
            return response()->json([
                'status' => 200,
                'data' => [],
                'message' => "se ha modificado el estatus de la cuenta.",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage(),
            ]);
        }
    }

    /**
     * importacion de usuarios
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function importUser(Request $request)
    {
        //csv,xls,ods
        $error = [];
        try {
            //$filePath = dirname((__FILE__)) . '/usuarios.csv';
            $filePath = request()->file('file');
            $records = Excel::toArray(new UsersImport(), $filePath);

            if (\count($records[0]) <= 0) {
                return response()->json([
                    'status' => 200,
                    'data' => [],
                    'message' => "El archivo no contiene registros.",
                ]);
            }

            $importUser = new UsersImport($this->_authController);
            $importUser->import($filePath);



            foreach ($importUser->failures() as $failure) {
                $error[] = [
                    "row" => $failure->row(), // row that went wrong
                    "attribute" => $failure->attribute(), // either heading key (if using heading row concern) or column index
                    "error" => $failure->errors(), // Actual error messages from Laravel validator
                    "value" => $failure->values(), // The values of the row that has failed.
                ];
            }

            $rowCount = $importUser->getRowCount();
            return response()->json([
                'status' => 200,
                'data' => [],
                'message' => "Se ha completado la importación,#{$rowCount} importados.",
                'errorImport'=>$error
            ]);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            foreach ($failures as $failure) {
                $error[] = [
                    "row" => $failure->row(), // row that went wrong
                    "attribute" => $failure->attribute(), // either heading key (if using heading row concern) or column index
                    "error" => $failure->errors(), // Actual error messages from Laravel validator
                    "value" => $failure->values(), // The values of the row that has failed.
                ];
            }
            return response()->json([
                'status' => 422,
                'errorImport' => $error,
            ]);
        }
    }

    /**
     * verificacion de cuenta
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verifyAccount($id)
    {
        try {

            /* 
                //SOLO PARA TEST url/api/v1/verifyAccount
                $id_user=1;
                $code="957852";
                $correo="admin@gmail.com";
                $verification_link="{$code}_{$correo}"; //debe de ir la columna de verification_link
                $code=base64_encode("{$code}_{$correo}_{$id_user}");// OTU3ODUyX2FkbWluQGdtYWlsLmNvbV8x
                $id="OTU3ODUyX2FkbWluQGdtYWlsLmNvbV8x";
             */

            
            $code = explode("_", base64_decode($id));
            $id_user = $code[2];
            $verificationLink = $code[0]."_".$code[1];
            $user = User::where('id_users', $id_user)->where('verification_link', $verificationLink)->first();
            if(empty($user)){
                return redirect('/ErrorverifyAccount');
            }
            $now = date("Y-m-d H:i:s");
            $user->account_status = 1;//activamos cuenta
            $user->email_verified_at=$now;
            $user->verification_link='';
            $user->save();
            return redirect('/iniciar-sesion?message="La cuenta fue activada con éxito"'); 

        } catch (\Exception $e) {
            return redirect("/iniciar-sesion?message={$this->ERROR_SERVER_MSG}");
        }
    }
}
