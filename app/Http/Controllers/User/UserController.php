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

use Maatwebsite\Excel\Facades\Excel;
//use Maatwebsite\Excel\Excel;

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
     * Display a listing of the resource.
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
    public function getUser(Request $request)
    {
        $id_user = $this->idUser;

        $numberPage = abs($request->get('numberPage') ?? 1);
        $endRow =     abs($request->get('endRow') ?? 10);
        $startRow = (($numberPage * $endRow) - $endRow);
        $totalRows = 0;

        try {
            $condition = $request->has('clients') && $request->get('clients') ? "=" : "!=";

            /**https://spatie.be/index.php/docs/laravel-permission/v5/basic-usage/basic-usage */



            $queryUser = User::query();

            $users = $queryUser->whereHas('roles', function ($query) use ($condition) {
                $query->where('name', $condition, 'Cliente');
            })->with(['roles', 'info'])
                ->where('id_users', "!=", $id_user)
                ->where('account_status', "!=", 4);

            if (!empty($request->get('search'))) {
                $search = $request->get('search');
                $users = $queryUser->whereRaw("concat(users.name,' ',users.last_name,' ',users.second_last_name) like '%$search%'");
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
     * suspend user
     *
     * @param integer $id
     * @return bool
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

    /*
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
            $roles = ['Administrador', 'Abogado'];

            if ($request->has('filter_rol')) {
                $rol = $request->get('filter_rol');

                if ($rol == "Cliente") {
                    $nameFile = "Clientes";
                }

                if (in_array($rol, ['Administrador', 'Abogado', 'Cliente'])) {
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
     */
}
