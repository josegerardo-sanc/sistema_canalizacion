<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

trait Helper
{
    /**
     * validation of size image
     *
     * @param float $size
     * @param float $allowedSize
     * @return array
     */
    public function validate_size_img(float $size, float $allowedSize)
    {
        $image_size = $this->getSize_img($size);
        $allowed_size = $this->getSize_img($allowedSize);

        if ($size > $allowedSize) {
            return ['status' => 400, 'message' => " Peso Permitido: {$allowed_size}, Peso Actual {$image_size}"];
        }
        return ['status' => 200, 'message' => ""];
    }

    /**
     * validation of extension image
     *
     * @param string $name img
     * @param array $allowedFormats 
     * @return bool  
     */

    public function validate_extension_img(string $name, array $allowedFormats)
    {
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        if (!in_array($extension, $allowedFormats)) {
            return ['status' => 400, 'message' => 'Formato no permitido: ' . strtoupper($extension)];
        }
        return ['status' => 200, 'message' => ""];
    }

    /**
     * Obtiene el peso en BYTES KB MB
     *
     * @param float $size
     * @return float $sizeImg
     */
    public function getSize_img(float $size)
    {
        $sizeImg = 0;
        if ($size < 1024) {
            $sizeImg = $size . 'bytes';
        } else if ($size >= 1024 && $size < 1048576) {
            $sizeImg = number_format(($size / 1024), 2) . 'KB';
        } else if ($size >= 1048576) {
            $sizeImg = number_format(($size / 1048576), 2) . 'MB';
        }
        return $sizeImg;
    }


    public function getTime($fecha1, $fecha2)
    {
        $datetime1 = date_create($fecha1);
        $datetime2 = date_create($fecha2);
        $interval = date_diff($datetime1, $datetime2);

        #determine time 
        $date_type = $interval->format('%R');
        $year = $interval->format('%Y');
        $moth = $interval->format('%M');
        $days = $interval->format('%a');
        $day = $interval->format('%D');
        $hours = $interval->format('%H');
        $minutes = $interval->format('%I');

        $message_date = "";


        $text_year = $year == 1 ? " año " : " años ";
        $text_moth = $moth == 1 ? " mes " : " meses ";
        $text_days = $days == 1 ? " día " : " días ";
        $text_hours = $hours == 1 ? " hora " : " horas ";
        $text_minutes = $minutes == 1 ? " minuto " : " minutos ";


        $year_value = "";
        $moth_value = "";
        $days_value = "";
        $hours_value = "";
        $minutes_value = "";

        if ($days > 0) {
            $days_value = "{$days} {$text_days}";
            if ($days > 31) {
                //se comienza a ocupar meses
                $days_value = "{$day} {$text_days}";
            }
        }

        if ($moth > 0) {
            $moth_value = "{$moth} {$text_moth}";
        }

        if ($year > 0) {
            $year_value = "{$year} {$text_year}";
        }

        $hours_value = "{$hours} {$text_hours}";
        $minutes_value = "{$minutes} {$text_minutes}";

        $message_date = "{$year_value} {$moth_value} {$days_value} {$hours_value} {$minutes_value} ";

        $calculateDate = ($date_type === "-" ? "Hace: " : "Faltan: ") . $message_date;

        return $calculateDate;
    }
}
