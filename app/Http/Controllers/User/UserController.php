<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\AuthController;
use App\Traits\Helper;
use App\User;
use App\HistoryLog;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;
//use Maatwebsite\Excel\Excel;

class UserController extends Controller
{
    use Helper;
    const CLIENTE_CREATE = "cliente_create";
    const USUARIO_CREATE = "usuario_create";
    const CLIENTE_UPDATE = "cliente_update";
    const USUARIO_UPDATE = "usuario_update";
    const ROLES = ['Cliente', 'Administrador'];


    /**
     * @var AuthController $_authController
     */
    public $_authController;

    public $ERROR_SERVER_MSG = 'Ha ocurrido un error, intenta de nuevo más tarde.';
    public $idUser;
    public $nameUser;
    /**
     * @param AuthController $AuthController
     */
    public function __construct(
        AuthController $AuthController
    ) {
        $this->_authController = $AuthController;
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
    public function saveUser(Request  $request)
    {
        try {

            $_validator = $this->validationUser($request);
            if (isset($_validator['status']) && $_validator['status'] == 422) {
                return response()->json($_validator);
            }

            #obligatorios globales
            $name = ucwords($request->get('name'));
            $last_name = ucwords($request->get('last_name'));
            $second_last_name = ucwords($request->get('second_last_name'));
            $email = $request->get('email');
            $typeRol = $request->get('type_rol');

            #variant=> type_form
            $password = $request->get('password');
            $phone = $request->get('phone');
            $addreses = $request->get('addreses');
            $type_form = $request->get('type_form');

            DB::beginTransaction();

            $user = null;
            $adtUser = null;

            if ($type_form == self::USUARIO_CREATE || $type_form == self::CLIENTE_CREATE) {
                $user = new User;
                //$adtUser = new AdditionalInfoUser;
                $user->password = empty($password) ? Hash::make("password") : Hash::make($password);
            } else if ($type_form == self::USUARIO_UPDATE || $type_form == self::CLIENTE_UPDATE) {
                #update
                $id_user = $request->get('id_users');
                $user = User::where('id_users', $id_user)->first();
                //$adtUser = AdditionalInfoUser::where('id_users', $id_user)->first();
                if (empty($user)) {
                    return response()->json([
                        'status' => 400,
                        'message' => "No se encontro el usuario con ID: {$id_user}"
                    ]);
                }
                /*
                if (empty($adtUser)) {
                    $adtUser = new AdditionalInfoUser;
                }
                */
            }
            #update type_rol=>request
            $rol_name = $typeRol;
            $user->name = $name;
            $user->last_name = $last_name;
            $user->second_last_name = $second_last_name;
            $user->email = $email;
            $user->account_status = 1;
            $user->syncRoles($rol_name);
            #variant=> type_form
            $user->addreses = $addreses;
            $user->phone = $phone;
            $user->save();

            $id_user = $user->id_users;
            //$this->saveAdditionalUser($request, $id_user, $adtUser);
            DB::commit();
            $message = strpos($type_form, "create") ? "Se ha creado con éxito." : "Se ha actualizado con éxito.";

            return response()->json([
                'status' => 200,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage()
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

        $type_form = $request->get('type_form');
        $rol_name = $request->get('type_rol');


        $validations = [
            'name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'second_last_name' => 'required|string|max:50',
            'type_form' => 'required|string'
        ];

        #insert
        if ($type_form == self::CLIENTE_CREATE || $type_form == self::USUARIO_CREATE) {
            $validations['email'] = 'required|string|email|unique:users|max:50';

            if ($type_form == self::CLIENTE_CREATE) {
                //$validations['phone'] = 'required|digits:10|unique:user';
                //$validations['propiedad'] = 'required|unique:table';
            }
            if ($type_form == self::USUARIO_CREATE) {
                //$validations['password'] = 'required|string|confirmed';
            }
        }
        #update
        $id_user = $request->get('id_users');
        if ($type_form == self::CLIENTE_UPDATE || $type_form == self::USUARIO_UPDATE) {
            $validations['email'] = ['required', 'email', 'max:50', Rule::unique('users')->ignore($id_user, 'id_users')];

            if ($type_form == self::CLIENTE_UPDATE) {
                $validations['phone'] = ['required', 'digits:10', Rule::unique('users')->ignore($id_user, 'id_users')];
                //$validations['phone'] = 'required|digits:10';
            }
        }

        $validator = Validator::make($request->all(), $validations, [
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre debe contener como máximo 50 caracteres.',
            'last_name.required' => 'El primer apellido es obligatorio.',
            'last_name.max' => 'El primer apellido debe contener como máximo 50 caracteres.',
            'second_last_name.required' => 'El segundo apellido es obligatorio.',
            'second_last_name.max' => 'El segundo apellido debe contener como máximo 50 caracteres.',
            'email.required' => 'El correo es obligatorio.',
            'email.unique' => 'El correo ya está en uso.',
            'email.email' => 'El correo es invalido verifique el formato.',
            'email.max' => 'El correo debe contener como máximo 50 caracteres.',
            'phone.required' => 'El telefono es obligatorio.',
            'phone.digits' => 'El telefono debe contener 10 digitos.',
            //'password.required' => 'La contraseña es obligatoria.',
            //'password.confirmed' => 'La contraseñas no coinciden.',
        ]);

        if ($type_form == self::USUARIO_CREATE || $type_form == self::USUARIO_UPDATE) {
            if (empty($rol_name) || $rol_name === 0) {
                $validator->after(function ($validator) {
                    $validator->errors()->add('rol', 'Debes seleccionar un rol');
                });
            }
        } else if ($type_form == self::CLIENTE_CREATE || $type_form == self::CLIENTE_UPDATE) {
            #se agrega el rol por default
            $request->request->add([
                'type_rol' => "Cliente"
            ]);
        }

        $validator = $validator->fails() ? json_decode($validator->errors(), true) : [];

        if (count($validator) > 0) {
            return [
                'status' => 422,
                'errors' => $validator
            ];
        }
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
                'data' => $all_roles_in_database
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e
            ]);
        }
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
        $endRow =     abs($request->get('endRow') ?? 10);
        $startRow = (($numberPage * $endRow) - $endRow);
        $totalRows = 0;

        try {
            $typeRol = $request->get('typeRol');
            $searchRoles = self::ROLES;
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
            })->with(['roles'])
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
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage()
            ]);
        }
    }

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
                $allowedFormats =  array('jpg', 'jpeg', 'png');
                $allowedformat = $this->validate_extension_img($file['name'], $allowedFormats);

                $allowedSize = (3 * 1048576);
                $allowedSize = $this->validate_size_img($file['size'], $allowedSize);

                if ($allowedformat['status'] != 200 || $allowedSize['status'] != 200) {
                    $errors = $allowedformat['message'] . "" . $allowedSize['message'];
                    return response()->json([
                        'status' => 400,
                        'message' => $errors
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
                    'message' => "Se ha cambiado con éxito la foto de perfil"
                ]);
            } else {
                return response()->json([
                    'status' => 400,
                    'message' => "No se encontro archivos para actualizar."
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage()
            ]);
        }
    }


    /**
     * update profile
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateProfile(Request  $request)
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
                'addreses.max' => 'La dirección debe tener como máximo 255 caracteres.'
            ]);
            #validation of password
            $password = $request->get('password');
            $password_confirmation = $request->get('password_confirmation');


            if ($password != $password_confirmation) {
                $validator->after(function ($validator) {
                    $validator->errors()->add('password', 'Las contraseñas no coincide.');
                });
            }

            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'errors' => $validator->errors()
                ]);
            }

            #$type_form = $request->get('type_form');
            $name = ucwords($request->get('name'));
            $last_name = ucwords($request->get('last_name'));
            $second_last_name = ucwords($request->get('second_last_name'));
            $email = $request->get('email');
            $addreses = $request->get('addreses');


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
            $user->save();
            DB::commit();

            $userData = $this->_authController->getDataUser($user);
            return response()->json([
                'status' => 200,
                'message' => 'información actualizada con éxito.',
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage() . $e->getLine()
            ]);
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
                $user->phone = $user->phone;
                $user->email = $user->email;
                $user->updated_at = $now;
                $user->save();

                $historyLog = new HistoryLog;
                $historyLog->id_user = $id_user;
                $historyLog->id_user_delete = $user->id_users;
                $historyLog->note = "id:$id_user {$name_user} ha eliminado temporalmente a {$user->name} id: {$user->id_users}";
                $historyLog->save();

                //$user = User::where('id_users', $id)->delete();
                DB::commit();
                return response()->json([
                    'status' => 200,
                    'data' => [],
                    'message' => "Se ha eliminado temporalmente al usuario."
                ]);
            } else {
                return response()->json([
                    'status' => 400,
                    'message' => 'No se encontro el usuario'
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage()
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
            $roles = self::ROLES;

            if ($request->has('filter_rol')) {
                $rol = $request->get('filter_rol');

                if ($rol == "Cliente") {
                    $nameFile = "Clientes";
                }

                if (in_array($rol, self::ROLES)) {
                    $roles = [$rol];
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
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage()
            ], 400);
        }
    }

    /**
     * eliminar cuenta
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateAccount(Request $request)
    {
        $id_user = $this->idUser;
        $name_user = $this->nameUser;

        try {
            $user = User::where('id_users', $request->get('id_user'))->first();
            if (!empty($user)) {
                DB::beginTransaction();
                $now = date("Y-m-d H:i:s");
                $statusAccountUser = $request->get('statusAccountUser') === true ? 1 : 2; //activo 2=bloqueado
                $user->account_status = $statusAccountUser;
                $user->save();

                $historyLog = new HistoryLog;
                $historyLog->id_user = $id_user;
                $historyLog->id_user_delete = $user->id_users;
                $historyLog->note = "id:$id_user {$name_user} ha bloqueado temporalmente a {$user->name} id: {$user->id_users}";
                $historyLog->save();

                //$user = User::where('id_users', $id)->delete();
                DB::commit();
                return response()->json([
                    'status' => 200,
                    'data' => [],
                    'message' => "Se ha bloqueado temporalmente al usuario."
                ]);
            } else {
                return response()->json([
                    'status' => 400,
                    'message' => 'No se encontro el usuario'
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . " Exception: " . $e->getMessage()
            ]);
        }
    }
}
