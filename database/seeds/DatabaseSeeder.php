<?php

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        App\User::insert([
            [
                'account_status' => 1,
                'name' => 'admin',
                'last_name' => '',
                'second_last_name' => '',
                'email' => 'admin@gmail.com',
                'phone' => '',
                'verification_link' => '',
                'password' => bcrypt('password')
            ]
        ]);

        Role::create(['name' => 'Administrador']);
        Role::create(['name' => 'Tutor']);
        Role::create(['name' => 'Alumno']);

        $user_1 = App\User::find(1);
        $user_1->syncRoles(['Administrador']);
    }
}
