<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateListServicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('list_services', function (Blueprint $table) {
            $table->bigIncrements('id_list_service');
            $table->unsignedBigInteger('id_service');
            $table->foreign('id_service')->references('id_service')->on('services')->onDelete('cascade');
            $table->string('service');
            $table->boolean('active');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('list_services');
    }
}
