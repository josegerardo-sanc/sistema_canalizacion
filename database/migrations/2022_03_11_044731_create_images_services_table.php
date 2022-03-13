<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateImagesServicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('images_services', function (Blueprint $table) {
            $table->bigIncrements('id_image_service');
            $table->unsignedBigInteger('id_service');
            $table->foreign('id_service')->references('id_service')->on('services')->onDelete('cascade');
            $table->string('path');
            $table->string('priority')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('images_services');
    }
}
