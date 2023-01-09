<?php

namespace App\Imports;

use App\User;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

use Illuminate\Support\Facades\Mail;
use App\Mail\MessageCompleteRegistration;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;


class UsersImport implements ToModel, WithHeadingRow, WithValidation,SkipsOnFailure
{
    use Importable,SkipsFailures;

    /**
     * @var AuthController $_authController
     */
    public $_authController;
    public $attempts = 0;
    private $rows = 0;
    public function __construct(
        $AuthController = null
    ) {
        $this->_authController = $AuthController;
        $this->attempts = 0;
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        $this->rows++;
        if (auth()->user()->hasRole('Administrador')) {
            $rol_name = "Tutor";
        } else if (auth()->user()->hasRole('Tutor')) {
            $rol_name = "Alumno";
        }

        $password = Str::random(10);
        $hashPassword = Hash::make($password);
        $confirmation_code = Str::random(40);
        $email = $row['email'];
        $verification_link = "{$confirmation_code}_{$email}";
        $user = new User();
        $user->email = $email;
        $user->password = $hashPassword;
        $user->verification_link = $verification_link;
        $user->account_status = 3; //verificar correo
        $user->syncRoles($rol_name);
        $user->save();
        $userData = $this->_authController->getDataUser($user);

        $id_users = $user->id_users;
        $code = base64_encode("{$confirmation_code}_{$email}_{$id_users}");
        $userData['link'] = action('User\UserController@verifyAccount', ['id' => $code]);
        $userData['newPassword'] = $password;
        $this->attempts = 0;
        
        //$this->sendEmail($userData, $email);
        return $user;
    }

    //VALIDACION DE FILA
    public function rules(): array
    {
        return [
            'email' => ['required', 'unique:users', 'email']
        ];
    }

    public function customValidationMessages()
    {
        return [
            'email.required' => 'El correo es obligatorio.',
            'email.unique' => 'El correo ya está en uso.',
            'email.email' => 'El correo no tiene el formato correcto.',
        ];
    }

    public function customValidationAttributes()
    {
        return ['1' => 'email'];
    }

    public function sendEmail($userData, $email)
    {

        try {
            Mail::to($email)->send(new MessageCompleteRegistration($userData));
        } catch (\Throwable $th) {
            //realiza el intento de correo dos veces mas
            if ($this->attempts <= 2) {
                $this->attempts = $this->attempts + 1;
                $this->sendEmail($userData, $email);
            }
        }
    }

    public function getRowCount(): int
    {
        return $this->rows;
    }
}
