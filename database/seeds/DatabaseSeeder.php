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
        // $this->call(UserSeeder::class);
        $user = App\User::insert([
            [
                'account_status' => 1,
                'name' => 'jose gerardo',
                'last_name' => 'sanchez',
                'second_last_name' => 'alvarado',
                'email' => 'sanchezalvaradojose0@gmail.com',
                'phone' => '9321078928',
                'verification_link' => '',
                'password' => bcrypt('password')
            ],
            [
                'account_status' => 1, //1=activo 2=bloqueado  3=verificarCuentaCorreo
                'name' => 'victor',
                'last_name' => 'sanchez',
                'second_last_name' => 'lopez',
                'email' => 'admin@gmail.com',
                'phone' => '9321078920',
                'verification_link' => '',
                'password' => bcrypt('password')
            ],
            [
                'account_status' => 1, //1=activo 2=bloqueado  3=verificarCuentaCorreo
                'name' => 'luis',
                'last_name' => 'perez',
                'second_last_name' => 'gomez',
                'email' => 'cliente@gmail.com',
                'phone' => '9321078920',
                'verification_link' => '',
                'password' => bcrypt('password')
            ],
        ]);

        Role::create(['name' => 'Administrador']);
        Role::create(['name' => 'Cliente']);

        $user_1 = App\User::find(1);
        $user_2 = App\User::find(2);
        $user_3 = App\User::find(3);

        $user_1->syncRoles(['Administrador']);
        $user_2->syncRoles(['Administrador']);
        $user_3->syncRoles(['Cliente']);
    }
}
