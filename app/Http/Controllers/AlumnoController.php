<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Student;
use App\User;
use Illuminate\Support\Facades\DB;


class AlumnoController extends Controller
{
    /**
     * getDataStudent
     *
     * @return void
     */
    public function getDataStudent()
    {
        try {
            $student = Student::where('id_users', $this->idUser)
                ->leftJoin('university_careers', 'students.id_university_careers', '=', 'university_careers.id_university_careers')
                ->get();

            if (count($student) > 0) {
                $student = $student[0];
            }

            return response()->json(
                [
                    'status' => 200,
                    'data' => $student
                ]
            );
        } catch (\Exception $e) {
            return response()->json(
                [
                    'status' => 400,
                    'message' => $this->ERROR_SERVER_MSG . ",Exception:" . $e->getMessage()
                ]
            );
        }
    }


    public function setAlumno(Request $request)
    {
        $id_user = $request->get('id_users');
        $matricula = $request->get('matricula');
        $id_university_careers = $request->get('careers');
        $semester = $request->get('semester');
        $school_shift = $request->get('school_shift');
        $student = null;
        if (!empty($request->get('alumno'))) {
            $id_students = intval($request->get('alumno')['id_students']);
            $student = Student::where('id_students', $id_students)->first();
        } else {
            //if (empty($student)) {
            $student = new Student();
        }
        $student->id_users = $id_user;
        $student->matricula = $matricula;
        $student->id_university_careers = $id_university_careers;
        $student->semester = $semester;
        $student->school_shift = $school_shift;
        $student->save();
    }
}
