<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSchoolGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('school_groups', function (Blueprint $table) {
            $table->bigIncrements('id_school_group');
            $table->unsignedBigInteger('id_users')->comment('id users');
            $table->foreign('id_users')->references('id_users')->on('users');
            $table->unsignedBigInteger('id_university_careers')->comment('id users');
            $table->foreign('id_university_careers')->references('id_university_careers')->on('university_careers');
            $table->string('semester');
            $table->string('shift');
            $table->string('year_period');
            $table->string('period');
            //$table->string('group');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('school_groups');
    }
}
