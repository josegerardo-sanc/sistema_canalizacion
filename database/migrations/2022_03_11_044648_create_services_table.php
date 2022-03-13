<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateServicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('services', function (Blueprint $table) {
            $table->bigIncrements('id_service');
            $table->enum('type', ['habitacion', 'salon', 'promocion']);
            $table->boolean('is_active')->default(false);
            $table->string('title')->unique();
            $table->text('description_short')->nullable();
            $table->text('description_long')->nullable();
            $table->double('price');
            $table->double('promotion')->nullable();
            $table->string('path');
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
        Schema::dropIfExists('services');
    }
}
