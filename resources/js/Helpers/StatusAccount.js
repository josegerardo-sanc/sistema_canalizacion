import React from "react";


export const statusAccount = ($status) => {
    let $info = "";
    let $color = "";
    switch ($status) {
        case 1:
            $info = "Activo";
            $color = "success";
            break;
        case 2:
            $info = "inhabilitó";
            $color = "warning";
            break;
        case 3:
            $info = "No ha verificado su cuenta de correo electrónico.";
            $color = "info";
            break;
        case 4:
            $info = "bloqueado forma permanente";
            $color = "danger";
            break;

        default:
            $info = "status desconocido: " + $status;
            $color = "danger";
            break;
    }
    return {
        'message': $info,
        'color': $color
    };
}