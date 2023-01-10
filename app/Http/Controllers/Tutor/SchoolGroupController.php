<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\SchoolGroup;
use App\User;
use Illuminate\Support\Facades\DB;


class SchoolGroupController extends Controller
{

    protected $errors;

    public function validDataSchoolGroup($request)
    {
        $validator = Validator::make($request->all(), [
            'careers' => 'required|numeric|exists:university_careers,id_university_careers',
            'semester' =>
            [
                'required',
                'regex:/[1-9]{1}/',
            ],
            'school_shift' => [
                'required',
                Rule::in(['Matutino', 'Vespertino']),
            ],
            "year_period" => [
                'required',
                'regex:/[0-9]{4}/',
            ],
            "period" => [
                'required',
                Rule::in(['Enero-Junio', 'Julio-Diciembre']),
            ]
        ]);

        if ($validator->fails()) {
            $this->errors = $validator->errors();
            return true;
        }
        return false;
    }

    /**
     * Crear y actualizar un grupo
     *
     * @param Request $request
     * @return void
     */
    public function schoolGroup(Request $request)
    {
        try {

            if ($this->validDataSchoolGroup($request)) {
                return [
                    'status' => 422,
                    'errors' => $this->errors,
                ];
            }

            $id_tutor = auth()->user()->id_users;
            $id_university_careers = $request->get('careers');
            $semester = $request->get('semester');
            $shift = $request->get('school_shift');
            $year_period = $request->get('year_period');
            $period = $request->get('period');

            if ($request->has('id_school_group')) {
                $id_school_group = $request->get('id_school_group');
                $schoolGroup = SchoolGroup::where('id_school_group', $id_school_group)
                    ->where('id_users', $id_tutor)->first();

                if (empty($schoolGroup)) {
                    throw new \Exception("No se encontro información del grupo solicitado.");
                }
            } else {
                $existSchoolGroup = SchoolGroup::where('id_university_careers', $id_university_careers)
                    ->where("semester", $semester)
                    ->where("shift", $shift)
                    ->where("year_period", $year_period)
                    ->where("period", $period)
                    ->first();

                if (!empty($existSchoolGroup)) {
                    if ($existSchoolGroup->id_users == $id_tutor)
                        throw new \Exception("Ya cuentas con el grupo registrado.");
                    else
                        $userData = User::where('id_users', $existSchoolGroup->id_users)->first();
                    throw new \Exception("{$userData->name} {$userData->last_name} ya registro el grupo.");
                }

                $schoolGroup = new SchoolGroup();
                $schoolGroup->id_users = $id_tutor;
            }
            $schoolGroup->id_university_careers = $id_university_careers;
            $schoolGroup->semester = $semester;
            $schoolGroup->shift = $shift;
            $schoolGroup->year_period = $year_period;
            $schoolGroup->period = $period;
            $schoolGroup->save();
            $response = [
                'status' => 200,
                'message' => "Grupo creado con exito",
            ];
        } catch (\Exception $e) {
            $response = [
                'status' => 400,
                'message' => $e->getMessage()
            ];
        }

        return response()->json($response);
    }

    /**
     * Obtener los grupos asignados por el tutor logueado
     *
     * @return void
     */
    public function listSchoolGroup()
    {
        try {

            $id_tutor = auth()->user()->id_users;

            $data = DB::table('school_groups as group')
                ->leftJoin('university_careers as careers', 'group.id_university_careers', '=', 'careers.id_university_careers')
                ->where('id_users', $id_tutor)
                ->select("group.*","careers.name")
                ->get();


            return response()->json([
                'status' => 200,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function deleteGroups(Request $request)
    {
        try {

            $id_tutor = auth()->user()->id_users;
            $id_school_group = $request->get('id_school_group');

            $schoolGroup = SchoolGroup::where('id_school_group', $id_school_group)
                ->where('id_users', $id_tutor)->first();

            if (empty($schoolGroup)) {
                throw new \Exception("No se encontro información del grupo solicitado.");
            }

            $schoolGroup->delete();

            return response()->json([
                'status' => 200,
                'data' => "grupo eliminado con exito"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 400,
                'message' => $e->getMessage()
            ]);
        }
    }
}
