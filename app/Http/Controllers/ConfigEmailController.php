<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Config;


use App\ConfigEmails;

class ConfigEmailController extends Controller
{
    public $ERROR_SERVER_MSG = 'Ha ocurrido un error, intenta de nuevo más tarde.';

    /**
     * save credentials config emails.
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveConfigEmail(Request $request)
    {
        try {

            $_validator = $this->validationConfig($request);
            if (isset($_validator['status']) && $_validator['status'] == 422) {
                return response()->json($_validator);
            }

            DB::beginTransaction();

            $config_emails = null;
            $host = $request->get('host');
            $username = $request->get('username');
            $password = $request->get('password');
            $puerto = $request->get('puerto');
            $email_remitente = $request->get('email_remitente');
            $name_remitente = $request->get('name_remitente');
            $encryption = $request->get('encryption');

            if ($request->has('id_config_emails')) {
                $id_config_emails = $request->get('id_config_emails');
                $config_emails = ConfigEmails::where('id_config_emails', '=', $id_config_emails)->first();
            } else {
                $config_emails = new ConfigEmails();
            }

            $config_emails->host = $host;
            $config_emails->username = $username;
            $config_emails->password = $password;
            $config_emails->puerto = $puerto;
            $config_emails->email_remitente = $email_remitente;
            $config_emails->name_remitente = $name_remitente;
            $config_emails->encryption = $encryption;
            $config_emails->save();

            DB::commit();
            $this->mailSettingStore($request);

            return response()->json([
                'status' => 200,
                'message' => "La configuración se ha almacenado con éxito. ",
                'data' => $request->all()
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

    public function getConfigEmail()
    {

        try {
            $config_emails = ConfigEmails::orderBy('id_config_emails', 'desc')
                ->first();

            return response()->json([
                'status' => 200,
                'message' => "",
                'data' => $config_emails
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
     * validation function
     *
     * @param Request $request
     * @param $validator
     * @return array
     */

    public function validationConfig(Request $request)
    {

        $validations = [
            'host' => 'required|string|max:100',
            'username' => 'required|string|max:100',
            'password' => 'required|string|max:100',
            'puerto' => 'required|numeric',
            'email_remitente' => 'required|string|max:100',
            'name_remitente' => 'required|string|max:100',
            'encryption' => 'required|string|max:10'
        ];

        $validator = Validator::make($request->all(), $validations, [
            'host.required' => 'El nombre de host es obligatorio.',
            'host.max' => 'El nombre de host debe contener como máximo 100 caracteres.',
            'username.required' => 'El nombre de usuario es obligatorio.',
            'username.max' => 'El nombre de usuario debe contener como máximo 100 caracteres.',
            'password.required' => 'La contraseña es obligatorio.',
            'password.max' => 'La contraseña debe contener como máximo 250 caracteres.',
            'puerto.required' => 'El puerto es obligatorio.',
            'puerto.numeric' => 'El puerto debe ser númerico.',
            'email_remitente.required' => 'El correo remitente es obligatorio.',
            'email_remitente.max' => 'El correo remitente  debe contener como máximo 250 caracteres.',
            'email_remitente.email' => 'El correo del remitente es inválido.',
            'name_remitente.required' => 'El nombre del remitente es obligatorio.',
            'name_remitente.max' => 'El nombre del remitente debe contener como máximo 100 caracteres.',
            'encryption.required' => 'La encryption es obligatorio.',
            'encryption.max' => 'La encryption debe contener como máximo 10 caracteres.',
        ]);

        $validator = $validator->fails() ? json_decode($validator->errors(), true) : [];

        if (count($validator) > 0) {
            return [
                'status' => 422,
                'errors' => $validator
            ];
        }
    }



    public function mailSettingStore($request)
    {

        $host = $request->get('host');
        $username = $request->get('username');
        $password = $request->get('password');
        $port = $request->get('puerto');
        $mail_address = $request->get('email_remitente');
        $mail_name = $request->get('name_remitente');
        $encryption = $request->get('encryption');

        $this->cleanCache();
        $path = app()->environmentFilePath();

        //dd(file_get_contents($path));

        $informationFile = $this->readFile($path);

        $configArray = [
            "MAIL_HOST",
            "MAIL_PORT",
            "MAIL_FROM_ADDRESS",
            "MAIL_FROM_NAME",
            "MAIL_USERNAME",
            "MAIL_PASSWORD",
            "MAIL_ENCRYPTION"
        ];

        $searchArray = array();

        foreach ($configArray as $indice => $config) {
            foreach ($informationFile as $item) {
                if (strpos($item, $config) !== false) {
                    $searchArray[] = $item;
                    break;
                }
            }
        }


        $replaceArray = [
            "MAIL_HOST='{$host}'\n",
            "MAIL_PORT='{$port}'\n",
            "MAIL_FROM_ADDRESS='{$mail_address}'\n",
            "MAIL_FROM_NAME='{$mail_name}'\n",
            "MAIL_USERNAME='{$username}'\n",
            "MAIL_PASSWORD='{$password}'\n",
            "MAIL_ENCRYPTION='{$encryption}'\n"
        ];

        $arreglo[] = $searchArray;
        $arreglo[] = $replaceArray;

        //dd($arreglo);

        $dataNew = str_replace($searchArray, $replaceArray, file_get_contents($path));

        //dd($dataNew);
        file_put_contents($path, $dataNew);

        $this->cleanCache();
        //dd(file_get_contents($path));
    }

    public function readFile($path)
    {
        // Abriendo el archivo
        $archivo = fopen($path, "r");

        $data = array();
        // Recorremos todas las lineas del archivo
        while (!feof($archivo)) {
            // Leyendo una linea
            $traer = fgets($archivo);
            $data[] = $traer;
        }

        // Cerrando el archivo
        fclose($archivo);

        return $data;
    }


    public function cleanCache()
    {
        \Artisan::call('config:clear');
        \Artisan::call('config:cache');
        //\Artisan::call('cache:clear');
        //\Artisan::call('route:clear');
    }
}
