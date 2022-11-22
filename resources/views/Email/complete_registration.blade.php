<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:m="http://schemas.microsoft.com/office/2004/12/omml">

<head>
    <meta http-equiv="Content-Language" content="es">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <title>Mensaje de Bienvenida</title>
</head>

<body>
    <center>
        <table>
            <tbody>
                <tr>
                    <h3>
                        <strong>Hola! {{ $user['name'] }}</strong>
                    </h3>
                    <strong>
                        Por favor confirme su dirección email haciendo clic en el siguiente enlace:
                        Si tiene problemas con el enlace, por favor, copie y pegue la siguiente línea en su
                        navegador web:
                    </strong>
                    <br>
                    <br>
                    <br>
                    <a href="{{ $user['link'] }}" target="_blank">
                        {{ $user['link'] }}
                    </a>
                    <br>
                    <p>
                        Si usted no ha solicitado ningún tipo de registro, ignore este mensaje y no pasará nada.
                        Gracias
                    </p>
                    <br>
                </tr>
                <tr>
                    <th>
                        <strong>contrase&ntilde;a: </strong>
                        {{ $user['newPassword'] }}
                    </th>
                </tr>
                <tr>
                    <strong>
                        Te recomendamos que cambies esta contrase&ntilde;a por una que recuerdes
                        fácilmente.
                    </strong>
                </tr>
            </tbody>
        </table>
    </center>
</body>

</html>
