<?php

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use App\Student;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        DB::table('university_careers')->insert([
            ['name' => 'Ing.Informática'],
            ['name' => 'Ing.Administración'],
            ['name' => 'Ing.Energías Renovable'],
            ['name' => 'Ing.Bioquímica'],
            ['name' => 'Ing.Industrial'],
            ['name' => 'Ing.Electromecánica'],
            ['name' => 'Ing.Agronomía'],
        ]);

        App\User::insert([
            [
                'account_status' => 1,
                'name' => 'admin',
                'last_name' => '',
                'second_last_name' => '',
                'email' => 'admin@gmail.com',
                'phone' => '',
                'verification_link' => '',
                'password' => bcrypt('password'),
                'complete_register'=>true
            ],
            [
                'account_status' => 1,
                'name' => 'jose',
                'last_name' => 'sanchez',
                'second_last_name' => '',
                'email' => 'tutor@gmail.com',
                'phone' => '',
                'verification_link' => '',
                'password' => bcrypt('password'),
                'complete_register'=>true
            ],
            [
                'account_status' => 1,
                'name' => 'carmen',
                'last_name' => 'sanchez',
                'second_last_name' => '',
                'email' => 'alumno@gmail.com',
                'phone' => '',
                'verification_link' => '',
                'password' => bcrypt('password'),
                'complete_register'=>true
            ]
        ]);


        //agregar la lista de roles al archivo
        //app/Http/Controllers/User/UserController.php
        Role::create(['name' => 'Administrador']);
        Role::create(['name' => 'Tutor']);
        Role::create(['name' => 'Alumno']);

        $user_1 = App\User::find(1);
        $user_1->syncRoles(['Administrador']);

        $user_2 = App\User::find(2);
        $user_2->syncRoles(['Tutor']);

        $user_3 = App\User::find(3);
        $user_3->syncRoles(['Alumno']);


        $student = new Student;
        $student->matricula ="14E30379";
        $student->id_users = 3;
        $student->id_university_careers =1;
        $student->semester = "1 SEMESTRE";
        $student->school_shift = "Vespertino";
        $student->save();

        /*
        $this->call(UserSeeder::class);

        for ($i = 2; $i <= 102; $i++) {

            $user = App\User::find($i);
            $user->syncRoles(['Alumno']);
            $student = new Student;
            $id = $user->id_users;
            $matricula = "14E30" . $id;
            if ($i == 2) {
                $matricula = "14E30379";
            }
            $student->matricula = $matricula;
            $student->id_users = $i;
            $student->id_university_careers = rand(1, 6);
            $student->semester = "1 SEMESTRE";
            $student->school_shift = "";
            $student->save();
        }
        */
    }
}