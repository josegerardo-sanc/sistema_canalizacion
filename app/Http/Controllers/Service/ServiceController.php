<?php

namespace App\Http\Controllers\Service;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Traits\Helper;
use App\Services;
use App\ListServices;
use App\ImagesService;
use Mockery\Undefined;
use PhpOffice\PhpSpreadsheet\Calculation\Web\Service;

class ServiceController extends Controller
{
    use Helper;

    const TYPES = ['habitacion', 'salon', 'promocion'];
    public $ERROR_SERVER_MSG = 'Ha ocurrido un error, intenta de nuevo más tarde.';
    public $id_service;
    public $listServices;
    /**
     * actualizar y guardar servicio
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function saveService(Request $request)
    {
        /*
        $request->request->add([
            'id_service' => 5
        ]);
        */

        try {
            //proceso
            $_validator = $this->validationService($request);
            if (isset($_validator['status']) && $_validator['status'] == 422) {
                return response()->json($_validator);
            }

            DB::beginTransaction();

            $service = null;
            $id_service = null;
            $file = null;
            $saveImg = true;

            if ($request->has('id_service')) {
                $id_service = $request->get('id_service');
                $service = Services::where('id_service', '=', $id_service)->first();
                if (empty($service)) {
                    return response()->json([
                        'status' => 400,
                        'message' => "El servicio con ID: {$id_service} no se encontro en la base de datos"
                    ]);
                }
                //////////////
                $saveImg = false;
                if (
                    isset($_FILES['file_primary']) &&
                    $_FILES['file_primary'] != "undefined" &&
                    $request->hasFile('file_primary')
                ) {
                    $file = $_FILES['file_primary'];
                    $saveImg = true;
                    $exists = Storage::disk('public')->exists($service->path);
                    if ($exists) {
                        Storage::delete('public/' . $service->path);
                    }
                }
                //////////////
            } else {
                $service = new Services();

                if (!isset($_FILES['file_primary'])) {
                    return response()->json([
                        'status' => 400,
                        'message' => "La imagen principal es obligatoria."
                    ]);
                }
                $file = $_FILES['file_primary'];
            }

            if (!empty($file)) {
                $allowedFormats =  array(
                    'jpg', 'jpeg', 'png'
                );
                $allowedformat = $this->validate_extension_img($file['name'], $allowedFormats);

                $allowedSize = (5 * 1048576);
                $allowedSize = $this->validate_size_img($file['size'], $allowedSize);

                if ($allowedformat['status'] != 200 || $allowedSize['status'] != 200) {
                    $errors = $allowedformat['message'] . "" . $allowedSize['message'];
                    return response()->json([
                        'status' => 400,
                        'message' => $errors
                    ]);
                }
            }


            $type = $request->get('type');
            $is_active = (bool) $request->get('is_active');
            $title = $request->get('title');
            $description_short = $request->get('description_short');
            $description_long = $request->get('description_long');
            $price = (float)$request->get('price');
            $promotion = (float)$request->get('promotion'); //precio tachado

            $promotion = $type == "habitacion" ? $promotion : null;
            $description_short = $type == "habitacion" ? $description_short : null;

            $service->type = $type;
            $service->is_active = $is_active;
            $service->title = $title;
            $service->description_short = $description_short;
            $service->description_long = $description_long;
            $service->price = $price;
            $service->promotion = $promotion;

            if ($saveImg) {
                $file_primary_new = $request->file('file_primary')->store('servicios', 'public');
                $service->path = $file_primary_new;
            }

            $service->save();

            $this->id_service = $service->id_service;
            $this->listServices = empty($request->get('services')) ? [] : json_decode($request->get('services'), true);

            $this->saveListServices();
            $errorsImage = $this->saveListImages($request, $_FILES);
            DB::commit();

            $message = $request->has('id_service') ? "Se ha actualizado con éxito" : "Se ha registrado con éxito";
            return response()->json([
                'status' => 200,
                'data' => [],
                'message' => $message,
                'errors' => $errorsImage
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 400,
                'message' => $this->ERROR_SERVER_MSG . ' Exeption: ' . $e->getMessage() . "line" . $e->getLine()
            ]);
        }
    }

    /**
     * valida los datos de entrada
     *
     * @param Request $request
     * @return array 
     */
    public function validationService(Request $request)
    {

        $validations = [
            'type' => [
                'required',
                Rule::in(self::TYPES),
            ],
            //'is_active' => 'required',
            'price' => 'required|numeric',
            //'description_long' => 'required|string'
        ];

        if ($request->has('id_service')) {
            #update
            $id_service = $request->get('id_service');
            $validations['title'] = ['required', 'string', 'max:255', Rule::unique('services')->ignore($id_service, 'id_service')];
        } else {
            #insert
            $validations['title'] = 'required|string|unique:services|max:255';

            $type = $request->get('type');
            if ($type == "habitacion") {
                $validations['promotion'] = 'numeric';
                $validations['description_short'] = 'required|string';
            }
        }


        $validator = Validator::make($request->all(), $validations, [
            'type.in' => "Selecione el tipo de servicio.",
            'type.required' => 'El tipo de servicio es obligatorio.',
            'title.required' => 'El titulo es obligatorio.',
            'title.max' => 'El titulo debe contener como máximo 255 caracteres.',
            'title.unique' => 'El titulo ya está en uso.',
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser númerico.',
            'promotion.required' => 'El precio de promoción es obligatorio.',
            'promotion.numeric' => 'El precio de promición debe ser númerico.',
            'description_short.required' => 'La descripción corta es obligatorio.',
            'description_long.required' => 'La descripción larga es obligatorio.'
        ]);

        $validator = $validator->fails() ? json_decode($validator->errors(), true) : [];

        if (count($validator) > 0) {
            return [
                'status' => 422,
                'errors' => $validator
            ];
        }
    }

    /**
     * listar servicios
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getService(Request $request)
    {
        $numberPage = abs($request->get('numberPage') ?? 1);
        $endRow =     abs($request->get('endRow') ?? 10);
        $startRow = (($numberPage * $endRow) - $endRow);
        $totalRows = 0;

        try {
            $type = $request->get('type');
            $searchTypes = array();

            if (in_array($type, self::TYPES)) {
                $searchTypes = [$type];
            } else if ($type == "all" || $type == 0) {
                $searchTypes = self::TYPES;
            }

            $queryService = Services::query();
            $services = $queryService
                ->with(['listServices'])
                ->whereIn('type', $searchTypes);

            if (!empty($request->get('search'))) {
                $search = $request->get('search');
                $services = $queryService->whereRaw(
                    '(
                        services.title like ? OR
                        services.price like ? OR 
                        services.promotion like ?
                    )',
                    array("%{$search}%", "%{$search}%", "%{$search}%")
                );
            }
            $totalRows = $services->count();

            if ($startRow > $totalRows) {
                /**reinicia la paginacion */
                $startRow = 0;
                $numberPage = 1;
            }

            $services = $queryService
                ->orderBy('id_service', 'desc')
                ->offset($startRow)
                ->limit($endRow)
                ->get();

            return response()->json([
                'status' => 200,
                'message' => 'Lista de servicios.',
                'data' => $services,
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
     * activar/desactivar servicios
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateStatusService(Request $request)
    {
        try {
            $service = Services::where('id_service', $request->get('id_service'))->first();
            if (!empty($service)) {
                DB::beginTransaction();
                $now = date("Y-m-d H:i:s");
                $statusActive = (bool)$request->get('statusActive'); //activo 2=bloqueado
                $service->is_active = $statusActive;
                $service->save();
                DB::commit();
                return response()->json([
                    'status' => 200,
                    'data' => [],
                    'message' => "Se ha actualizado con éxito."
                ]);
            } else {
                return response()->json([
                    'status' => 400,
                    'message' => 'No se encontro el servicio.'
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
     * eliminar servicios "is_active=delete"
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function deleteService(int $id)
    {
        try {
            $service = Services::where('id_service', $id)->first();


            if (!empty($service)) {
                DB::beginTransaction();
                $now = date("Y-m-d H:i:s");
                $service->delete();

                DB::commit();
                return response()->json([
                    'status' => 200,
                    'data' => [],
                    'message' => "Se ha actualizado con éxito."
                ]);
            } else {
                return response()->json([
                    'status' => 400,
                    'message' => 'No se encontro el servicio.'
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
     * guardar lista de servicio que incluye habitacion,salon,promocion
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function saveListServices()
    {
        try {
            $services = $this->listServices;
            $id_service = $this->id_service;


            $list_services = ListServices::where('id_service', $id_service)->get();
            if (!empty($list_services)) {
                DB::table('list_services')->where('id_service', $id_service)->delete();
            }

            $data = [];
            foreach ($services as $key => $item) {
                $data[] = [
                    'id_service' => $id_service,
                    'service' => $item['service'],
                    'active' => $item['active'],
                ];
            }
            DB::table('list_services')->insert($data);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function saveListImages(Request $request, $_files)
    {
        try {
            $id_service = $this->id_service; //required
            $listImages = ImagesService::where('id_service', $id_service)->get();
            if (!empty($listImages)) {
                #verifica la existencia de la imagen
                foreach ($listImages as $key => $item) {
                    $exists = Storage::disk('public')->exists($item['path']);
                    if ($exists) {
                        Storage::delete('public/' . $item['path']);
                    }
                }
                DB::table('images_services')->where('id_service', $id_service)->delete();
            }

            $data = [];
            $errorsImages = [];
            $allowedFormats =  array('jpg', 'jpeg', 'png');
            foreach ($_files as $key => $file) {
                $data[] = $file;

                $allowedformat = $this->validate_extension_img($file['name'], $allowedFormats);
                $allowedSize = (5 * 1048576);
                $allowedSize = $this->validate_size_img($file['size'], $allowedSize);

                if ($allowedformat['status'] != 200 || $allowedSize['status'] != 200) {
                    $errorsImages[] = $allowedformat['message'] . "" . $allowedSize['message'];
                }

                $pathImage = $request->file($key)->store('servicios', 'public');
                $imagesService = new ImagesService();
                $imagesService->id_service = $id_service;
                $imagesService->path = $pathImage;
                $imagesService->priority = 1;
                $imagesService->save();
            }
            return $errorsImages;
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
